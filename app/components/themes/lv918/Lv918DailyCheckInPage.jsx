"use client";

import ThemedCheckInBoard from "../shared/ThemedCheckInBoard";
import { buildCheckinSkin } from "../shared/checkinMartSkin";
import { LV918_ASSETS, LV918_COLORS } from "./assets";

/**
 * LV918 Daily Check-in (Figma 463:1130).
 *
 * The page chrome (themed backdrop, ThemeHeader, ornate bottom nav) comes from
 * <ThemedPageShell> in AppLayout, so this only supplies the theme's art to the
 * shared board.
 */
const SKIN = buildCheckinSkin(LV918_ASSETS, LV918_COLORS, {
  // Inner flat area of this theme's frame art (% of the board box). The day
  // layout is fitted into it so no tile or DAY label lands on the border or a
  // corner ornament.
  panel: { l: 13, r: 87, t: 15, b: 79 },
  // Image overscale/offset per slot, taken from this theme's comp. The
  // exported PNGs carry different amounts of transparent padding, so without
  // this the tiles render smaller than their slot with wide gaps.
  fit: {
    board: { w: 100, h: 100, left: 0, top: -0.16 },
    dayCard: { w: 134.03, h: 106.59, left: -16.75, top: 0 },
    chest: { w: 114.63, h: 120.75, left: -7.09, top: -6.6 },
  },
  // lv918's board interior is a bright pink panel, so the comp drops the gold
  // text for dark ink on days 1-6, keeping gold only for the DAY 7 label
  // (which sits outside that panel).
  c: { label: '#634600', reward: '#1c1400', labelSpecial: '#f2ba33' },
});

export default function Lv918DailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
