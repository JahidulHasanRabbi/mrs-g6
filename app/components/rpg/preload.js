// Fire-and-forget image cache warm, shared by the mini-games.
//
// Each game had its own copy of this (rpgAssets, penalty-kick/assets,
// boss-war/warAssets), each with its own "already started" latch.

function collectUrls(node, out) {
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (node && typeof node === "object") Object.values(node).forEach((v) => collectUrls(v, out));
  return out;
}

/**
 * Returns a `preload()` that warms every URL reachable from `trees` once.
 * Safe to call repeatedly; no-ops on the server.
 *
 * Pass only what the first screen needs — a preload races the API calls and
 * the frame art the member is actually waiting on, so a full catalogue costs
 * more than it saves.
 */
export function makePreloader(...trees) {
  let started = false;
  return function preload() {
    if (started || typeof window === "undefined") return;
    started = true;
    const urls = trees.reduce((acc, tree) => collectUrls(tree, acc), []);
    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.decode) img.decode().catch(() => {});
    });
  };
}
