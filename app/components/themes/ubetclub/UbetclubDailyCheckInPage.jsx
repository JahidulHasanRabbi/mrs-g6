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
const SKIN = buildCheckinSkin(UBET_ASSETS, UBET_COLORS);

export default function UbetclubDailyCheckInPage() {
  return <ThemedCheckInBoard skin={SKIN} />;
}
