"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { ACEBET_ASSETS, ACEBET_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.ACEBET77, ACEBET_ASSETS, ACEBET_COLORS, {
  // Measured off spin/panel-ornate.webp (1400x1050).
  panel: { slice: "17.2% 9.5% 16.4% 8.6% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1351x1164).
  tile: { slice: "15.7% 12.6% 15.0% 12.4% fill" },
  // Comp 2450:1903 — warm brown bar rather than the theme's near-black dark.
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #221e10 0%, #3e280a 100%)" },
});

export default function Acebet77RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
