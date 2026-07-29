"use client";

import ThemedMartGrid from "../shared/ThemedMartGrid";
import { buildMartSkin } from "../shared/checkinMartSkin";
import { ACEBET_ASSETS, ACEBET_COLORS } from "./assets";

/**
 * Acebet77 Mart (Figma 468:1790).
 *
 * Chrome comes from <ThemedPageShell> in AppLayout; this only supplies the
 * theme's art to the shared redemption grid.
 */
const SKIN = buildMartSkin(ACEBET_ASSETS, ACEBET_COLORS);

export default function Acebet77MartPage() {
  return <ThemedMartGrid skin={SKIN} />;
}
