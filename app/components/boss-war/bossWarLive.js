// Boss War live backend adapter — same exports as bossWarMock.js. The field
// names below are best guesses at the pending API and are the ONLY place to
// touch when the real documentation lands (see ENDPOINTS.BOSS_WAR).

import * as api from "../../api/memberApi";
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

export async function getGameStatus() {
  const res = await api.getBossWarGameStatus();
  return { open: Number(res?.game_status ?? res?.status ?? 1) === 1 };
}

export async function getAttackPoints() {
  return apView(await api.getBossWarAttackPoints());
}

export async function getBossList() {
  const [bosses, ap] = await Promise.all([api.getBossWarBosses(), api.getBossWarAttackPoints()]);
  return { bosses: list(bosses).map(bossView), ap: apView(ap), serverTime: bosses?.server_time ?? new Date().toISOString() };
}

export async function getBattle(bossId) {
  const [boss, ap] = await Promise.all([api.getBossWarBoss(bossId), api.getBossWarAttackPoints()]);
  return {
    boss: bossView(boss),
    ap: apView(ap),
    next: boss?.next_boss ? bossView(boss.next_boss) : null,
    nextStartsAt: boss?.next_boss?.starts_at ?? null,
  };
}

export async function attack(bossId) {
  const res = await api.attackBossWarBoss(bossId);
  return {
    damage: Number(res?.damage ?? 0),
    critical: Boolean(res?.is_critical ?? res?.critical),
    apUsed: Number(res?.ap_used ?? 1),
    boss: bossView(res?.boss),
    ap: apView(res?.attack_points),
    myRank: res?.my_rank ?? null,
  };
}

const tierView = (t) => (t ? { name: t.name, desc: t.description ?? t.desc ?? "", gem: t.gem ?? t.tier ?? "common" } : null);

export async function getResults(bossId) {
  const res = await api.getBossWarResults(bossId);
  return {
    boss: bossView(res?.boss),
    rank: res?.my_rank ?? null,
    damage: Number(res?.my_damage ?? 0),
    calculating: Boolean(res?.calculating ?? res?.boss?.status === "active"),
    reward: tierView(res?.reward) || { name: "Common Reward", desc: "Final reward is configured by Admin", gem: "common" },
    rewards: {
      rank: tierView(res?.rank_reward),
      boss: tierView(res?.kill_reward),
      participation: tierView(res?.participation_reward),
    },
    next: res?.next_boss ? bossView(res.next_boss) : null,
    nextStartsAt: res?.next_boss?.starts_at ?? null,
  };
}

export async function getLeaderboard(bossId, params = {}) {
  const res = await api.getBossWarLeaderboard(bossId, params);
  const rows = list(res).map((r, i) => ({
    rank: Number(r.rank ?? i + 1),
    name: r.username ?? r.name ?? "",
    damage: Number(r.total_damage ?? r.damage ?? 0),
    isMe: Boolean(r.is_me),
  }));
  const me = res?.me
    ? { rank: Number(res.me.rank), name: res.me.username ?? res.me.name ?? "", damage: Number(res.me.total_damage ?? 0) }
    : rows.find((r) => r.isMe) || null;
  return { rows, me, total: Number(res?.count ?? rows.length) };
}

export async function getRewards() {
  const res = await api.getBossWarRewards();
  const pick = (key, fallback) => {
    const rows = list(res?.[key]);
    if (!rows.length) return fallback;
    return rows.map((t, i) => ({ id: t.uuid ?? `${key}-${i}`, rank: t.rank_label ?? t.rank ?? "", ...tierView(t) }));
  };
  return { rank: pick("ranking", RANK_REWARD_TIERS), boss: pick("kill", BOSS_REWARD_TIERS), event: pick("event", EVENT_REWARD_TIERS) };
}

export async function getHistory(params = {}) {
  const res = await api.getBossWarHistory(params);
  return {
    rows: list(res).map((h) => ({
      id: h.uuid ?? h.id,
      time: h.created_at ?? h.attacked_at,
      bossName: h.boss_name ?? h.boss?.name ?? "",
      damage: Number(h.damage ?? 0),
      critical: Boolean(h.is_critical ?? h.critical),
      ap: Number(h.ap_used ?? 1),
    })),
    hasMore: Boolean(res?.next),
  };
}

export async function getEarnRules() {
  const res = await api.getBossWarEarnRules();
  const claimed = new Set(list(res?.claimed_today));
  const deposit = list(res?.deposit_tiers);
  const free = list(res?.free_rules);
  return {
    deposit: deposit.length ? deposit.map((d) => ({ amount: Number(d.amount), ap: Number(d.ap) })) : DEFAULT_DEPOSIT_AP,
    free: free.length ? free.map((f, i) => ({ id: f.key ?? `free-${i}`, label: f.label, ap: Number(f.ap) })) : DEFAULT_FREE_AP,
    miniGames: res?.mini_games_note ?? MINI_GAMES_NOTE,
    tiles: EARN_TILES.map((t) => ({ ...t, claimable: !t.href && !claimed.has(t.id) })),
  };
}

export async function claimAp(source) {
  const res = await api.claimBossWarAttackPoints(source);
  return { gained: Number(res?.gained ?? 0), ap: apView(res?.attack_points ?? res) };
}
