"use client";

import ThemedCheckInBoard from "../shared/ThemedCheckInBoard";
import { buildCheckinSkin } from "../shared/checkinMartSkin";
import { KGAME99_ASSETS, KGAME99_COLORS } from "./assets";

/**
 * Kgame99 Daily Check-in (Figma 463:875).
 *
 * The page chrome (themed backdrop, ThemeHeader, ornate bottom nav) comes from
 * <ThemedPageShell> in AppLayout, so this only supplies the theme's art to the
 * shared board.
 */
const SKIN = buildCheckinSkin(KGAME99_ASSETS, KGAME99_COLORS, {
  // Image overscale/offset per slot, taken from this theme's comp. The
  // exported PNGs carry different amounts of transparent padding, so without
  // this the tiles render smaller than their slot with wide gaps.
  fit: {
    board: { w: 100, h: 102.51, left: 0, top: -1.1 },
    dayCard: { w: 113.27, h: 115.48, left: -13.27, top: -6.63 },
    chest: { w: 103.43, h: 104.38, left: -1.62, top: -1.02 },
  },
});

export default function Kgame99DailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
