"use client";

import ThemedCheckInBoard from "../shared/ThemedCheckInBoard";
import { buildCheckinSkin } from "../shared/checkinMartSkin";
import { N1GANG_ASSETS, N1GANG_COLORS } from "./assets";

/**
 * N1gang Daily Check-in (Figma 463:1384).
 *
 * The page chrome (themed backdrop, ThemeHeader, ornate bottom nav) comes from
 * <ThemedPageShell> in AppLayout, so this only supplies the theme's art to the
 * shared board.
 */
const SKIN = buildCheckinSkin(N1GANG_ASSETS, N1GANG_COLORS, {
  // Image overscale/offset per slot, taken from this theme's comp. The
  // exported PNGs carry different amounts of transparent padding, so without
  // this the tiles render smaller than their slot with wide gaps.
  fit: {
    board: { w: 100, h: 100, left: 0, top: 0 },
    dayCard: { w: 131.11, h: 100, left: -15.49, top: 0 },
    chest: { w: 108.86, h: 120.19, left: -4.18, top: -5.75 },
  },
  // n1gang's check-in title is a narrow 206px crest rather than the full-bleed
  // 408px plaque the other five skins use (Figma 463:1387).
  titleWidthPct: 52,
});

export default function N1gangDailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
