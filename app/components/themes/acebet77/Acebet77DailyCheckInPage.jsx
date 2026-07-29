"use client";

import ThemedCheckInBoard from "../shared/ThemedCheckInBoard";
import { buildCheckinSkin } from "../shared/checkinMartSkin";
import { ACEBET_ASSETS, ACEBET_COLORS } from "./assets";

/**
 * Acebet77 Daily Check-in (Figma 460:23).
 *
 * The page chrome (themed backdrop, ThemeHeader, ornate bottom nav) comes from
 * <ThemedPageShell> in AppLayout, so this only supplies the theme's art to the
 * shared board.
 */
const SKIN = buildCheckinSkin(ACEBET_ASSETS, ACEBET_COLORS, {
  // Inner flat area of this theme's frame art (% of the board box). The day
  // layout is fitted into it so no tile or DAY label lands on the border or a
  // corner ornament.
  panel: { l: 11, r: 89, t: 15, b: 85 },
  // Image overscale/offset per slot, taken from this theme's comp. The
  // exported PNGs carry different amounts of transparent padding, so without
  // this the tiles render smaller than their slot with wide gaps.
  fit: {
    board: { w: 100.07, h: 100, left: -0.03, top: 0 },
    dayCard: { w: 113.9, h: 104.56, left: -6.67, top: -0.75 },
    chest: { w: 110.74, h: 114.16, left: -5.62, top: -5.02 },
  },
});

export default function Acebet77DailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
