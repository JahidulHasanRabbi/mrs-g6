"use client";

import { lazy, Suspense } from "react";
import { readActiveThemeId } from "../../config/themes";

/**
 * Per-skin code splitting for a themed route.
 *
 * Every themed page used to import all six skins, so an acebet77 member paid to
 * download and compile ubetclub, ep369, kgame99, lv918 and n1gang too.
 * `lazySkins` turns the map into lazy chunks and — this is the part that keeps
 * it fast — requests the member's own chunk at module scope, before React's
 * first render, so the fetch overlaps hydration instead of queueing behind it.
 */
export function lazySkins(loaders) {
  const warm = typeof window !== "undefined" && loaders[readActiveThemeId()];
  if (warm) warm();

  const skins = {};
  for (const id of Object.keys(loaders)) skins[id] = lazy(loaders[id]);
  return skins;
}

/**
 * The element for this member's skin, or null on the default portal — so a page
 * keeps its `if (skin) return skin;` early return. The Suspense fallback is a
 * bare backdrop in the theme's own base colour (--skin-bg in globals.css), so
 * any warm-up gap reads as the page still painting, never as another brand.
 */
export function skinFor(skins, themeId) {
  const Skin = skins[themeId];
  if (!Skin) return null;
  return (
    <Suspense fallback={<div className="min-h-screen w-full skin-backdrop" />}>
      <Skin />
    </Suspense>
  );
}
