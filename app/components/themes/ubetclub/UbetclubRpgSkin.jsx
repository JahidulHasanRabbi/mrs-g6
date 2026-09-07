"use client";

import { buildRpgSkin, RpgSkinProvider, warFrame } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { UBET_ASSETS, UBET_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.UBETCLUB, UBET_ASSETS, UBET_COLORS, {
  // Measured off spin/panel.webp (1400x1050).
  panel: { slice: "26.8% 10.5% 17.1% 10.4% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1254x1254).
  tile: { slice: "18.7% 17.4% 19.1% 17.3% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #18080a 0%, #300b0c 50%, #480e0f 100%)" },
  // Boss War frames — insets measured off public/assets/themes/ubetclub/war/*.
  war: {
    earnTile: { frame: UBET_ASSETS.war.earnTile, aspect: 0.74 },
    timerAspect: 3.62,
    card: warFrame(UBET_ASSETS.war.cardFrame, 4.6, 3.7, 4.6, 3.7, [358, 160], { art: [1000, 1000] }),
    statCard: warFrame(UBET_ASSETS.war.statCard, 19.2, 7.6, 17.8, 8.3, [358, 96], { art: [787, 297] }),
    table: warFrame(UBET_ASSETS.war.tableFrame, 4.6, 3.7, 4.6, 3.7, [358, 440], { art: [1000, 1000] }),
    row: warFrame(UBET_ASSETS.war.rowFrame, 15.1, 5.3, 9.6, 5.3, [358, 52], { art: [1000, 219] }),
    plaque: warFrame(UBET_ASSETS.war.plaque, 25.8, 11.6, 13.8, 11.6, [358, 213], { art: [1000, 712] }),
    titleInset: { top: 31, right: 12, bottom: 25, left: 12 },
  },
});

export default function UbetclubRpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
