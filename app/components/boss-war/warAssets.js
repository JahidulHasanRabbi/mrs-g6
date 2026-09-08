// Theme-neutral Boss War art (shared by every skin) + a best-effort preloader.
// Per-theme frames live on the RPG skin (`skin.war.*`, fed from each theme's
// assets.js `war` block).

import { BOSS_CATALOG, GEM_ART, EARN_TILES } from "./constants";
import { makePreloader } from "../rpg/preload";

export const WAR_IMAGES = {
  ui: {
    ap: "/assets/boss-war/ui/icon-ap.webp",
    plus: "/assets/boss-war/ui/icon-plus.webp",
    clock: "/assets/boss-war/ui/icon-clock.webp",
    crown: "/assets/boss-war/ui/icon-crown.webp",
    defeated: "/assets/boss-war/ui/stamp-defeated.webp",
    // Hollow reward plaque from the comps' shared sheet; the tier's colour is
    // painted behind it (GEM_TINT), so one file dresses all four rarities.
    rewardBadge: "/assets/boss-war/ui/reward-badge.webp",
    // The stat-card glyphs are not separate layers in the comps; reuse the
    // crown / sword icons the same screens already ship.
    participants: "/assets/boss-war/ui/icon-crown.webp",
    damage: "/assets/boss-war/ui/icon-ap.webp",
    total: "/assets/boss-war/gems/legendary.webp",
  },
  // The comps draw every rank with the same laurel badge and a text number,
  // so the per-rank variants are not shipped.
  rankBadge: "/assets/boss-war/ui/rank-badge-1.webp",
  gems: GEM_ART,
  boss: Object.fromEntries(Object.entries(BOSS_CATALOG).map(([id, b]) => [id, b.art])),
  earn: Object.fromEntries(EARN_TILES.map((t) => [t.id, t.icon])),
};

export const gemFor = (gem) => WAR_IMAGES.gems[gem] || WAR_IMAGES.gems.common;

// Deliberately NOT the whole catalogue: the boss illustrations are ~240KB
// each and the earn icons, rank badge and DEFEATED stamp belong to screens
// the member may never open. Warming them here raced the frame art actually
// on screen. These few are small, and every screen shows them.
export const preloadWarAssets = makePreloader(WAR_IMAGES.gems, {
  ap: WAR_IMAGES.ui.ap,
  crown: WAR_IMAGES.ui.crown,
  clock: WAR_IMAGES.ui.clock,
  rewardBadge: WAR_IMAGES.ui.rewardBadge,
});
