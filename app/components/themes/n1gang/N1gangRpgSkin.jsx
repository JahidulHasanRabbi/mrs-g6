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
  // Boss War frames — insets measured off public/assets/themes/n1gang/war/*.
  war: {
    card: warFrame(N1GANG_ASSETS.war.cardFrame, 14, 6, 8, 6, [358, 160]),
    plaque: warFrame(N1GANG_ASSETS.war.plaque, 12, 12, 12, 14, [358, 213]),
    statCard: warFrame(N1GANG_ASSETS.war.statCard, 12, 12, 12, 14, [358, 96]),
    row: warFrame(N1GANG_ASSETS.war.rowFrame, 14, 7, 16, 7, [358, 52]),
    table: warFrame(N1GANG_ASSETS.war.tableFrame, 18, 19, 21, 19, [358, 440]),
  },
});

export default function N1gangRpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
