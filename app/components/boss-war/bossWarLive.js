// Boss War live backend adapter — the only data source for the member screens.
//
// Field names below are verified against the real API (postman/bosswar.md).
// Four view-models have no matching endpoint and are composed here instead:
//   results   → boss detail + member rank + the member's reward log
//   rewards   → the boss's own reward-items, grouped by reward_type
//   earnRules → real deposit bands + static copy for the rest
//   next boss → the soonest UPCOMING boss in the member list (see nextBoss)
// There is no claim endpoint: Attack Points are granted by the feature that
// awards them (check-in, missions, mini-games, deposits), so the earn tiles
// navigate there rather than claiming.

import * as api from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";
import {
  BOSS_REWARD_TIERS,
  DEFAULT_DEPOSIT_AP,
  DEFAULT_FREE_AP,
  EARN_TILES,
  MINI_GAMES_NOTE,
  EVENT_REWARD_TIERS,
  RANK_REWARD_TIERS,
} from "./constants";
import { apView, bossView } from "./viewModels";

const list = (res) => (Array.isArray(res) ? res : res?.results || res?.data || []);

// Every member-scoped route carries the uuid in its path. Reading it here
// keeps the screens from having to thread it through as a prop.
function memberUuid() {
  const uuid = tokenStorage.getMemberUuid();
  if (!uuid) {
    const err = new Error("Your session has expired. Please sign in again.");
    err.status = 401;
    throw err;
  }
  return uuid;
}

// The API sends labels ("DAILY", "EPIC"); the screens key off lower case.
const lower = (value, fallback = "") => String(value ?? fallback).toLowerCase();

// bossView() reads snake_case server fields, so normalise the labels only.
function toBossView(server) {
  if (!server) return null;
  return bossView({
    ...server,
    boss_type: lower(server.boss_type, "daily"),
    status: lower(server.status, "active"),
    reward_gem: lower(server.reward_gem, "common"),
  });
}

// The balance endpoint has no ceiling. `max` here is just the current balance;
// the battle screen anchors it to the balance the visit started with so the
// card can read "18 / 20" — AP left of what you walked in with.
function toApView(balance) {
  const current = Number(balance?.current ?? 0);
  return apView({ current, max: current, per_attack: balance?.per_attack ?? 1 });
}

// There is no "next boss" endpoint, but /member/bosses/ already returns
// UPCOMING bosses alongside the live ones — it only drops archived, settled and
// already-ended rows. So the soonest upcoming boss other than this one is the
// next boss, and its starts_at drives the countdown.
async function nextBoss(excludeId) {
  const rows = list(await api.getBossWarBosses().catch(() => []));
  const upcoming = rows
    .filter((b) => b.uuid !== excludeId && lower(b.status) === "upcoming" && b.starts_at)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const soonest = upcoming[0];
  return {
    next: soonest ? toBossView(soonest) : null,
    nextStartsAt: soonest ? new Date(soonest.starts_at).toISOString() : null,
  };
}

export async function getGameStatus() {
  const res = await api.getBossWarSettings();
  return { open: Number(res?.game_status ?? 1) === 1 };
}

export async function getAttackPoints() {
  return toApView(await api.getBossWarBalance(memberUuid()));
}

export async function getBossList() {
  const uuid = memberUuid();
  const [bosses, balance] = await Promise.all([
    api.getBossWarBosses(),
    api.getBossWarBalance(uuid),
  ]);
  return {
    bosses: list(bosses).map(toBossView),
    ap: toApView(balance),
    serverTime: new Date().toISOString(),
  };
}

// The list payload omits the member's own damage/rank, so the battle screen
// pulls them from the rank endpoint and folds them onto the boss.
export async function getBattle(bossId) {
  const uuid = memberUuid();
  const [boss, balance, rank, upcoming] = await Promise.all([
    api.getBossWarBoss(bossId),
    api.getBossWarBalance(uuid),
    api.getBossWarMemberRank(bossId, uuid).catch(() => null),
    nextBoss(bossId),
  ]);
  return {
    boss: {
      ...toBossView(boss),
      myDamage: Number(rank?.amount ?? 0),
      myRank: rank?.rank ?? null,
    },
    ap: toApView(balance),
    ...upcoming,
  };
}

export async function attack(bossId) {
  const uuid = memberUuid();
  const res = await api.attackBossWarBoss(bossId, uuid);
  // The attack response carries the boss's new state inline rather than a
  // nested boss object, so rebuild the view from the fields it does return.
  const boss = await api.getBossWarBoss(bossId).catch(() => null);
  return {
    damage: Number(res?.damage ?? 0),
    critical: Boolean(res?.is_critical),
    apUsed: Number(res?.ap_used ?? 1),
    boss: boss
      ? { ...toBossView(boss), myDamage: Number(res?.my_damage ?? 0), myRank: res?.my_rank ?? null }
      : null,
    ap: toApView({ current: res?.attack_points, per_attack: res?.ap_used ?? 1 }),
    myRank: res?.my_rank ?? null,
  };
}

// Composed: the API has no results endpoint. Rank and damage come from the
// rank route, and any settled rewards from the member's reward log.
export async function getResults(bossId) {
  const uuid = memberUuid();
  const [boss, rank, rewards, upcoming] = await Promise.all([
    api.getBossWarBoss(bossId),
    api.getBossWarMemberRank(bossId, uuid).catch(() => null),
    api.getBossWarMemberRewards(bossId, uuid).catch(() => null),
    nextBoss(bossId),
  ]);

  const won = list(rewards);
  const byType = (type) => won.find((r) => String(r.reward_type).toUpperCase() === type) || null;
  const tier = (row, fallbackName) =>
    row
      ? { name: row.reward_name || fallbackName, desc: row.item_type || "", gem: lower(boss?.reward_gem, "common") }
      : null;

  const status = lower(boss?.status);

  return {
    boss: toBossView(boss),
    rank: rank?.rank ?? null,
    damage: Number(rank?.amount ?? 0),
    // Rewards only exist once the boss is settled; until then the screen shows
    // its "being calculated" line.
    calculating: status === "active" || won.length === 0,
    reward: {
      name: won[0]?.reward_name || "Reward Pending",
      desc: won.length ? won[0].item_type : "Final reward is configured by Admin",
      gem: lower(boss?.reward_gem, "common"),
    },
    rewards: {
      rank: tier(byType("RANKING"), "Ranking Reward"),
      boss: tier(byType("KILL"), "Boss Kill Reward"),
      participation: tier(byType("PARTICIPATION"), "Participation Reward"),
    },
    ...upcoming,
  };
}

// Top 20 by damage, names already masked by the API. `isMe` is resolved by
// matching the member's own rank, since the rows carry no uuid.
export async function getLeaderboard(bossId) {
  const uuid = memberUuid();
  const [ranking, mine] = await Promise.all([
    api.getBossWarRanking(bossId),
    api.getBossWarMemberRank(bossId, uuid).catch(() => null),
  ]);

  const myRank = mine?.rank ?? null;
  const rows = list(ranking).map((r, i) => {
    const rank = Number(r.rank ?? i + 1);
    return {
      rank,
      name: r.display_name ?? "",
      damage: Number(r.amount ?? 0),
      isMe: myRank != null && rank === myRank,
    };
  });

  const me = myRank
    ? { rank: myRank, name: rows.find((r) => r.isMe)?.name || "You", damage: Number(mine?.amount ?? 0) }
    : null;

  return { rows, me, total: rows.length };
}

// Composed from the boss's configured reward items. Without a boss in context
// the screen falls back to the spec's static tiers.
export async function getRewards(bossId) {
  if (!bossId) return { rank: RANK_REWARD_TIERS, boss: BOSS_REWARD_TIERS, event: EVENT_REWARD_TIERS };

  const items = list(await api.getBossWarRewardItems(bossId).catch(() => []))
    .filter((i) => !i.archived);

  const amountOf = (i) => {
    if (i.credit_amount != null) return `${i.credit_amount} Credit`;
    if (i.token_amount != null) return `${i.token_amount} KR Coins`;
    if (i.battle_point_amount != null) return `${i.battle_point_amount} BP`;
    if (i.attack_point_amount != null) return `${i.attack_point_amount} AP`;
    return i.item_type || "";
  };

  const rankLabel = (i) => {
    if (i.position_start == null) return "All";
    if (i.position_end == null || i.position_end === i.position_start) return `#${i.position_start}`;
    return `#${i.position_start}-${i.position_end}`;
  };

  const pick = (type, fallback) => {
    const rows = items.filter((i) => String(i.reward_type).toUpperCase() === type);
    if (!rows.length) return fallback;
    return rows.map((i) => ({
      id: i.uuid,
      rank: rankLabel(i),
      name: i.reward_name,
      desc: amountOf(i),
      gem: "common",
    }));
  };

  return {
    rank: pick("RANKING", RANK_REWARD_TIERS),
    boss: pick("KILL", BOSS_REWARD_TIERS),
    event: pick("PARTICIPATION", EVENT_REWARD_TIERS),
  };
}

// The attack-point ledger is the only cross-boss history the API exposes, and
// it records spend events rather than per-hit damage. Boss-scoped attack rows
// carry the damage, so use those when a boss is in context.
export async function getHistory({ limit = 50, bossId } = {}) {
  const uuid = memberUuid();

  if (bossId) {
    const res = await api.getBossWarAttacks(bossId, uuid, { page_size: limit });
    const boss = await api.getBossWarBoss(bossId).catch(() => null);
    return {
      rows: list(res).map((h) => ({
        id: h.uuid ?? h.id,
        time: h.created,
        bossName: boss?.name || "",
        damage: Number(h.damage ?? 0),
        critical: Boolean(h.is_critical),
        ap: Number(h.ap_used ?? 1),
      })),
      hasMore: Boolean(res?.next),
    };
  }

  // No boss selected: show the AP ledger's battle spends.
  const res = await api.getBossWarPoints(uuid, { page_size: limit });
  return {
    rows: list(res).map((h) => ({
      id: h.uuid,
      time: h.created,
      bossName: h.reason_type || "",
      damage: 0,
      critical: false,
      ap: Number(h.amount ?? 0),
    })),
    hasMore: Boolean(res?.next),
  };
}

// Raw boss record plus the global VIP combat table, for the Boss Info screen.
// Both are admin-configured, so the screen shows these instead of the spec's
// example damage range and crit rates.
export async function getBossInfo(bossId) {
  if (!bossId) return { boss: null, vip: [] };
  const [boss, vip] = await Promise.all([
    api.getBossWarBoss(bossId).catch(() => null),
    api.getBossWarVipBonuses().catch(() => []),
  ]);
  return { boss, vip: list(vip) };
}

// Deposit bands are real; the rest is spec copy. Tiles route to the feature
// that grants the points — there is no claim endpoint to call.
export async function getEarnRules() {
  const bands = list(await api.getBossWarDepositPoints().catch(() => []));
  return {
    deposit: bands.length
      ? bands.map((b) => ({ amount: Number(b.deposit_amount), ap: Number(b.attack_point_amount) }))
      : DEFAULT_DEPOSIT_AP,
    free: DEFAULT_FREE_AP,
    miniGames: MINI_GAMES_NOTE,
    tiles: EARN_TILES.map((t) => ({ ...t, claimable: false })),
  };
}
