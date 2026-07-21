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
  // Attack frame(s) played on each landed hit during a boss battle. An array
  // so more frames can be added back later; currently just the first pose
  // (strike-2/3/4 removed). Females fall back to the lunge motion.
  heroStrike: {
    male: ["/assets/rpg/hero/male-moveset/strike-1.webp"],
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
  },
  equipment: {
    weapon: "/assets/rpg/equipment/weapon.svg",
    helmet: "/assets/rpg/equipment/helmet.svg",
    armor: "/assets/rpg/equipment/armor.svg",
    boots: "/assets/rpg/equipment/boots.svg",
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
