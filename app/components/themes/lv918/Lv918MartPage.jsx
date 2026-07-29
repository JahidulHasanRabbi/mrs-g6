"use client";

import ThemedMartGrid from "../shared/ThemedMartGrid";
import { buildMartSkin } from "../shared/checkinMartSkin";
import { LV918_ASSETS, LV918_COLORS } from "./assets";

/**
 * LV918 Mart (Figma 468:2857).
 *
 * Chrome comes from <ThemedPageShell> in AppLayout; this only supplies the
 * theme's art to the shared redemption grid.
 */
const SKIN = buildMartSkin(LV918_ASSETS, LV918_COLORS);

export default function Lv918MartPage() {
  return <ThemedMartGrid skin={SKIN} />;
}
