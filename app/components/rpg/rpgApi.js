// Feature-local, API-shaped mock service for the RPG mini-game.
//
// There is no RPG backend yet. Every function here is async, latency
// simulated, and returns view-models shaped like future API responses so the
// screens never know they're talking to localStorage. When the backend lands,
// swap the internals for apiRequest(...) calls without touching components.
//
// State is one JSON blob per member under `mrs_member_rpg_<memberUuid>`
// (naming follows app/api/tokenStorage.js). Outcomes that matter (dice rolls,
// box drops) come from a counter-seeded PRNG persisted in the blob, so a
// mid-animation refresh can never reroll a result — mimicking server
// authority.

import { tokenStorage } from "../../api/tokenStorage";
import {
  MAX_LEVEL,
  EQUIP_POWER,
  POWER_PER_LEVEL,
  EQUIP_SLOTS,
  BACKPACK_CAPACITY,
  EXTRA_ATTEMPT_COST,
  DISCARD_COST,
  bpToNext,
  powerFor,
  BOSSES,
  MYSTERY_BOX_TABLE,
  EQUIPMENT_NAMES,
  RPG_MISSIONS,
  CHECKIN_RULES,
} from "./constants";

const VERSION = 1;
const LATENCY_MS = 220;

const wait = (ms = LATENCY_MS) => new Promise((r) => setTimeout(r, ms));

const apiError = (code, message) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function storageKey() {
  const uuid =
    (typeof window !== "undefined" && tokenStorage.getMemberUuid()) || "anon";
  return `mrs_member_rpg_${uuid}`;
}

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Monday-based start of the current week, as YYYY-MM-DD.
function weekStartStr() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - day);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function defaultState() {
  return {
    v: VERSION,
    hero: null, // { gender }
    level: 1,
    bp: 0,
    tokens: 0,
    tokensSeeded: false,
    equipment: { weapon: null, helmet: null, armor: null, boots: null },
    backpack: [], // [{ id, slot, name }]
    nextItemId: 1,
    starterGearSeeded: false,
    attempts: { date: todayStr(), freeUsed: false, paid: 0 },
    pendingBoxes: [], // [{ id, bossId }]
    nextBoxId: 1,
    rngCounter: 0,
    checkIn: { weekStart: weekStartStr(), days: [false, false, false, false, false, false, false], history: [] },
    counters: { bossesToday: 0, bossesWeek: 0, boxesWeek: 0, nebulaKills: 0, countersDate: todayStr(), countersWeek: weekStartStr() },
    claimedMissions: {}, // id -> date/weekStart it was claimed for
  };
}

let cache = null;
let cacheKey = null;

function loadState() {
  const key = storageKey();
  if (cache && cacheKey === key) return cache;
  let state = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) state = JSON.parse(raw);
  } catch {
    state = null;
  }
  if (!state || state.v !== VERSION) state = defaultState();
  cache = state;
  cacheKey = key;
  rollover(state);
  return state;
}

function saveState(state) {
  cache = state;
  cacheKey = storageKey();
  try {
    localStorage.setItem(cacheKey, JSON.stringify(state));
  } catch {
    // Storage full/blocked — keep playing off the in-memory cache.
  }
}

// Lazy date rollovers (no timers): daily attempts + daily/weekly counters +
// check-in week reset happen on read.
function rollover(state) {
  const today = todayStr();
  const week = weekStartStr();
  if (state.attempts.date !== today) {
    state.attempts = { date: today, freeUsed: false, paid: 0 };
  }
  if (state.counters.countersDate !== today) {
    state.counters.countersDate = today;
    state.counters.bossesToday = 0;
  }
  if (state.counters.countersWeek !== week) {
    state.counters.countersWeek = week;
    state.counters.bossesWeek = 0;
    state.counters.boxesWeek = 0;
  }
  if (state.checkIn.weekStart !== week) {
    state.checkIn = { weekStart: week, days: [false, false, false, false, false, false, false], history: state.checkIn.history || [] };
  }
}

// ---------------------------------------------------------------------------
// Deterministic RNG — one draw per counter tick, seeded off the member key,
// so outcomes are decided the moment they're persisted.
// ---------------------------------------------------------------------------

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function draw(state) {
  const seed = hashStr(storageKey()) ^ Math.imul(state.rngCounter + 1, 0x9e3779b9);
  state.rngCounter += 1;
  return mulberry32(seed)();
}

// ---------------------------------------------------------------------------
// View-model mappers
// ---------------------------------------------------------------------------

function equippedCount(state) {
  return EQUIP_SLOTS.filter((s) => state.equipment[s]).length;
}

function profileView(state) {
  const nextCost = bpToNext(state.level);
  return {
    hasHero: Boolean(state.hero),
    gender: state.hero?.gender || null,
    level: state.level,
    maxLevel: MAX_LEVEL,
    bp: state.bp,
    tokens: state.tokens,
    bpToNext: nextCost,
    expPct: state.level >= MAX_LEVEL ? 100 : Math.min(100, Math.round((state.bp / nextCost) * 100)),
    equippedCount: equippedCount(state),
    power: powerFor(state.level, equippedCount(state)),
    powerPerLevel: POWER_PER_LEVEL,
    equipPower: EQUIP_POWER,
    canLevelUp: state.level < MAX_LEVEL && state.bp >= nextCost,
  };
}

function itemView(item, state) {
  return {
    ...item,
    equipped: EQUIP_SLOTS.some((s) => state.equipment[s]?.id === item.id),
  };
}

// ---------------------------------------------------------------------------
// Profile / hero
// ---------------------------------------------------------------------------

// `seedTokens` (a parsed number) is applied exactly once per member: the RPG
// wallet starts from the member's real token balance but then lives its own
// life — we never write back to the real balance (no backend to honor it).
export async function getRpgProfile({ seedTokens } = {}) {
  await wait();
  const state = loadState();
  if (!state.tokensSeeded && Number.isFinite(seedTokens)) {
    state.tokens = Math.max(0, Math.floor(seedTokens));
    state.tokensSeeded = true;
  }
  grantStarterGear(state);
  saveState(state);
  return profileView(state);
}

export async function createHero(gender) {
  await wait();
  const state = loadState();
  if (state.hero) throw apiError("HERO_EXISTS", "Hero already created.");
  if (gender !== "male" && gender !== "female") {
    throw apiError("BAD_GENDER", "Choose male or female.");
  }
  state.hero = { gender };
  grantStarterGear(state);
  saveState(state);
  return profileView(state);
}

export async function levelUp() {
  await wait();
  const state = loadState();
  if (!state.hero) throw apiError("NO_HERO", "Create a hero first.");
  if (state.level >= MAX_LEVEL) throw apiError("MAX_LEVEL", "Already at max level.");
  const cost = bpToNext(state.level);
  if (state.bp < cost) throw apiError("INSUFFICIENT_BP", `Need ${cost.toLocaleString("en-GB")} BP to level up.`);
  state.bp -= cost;
  state.level += 1;
  saveState(state);
  return profileView(state);
}

// Dev/testing helper surfaced from the info modal.
export async function resetRpgState() {
  await wait(80);
  const state = defaultState();
  saveState(state);
  return profileView(state);
}

// ---------------------------------------------------------------------------
// Equipment / backpack
// ---------------------------------------------------------------------------

export async function getEquipment() {
  await wait();
  const state = loadState();
  return {
    slots: EQUIP_SLOTS.reduce((acc, s) => {
      acc[s] = state.equipment[s] ? itemView(state.equipment[s], state) : null;
      return acc;
    }, {}),
    backpack: state.backpack.map((i) => itemView(i, state)),
    capacity: BACKPACK_CAPACITY,
    profile: profileView(state),
  };
}

export async function equipItem(itemId) {
  await wait();
  const state = loadState();
  const idx = state.backpack.findIndex((i) => i.id === itemId);
  if (idx === -1) throw apiError("NOT_FOUND", "Item not in backpack.");
  const item = state.backpack[idx];
  state.backpack.splice(idx, 1);
  const current = state.equipment[item.slot];
  if (current) state.backpack.push(current); // swap back into the bag
  state.equipment[item.slot] = item;
  saveState(state);
  return getEquipmentSync(state);
}

export async function unequipItem(slot) {
  await wait();
  const state = loadState();
  const item = state.equipment[slot];
  if (!item) throw apiError("EMPTY_SLOT", "Nothing equipped in that slot.");
  if (state.backpack.length >= BACKPACK_CAPACITY) {
    throw apiError("BACKPACK_FULL", "Backpack is full — discard something first.");
  }
  state.equipment[slot] = null;
  state.backpack.push(item);
  saveState(state);
  return getEquipmentSync(state);
}

export async function discardItems(itemIds) {
  await wait();
  const state = loadState();
  const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
  const cost = ids.length * DISCARD_COST;
  if (state.tokens < cost) {
    throw apiError("INSUFFICIENT_TOKENS", `Discarding costs ${DISCARD_COST} Tokens per item (${cost} total).`);
  }
  const missing = ids.filter((id) => !state.backpack.some((i) => i.id === id));
  if (missing.length) throw apiError("NOT_FOUND", "Item not in backpack.");
  state.tokens -= cost;
  state.backpack = state.backpack.filter((i) => !ids.includes(i.id));
  saveState(state);
  return getEquipmentSync(state);
}

function getEquipmentSync(state) {
  return {
    slots: EQUIP_SLOTS.reduce((acc, s) => {
      acc[s] = state.equipment[s] ? itemView(state.equipment[s], state) : null;
      return acc;
    }, {}),
    backpack: state.backpack.map((i) => itemView(i, state)),
    capacity: BACKPACK_CAPACITY,
    profile: profileView(state),
  };
}

function makeItem(state, slot) {
  const names = EQUIPMENT_NAMES[slot];
  const name = names[Math.floor(draw(state) * names.length)];
  const item = { id: `item_${state.nextItemId}`, slot, name };
  state.nextItemId += 1;
  return item;
}

// TEMPORARY (mock only): stock the backpack with a one-time starter set (one
// item per slot, UNEQUIPPED) so the equipment art is visible before the real
// backend lands. Left unequipped so the player equips via the UI and early-game
// power stays balanced. Idempotent via `starterGearSeeded`.
// Remove this (and its two call sites) once real equipment comes from the API.
function grantStarterGear(state) {
  if (state.starterGearSeeded || !state.hero) return;
  EQUIP_SLOTS.forEach((slot) => {
    if (state.backpack.length < BACKPACK_CAPACITY) state.backpack.push(makeItem(state, slot));
  });
  state.starterGearSeeded = true;
}

// ---------------------------------------------------------------------------
// Bosses / battle
// ---------------------------------------------------------------------------

export async function getBosses() {
  await wait();
  const state = loadState();
  const power = powerFor(state.level, equippedCount(state));
  return {
    bosses: BOSSES.map((b) => ({
      ...b,
      locked: power < b.requiredPower,
      deficit: Math.max(0, b.requiredPower - power),
    })),
    freeAttemptAvailable: !state.attempts.freeUsed,
    extraAttemptCost: EXTRA_ATTEMPT_COST,
    tokens: state.tokens,
    power,
    profile: profileView(state),
  };
}

// Validates and *fully decides* the battle up front: the roll script and the
// reward box are persisted before the component animates anything, so a
// refresh can lose the show but never the outcome.
export async function startBattle(bossId) {
  await wait();
  const state = loadState();
  if (!state.hero) throw apiError("NO_HERO", "Create a hero first.");
  const boss = BOSSES.find((b) => b.id === bossId);
  if (!boss) throw apiError("NOT_FOUND", "Unknown boss.");
  const power = powerFor(state.level, equippedCount(state));
  if (power < boss.requiredPower) {
    throw apiError("LOCKED", `Need ${(boss.requiredPower - power).toLocaleString("en-GB")} more Power.`);
  }
  let paidWithTokens = false;
  if (state.attempts.freeUsed) {
    if (state.tokens < EXTRA_ATTEMPT_COST) {
      throw apiError("INSUFFICIENT_TOKENS", `Extra attempts cost ${EXTRA_ATTEMPT_COST} Tokens.`);
    }
    state.tokens -= EXTRA_ATTEMPT_COST;
    state.attempts.paid += 1;
    paidWithTokens = true;
  } else {
    state.attempts.freeUsed = true;
  }

  // Roll until the cumulative total clears the boss threshold.
  const rounds = [];
  let cumulative = 0;
  while (cumulative <= boss.diceThreshold) {
    const roll = 1 + Math.floor(draw(state) * 6);
    cumulative += roll;
    rounds.push({ roll, cumulative });
  }

  const boxId = `box_${state.nextBoxId}`;
  state.nextBoxId += 1;
  state.pendingBoxes.push({ id: boxId, bossId: boss.id });
  state.counters.bossesToday += 1;
  state.counters.bossesWeek += 1;
  if (boss.id === "nebula") state.counters.nebulaKills += 1;
  saveState(state);

  return {
    boss,
    rounds,
    threshold: boss.diceThreshold,
    boxId,
    paidWithTokens,
    tokens: state.tokens,
    power,
    profile: profileView(state),
  };
}

export async function getPendingBox(boxId) {
  await wait(80);
  const state = loadState();
  const box = state.pendingBoxes.find((b) => b.id === boxId);
  if (!box) return null;
  return { ...box, boss: BOSSES.find((b) => b.id === box.bossId) || null };
}

// Newest first — lets the box screen recover after a reload without a boxId.
export async function getLatestPendingBox() {
  await wait(80);
  const state = loadState();
  const box = state.pendingBoxes[state.pendingBoxes.length - 1];
  if (!box) return null;
  return { ...box, boss: BOSSES.find((b) => b.id === box.bossId) || null };
}

export async function openMysteryBox(boxId) {
  await wait();
  const state = loadState();
  const idx = state.pendingBoxes.findIndex((b) => b.id === boxId);
  if (idx === -1) throw apiError("NOT_FOUND", "No mystery box to open.");
  state.pendingBoxes.splice(idx, 1);

  // Weighted draw over the spec table.
  const total = MYSTERY_BOX_TABLE.reduce((s, r) => s + r.weight, 0);
  let ticket = draw(state) * total;
  let row = MYSTERY_BOX_TABLE[0];
  for (const r of MYSTERY_BOX_TABLE) {
    if (r.weight <= 0) continue;
    ticket -= r.weight;
    if (ticket <= 0) {
      row = r;
      break;
    }
  }

  const reward = { id: row.id, type: row.type, label: row.label, amount: row.amount || 0 };
  if (row.type === "tokens") {
    state.tokens += row.amount;
  } else if (row.type === "bp") {
    state.bp += row.amount;
  } else if (row.type === "levelup") {
    state.level = Math.min(MAX_LEVEL, state.level + row.amount);
  } else if (row.type === "equipment") {
    if (state.backpack.length >= BACKPACK_CAPACITY) {
      // Bag full — convert to a token consolation so the reward never vanishes.
      state.tokens += 10;
      reward.converted = true;
      reward.label = "Rare Equipment ×1 → Token ×10 (backpack full)";
    } else {
      const slot = EQUIP_SLOTS[Math.floor(draw(state) * EQUIP_SLOTS.length)];
      const item = makeItem(state, slot);
      state.backpack.push(item);
      reward.item = item;
    }
  }
  // "credit" / "gold" rewards are informational in the mock — nothing to apply.

  state.counters.boxesWeek += 1;
  saveState(state);
  return { reward, profile: profileView(state) };
}

// ---------------------------------------------------------------------------
// Missions (mock)
// ---------------------------------------------------------------------------

function missionPeriodKey(mission) {
  if (mission.tab === "daily") return todayStr();
  if (mission.tab === "weekly") return weekStartStr();
  return "all-time";
}

function missionProgress(state, mission) {
  const c = state.counters;
  switch (mission.metric) {
    case "checkinToday": {
      const dayIdx = (new Date().getDay() + 6) % 7;
      return state.checkIn.days[dayIdx] ? 1 : 0;
    }
    case "checkinWeek":
      return state.checkIn.days.filter(Boolean).length;
    case "deposit":
      return 0; // no deposit signal without a backend
    case "gamesPlayed":
      return Math.min(3, c.bossesToday); // boss fights count as mini-game plays in the mock
    case "bossesToday":
      return c.bossesToday;
    case "bossesWeek":
      return c.bossesWeek;
    case "boxesWeek":
      return c.boxesWeek;
    case "level":
      return state.level;
    case "equipped":
      return equippedCount(state);
    case "nebulaKills":
      return c.nebulaKills;
    default:
      return 0;
  }
}

export async function getRpgMissions() {
  await wait();
  const state = loadState();
  const missions = RPG_MISSIONS.map((m) => {
    const progress = Math.min(m.target, missionProgress(state, m));
    const claimed = state.claimedMissions[m.id] === missionPeriodKey(m);
    return {
      ...m,
      progress,
      claimed,
      claimable: !claimed && progress >= m.target,
    };
  });
  return { missions, profile: profileView(state) };
}

export async function claimRpgMission(missionId) {
  await wait();
  const state = loadState();
  const mission = RPG_MISSIONS.find((m) => m.id === missionId);
  if (!mission) throw apiError("NOT_FOUND", "Unknown mission.");
  const period = missionPeriodKey(mission);
  if (state.claimedMissions[mission.id] === period) {
    throw apiError("ALREADY_CLAIMED", "Reward already claimed.");
  }
  if (missionProgress(state, mission) < mission.target) {
    throw apiError("NOT_COMPLETE", "Mission not completed yet.");
  }
  state.claimedMissions[mission.id] = period;
  if (mission.reward.tokens) state.tokens += mission.reward.tokens;
  if (mission.reward.bp) state.bp += mission.reward.bp;
  saveState(state);
  return { reward: mission.reward, profile: profileView(state) };
}

// ---------------------------------------------------------------------------
// Daily check-in
// ---------------------------------------------------------------------------

function checkInView(state) {
  const dayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  const days = state.checkIn.days.map((checked, i) => {
    const rule = CHECKIN_RULES.days[i];
    return {
      day: i + 1,
      checked,
      isToday: i === dayIdx,
      isPast: i < dayIdx && !checked,
      bp: rule.bp,
      tokens: rule.tokens,
      double: Boolean(rule.double),
      weeklyPrize: rule.weekly ? CHECKIN_RULES.weeklyPrize : null,
    };
  });
  return {
    days,
    checkedCount: state.checkIn.days.filter(Boolean).length,
    todayChecked: state.checkIn.days[dayIdx],
    todayDouble: Boolean(CHECKIN_RULES.days[dayIdx].double),
    history: [...state.checkIn.history].reverse().slice(0, 30),
    profile: profileView(state),
  };
}

export async function getCheckInStatus() {
  await wait();
  return checkInView(loadState());
}

export async function checkIn() {
  await wait();
  const state = loadState();
  if (!state.hero) throw apiError("NO_HERO", "Create a hero first.");
  const dayIdx = (new Date().getDay() + 6) % 7;
  if (state.checkIn.days[dayIdx]) throw apiError("ALREADY_CHECKED", "Already checked in today.");
  state.checkIn.days[dayIdx] = true;

  const rule = CHECKIN_RULES.days[dayIdx];
  const bp = rule.bp;
  let tokens = rule.tokens;
  let mysteryBox = null;
  if (rule.weekly && state.checkIn.days.every(Boolean)) {
    tokens += CHECKIN_RULES.weeklyPrize.tokens;
    if (CHECKIN_RULES.weeklyPrize.mysteryBox) {
      const boxId = `box_${state.nextBoxId}`;
      state.nextBoxId += 1;
      state.pendingBoxes.push({ id: boxId, bossId: null });
      mysteryBox = boxId;
    }
  }
  state.bp += bp;
  state.tokens += tokens;
  state.checkIn.history.push({ date: new Date().toISOString(), day: dayIdx + 1, bp, tokens, mysteryBox: Boolean(mysteryBox) });
  saveState(state);
  return { reward: { bp, tokens, mysteryBox }, ...checkInView(state) };
}
