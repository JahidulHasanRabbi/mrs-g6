// RPG mini-game service — real /avatar/* backend adapter.
//
// Screens consume the same view-models the old localStorage mock produced, so
// this file is the ONLY place that knows the API's integer enums and response
// shapes. Raw calls live in app/api/memberApi.js (global API layer); the
// enum ↔ frontend-key maps live in app/config/avatarOptions.js (global config).
//
// View-model contract (unchanged from the mock):
//   profile   → { hasHero, gender, level, maxLevel, bp, tokens, bpToNext,
//                 expPct, equippedCount, power, powerPerLevel, equipPower,
//                 levelPower, bpPerLevelMultiplier, canLevelUp, gameOpen,
//                 discardCost, extraAttemptCost }
//   equipment → { slots: {weapon|helmet|armor|boots: item|null},
//                 backpack: [item], capacity, profile }
//   item      → { id (member equipment uuid), slot, name, power, equipped }
//   boss      → constants.BOSSES visual entry merged with server stats
//               { uuid, requiredPower, hp, diceThreshold, rewardSlot,
//                 locked, deficit, totalDefeats }

import {
  getAvatarGameStatus,
  getAvatarSettings,
  getAvatarProfile,
  startAvatarJourney,
  avatarLevelUp,
  getMyAvatarEquipment,
  equipAvatarEquipment,
  unequipAvatarEquipment,
  discardAvatarEquipment,
  getMyAvatarMissions,
  claimAvatarMission,
  getAvatarChallengeStatus,
  attackAvatarBoss,
  openAvatarMysteryBox,
  getMyAvatarBoxes,
  getAvatarMysteryBoxCatalog,
  getMemberInfo,
} from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";
import {
  GENDER_KEY_BY_CODE,
  GENDER_CODE_BY_KEY,
  SLOT_KEY_BY_CODE,
  PLANET_KEY_BY_CODE,
} from "../../config/avatarOptions";
import { BOSSES, RPG_VIEWS } from "./constants";

// ---------------------------------------------------------------------------
// Errors — surface the backend's message (screens show err.message in
// NoticeModal), keep a code for programmatic checks.
// ---------------------------------------------------------------------------

// The API's player-facing reason lives in `details` ("Already checked in
// today", "Battle power is too low…"); `error` is only the generic bucket
// ("Invalid request"), so `details` is read first.
function gameError(err, fallback) {
  const data = err?.data;
  let message = null;
  if (typeof data === "string") {
    message = data;
  } else if (data && typeof data === "object") {
    const details = data.details;
    if (typeof details === "string") {
      message = details;
    } else if (details && typeof details === "object") {
      // Field validation shape: { field: ["msg"] }
      for (const val of Object.values(details)) {
        const msg = Array.isArray(val) ? val[0] : val;
        if (typeof msg === "string") {
          message = msg;
          break;
        }
      }
    }
    if (!message && data.detail) message = String(data.detail);
    if (!message && typeof data.error === "string") message = data.error;
  }
  const out = new Error(message || fallback || "Something went wrong. Please try again.");
  out.code = err?.status;
  return out;
}

const rethrow = (fallback) => (err) => {
  throw gameError(err, fallback);
};

// ---------------------------------------------------------------------------
// Session caches — settings rarely change; challenge status is cached so
// startBattle can resolve a planet key back to its boss uuid.
// ---------------------------------------------------------------------------

// Nothing is cached between calls: every read hits the API. Module-level
// state would outlive a member switch (/auth?id=… is a client-side push, so
// the module is never reloaded) and there is no cheap way to be sure it is
// still valid — so we just always ask.
const getSettings = getAvatarSettings;

// TEMP DEV CHECK: enables a full-equipment dummy profile with
// /rpg?dummyRpg=fullArmor. Remove this block after visual QA is done.
const DUMMY_RPG_KEY = "mrs_rpg_dummy_api";
const DUMMY_RPG_GENDER_KEY = "mrs_rpg_dummy_gender";

function dummyRpgMode() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get("dummyRpg");
  const requestedGender = params.get("gender");

  if (requestedGender === "male" || requestedGender === "female") {
    window.sessionStorage.setItem(DUMMY_RPG_GENDER_KEY, requestedGender);
  }

  if (requestedMode === "off") {
    window.sessionStorage.removeItem(DUMMY_RPG_KEY);
    window.sessionStorage.removeItem(DUMMY_RPG_GENDER_KEY);
    return false;
  }

  if (requestedMode === "fullArmor" || requestedMode === "1") {
    window.sessionStorage.setItem(DUMMY_RPG_KEY, "fullArmor");
    return true;
  }

  return window.sessionStorage.getItem(DUMMY_RPG_KEY) === "fullArmor";
}

function dummyGender() {
  if (typeof window === "undefined") return "female";
  const params = new URLSearchParams(window.location.search);
  const requestedGender = params.get("gender");
  if (requestedGender === "male" || requestedGender === "female") return requestedGender;
  return window.sessionStorage.getItem(DUMMY_RPG_GENDER_KEY) || "female";
}

function dummyProfile() {
  return {
    hasHero: true,
    gender: dummyGender(),
    level: 11,
    maxLevel: 100,
    bp: 2400,
    tokens: 99000,
    bpToNext: 1100,
    expPct: 100,
    equippedCount: 4,
    power: 5500,
    levelPower: 1500,
    equipPower: 4000,
    powerPerLevel: 500,
    bpPerLevelMultiplier: 100,
    equipmentSlotCount: 4,
    backpackCapacity: 100,
    discardCost: 10,
    extraAttemptCost: 10,
    canLevelUp: true,
    gameOpen: true,
  };
}

function dummyEquipment() {
  const profile = dummyProfile();
  const slots = {
    weapon: { id: "dummy-weapon", slot: "weapon", name: "Void Cleaver", power: 1000, equipped: true },
    helmet: { id: "dummy-helmet", slot: "helmet", name: "Warden Visor", power: 1000, equipped: true },
    armor: { id: "dummy-armor", slot: "armor", name: "Nebula Aegis", power: 1000, equipped: true },
    boots: { id: "dummy-boots", slot: "boots", name: "Astral Walkers", power: 1000, equipped: true },
  };
  return {
    slots,
    backpack: [
      { id: "dummy-backpack-weapon", slot: "weapon", name: "Starfall Blade", power: 1000, equipped: false },
      { id: "dummy-backpack-helmet", slot: "helmet", name: "Sentinel Helm", power: 1000, equipped: false },
    ],
    capacity: profile.backpackCapacity,
    profile,
  };
}

// Dummy mode is a pure front-end sandbox with no server to write to, so the
// equip / unequip / discard calls mutate this in-memory copy of the seed. They
// used to each return a fresh `dummyEquipment()`, which made Hero Item look
// broken — drag-to-equip and tap-to-equip fired correctly but the grid
// re-rendered from identical data, so nothing ever moved.
let dummyEquipmentState = null;

function dummyStore() {
  if (!dummyEquipmentState) dummyEquipmentState = dummyEquipment();
  return dummyEquipmentState;
}

// A fresh object each time, so React sees a new reference and re-renders.
function dummySnapshot() {
  const store = dummyStore();
  return {
    slots: { ...store.slots },
    backpack: [...store.backpack],
    capacity: store.capacity,
    profile: store.profile,
  };
}

function dummyEquip(itemId) {
  const store = dummyStore();
  const i = store.backpack.findIndex((it) => it.id === itemId);
  if (i === -1) return dummySnapshot();
  const [item] = store.backpack.splice(i, 1);
  // Equipping into an occupied slot swaps the old piece back into the bag.
  const displaced = store.slots[item.slot];
  if (displaced) store.backpack.push({ ...displaced, equipped: false });
  store.slots[item.slot] = { ...item, equipped: true };
  return dummySnapshot();
}

function dummyUnequip(slot) {
  const store = dummyStore();
  const item = store.slots[slot];
  if (!item) return dummySnapshot();
  store.slots[slot] = null;
  store.backpack.push({ ...item, equipped: false });
  return dummySnapshot();
}

function dummyDiscard(itemIds) {
  const store = dummyStore();
  const drop = new Set(Array.isArray(itemIds) ? itemIds : [itemIds]);
  store.backpack = store.backpack.filter((it) => !drop.has(it.id));
  return dummySnapshot();
}

function dummyBosses() {
  return {
    bosses: BOSSES.map((boss) => ({
      ...boss,
      uuid: `dummy-${boss.id}`,
      locked: false,
      deficit: 0,
      totalDefeats: boss.id === "nebula" ? 7 : 1,
    })),
    freeAttemptAvailable: true,
    freeAttemptsRemaining: 1,
    extraAttemptCost: 10,
    unopenedBoxes: 0,
    tokens: 99000,
    power: 5500,
    gameOpen: true,
  };
}

// Members' token balance lives on the member record, not the avatar profile.
async function fetchTokens() {
  const uuid = typeof window !== "undefined" ? tokenStorage.getMemberUuid() : null;
  if (!uuid) return 0;
  try {
    const info = await getMemberInfo(uuid);
    const n = Number(info?.current_tokens);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// View-model mappers
// ---------------------------------------------------------------------------

function itemView(row) {
  return {
    id: row.uuid,
    slot: SLOT_KEY_BY_CODE[row.slot_type] || "weapon",
    name: row.item_name,
    power: row.power_bonus,
    equipped: Boolean(row.is_equipped),
  };
}

function profileView({ profile, settings, equippedRows, tokens, gameStatus }) {
  const hasHero = Boolean(profile?.journey_started);
  const level = profile?.level ?? 1;
  const maxLevel = profile?.max_level ?? settings?.max_level ?? 100;
  const bp = profile?.current_battle_points ?? 0;
  const bpToNext = profile?.next_level_cost ?? level * (settings?.battle_point_per_level_multiplier ?? 100);
  const power = profile?.battle_power ?? 0;
  const powerPerLevel = settings?.battle_power_per_level ?? 500;
  const equipPower = (equippedRows || []).reduce((s, r) => s + (r.power_bonus || 0), 0);
  return {
    hasHero,
    gender: hasHero ? GENDER_KEY_BY_CODE[profile.gender] || null : null,
    level,
    maxLevel,
    bp,
    tokens: tokens ?? 0,
    bpToNext,
    expPct: level >= maxLevel ? 100 : Math.min(100, Math.round((bp / (bpToNext || 1)) * 100)),
    equippedCount: (equippedRows || []).length,
    power,
    levelPower: power - equipPower,
    equipPower,
    powerPerLevel,
    bpPerLevelMultiplier: settings?.battle_point_per_level_multiplier ?? 100,
    equipmentSlotCount: settings?.equipment_slot_count ?? 4,
    backpackCapacity: settings?.backpack_capacity ?? 100,
    discardCost: settings?.discard_equipment_cost ?? 10,
    extraAttemptCost: settings?.extra_attempt_token_cost ?? 10,
    canLevelUp: level < maxLevel && bp >= bpToNext,
    gameOpen: (gameStatus ?? settings?.game_status ?? 1) === 1,
  };
}

// Fetch everything the profile view needs in one go.
async function loadProfileView({ withGameStatus = false } = {}) {
  const [settings, profile, equippedRows, tokens, status] = await Promise.all([
    getSettings(),
    getAvatarProfile(),
    getMyAvatarEquipment({ is_equipped: true }).catch(() => []),
    fetchTokens(),
    withGameStatus ? getAvatarGameStatus().catch(() => null) : Promise.resolve(null),
  ]);
  return profileView({
    profile,
    settings,
    equippedRows: profile?.journey_started ? equippedRows : [],
    tokens,
    gameStatus: status?.game_status,
  });
}

function equipmentView(rows, profile) {
  const slots = { weapon: null, helmet: null, armor: null, boots: null };
  const backpack = [];
  (rows || []).forEach((row) => {
    const item = itemView(row);
    if (item.equipped && slots[item.slot] === null) slots[item.slot] = item;
    else backpack.push(item);
  });
  return { slots, backpack, capacity: profile.backpackCapacity, profile };
}

// Merge a server boss over its fixed visual identity (constants.BOSSES is
// keyed by planet — gradients, names, art keys used by rpgAssets).
function bossView(server, battlePower) {
  const key = PLANET_KEY_BY_CODE[server.planet] || "starlight";
  const base = BOSSES.find((b) => b.id === key) || BOSSES[0];
  const locked = !server.is_unlocked;
  return {
    ...base,
    uuid: server.uuid,
    requiredPower: server.power_required,
    hp: server.hp,
    diceThreshold: server.dice_threshold,
    rewardSlot: SLOT_KEY_BY_CODE[server.equipment_reward_slot] || base.rewardSlot,
    locked,
    deficit: Math.max(0, server.power_required - (battlePower ?? 0)),
    totalDefeats: server.total_defeats ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Profile / hero
// ---------------------------------------------------------------------------

export async function getRpgProfile() {
  if (dummyRpgMode()) return dummyProfile();
  try {
    return await loadProfileView({ withGameStatus: true });
  } catch (err) {
    throw gameError(err, "Could not load your avatar profile.");
  }
}

export async function createHero(gender) {
  if (dummyRpgMode()) {
    if (typeof window !== "undefined" && (gender === "male" || gender === "female")) {
      window.sessionStorage.setItem(DUMMY_RPG_GENDER_KEY, gender);
    }
    return dummyProfile();
  }
  const code = GENDER_CODE_BY_KEY[gender];
  if (!code) throw gameError(null, "Choose male or female.");
  try {
    await startAvatarJourney(code);
  } catch (err) {
    throw gameError(err, "Could not create your hero. Please try again.");
  }
  return loadProfileView();
}

export async function levelUp() {
  if (dummyRpgMode()) return dummyProfile();
  try {
    await avatarLevelUp();
  } catch (err) {
    throw gameError(err, "Could not level up.");
  }
  return loadProfileView();
}

// ---------------------------------------------------------------------------
// Equipment / backpack
// ---------------------------------------------------------------------------

async function loadEquipmentView() {
  const [settings, rows, profile, tokens] = await Promise.all([
    getSettings(),
    getMyAvatarEquipment(),
    getAvatarProfile(),
    fetchTokens(),
  ]);
  const equippedRows = rows.filter((r) => r.is_equipped);
  const pv = profileView({ profile, settings, equippedRows, tokens });
  return equipmentView(rows, pv);
}

export async function getEquipment() {
  if (dummyRpgMode()) return dummySnapshot();
  try {
    return await loadEquipmentView();
  } catch (err) {
    throw gameError(err, "Could not load your equipment.");
  }
}

export async function equipItem(itemId) {
  if (dummyRpgMode()) return dummyEquip(itemId);
  try {
    await equipAvatarEquipment(itemId);
  } catch (err) {
    throw gameError(err, "Could not equip that item.");
  }
  return loadEquipmentView();
}

export async function unequipItem(slot) {
  if (dummyRpgMode()) return dummyUnequip(slot);
  // The API unequips by member-equipment uuid, so resolve the slot first.
  let rows;
  try {
    rows = await getMyAvatarEquipment({ is_equipped: true });
  } catch (err) {
    throw gameError(err, "Could not load your equipment.");
  }
  const slotCode = { weapon: 1, helmet: 2, armor: 3, boots: 4 }[slot];
  const row = (rows || []).find((r) => r.slot_type === slotCode);
  if (!row) throw gameError(null, "Nothing equipped in that slot.");
  try {
    await unequipAvatarEquipment(row.uuid);
  } catch (err) {
    throw gameError(err, "Could not unequip that item.");
  }
  return loadEquipmentView();
}

// The API discards one item per call and charges tokens each time, so a batch
// runs sequentially and stops at the first refusal (e.g. not enough tokens).
// Items discarded before the failure stay discarded — the error carries how
// far it got so the screen can say so.
export async function discardItems(itemIds) {
  if (dummyRpgMode()) return dummyDiscard(itemIds);
  const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
  let done = 0;
  for (const id of ids) {
    try {
      await discardAvatarEquipment(id);
      done += 1;
    } catch (err) {
      const error = gameError(err, "Could not discard.");
      if (done > 0) {
        error.message = `${error.message} (${done} of ${ids.length} discarded)`;
      }
      throw error;
    }
  }
  return loadEquipmentView();
}

// ---------------------------------------------------------------------------
// Bosses / battle
// ---------------------------------------------------------------------------

export async function getBosses() {
  if (dummyRpgMode()) return dummyBosses();
  let status;
  try {
    status = await getAvatarChallengeStatus();
  } catch (err) {
    throw gameError(err, "Could not load the challenge.");
  }
  const [settings, tokens] = await Promise.all([getSettings(), fetchTokens()]);
  return {
    bosses: (status.bosses || []).map((b) => bossView(b, status.battle_power)),
    freeAttemptAvailable: (status.free_attempts_remaining ?? 0) > 0,
    freeAttemptsRemaining: status.free_attempts_remaining ?? 0,
    extraAttemptCost: status.extra_attempt_token_cost ?? settings.extra_attempt_token_cost ?? 10,
    unopenedBoxes: status.unopened_boxes ?? 0,
    tokens,
    power: status.battle_power ?? 0,
    gameOpen: (status.game_status ?? 1) === 1,
  };
}

// The attack response fully decides the battle: the roll script and the
// reward box come back at once, so the Battle screen is pure theatre — a
// refresh can lose the show but never the outcome (the box stays claimable
// via my-boxes).
export async function startBattle(bossId) {
  if (dummyRpgMode()) {
    const profile = dummyProfile();
    const boss = (dummyBosses().bosses || []).find((b) => b.id === bossId) || dummyBosses().bosses[3];
    const threshold = boss.diceThreshold ?? 6;
    // Enough rolls to actually cross the threshold. The old script was a single
    // roll of 6, which cannot beat a threshold of 6 OR 12 — so every sandbox
    // battle ended one press in with the run unwinnable and no rounds left.
    const rounds = [];
    let cumulative = 0;
    while (cumulative <= threshold) {
      const roll = 3 + ((rounds.length * 2) % 4); // 3,5,3,5… deterministic
      cumulative += roll;
      rounds.push({ roll, cumulative });
    }
    return {
      boss,
      rounds,
      threshold,
      boxId: "dummy-box",
      paidWithTokens: false,
      tokenCost: 0,
      tokens: profile.tokens,
      power: profile.power,
      profile,
    };
  }
  // bossId is the planet art key ("starlight"...) the screens use; the attack
  // endpoint needs the boss uuid, so read the current status to resolve it.
  let status;
  try {
    status = await getAvatarChallengeStatus();
  } catch (err) {
    throw gameError(err, "Could not load the challenge.");
  }
  const planetCode = { starlight: 1, comet: 2, meteor: 3, nebula: 4 }[bossId];
  const server = (status.bosses || []).find((b) => b.planet === planetCode);
  if (!server) throw gameError(null, "Unknown boss.");

  let attack;
  try {
    attack = await attackAvatarBoss(server.uuid);
  } catch (err) {
    throw gameError(err, "Could not start the battle.");
  }

  const profile = await loadProfileView();
  return {
    boss: bossView({ ...server, is_unlocked: true }, attack.battle_power),
    rounds: (attack.dice_rounds || []).map((r) => ({ roll: r.roll, cumulative: r.cumulative })),
    threshold: attack.dice_threshold ?? server.dice_threshold,
    boxId: attack.mystery_box_uuid,
    paidWithTokens: !attack.is_free,
    tokenCost: attack.token_cost ?? 0,
    tokens: profile.tokens,
    power: attack.battle_power ?? profile.power,
    profile,
  };
}

function boxView(row) {
  const key = PLANET_KEY_BY_CODE[row.planet] || null;
  const boss = key ? BOSSES.find((b) => b.id === key) || null : null;
  return { id: row.uuid, bossId: key, boss, created: row.created };
}

async function unopenedBoxes() {
  const data = await getMyAvatarBoxes({ is_opened: false, page_size: 100 });
  const rows = data.results ?? data ?? [];
  // Newest first regardless of server ordering.
  return rows
    .map(boxView)
    .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
}

export async function getPendingBox(boxId) {
  if (dummyRpgMode()) {
    const boss = BOSSES.find((b) => b.id === "nebula") || BOSSES[0];
    return { id: boxId || "dummy-box", bossId: boss.id, boss, created: new Date().toISOString() };
  }
  try {
    const boxes = await unopenedBoxes();
    return boxes.find((b) => b.id === boxId) || null;
  } catch {
    return null;
  }
}

// Newest unopened box — lets the box screen recover after a reload.
export async function getLatestPendingBox() {
  if (dummyRpgMode()) {
    const boss = BOSSES.find((b) => b.id === "nebula") || BOSSES[0];
    return { id: "dummy-box", bossId: boss.id, boss, created: new Date().toISOString() };
  }
  try {
    const boxes = await unopenedBoxes();
    return boxes[0] || null;
  } catch {
    return null;
  }
}

// Reward types: 1 TOKEN 2 BATTLE-POINT 3 FREE-CREDIT 4 EQUIPMENT 5 LEVEL-UP 6 GOLD-BAR
const REWARD_TYPE_KEYS = { 1: "tokens", 2: "bp", 3: "credit", 4: "equipment", 5: "levelup", 6: "gold" };

// The "possible rewards" panel — the live admin catalog, not a hardcoded
// table. Show every item returned by the API, including zero-probability items.
export async function getMysteryBoxRewards() {
  try {
    const data = await getAvatarMysteryBoxCatalog({ page_size: 100 });
    const rows = data.results ?? data ?? [];
    return rows.map((r) => ({
      id: r.uuid,
      type: REWARD_TYPE_KEYS[r.reward_type] || "tokens",
      label: r.reward_name,
      image: r.image || null,
      probability: Number(r.probability) || 0,
    }));
  } catch {
    // A missing catalog must never block opening a box.
    return [];
  }
}

export async function openMysteryBox(boxId) {
  if (dummyRpgMode()) {
    return {
      reward: {
        type: "equipment",
        label: "Nebula Aegis",
        amount: 0,
        item: { name: "Nebula Aegis", slot: "armor" },
      },
      profile: dummyProfile(),
    };
  }
  let result;
  try {
    result = await openAvatarMysteryBox(boxId);
  } catch (err) {
    throw gameError(err, "Could not open the mystery box.");
  }
  const type = REWARD_TYPE_KEYS[result.reward_type] || "tokens";
  const reward = {
    type,
    label: result.reward_name || "Reward",
    amount:
      type === "tokens"
        ? result.token_amount ?? 0
        : type === "bp"
          ? result.battle_point_amount ?? 0
          : type === "levelup"
            ? result.level_up_count ?? 0
            : type === "credit"
              ? Number(result.reward_credit_amount ?? 0)
              : 0,
  };
  if (type === "equipment" && result.equipment_name) {
    reward.item = {
      name: result.equipment_name,
      slot: SLOT_KEY_BY_CODE[result.equipment_slot] || "weapon",
    };
  }
  const profile = await loadProfileView();
  return { reward, profile };
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

// category 1..4 → tab keys; condition_action → GO deep link + icon hint.
const TAB_BY_CATEGORY = { 1: "daily", 2: "weekly", 3: "monthly", 4: "achievement" };
const GO_BY_ACTION = {
  1: null, //             Login — happens outside the game
  2: null, //             Deposit Amount — happens outside the game
  3: RPG_VIEWS.CHALLENGE, // Boss Battle
  4: RPG_VIEWS.CHALLENGE, // Obtain Equipment — mystery boxes drop gear
  5: RPG_VIEWS.ITEMS, //   Full Equipment Set
  6: null, //             Complete Missions — this screen itself
};
const METRIC_BY_ACTION = { 2: "deposit" }; // icon hints

function missionView(m) {
  const target = m.accumulate_target ?? 1;
  const progress = Math.min(target, m.current_value ?? 0);
  return {
    id: m.uuid,
    tab: TAB_BY_CATEGORY[m.category] || "daily",
    title: m.mission_name,
    description: m.description || "",
    reward: { tokens: m.reward_token_quantity || 0, bp: m.reward_battle_point_quantity || 0 },
    target,
    progress,
    metric: METRIC_BY_ACTION[m.condition_action] || "bp",
    go: GO_BY_ACTION[m.condition_action] ?? null,
    joined: Boolean(m.joined),
    claimed: m.status === 3,
    claimable: m.status === 2,
  };
}

export async function getRpgMissions() {
  if (dummyRpgMode()) {
    return {
      missions: [
        {
          id: "dummy-mission-full-set",
          tab: "daily",
          title: "Full Equipment Set",
          description: "Dummy mission for full armor visual QA.",
          reward: { tokens: 10, bp: 100 },
          target: 1,
          progress: 1,
          metric: "bp",
          go: RPG_VIEWS.ITEMS,
          joined: true,
          claimed: false,
          claimable: true,
        },
      ],
    };
  }
  try {
    const rows = await getMyAvatarMissions();
    return { missions: (rows || []).map(missionView) };
  } catch (err) {
    throw gameError(err, "Could not load missions.");
  }
}

export async function claimRpgMission(missionId) {
  if (dummyRpgMode()) {
    return {
      reward: { tokens: 10, bp: 100 },
      profile: dummyProfile(),
    };
  }
  let claim;
  try {
    claim = await claimAvatarMission(missionId);
  } catch (err) {
    throw gameError(err, "Could not claim.");
  }
  const profile = await loadProfileView();
  return {
    reward: { tokens: claim.token_amount || 0, bp: claim.battle_point_amount || 0 },
    profile,
  };
}
