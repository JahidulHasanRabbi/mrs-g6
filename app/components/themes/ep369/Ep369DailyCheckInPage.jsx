"use client";

import ThemedCheckInBoard from "../shared/ThemedCheckInBoard";
import { buildCheckinSkin } from "../shared/checkinMartSkin";
import { EP369_ASSETS, EP369_COLORS } from "./assets";

/**
 * EP369 Daily Check-in (Figma 463:625).
 *
 * The page chrome (themed backdrop, ThemeHeader, ornate bottom nav) comes from
 * <ThemedPageShell> in AppLayout, so this only supplies the theme's art to the
 * shared board.
 */
const SKIN = buildCheckinSkin(EP369_ASSETS, EP369_COLORS, {
  // Image overscale/offset per slot, taken from this theme's comp. The
  // exported PNGs carry different amounts of transparent padding, so without
  // this the tiles render smaller than their slot with wide gaps.
  fit: {
    board: { w: 102.97, h: 100, left: -1.35, top: 0 },
    dayCard: { w: 102.52, h: 109.81, left: -3.47, top: -9.81 },
    chest: { w: 112.2, h: 119.07, left: -5.48, top: -3.37 },
  },
});

export default function Ep369DailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
