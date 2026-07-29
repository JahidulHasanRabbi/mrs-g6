"use client";

import ThemedCheckInBoard from "../shared/ThemedCheckInBoard";
import { buildCheckinSkin } from "../shared/checkinMartSkin";
import { UBET_ASSETS, UBET_COLORS } from "./assets";

/**
 * Ubetclub Daily Check-in (Figma 462:403).
 *
 * The page chrome (themed backdrop, ThemeHeader, ornate bottom nav) comes from
 * <ThemedPageShell> in AppLayout, so this only supplies the theme's art to the
 * shared board.
 */
const SKIN = buildCheckinSkin(UBET_ASSETS, UBET_COLORS, {
  // Inner flat area of this theme's frame art (% of the board box). The day
  // layout is fitted into it so no tile or DAY label lands on the border or a
  // corner ornament.
  panel: { l: 13, r: 88, t: 18, b: 82 },
  // Image overscale/offset per slot, taken from this theme's comp. The
  // exported PNGs carry different amounts of transparent padding, so without
  // this the tiles render smaller than their slot with wide gaps.
  fit: {
    board: { w: 105.41, h: 106.27, left: -2.43, top: -3.13 },
    dayCard: { w: 110.06, h: 100.44, left: -5.35, top: -1.31 },
    chest: { w: 111.06, h: 116.5, left: -5.42, top: 0 },
  },
});

export default function UbetclubDailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
