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
  // The tile art bakes its CTA pill in at [82, 93] % of height (measured).
  // Boss War frames — insets measured off public/assets/themes/acebet77/war/*.
  war: {
    timerAspect: 3.62,
    card: warFrame(ACEBET_ASSETS.war.cardFrame, 14.4, 4.8, 8.8, 5.0, [358, 160], { art: [1000, 749] }),
    statCard: warFrame(ACEBET_ASSETS.war.statCard, 14.4, 4.8, 8.8, 5.0, [358, 96], { art: [1000, 749] }),
    table: warFrame(ACEBET_ASSETS.war.tableFrame, 14.4, 4.8, 8.8, 5.0, [358, 440], { art: [1000, 749] }),
    row: warFrame(ACEBET_ASSETS.war.rowFrame, 14.4, 4.8, 8.8, 5.0, [358, 52], { art: [1000, 749] }),
    plaque: warFrame(ACEBET_ASSETS.war.plaque, 24.0, 15.9, 15.6, 15.7, [358, 213], { art: [1000, 725] }),
    titleInset: { top: 30, right: 10, bottom: 7, left: 10 },
    earnTile: { frame: ACEBET_ASSETS.war.earnTile, ctaBand: [82, 93], inset: 13 },
  },
});

export default function Acebet77RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
