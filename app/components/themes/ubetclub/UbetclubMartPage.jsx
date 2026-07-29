"use client";

import ThemedMartGrid from "../shared/ThemedMartGrid";
import { buildMartSkin } from "../shared/checkinMartSkin";
import { UBET_ASSETS, UBET_COLORS } from "./assets";

/**
 * Ubetclub Mart (Figma 468:2192).
 *
 * Chrome comes from <ThemedPageShell> in AppLayout; this only supplies the
 * theme's art to the shared redemption grid.
 */
const SKIN = buildMartSkin(UBET_ASSETS, UBET_COLORS);

export default function UbetclubMartPage() {
  return <ThemedMartGrid skin={SKIN} />;
}
