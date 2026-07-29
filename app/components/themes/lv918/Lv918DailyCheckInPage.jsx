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
  // lv918's board interior is a bright pink panel, so the comp drops the gold
  // text for dark ink on days 1-6, keeping gold only for the DAY 7 label
  // (which sits outside that panel).
  c: { label: '#634600', reward: '#1c1400', labelSpecial: '#f2ba33' },
});

export default function Lv918DailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
