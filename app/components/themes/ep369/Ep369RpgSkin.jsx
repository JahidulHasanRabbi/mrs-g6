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
    earnTile: { frame: EP369_ASSETS.war.earnTile, aspect: 0.5 },
    timerAspect: 4.18,
    card: warFrame(EP369_ASSETS.war.cardFrame, 3.9, 3.5, 4.8, 3.4, [358, 160], { art: [1000, 800] }),
    statCard: warFrame(EP369_ASSETS.war.statCard, 19.7, 14.4, 17.0, 9.3, [358, 96], { art: [743, 289] }),
    table: warFrame(EP369_ASSETS.war.tableFrame, 3.9, 3.5, 4.8, 3.4, [358, 440], { art: [1000, 800] }),
    row: warFrame(EP369_ASSETS.war.rowFrame, 2.0, 5.9, 15.9, 5.9, [358, 52], { art: [1000, 258] }),
    plaque: warFrame(EP369_ASSETS.war.plaque, 20.3, 15.4, 19.1, 15.8, [358, 213], { art: [998, 1000] }),
    titleInset: { top: 16, right: 4, bottom: 8, left: 5 },
  },
});

export default function Ep369RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
