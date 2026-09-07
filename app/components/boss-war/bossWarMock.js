// Boss War mock backend — same exports as bossWarLive.js so bossWarApi can
// swap sources with one flag. Stateful in sessionStorage so attacks consume
// AP, reduce boss HP, append history and eventually defeat the boss.
//
// Dev helpers (query params on /boss-war):
//   ?warMock=reset   wipe the mock state
//   ?warMock=weak    every active boss at ≤2,000 HP so DEFEATED is reachable fast
//   ?warMock=noap    zero Attack Points

import {
  AP_PER_ATTACK,
  BOSS_CATALOG,
  BOSS_REWARD_TIERS,
  DEFAULT_DEPOSIT_AP,
  DEFAULT_FREE_AP,
  EARN_TILES,
  EVENT_REWARD_TIERS,
  RANK_REWARD_TIERS,
} from "./constants";
import { bossView } from "./viewModels";

const KEY = "mrs_boss_war_mock";
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const latency = (ms = 220) => new Promise((r) => setTimeout(r, ms));

const MY_NAME = "Rea***66";
const MY_RANK_SEED = 23;

function seed(now) {
  const bosses = [
    { id: "goblin-king", hpMax: 60000, hp: 35400, participants: 1256, totalDamage: 3742560, myDamage: 125500, endsAt: now + 14 * HOUR + 23 * 60000 + 45000 },
    { id: "fire-dragon", hpMax: 1500000, hp: 1380000, participants: 842, totalDamage: 120000, myDamage: 0, endsAt: now + 5 * DAY + 3 * HOUR },
    { id: "ice-giant", hpMax: 5000000, hp: 4800000, participants: 311, totalDamage: 200000, myDamage: 0, endsAt: now + 6 * DAY + 11 * HOUR },
    { id: "titan-emperor", hpMax: 10000000, hp: 10000000, participants: 0, totalDamage: 0, myDamage: 0, endsAt: now + 12 * DAY },
  ].map((b) => ({ ...b, status: "active", startsAt: now - HOUR, defeatedAt: null, myRank: b.myDamage ? MY_RANK_SEED : null }));
  return { ap: { current: 12, max: 20 }, bosses, history: [], claimed: {}, vipDamageBonus: 1.2, vipCritRate: 0.15 };
}

function applyDebug(state) {
  if (typeof window === "undefined") return state;
  const mode = new URLSearchParams(window.location.search).get("warMock");
  if (mode === "weak") state.bosses.forEach((b) => { if (b.status === "active") b.hp = Math.min(b.hp, 2000); });
  if (mode === "noap") state.ap.current = 0;
  return state;
}

function save(state) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota / private mode */ }
}

function load() {
  const now = Date.now();
  if (typeof window === "undefined") return seed(now);
  const mode = new URLSearchParams(window.location.search).get("warMock");
  let state = null;
  if (mode !== "reset") {
    try { state = JSON.parse(window.sessionStorage.getItem(KEY) || "null"); } catch { state = null; }
  }
  if (!state) { state = applyDebug(seed(now)); save(state); }
  else if (mode === "weak" || mode === "noap") { applyDebug(state); save(state); }
  return state;
}

function raw(state, id) {
  const b = state.bosses.find((x) => x.id === id);
  if (!b) { const err = new Error("Boss not found."); err.status = 404; throw err; }
  return b;
}

function toServer(b) {
  const cat = BOSS_CATALOG[b.id] || {};
  return {
    uuid: b.id, name: cat.name, boss_type: cat.type, hp_max: b.hpMax, hp_remaining: b.hp, status: b.status,
    starts_at: new Date(b.startsAt).toISOString(), ends_at: new Date(b.endsAt).toISOString(),
    participants: b.participants, total_damage: b.totalDamage, my_damage: b.myDamage, my_rank: b.myRank, reward_gem: cat.gem,
  };
}

function nextBossAfter(state, id) {
  const cur = raw(state, id);
  const candidates = state.bosses.filter((b) => b.id !== id && b.status === "active").sort((a, b) => a.endsAt - b.endsAt);
  const next = candidates[0] || null;
  return { next: next ? bossView(toServer(next)) : null, nextStartsAt: new Date(cur.endsAt + 2 * HOUR).toISOString() };
}

const ap = (s) => ({ current: s.ap.current, max: s.ap.max, perAttack: AP_PER_ATTACK });

// ---------------------------------------------------------------------------

export async function getGameStatus() { await latency(80); return { open: true }; }

export async function getAttackPoints() {
  await latency(80);
  return ap(load());
}

export async function getBossList() {
  await latency();
  const s = load();
  return { bosses: s.bosses.map((b) => bossView(toServer(b))), ap: ap(s), serverTime: new Date().toISOString() };
}

export async function getBattle(bossId) {
  await latency();
  const s = load();
  const b = raw(s, bossId);
  return { boss: bossView(toServer(b)), ap: ap(s), ...nextBossAfter(s, bossId) };
}

export async function attack(bossId) {
  await latency(350);
  const s = load();
  const b = raw(s, bossId);
  if (b.status !== "active") { const err = new Error("This boss is no longer active."); err.status = 409; throw err; }
  if (s.ap.current < AP_PER_ATTACK) { const err = new Error("Not enough Attack Points."); err.status = 402; throw err; }

  const base = 100 + Math.floor(Math.random() * 401);
  const critical = Math.random() < s.vipCritRate;
  const damage = Math.round(base * (critical ? 2 : 1) * s.vipDamageBonus);

  s.ap.current -= AP_PER_ATTACK;
  b.hp = Math.max(0, b.hp - damage);
  b.myDamage += damage;
  b.totalDamage += damage;
  if (!b.myRank) { b.myRank = MY_RANK_SEED; b.participants += 1; }
  else if (b.myDamage > 200000 && b.myRank > 5) b.myRank -= 1;
  if (b.hp === 0) { b.status = "defeated"; b.defeatedAt = Date.now(); }
  s.history.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), bossId, damage, critical, ap: AP_PER_ATTACK });
  s.history = s.history.slice(0, 200);
  save(s);

  return { damage, critical, apUsed: AP_PER_ATTACK, boss: bossView(toServer(b)), ap: ap(s), myRank: b.myRank };
}

function rankTier(rank) {
  if (rank == null) return null;
  if (rank === 1) return RANK_REWARD_TIERS[0];
  if (rank <= 10) return RANK_REWARD_TIERS[1];
  if (rank <= 100) return RANK_REWARD_TIERS[2];
  if (rank <= 1000) return RANK_REWARD_TIERS[3];
  return RANK_REWARD_TIERS[4];
}

export async function getResults(bossId) {
  await latency();
  const s = load();
  const b = raw(s, bossId);
  const tier = rankTier(b.myRank);
  const share = b.totalDamage ? ((b.myDamage / b.totalDamage) * 100).toFixed(2) : "0.00";
  return {
    boss: bossView(toServer(b)),
    rank: b.myRank,
    damage: b.myDamage,
    calculating: b.status === "active",
    reward: { name: "Common Reward", desc: "Final reward is configured by Admin", gem: "common" },
    rewards: {
      rank: tier ? { name: tier.name, desc: tier.desc, gem: tier.gem } : null,
      boss: { name: "Boss Kill Reward", desc: `Contribution ${share}%`, gem: "epic" },
      participation: { name: "Participation Reward", desc: "All qualified participants", gem: "common" },
    },
    ...nextBossAfter(s, bossId),
  };
}

export async function getLeaderboard(bossId, { limit = 50 } = {}) {
  await latency();
  const s = load();
  const b = raw(s, bossId);
  const myRank = b.myRank;
  const rows = [];
  for (let i = 1; i <= limit; i++) {
    const isMe = i === myRank;
    const damage = isMe ? b.myDamage : Math.max(myRank ? b.myDamage + (myRank - i) * 48000 : 5200000 - i * 90000, 1000);
    rows.push({ rank: i, name: isMe ? MY_NAME : `Rea***${(66 + i * 7) % 100}`, damage, isMe });
  }
  return { rows, me: myRank ? { rank: myRank, name: MY_NAME, damage: b.myDamage } : null, total: b.participants };
}

export async function getRewards() {
  await latency(120);
  return { rank: RANK_REWARD_TIERS, boss: BOSS_REWARD_TIERS, event: EVENT_REWARD_TIERS };
}

export async function getHistory({ limit = 50 } = {}) {
  await latency();
  const s = load();
  const rows = s.history.slice(0, limit).map((h) => ({
    id: h.id, time: h.at, bossName: BOSS_CATALOG[h.bossId]?.name || h.bossId, damage: h.damage, critical: h.critical, ap: h.ap,
  }));
  return { rows, hasMore: s.history.length > limit };
}

export async function getEarnRules() {
  await latency(120);
  const s = load();
  return {
    deposit: DEFAULT_DEPOSIT_AP,
    free: DEFAULT_FREE_AP,
    miniGames: "Play eligible MRS mini games to earn Attack Points. Exact reward follows campaign configuration.",
    tiles: EARN_TILES.map((t) => ({ ...t, claimable: !t.href && !s.claimed[t.id] })),
  };
}

export async function claimAp(source) {
  await latency(300);
  const s = load();
  if (s.claimed[source]) { const err = new Error("Already claimed today."); err.status = 409; throw err; }
  const gained = source === "deposit" ? 2 : 1;
  s.claimed[source] = Date.now();
  s.ap.current = Math.min(s.ap.max, s.ap.current + gained);
  save(s);
  return { gained, ap: ap(s) };
}
