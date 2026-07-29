"use client";

import ThemedMartGrid from "../shared/ThemedMartGrid";
import { buildMartSkin } from "../shared/checkinMartSkin";
import { EP369_ASSETS, EP369_COLORS } from "./assets";

/**
 * EP369 Mart (Figma 468:2543).
 *
 * Chrome comes from <ThemedPageShell> in AppLayout; this only supplies the
 * theme's art to the shared redemption grid.
 */
const SKIN = buildMartSkin(EP369_ASSETS, EP369_COLORS);

export default function Ep369MartPage() {
  return <ThemedMartGrid skin={SKIN} />;
}
