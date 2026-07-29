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
// Navy closed-panel tint, matching what the default page already used for the
// two blue-ish skins (app/mart/page.js).
const SKIN = buildMartSkin(LV918_ASSETS, LV918_COLORS, {
  closedPanelBg: 'rgba(20,31,54,0.95)',
});

export default function Lv918MartPage() {
  return <ThemedMartGrid skin={SKIN} />;
}
