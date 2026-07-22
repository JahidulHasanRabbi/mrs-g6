// Asset map + best-effort preloader for the RPG mini-game (pattern cloned
// from app/components/penalty-kick/assets.js). All art lives under
// public/assets/rpg/ as pre-optimized webp/svg — rendered with plain <img>.

export const RPG_IMAGES = {
  bg: "/assets/rpg/bg/damask.webp",
  hero: {
    male: {
      front: "/assets/rpg/hero/male-front.webp",
      back: "/assets/rpg/hero/male-back.webp",
    },
    female: {
      front: "/assets/rpg/hero/female-front.webp",
      back: "/assets/rpg/hero/female-back.webp",
    },
  },
  // Back-facing punch sequence played on each landed hit during a boss battle
  // (Figma attack frames, background-keyed). Frame order is punch → guard →
  // recover so the extended punch lands with the impact FX. Both genders now
  // have a real 3-frame sequence.
  heroStrike: {
    male: [
      "/assets/rpg/hero/male-moveset/strike-1.webp",
      "/assets/rpg/hero/male-moveset/strike-2.webp",
      "/assets/rpg/hero/male-moveset/strike-3.webp",
    ],
    female: [
      "/assets/rpg/hero/female-moveset/strike-1.webp",
      "/assets/rpg/hero/female-moveset/strike-2.webp",
      "/assets/rpg/hero/female-moveset/strike-3.webp",
    ],
  },
  chest: "/assets/rpg/chest/chest-closed.webp",
  chestOpen: "/assets/rpg/chest/chest-open.webp",
  ui: {
    info: "/assets/rpg/ui/icon-info.webp",
    menu: "/assets/rpg/ui/icon-menu.webp",
    logoGem: "/assets/rpg/ui/logo-gem.svg",
  },
  icons: {
    bpGem: "/assets/rpg/icons/bp-gem.svg",
    navHome: "/assets/rpg/icons/nav-home.svg",
    navHeroItem: "/assets/rpg/icons/nav-hero-item.svg",
    navChallenge: "/assets/rpg/icons/nav-challenge.svg",
    navMission: "/assets/rpg/icons/nav-mission.svg",
    navCheckIn: "/assets/rpg/icons/nav-checkin.svg",
  },
  // Outline SVG icons — used for EMPTY equipment slots (dimmed placeholder).
  equipment: {
    weapon: "/assets/rpg/equipment/weapon.svg",
    helmet: "/assets/rpg/equipment/helmet.svg",
    armor: "/assets/rpg/equipment/armor.svg",
    boots: "/assets/rpg/equipment/boots.svg",
  },
  // Real gear art (Figma "Equipment" set, background-keyed) — used for
  // EQUIPPED slots and owned backpack items (Hero Item design 2284:2415).
  equipmentArt: {
    weapon: "/assets/rpg/equipment/weapon.webp",
    helmet: "/assets/rpg/equipment/helmet.webp",
    armor: "/assets/rpg/equipment/armor.webp",
    boots: "/assets/rpg/equipment/boots.webp",
  },
  // Per-boss arena backdrops (Figma "Backgrounds" set). Each is a full-bleed
  // 820-wide webp with a magic-circle floor the hero stands on. battleArena is
  // the default fallback for any boss without a dedicated arena.
  battleArena: "/assets/rpg/bg/battle-arena.webp",
  // Home sits over a moonlit-ruins realm (Figma Home design 2026:3034) rather
  // than the plain damask tile used by the other in-game screens.
  homeRealm: "/assets/rpg/bg/home-realm.webp",
  arena: {
    starlight: "/assets/rpg/bg/arena-starlight.webp",
    comet: "/assets/rpg/bg/arena-comet.webp",
    meteor: "/assets/rpg/bg/arena-meteor.webp",
    nebula: "/assets/rpg/bg/arena-nebula.webp",
  },
  // Real per-boss character art (Figma "Bosses" set), background-keyed to
  // transparent cutouts. Each boss now has its own sprite — the old CSS
  // hue-tint of a single shared image is gone (BOSSES[].artFilter is "none").
  bossArt: {
    starlight: "/assets/rpg/boss/starlight.webp",
    comet: "/assets/rpg/boss/comet.webp",
    meteor: "/assets/rpg/boss/meteor.webp",
    nebula: "/assets/rpg/boss/nebula.webp",
  },
};

// Resolve a boss's sprite, falling back to the Meteor art if an id is unknown.
export function bossArtFor(bossId) {
  return (RPG_IMAGES.bossArt && RPG_IMAGES.bossArt[bossId]) || RPG_IMAGES.bossArt.meteor;
}

// Resolve a boss's arena backdrop, falling back to the default battle arena.
export function arenaFor(bossId) {
  return (RPG_IMAGES.arena && RPG_IMAGES.arena[bossId]) || RPG_IMAGES.battleArena;
}

// ---------------------------------------------------------------------------
// Equipped hero poses (Figma hero-pose set)
//
// The hero on Home visually wears whatever gear is equipped. Each pose art is
// keyed by a 4-bit gear mask: weapon=8, helmet=4, armor=2, boots=1. Files live
// at /assets/rpg/hero/<gender>/<mask 2-digit>.webp. A couple of combos weren't
// drawn (e.g. female armor+boots), so heroPoseFor() falls back to the closest
// SUBSET pose — never showing a piece that isn't equipped.
// ---------------------------------------------------------------------------

export const HERO_POSE_MASKS = {
  male: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  female: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
};

// Back-facing poses for the boss battle (Figma mini set) — the hero faces the
// boss. Keyed by the same 4-bit gear mask. Only male art exists so far; female
// falls back to the front pose until its back art is added.
export const HERO_BATTLE_MASKS = {
  male: [0, 1, 2, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15],
  // Conservative confident subset (the back-view tiara is hard to read on the
  // rest); the subset resolver safely fills the gaps — never shows unequipped
  // gear. Full loadout (15) has a real full back pose.
  female: [0, 1, 5, 6, 9, 15],
};

const popcount = (n) => {
  let c = 0;
  for (let x = n; x; x >>= 1) c += x & 1;
  return c;
};

// Bitmask of equipped slots from an equipment view-model (equipment.slots).
export function equipMask(equipment) {
  const s = equipment?.slots || {};
  return (s.weapon ? 8 : 0) | (s.helmet ? 4 : 0) | (s.armor ? 2 : 0) | (s.boots ? 1 : 0);
}

// Pick the available pose mask that is a SUBSET of `want` (never shows a piece
// that isn't equipped) covering the most equipped pieces. Ties prefer the most
// visible gear: weapon > helmet > armor > boots. mask 0 is always eligible.
function closestSubsetMask(avail, want) {
  let best = 0;
  let bestScore = -1;
  for (const m of avail) {
    if ((m & ~want) !== 0) continue; // shows gear that isn't equipped — skip
    const score =
      popcount(m & want) * 100 + (m & 8 ? 8 : 0) + (m & 4 ? 4 : 0) + (m & 2 ? 2 : 0) + (m & 1 ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

export function heroPoseFor(gender, equipment) {
  const g = gender === "female" ? "female" : "male";
  const avail = HERO_POSE_MASKS[g];
  const want = equipMask(equipment);
  // Exact pose for the equipped set, when it exists.
  let best = 0;
  if (avail.includes(want)) {
    best = want;
  } else {
    // SUBSET-ONLY: a pose is eligible only when every piece it shows is
    // actually equipped (m has no bit outside `want`). This guarantees the
    // hero can never display gear the player hasn't equipped. Among eligible
    // poses pick the one covering the most equipped pieces (mask 0 is always
    // eligible, so there is always a result).
    best = closestSubsetMask(avail, want);
  }
  return `/assets/rpg/hero/${g}/${String(best).padStart(2, "0")}.webp`;
}

// Back-facing pose for the battle (hero faces the boss). Subset-only, same as
// heroPoseFor. Falls back to the front pose for a gender with no back art yet.
export function heroBattlePoseFor(gender, equipment) {
  const g = gender === "female" ? "female" : "male";
  const avail = HERO_BATTLE_MASKS[g];
  if (!avail || !avail.length) return heroPoseFor(gender, equipment);
  const want = equipMask(equipment);
  const best = avail.includes(want) ? want : closestSubsetMask(avail, want);
  return `/assets/rpg/hero/${g}-battle/${String(best).padStart(2, "0")}.webp`;
}

// ---------------------------------------------------------------------------
// Boss animation frames (frame-ready)
//
// BossSprite plays a per-state frame SEQUENCE when one is supplied here, and
// otherwise falls back to a procedural animation of the single `bossArt`
// sprite. To use real art later, drop PNG/webp frames under
// public/assets/rpg/boss/<bossId>/ and list them here — e.g.
//
//   meteor: {
//     hurt:   ["/assets/rpg/boss/meteor/hurt-1.webp", "…hurt-2.webp"],
//     attack: ["/assets/rpg/boss/meteor/attack-1.webp", "…attack-2.webp"],
//   }
//
// Any state left empty keeps the procedural effect. `default` applies to every
// boss (they currently share one sprite); a per-boss key overrides it.
export const BOSS_FRAMES = {
  default: { idle: [], hurt: [], attack: [], defeat: [] },
};

export function bossFramesFor(bossId, state) {
  return (
    (BOSS_FRAMES[bossId] && BOSS_FRAMES[bossId][state]) ||
    (BOSS_FRAMES.default && BOSS_FRAMES.default[state]) ||
    []
  );
}

function collectUrls(node, out) {
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  Object.values(node).forEach((v) => collectUrls(v, out));
  return out;
}

let preloadStarted = false;

// Fire-and-forget cache warm so the battle/box screens never fetch art
// mid-animation. Safe to call multiple times; no-ops on the server.
export function preloadRpgAssets() {
  if (preloadStarted || typeof window === "undefined") return;
  preloadStarted = true;
  const urls = collectUrls(RPG_IMAGES, []).concat(collectUrls(BOSS_FRAMES, []));
  urls.forEach((src) => {
    const img = new Image();
    img.src = src;
    if (img.decode) img.decode().catch(() => {});
  });
}
