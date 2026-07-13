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
  // Attack frame SEQUENCE played on each landed hit during a boss battle —
  // the energy punch builds spark → burst → beam → nova. Only the male
  // moveset exists so far; females fall back to the lunge motion.
  heroStrike: {
    male: [
      "/assets/rpg/hero/male-moveset/strike-1.webp",
      "/assets/rpg/hero/male-moveset/strike-2.webp",
      "/assets/rpg/hero/male-moveset/strike-3.webp",
      "/assets/rpg/hero/male-moveset/strike-4.webp",
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
  },
  equipment: {
    weapon: "/assets/rpg/equipment/weapon.svg",
    helmet: "/assets/rpg/equipment/helmet.svg",
    armor: "/assets/rpg/equipment/armor.svg",
    boots: "/assets/rpg/equipment/boots.svg",
  },
  battleArena: "/assets/rpg/bg/battle-arena.webp",
  // Only Meteor Colossus has boss art in the Figma file — every boss renders
  // this image with a per-boss CSS tint (see BOSSES[].artFilter).
  bossArt: "/assets/rpg/boss/meteor-colossus.webp",
};

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
