// Avatar RPG (Phase 3) enum labels — mirrors the ENUMS section of
// docs/MRS - G6 Avatar API Documentation.md. Shared by the back-office pages
// and (later) the member-facing game mappers. Follows missionOptions.js.

export const AVATAR_GAME_STATUS_LABELS = {
  1: "Open",
  2: "Closed",
};

export const AVATAR_GENDER_LABELS = {
  1: "Male",
  2: "Female",
};

export const EQUIPMENT_SLOT_LABELS = {
  1: "Weapon",
  2: "Helmet",
  3: "Armor",
  4: "Boots",
};

export const PLANET_LABELS = {
  1: "Starlight",
  2: "Comet",
  3: "Meteor",
  4: "Nebula",
};

// Display names from the Phase 3 spec (3b Challenge) — the API only returns
// the planet enum, the boss identity per planet is fixed.
export const BOSS_NAME_BY_PLANET = {
  1: "Starlight Sentinel",
  2: "Comet Reaper",
  3: "Meteor Colossus",
  4: "Nebula Warden",
};

export const BATTLE_POINT_EVENT_TYPE_LABELS = {
  1: "Earn",
  2: "Redeem",
  3: "Set",
  4: "Adjust",
  5: "Loss",
};

export const BATTLE_POINT_REASON_LABELS = {
  1: "Check-In",
  2: "Mission",
  3: "Mini-Game",
  4: "Level-Up",
  5: "Challenge",
};

export const AVATAR_MISSION_CATEGORY_LABELS = {
  1: "Daily Mission",
  2: "Weekly Mission",
  3: "Monthly Mission",
  4: "Achievement",
};

export const AVATAR_MISSION_ACTION_LABELS = {
  1: "Login",
  2: "Deposit Amount",
  3: "Boss Battle",
  4: "Obtain Equipment",
  5: "Full Equipment Set",
  6: "Complete Missions",
};

export const AVATAR_MISSION_STATUS_LABELS = {
  1: "In Progress",
  2: "Completed",
  3: "Claimed",
};

export const MYSTERY_BOX_REWARD_TYPE_LABELS = {
  1: "Token",
  2: "Battle Point",
  3: "Free Credit",
  4: "Equipment",
  5: "Level Up",
  6: "Gold Bar",
};

// ---------------------------------------------------------------------------
// API enum ↔ frontend key maps — the member game (app/components/rpg/*) keys
// its art and view-models by lowercase strings; the API speaks integers.
// ---------------------------------------------------------------------------

export const GENDER_KEY_BY_CODE = { 1: "male", 2: "female" };
export const GENDER_CODE_BY_KEY = { male: 1, female: 2 };

export const SLOT_KEY_BY_CODE = { 1: "weapon", 2: "helmet", 3: "armor", 4: "boots" };
export const SLOT_CODE_BY_KEY = { weapon: 1, helmet: 2, armor: 3, boots: 4 };

// Planet enum → the boss/arena art key used across rpgAssets + constants.BOSSES.
export const PLANET_KEY_BY_CODE = { 1: "starlight", 2: "comet", 3: "meteor", 4: "nebula" };

const toOptions = (labels) =>
  Object.entries(labels).map(([value, label]) => ({ value: Number(value), label }));

export const AVATAR_GAME_STATUS_OPTIONS = toOptions(AVATAR_GAME_STATUS_LABELS);
export const EQUIPMENT_SLOT_OPTIONS = toOptions(EQUIPMENT_SLOT_LABELS);
export const AVATAR_MISSION_CATEGORY_OPTIONS = toOptions(AVATAR_MISSION_CATEGORY_LABELS);
export const AVATAR_MISSION_ACTION_OPTIONS = toOptions(AVATAR_MISSION_ACTION_LABELS);
export const MYSTERY_BOX_REWARD_TYPE_OPTIONS = toOptions(MYSTERY_BOX_REWARD_TYPE_LABELS);
