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
    // The stat-card glyphs are not separate layers in the comps; reuse the
    // crown / sword icons the same screens already ship.
    participants: "/assets/boss-war/ui/icon-crown.webp",
    damage: "/assets/boss-war/ui/icon-ap.webp",
    total: "/assets/boss-war/gems/legendary.webp",
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

// The comps draw every rank row with the same laurel badge + a text number.
export const rankBadgeFor = () => WAR_IMAGES.rank[1];
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
