// Image asset paths. Backgrounds are SVG-drawn inline (see PitchBackground),
// so only the icons live here for now. When Figma artwork is exported,
// drop the files in public/assets/penalty-kick/{bg,ball,illust}/ and add
// their paths to this map — components already reference it.
//
// All raster art is served as WebP (alpha preserved), downscaled to ~2–3x its
// rendered size by scripts/optimize-penalty-assets.js. This cut the set from
// ~5.8MB to ~0.8MB so the keeper flipbook's dive frames load in time on slow
// 4G instead of fetching mid-dive (which made the keeper freeze/skip frames).
// Only the WebP files are committed — the source PNGs are not. To regenerate,
// re-export the PNGs from Figma into public/assets/penalty-kick/ at the paths
// the optimizer expects, then run the script (it overwrites the WebP in place).

export const IMAGES = {
  ballPng: "/assets/penalty-kick/ball/Football.webp",
  stadiumBg: "/assets/penalty-kick/bg/stadium.webp",
  goalpost: "/assets/penalty-kick/goalpost.webp",
  swipeArrows: "/assets/penalty-kick/illust/swipe-arrows.png",
};

// Goalkeeper sprite atlas — vendored from Figma. Each keeper sprite has
// a natural anchor at the standing-feet position; CSS positions the
// container so all frames register correctly when swapped.
export const KEEPER = {
  noMove: "/assets/penalty-kick/keeper/no-move.webp",
  // Static extended dive pose for the landed/miss state. Both directions
  // now use natively-drawn sprites (left=jump-left, right=last frame
  // of the right-side dive sequence) so the keeper faces the correct way
  // without CSS mirroring.
  jumpLeft: "/assets/penalty-kick/keeper/jump-left.webp",
  jumpRight: "/assets/penalty-kick/keeper/jump-right-4.webp",
  saveCenter: "/assets/penalty-kick/keeper/save-center.webp",
  // Idle-cycle frames — 2-frame standing animation (relaxed ↔ arms slightly
  // raised). Cycled in Keeper.jsx during phase 0.
  idleCycle: [
    "/assets/penalty-kick/keeper/still-pose-1.webp",
    "/assets/penalty-kick/keeper/still-pose-2.webp",
  ],
  diveLeft: [
    "/assets/penalty-kick/keeper/jump-left-1.webp",
    "/assets/penalty-kick/keeper/jump-left-2.webp",
    "/assets/penalty-kick/keeper/jump-left-3.webp",
    "/assets/penalty-kick/keeper/jump-left-4.webp",
  ],
  diveRight: [
    "/assets/penalty-kick/keeper/jump-right-1.webp",
    "/assets/penalty-kick/keeper/jump-right-2.webp",
    "/assets/penalty-kick/keeper/jump-right-3.webp",
    "/assets/penalty-kick/keeper/jump-right-4.webp",
  ],
};

// Every keeper frame + the ball, flattened — these are the assets that must be
// in cache BEFORE the kick fires so the dive flipbook never fetches mid-swap.
// preloadGameAssets() warms them during the loading/launch phases; by the time
// the player swipes, each <img src> swap is a guaranteed cache hit.
const PRELOAD_SRCS = [
  KEEPER.noMove,
  KEEPER.jumpLeft,
  KEEPER.jumpRight,
  KEEPER.saveCenter,
  ...KEEPER.idleCycle,
  ...KEEPER.diveLeft,
  ...KEEPER.diveRight,
  IMAGES.ballPng,
  IMAGES.goalpost,
];

let preloadStarted = false;

// Fire-and-forget cache warm. decode() forces the browser to fully fetch AND
// decode the bitmap (not just queue the request), so the first paint of each
// frame is instant. Safe to call repeatedly — it only runs once per page load
// and is a no-op during SSR.
export function preloadGameAssets() {
  if (preloadStarted || typeof window === "undefined") return;
  preloadStarted = true;
  for (const src of PRELOAD_SRCS) {
    const img = new Image();
    img.src = src;
    // decode() rejects if the bitmap can't be decoded yet; we don't care about
    // the outcome, only the side effect of pulling it into cache.
    img.decode?.().catch(() => {});
  }
}
