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
// Game math (Phase 3 spec)
// ---------------------------------------------------------------------------

export const MAX_LEVEL = 100;
export const POWER_PER_LEVEL = 500;
export const EQUIP_POWER = 1000;
export const EQUIP_SLOTS = ["weapon", "helmet", "armor", "boots"];
export const BACKPACK_CAPACITY = 100;
export const EXTRA_ATTEMPT_COST = 10; // tokens
export const DISCARD_COST = 10; // tokens per item

// BP required to go from `level` to `level + 1`.
export const bpToNext = (level) => level * 100;

export const powerFor = (level, equippedCount) =>
  level * POWER_PER_LEVEL + equippedCount * EQUIP_POWER;

// Planet bosses (3b Challenge). `diceThreshold`: the boss dies once the
// cumulative dice total exceeds it — the battle is always winnable when the
// power gate is met; dice only pace the animation.
//
// `planetGradient` reproduces the Figma planet spheres (they're vectors in
// the design, so no raster asset). `artFilter`: only Meteor Colossus has
// boss art in the Figma file — the other three reuse it with a CSS tint
// until dedicated art lands.
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
    artFilter: "hue-rotate(175deg) saturate(0.55) brightness(1.35)",
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
    artFilter: "hue-rotate(215deg) saturate(0.8) brightness(0.95)",
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
    artFilter: "hue-rotate(255deg) saturate(0.9) brightness(1.05)",
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

// RPG mission definitions (mock — no backend). `metric` keys map to counters
// the mock service maintains; `go` is the in-game view a GO button opens.
export const RPG_MISSIONS = [
  { id: "d-checkin", tab: "daily", title: "Check In 1 Day", reward: { tokens: 1, bp: 10 }, target: 1, metric: "checkinToday", go: RPG_VIEWS.CHECKIN },
  { id: "d-deposit", tab: "daily", title: "Daily Deposit RM100", reward: { tokens: 5 }, target: 100, metric: "deposit", go: null },
  { id: "d-games", tab: "daily", title: "Play 3 Mini Games", reward: { bp: 100 }, target: 3, metric: "gamesPlayed", go: null },
  { id: "d-boss", tab: "daily", title: "Defeat 1 Planet Boss", reward: { bp: 50 }, target: 1, metric: "bossesToday", go: RPG_VIEWS.CHALLENGE },
  { id: "w-checkin", tab: "weekly", title: "Check In 7 Days", reward: { tokens: 10, bp: 200 }, target: 7, metric: "checkinWeek", go: RPG_VIEWS.CHECKIN },
  { id: "w-boss", tab: "weekly", title: "Defeat 5 Planet Bosses", reward: { tokens: 5, bp: 300 }, target: 5, metric: "bossesWeek", go: RPG_VIEWS.CHALLENGE },
  { id: "w-box", tab: "weekly", title: "Open 5 Mystery Boxes", reward: { bp: 250 }, target: 5, metric: "boxesWeek", go: RPG_VIEWS.CHALLENGE },
  { id: "c-level10", tab: "challenge", title: "Reach Avatar Lv.10", reward: { tokens: 20, bp: 500 }, target: 10, metric: "level", go: RPG_VIEWS.LEVEL },
  { id: "c-gear4", tab: "challenge", title: "Equip All 4 Equipment", reward: { bp: 400 }, target: 4, metric: "equipped", go: RPG_VIEWS.ITEMS },
  { id: "c-nebula", tab: "challenge", title: "Defeat Nebula Warden", reward: { tokens: 30, bp: 1000 }, target: 1, metric: "nebulaKills", go: RPG_VIEWS.CHALLENGE },
];

export const MISSION_TABS = ["daily", "weekly", "challenge"];

// Daily check-in (design 2026:3862): 7-day week strip, Monday start.
// Day 3 pays double BP ("×2 BP BONUS"), days 5+ pay the higher tier, and a
// full week tops day 7 with the weekly prize.
export const CHECKIN_RULES = {
  days: [
    { tokens: 1, bp: 10 },
    { tokens: 1, bp: 10 },
    { tokens: 1, bp: 20, double: true },
    { tokens: 1, bp: 10 },
    { tokens: 2, bp: 20 },
    { tokens: 2, bp: 20 },
    { tokens: 2, bp: 20, weekly: true },
  ],
  weeklyPrize: { tokens: 5, mysteryBox: true },
};
