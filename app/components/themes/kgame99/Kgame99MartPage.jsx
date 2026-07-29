"use client";

import ThemedMartGrid from "../shared/ThemedMartGrid";
import { buildMartSkin } from "../shared/checkinMartSkin";
import { KGAME99_ASSETS, KGAME99_COLORS } from "./assets";

/**
 * Kgame99 Mart (Figma 469:2994).
 *
 * Chrome comes from <ThemedPageShell> in AppLayout; this only supplies the
 * theme's art to the shared redemption grid.
 */
const SKIN = buildMartSkin(KGAME99_ASSETS, KGAME99_COLORS);

export default function Kgame99MartPage() {
  return <ThemedMartGrid skin={SKIN} />;
}
