"use client";

import ThemedMartGrid from "../shared/ThemedMartGrid";
import { buildMartSkin } from "../shared/checkinMartSkin";
import { N1GANG_ASSETS, N1GANG_COLORS } from "./assets";

/**
 * N1gang Mart (Figma 468:2680).
 *
 * Chrome comes from <ThemedPageShell> in AppLayout; this only supplies the
 * theme's art to the shared redemption grid.
 */
const SKIN = buildMartSkin(N1GANG_ASSETS, N1GANG_COLORS);

export default function N1gangMartPage() {
  return <ThemedMartGrid skin={SKIN} />;
}
