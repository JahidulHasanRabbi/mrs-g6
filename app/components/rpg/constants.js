// RPG mini-game constants — palette, screen ids, and the game math from the
// Phase 3 spec (3a Avatar / 3b Challenge). The visual language is the Figma
// green-theme set: MRS dark-green chrome (top bar + nav) with a cyan/violet
// fantasy palette for the game surface itself.

export const RPG_COLORS = {
  chrome: "#07190d", // MRS dark green — top bar + RPG nav background
  chromeGold: "#eab043", // top bar bottom border
  navGold: "#febb4d", // RPG nav top border
  cyan: "#2fe6c8",
  cyanSoft: "#8ff5e6",
  text: "#efeaff",
  textDim: "#b9aee8",
  violet: "#7c4dff",
  violetSoft: "rgba(124,77,255,0.08)",
  violetBorder: "rgba(139,92,246,0.35)",
  violetBorderStrong: "rgba(139,92,246,0.5)",
  slotLabel: "#c7b9ff",
  slotEmpty: "#8f82c4",
  navInactive: "#036d49",
  gold: "#ffc94d",
  goldDeep: "#ff8a50",
  coinBorder: "#b8770f",
  coinText: "#7a4b00",
  darkText: "#0a0618",
  red: "#ff6b6b",
};

// Gradients reused across CTAs / bars.
export const RPG_GRADIENTS = {
  cta: "linear-gradient(136deg, #ffc94d 0%, #ff8a50 100%)",
  exp: "linear-gradient(90deg, #2fe6c8 0%, #7c4dff 100%)",
  maleToggle:
    "linear-gradient(134deg, rgba(47,230,200,0.25) 0%, rgba(124,77,255,0.25) 100%)",
  coin: "radial-gradient(circle at 35% 30%, #ffe29a 0%, #fac45f 35%, #f8b541 52%, #f5a623 70%)",
};

export const RPG_FONTS = {
  display: "var(--font-chakra-petch), 'Chakra Petch', sans-serif",
  number: "var(--font-rajdhani), 'Rajdhani', sans-serif",
  logo: "var(--font-acme), 'Acme', sans-serif",
};

// ?view= values — URL is the single source of navigation truth (leaderboard
// pattern) so browser back/forward unwinds through screens.
export const RPG_VIEWS = {
  HOME: "home",
  ITEMS: "items",
  CHALLENGE: "challenge",
  BATTLE: "battle",
  BOX: "box",
  MISSIONS: "missions",
  LEVEL: "level",
  CHECKIN: "checkin",
};

// ---------------------------------------------------------------------------
// Game math — spec defaults (Phase 3 sheets 3a / 3b).
//
// These are FALLBACKS only. The live values come from /avatar/settings/ and
// ride on the profile view-model (powerPerLevel, maxLevel, discardCost,
// extraAttemptCost, backpackCapacity, equipmentSlotCount), so a back-office
// change takes effect without a deploy.
// ---------------------------------------------------------------------------

export const MAX_LEVEL = 100;
export const POWER_PER_LEVEL = 500;
export const EQUIP_POWER = 1000;
export const EQUIP_SLOTS = ["weapon", "helmet", "armor", "boots"];
export const EXTRA_ATTEMPT_COST = 10; // tokens
export const DISCARD_COST = 10; // tokens per item

// Planet bosses (3b Challenge) — the VISUAL identity only: name, theme and
// the CSS planet spheres. Every stat (power required, HP, dice threshold,
// reward slot, unlock state) is overwritten from
// /avatar/member-challenge/status/ by rpgApi.bossView; the numbers below are
// the spec defaults kept so the art entry is complete on its own.
//
// `planetGradient` reproduces the Figma planet spheres (they're vectors in
// the design, so no raster asset). Each boss now has its own character art +
// arena backdrop (see rpgAssets: bossArt / arena), so `artFilter` is "none"
// everywhere — it's kept only as a per-boss tint hook for future art.
export const BOSSES = [
  {
    id: "starlight",
    name: "Starlight Sentinel",
    planet: "Starlight",
    theme: "Light Knight",
    requiredPower: 0,
    hp: 50000,
    diceThreshold: 6,
    rewardSlot: "weapon",
    planetGradient:
      "radial-gradient(circle at 35% 30%, #eafbff 0%, #b5eaff 22%, #7fd8ff 45%, #67bae9 54%, #4f9cd4 62%, #367dbe 71%, #1e5fa8 80%)",
    planetGlow: "0 0 11px rgba(127,216,255,0.5)",
    artFilter: "none",
  },
  {
    id: "comet",
    name: "Comet Reaper",
    planet: "Comet",
    theme: "Comet Reaper",
    requiredPower: 2000,
    hp: 100000,
    diceThreshold: 6,
    rewardSlot: "helmet",
    planetGradient:
      "radial-gradient(circle at 65% 65%, #0e1b4a 0%, #172b6d 28%, #1f3b8f 55%, #2b5da9 66%, #377fc3 78%, #43a1dd 89%, #4fc3f7 100%)",
    planetGlow: "0 0 11px rgba(79,195,247,0.45)",
    artFilter: "none",
  },
  {
    id: "meteor",
    name: "Meteor Colossus",
    planet: "Meteor",
    theme: "Rock & Lava Giant",
    requiredPower: 5000,
    hp: 150000,
    diceThreshold: 12,
    rewardSlot: "armor",
    planetGradient:
      "radial-gradient(circle at 35% 30%, #ffb27a 0%, #e2814b 28%, #d36933 41%, #c4501b 55%, #873411 73%, #69250c 81%, #4a1707 90%)",
    planetGlow: "0 0 22px rgba(255,138,80,0.4)",
    artFilter: "none",
  },
  {
    id: "nebula",
    name: "Nebula Warden",
    planet: "Nebula",
    theme: "Cosmic Guardian",
    requiredPower: 9000,
    hp: 200000,
    diceThreshold: 12,
    rewardSlot: "boots",
    planetGradient:
      "radial-gradient(circle at 40% 35%, #e6d7ff 0%, #c3a1ff 25%, #a78bfa 45%, #8b5cf6 62%, #6d3fd4 76%, #4c2699 88%, #32175f 100%)",
    planetGlow: "0 0 22px rgba(124,77,255,0.4)",
    artFilter: "none",
  },
];

// Mystery Box drop table (3b spec). Weights are percentages summing to 100;
// zero-weight rows stay listed so the "possible rewards" panel matches spec.
export const MYSTERY_BOX_TABLE = [
  { id: "token10", type: "tokens", amount: 10, label: "Token ×10", weight: 18 },
  { id: "token5", type: "tokens", amount: 5, label: "Token ×5", weight: 15 },
  { id: "bp100", type: "bp", amount: 100, label: "Battle Points 100", weight: 18 },
  { id: "bp1000", type: "bp", amount: 1000, label: "Battle Points 1,000", weight: 8 },
  { id: "credit-big", type: "credit", label: "Free Credit RM3–RM10", weight: 6 },
  { id: "token30", type: "tokens", amount: 30, label: "Token ×30", weight: 6 },
  { id: "equipment", type: "equipment", label: "Rare Equipment ×1", weight: 6 },
  { id: "credit-small", type: "credit", label: "Free Credit RM0.5–RM3", weight: 16 },
  { id: "gold-bar", type: "gold", label: "Gold Bar (0.5g)", weight: 0 },
  { id: "levelup1", type: "levelup", amount: 1, label: "Level Up ×1", weight: 7 },
  { id: "levelup2", type: "levelup", amount: 2, label: "Level Up ×2", weight: 0 },
  { id: "levelup3", type: "levelup", amount: 3, label: "Level Up ×3", weight: 0 },
];

// Equipment flavor names per slot, used when a mystery box drops gear.
export const EQUIPMENT_NAMES = {
  weapon: ["Starfall Blade", "Comet Edge", "Nova Saber", "Void Cleaver"],
  helmet: ["Sentinel Helm", "Reaper Hood", "Colossus Crown", "Warden Visor"],
  armor: ["Starlight Plate", "Comet Mail", "Magma Cuirass", "Nebula Aegis"],
  boots: ["Skystep Boots", "Comet Striders", "Titan Greaves", "Astral Walkers"],
};

// Mission tabs — the API's four categories (1 Daily, 2 Weekly, 3 Monthly,
// 4 Achievement). The missions themselves are configured in the back office
// and come from /avatar/avatar-missions/my-missions/.
export const MISSION_TABS = ["daily", "weekly", "monthly", "achievement"];

// Check-in is a rolling 7-day streak configured in the back office
// (/avatar/check-in-settings/); a missed day restarts at day 1. Rewards are
// battle points only: random(min, max) × multiplier.
export const CHECKIN_STREAK_DAYS = 7;
