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
  // n1gang's check-in title is a narrow 206px crest rather than the full-bleed
  // 408px plaque the other five skins use (Figma 463:1387).
  titleWidthPct: 52,
});

export default function N1gangDailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
