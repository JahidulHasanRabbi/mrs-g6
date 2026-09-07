"use client";

import { buildRpgSkin, RpgSkinProvider, warFrame } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { EP369_ASSETS, EP369_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.EP369, EP369_ASSETS, EP369_COLORS, {
  // Measured off spin/panel.webp (1400x788).
  panel: { slice: "29.8% 10.4% 18.5% 8.9% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1254x1254).
  tile: { slice: "17.7% 14.0% 17.6% 13.6% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #001002 0%, #05200d 50%, #093017 100%)" },
  nav: { centerBox: { w: 71, h: 71 } },
  // Boss War frames — insets measured off public/assets/themes/ep369/war/*.
  war: {
    card: warFrame(EP369_ASSETS.war.cardFrame, 4, 4, 5, 4, [358, 160]),
    plaque: warFrame(EP369_ASSETS.war.plaque, 20, 15, 19, 15, [358, 213]),
    statCard: warFrame(EP369_ASSETS.war.statCard, 21, 19, 19, 19, [358, 96]),
    row: warFrame(EP369_ASSETS.war.rowFrame, 13, 6, 15, 6, [358, 52]),
    table: warFrame(EP369_ASSETS.war.tableFrame, 4, 4, 5, 4, [358, 440]),
  },
});

export default function Ep369RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
