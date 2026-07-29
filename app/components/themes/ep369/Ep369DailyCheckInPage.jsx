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
const SKIN = buildCheckinSkin(EP369_ASSETS, EP369_COLORS);

export default function Ep369DailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
