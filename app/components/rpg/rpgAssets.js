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
  chest: "/assets/rpg/chest/chest-closed.webp",
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
  collectUrls(RPG_IMAGES, []).forEach((src) => {
    const img = new Image();
    img.src = src;
    if (img.decode) img.decode().catch(() => {});
  });
}
