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
const SKIN = buildCheckinSkin(KGAME99_ASSETS, KGAME99_COLORS);

export default function Kgame99DailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
