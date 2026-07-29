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
const SKIN = buildCheckinSkin(ACEBET_ASSETS, ACEBET_COLORS);

export default function Acebet77DailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
