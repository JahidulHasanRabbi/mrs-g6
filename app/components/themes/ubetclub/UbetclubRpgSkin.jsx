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
    card: warFrame(UBET_ASSETS.war.cardFrame, 8, 4, 5, 4, [358, 160]),
    plaque: warFrame(UBET_ASSETS.war.plaque, 25, 11, 13, 11, [358, 213]),
    statCard: warFrame(UBET_ASSETS.war.statCard, 20, 9, 18, 9, [358, 96]),
    table: warFrame(UBET_ASSETS.war.tableFrame, 8, 4, 5, 4, [358, 440]),
  },
});

export default function UbetclubRpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
