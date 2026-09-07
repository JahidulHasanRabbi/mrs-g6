"use client";

import { buildRpgSkin, RpgSkinProvider, warFrame } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { N1GANG_ASSETS, N1GANG_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.N1GANG, N1GANG_ASSETS, N1GANG_COLORS, {
  // Measured off spin/panel-ornate.webp (1400x1050).
  panel: { slice: "4% 4.4% 8.3% 4.4% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1400x1120).
  tile: { slice: "9.0% 11.0% 16.0% 11.0% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #0a0a0a 0%, #17130a 55%, #2a2110 100%)" },
  // The tile art bakes its CTA pill in at [82, 93] % of height (measured).
  // Boss War frames — insets measured off public/assets/themes/n1gang/war/*.
  war: {
    timerAspect: 3.62,
    card: warFrame(N1GANG_ASSETS.war.cardFrame, 14.4, 4.8, 8.8, 5.1, [358, 160], { art: [1000, 748] }),
    statCard: warFrame(N1GANG_ASSETS.war.statCard, 16.5, 12.5, 17.6, 12.3, [358, 96], { art: [1000, 729] }),
    table: warFrame(N1GANG_ASSETS.war.tableFrame, 21.4, 18.2, 24.5, 18.3, [358, 440], { art: [814, 1000] }),
    row: warFrame(N1GANG_ASSETS.war.rowFrame, 13.9, 5.3, 16.7, 5.6, [358, 52], { art: [1000, 216] }),
    plaque: warFrame(N1GANG_ASSETS.war.plaque, 16.5, 12.5, 17.6, 12.3, [358, 213], { art: [1000, 729] }),
    titleInset: { top: 30, right: 10, bottom: 7, left: 10 },
    earnTile: { aspect: 0.61, frame: N1GANG_ASSETS.war.earnTile, ctaBand: [82, 93], inset: 13 },
  },
});

export default function N1gangRpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
