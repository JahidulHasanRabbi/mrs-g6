"use client";

import { buildRpgSkin, RpgSkinProvider, warFrame } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { ACEBET_ASSETS, ACEBET_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.ACEBET77, ACEBET_ASSETS, ACEBET_COLORS, {
  // Measured off spin/panel-ornate.webp (1400x1050).
  panel: { slice: "17.2% 9.5% 16.4% 8.6% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1351x1164).
  tile: { slice: "15.7% 12.6% 15.0% 12.4% fill" },
  // Comp 2450:1903 — warm brown bar rather than the theme's near-black dark.
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #221e10 0%, #3e280a 100%)" },
  // Boss War frames — insets measured off public/assets/themes/acebet77/war/*.
  war: {
    card: warFrame(ACEBET_ASSETS.war.cardFrame, 14, 5, 9, 5, [358, 160]),
    plaque: warFrame(ACEBET_ASSETS.war.plaque, 22, 8, 12, 8, [358, 213]),
    statCard: warFrame(ACEBET_ASSETS.war.statCard, 14, 5, 9, 5, [358, 96]),
    row: warFrame(ACEBET_ASSETS.war.rowFrame, 14, 5, 9, 5, [358, 52]),
    table: warFrame(ACEBET_ASSETS.war.tableFrame, 14, 5, 9, 5, [358, 440]),
  },
});

export default function Acebet77RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
