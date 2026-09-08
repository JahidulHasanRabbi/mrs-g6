// Boss War mini-game constants — screen ids, boss/reward catalogs and the
// spec defaults from Phase 3 sheet "3c - War". Everything numeric here is a
// FALLBACK: live values ride on the view-models from bossWarApi.

export const WAR_VIEWS = {
  LIST: "list",
  BATTLE: "battle",
  RESULTS: "results",
  LEADERBOARD: "leaderboard",
  REWARDS: "rewards",
  HISTORY: "history",
  EARN: "earn",
  INFO: "info",
};

export const WAR_FONT = "var(--font-neuton), 'Neuton', 'Times New Roman', serif";

export const BOSS_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  EVENT: "event",
};

export const BOSS_TYPE_TABS = [
  { id: BOSS_TYPES.DAILY, label: "Daily Boss" },
  { id: BOSS_TYPES.WEEKLY, label: "Weekly Boss" },
  { id: BOSS_TYPES.EVENT, label: "Event Boss" },
];

export const BOSS_TYPE_LABEL = Object.fromEntries(BOSS_TYPE_TABS.map((t) => [t.id, t.label]));

// The five example bosses from the brief. Art is theme-neutral (the comps
// share one illustration per boss across all six skins); only `id`/`art`
// are local — name, type, HP and timing come from the API.
export const BOSS_CATALOG = {
  "goblin-king": { name: "Goblin King", type: BOSS_TYPES.DAILY, art: "/assets/boss-war/boss/goblin-king.webp", gem: "common" },
  "fire-dragon": { name: "Fire Dragon", type: BOSS_TYPES.WEEKLY, art: "/assets/boss-war/boss/fire-dragon.webp", gem: "premium" },
  "ice-giant": { name: "Ice Giant", type: BOSS_TYPES.WEEKLY, art: "/assets/boss-war/boss/ice-giant.webp", gem: "epic" },
  "titan-emperor": { name: "Titan Emperor", type: BOSS_TYPES.EVENT, art: "/assets/boss-war/boss/titan-emperor.webp", gem: "legendary" },
  // No Shadow Demon illustration in the comps yet — reuses the Titan art.
  "shadow-demon": { name: "Shadow Demon", type: BOSS_TYPES.DAILY, art: "/assets/boss-war/boss/titan-emperor.webp", gem: "common" },
};
export const DEFAULT_BOSS_ART = "/assets/boss-war/boss/goblin-king.webp";

// Reward gem icons (shared across skins).
export const GEM_ART = {
  legendary: "/assets/boss-war/gems/legendary.webp",
  epic: "/assets/boss-war/gems/epic.webp",
  premium: "/assets/boss-war/gems/premium.webp",
  rare: "/assets/boss-war/gems/common.webp",
  common: "/assets/boss-war/gems/common.webp",
};

// The reward badge's interior, per gem tier — sampled off the four badges in
// comp 2642:3280..3370. The plaque art itself is hollow and shared.
export const GEM_TINT = {
  legendary: "radial-gradient(120% 90% at 50% 22%, #d64ba9 0%, #ac2384 100%)",
  epic: "radial-gradient(120% 90% at 50% 22%, #6d0d14 0%, #4a0404 100%)",
  premium: "radial-gradient(120% 90% at 50% 22%, #123544 0%, #01191f 100%)",
  rare: "radial-gradient(120% 90% at 50% 22%, #6a2e50 0%, #45182f 100%)",
  common: "radial-gradient(120% 90% at 50% 22%, #6a2e50 0%, #45182f 100%)",
};

// The boss thumbnail's box on a list card (comp: 137x139 in a 354x154 card).
// Deliberately the comp's shape, not the frame art's own aspect: every
// station's boss frame is landscape, and at full aspect the thumbnail leaves
// the name column too narrow for "GOBLIN KING". The hollow is read from each
// theme's measured `bossFrame.open`, which is in percent and so survives it.
export const BOSS_THUMB_ASPECT = 137 / 139;

// Ranking reward tiers (spec: Top 1 / 10 / 100 / 1000 / All).
export const RANK_REWARD_TIERS = [
  { id: "top1", rank: "1st", name: "Legendary Reward", desc: "Chest • Gems • Item", gem: "legendary" },
  { id: "top10", rank: "Top 10", name: "Epic Reward", desc: "Chest • Gems • Item", gem: "epic" },
  { id: "top100", rank: "Top 100", name: "Premium Reward", desc: "Chest • Item", gem: "premium" },
  { id: "top1000", rank: "Top 1000", name: "Participation Bonus", desc: "Chest", gem: "rare" },
  { id: "all", rank: "All", name: "Common Rewards", desc: "Chest", gem: "common" },
];

export const BOSS_REWARD_TIERS = [
  { id: "kill", rank: "Kill", name: "Boss Kill Reward", desc: "Share = Personal Damage / Total Boss Damage", gem: "epic" },
  { id: "participation", rank: "All", name: "Participation Reward", desc: "Every qualified participant", gem: "common" },
];

export const EVENT_REWARD_TIERS = [
  { id: "event-top1", rank: "1st", name: "Exclusive Event Reward", desc: "Limited-time • Chest • Item", gem: "legendary" },
  { id: "event-top10", rank: "Top 10", name: "Seasonal Reward", desc: "Chest • Gems", gem: "epic" },
  { id: "event-all", rank: "All", name: "Event Participation", desc: "Chest", gem: "common" },
];

// "How Rewards are Calculated" copy (Results screen).
export const REWARD_CALC_SECTIONS = [
  { id: "rank", title: "Ranking Reward", body: "Based on final total damage ranking" },
  { id: "boss", title: "Boss Kill Reward", body: "Contribution % = Personal Damage / Total Boss Damage" },
  { id: "participation", title: "Participation", body: "All qualified participants receive the configured basic reward" },
];

// Attack Point economy defaults (spec "Attack Point Economy").
export const AP_PER_ATTACK = 1;
export const DEFAULT_DEPOSIT_AP = [
  { amount: 30, ap: 2 },
  { amount: 50, ap: 4 },
  { amount: 100, ap: 10 },
  { amount: 300, ap: 35 },
  { amount: 500, ap: 70 },
];
export const DEFAULT_FREE_AP = [
  { id: "login", label: "Daily Login", ap: 1 },
  { id: "checkin", label: "Daily Check-In", ap: 1 },
  { id: "missions3", label: "Complete 3 Missions", ap: 2 },
  { id: "missionsAll", label: "Complete All Missions", ap: 3 },
];

// The four "How to Earn Attack Points" tiles. `source` is what claimAp() is
// called with; tiles with an `href` navigate instead of claiming.
export const MINI_GAMES_NOTE =
  "Play eligible MRS mini games to earn Attack Points. Exact reward follows campaign configuration.";

export const EARN_TILES = [
  { id: "deposit", label: "Deposit", sub: "RM30+", cta: "Claim", icon: "/assets/boss-war/earn/deposit.webp" },
  { id: "missions", label: "Missions", sub: "Daily", cta: "Claim", icon: "/assets/boss-war/earn/missions.webp" },
  { id: "minigames", label: "Mini Games", sub: "Play", cta: "Play", href: "/spin", icon: "/assets/boss-war/earn/mini-games.webp" },
  { id: "checkin", label: "Check-in", sub: "Daily", cta: "Claim", icon: "/assets/boss-war/earn/check-in.webp" },
];

// Static info copy.
export const HOW_TO_EARN_NOTE = [
  "Daily Boss: 24 hours",
  "Weekly Boss: 7 days",
  "Event Boss: limited campaign period",
  "Higher damage = higher ranking & rewards",
];

export const BOSS_INFO_SECTIONS = [
  { id: "type", label: "BOSS TYPE", title: "Daily Boss", body: "24-hour battle • Reward pool resets with the event" },
  { id: "attack", label: "ATTACK", title: "1 AP = 1 Attack", body: "Base damage 100–500 • Critical hits can deal 2× damage" },
  { id: "vip", label: "VIP BONUS", title: "VIP Combat Advantage", body: "Higher VIP can increase critical rate and damage bonus" },
  { id: "ranking", label: "RANKING", title: "Total Damage Contribution", body: "Higher damage gives better ranking and larger rewards" },
  { id: "rewards", label: "REWARDS", title: "After Boss / Event Ends", body: "Kill, ranking and participation rewards are distributed based on configured rules" },
];

export const ORDINAL = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "";
  const mod100 = v % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  return ["th", "st", "nd", "rd"][v % 10] || "th";
};

export const fmt = (n) => Number(n ?? 0).toLocaleString("en-GB");
