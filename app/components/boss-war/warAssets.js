// Theme-neutral Boss War art (shared by every skin) + a best-effort preloader.
// Per-theme frames live on the RPG skin (`skin.war.*`, fed from each theme's
// assets.js `war` block).

import { BOSS_CATALOG, GEM_ART, EARN_TILES } from "./constants";

export const WAR_IMAGES = {
  ui: {
    chip: "/assets/boss-war/ui/chip-boss-type.webp",
    ap: "/assets/boss-war/ui/icon-ap.webp",
    plus: "/assets/boss-war/ui/icon-plus.webp",
    clock: "/assets/boss-war/ui/icon-clock.webp",
    crown: "/assets/boss-war/ui/icon-crown.webp",
    defeated: "/assets/boss-war/ui/stamp-defeated.webp",
    participants: "/assets/boss-war/ui/icon-participants.webp",
    damage: "/assets/boss-war/ui/icon-damage.webp",
    total: "/assets/boss-war/ui/icon-total.webp",
  },
  rank: {
    1: "/assets/boss-war/ui/rank-badge-1.webp",
    2: "/assets/boss-war/ui/rank-badge-2.webp",
    3: "/assets/boss-war/ui/rank-badge-3.webp",
    generic: "/assets/boss-war/ui/rank-badge.webp",
  },
  gems: GEM_ART,
  boss: Object.fromEntries(Object.entries(BOSS_CATALOG).map(([id, b]) => [id, b.art])),
  earn: Object.fromEntries(EARN_TILES.map((t) => [t.id, t.icon])),
};

export const rankBadgeFor = (rank) => WAR_IMAGES.rank[rank] || WAR_IMAGES.rank.generic;
export const gemFor = (gem) => WAR_IMAGES.gems[gem] || WAR_IMAGES.gems.common;

function collectUrls(node, out) {
  if (typeof node === "string") out.push(node);
  else if (node && typeof node === "object") Object.values(node).forEach((v) => collectUrls(v, out));
  return out;
}

let preloadStarted = false;
export function preloadWarAssets() {
  if (preloadStarted || typeof window === "undefined") return;
  preloadStarted = true;
  collectUrls(WAR_IMAGES, []).forEach((src) => {
    const img = new Image();
    img.src = src;
    if (img.decode) img.decode().catch(() => {});
  });
}
