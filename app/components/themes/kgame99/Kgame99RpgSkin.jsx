"use client";

import { buildRpgSkin, RpgSkinProvider, warFrame } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { KGAME99_ASSETS, KGAME99_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.KGAME99, KGAME99_ASSETS, KGAME99_COLORS, {
  // Measured off spin/panel-ornate.webp (1254x1254).
  panel: { slice: "8.1% 23% 10.1% 23.1% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1024x1024).
  tile: { slice: "17.5% 13.9% 17.0% 13.8% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #061527 0%, #0a2a4a 50%, #0a4e9e 100%)" },
  nav: { centerBox: { w: 74, h: 72 } },
  // Boss War frames — insets measured off public/assets/themes/kgame99/war/*.
  // Its frame interiors are bright sky-blue, so the copy on them takes the dark
  // navy this theme already uses for headings (globals.css --lb-heading).
  war: {
    frameInkSolid: "#0b2545",
    inkFrame: { text: "#0b2545", meta: "#1f4368", value: "#0b2545", dmg: "#8a3b00", crit: "#12630f" },
    card: warFrame(KGAME99_ASSETS.war.cardFrame, 13.5, 5, 9, 5, [358, 160]),
    plaque: warFrame(KGAME99_ASSETS.war.plaque, 21, 14.5, 19, 14.5, [358, 213]),
    statCard: warFrame(KGAME99_ASSETS.war.statCard, 19, 18, 13.5, 17, [358, 96]),
    row: warFrame(KGAME99_ASSETS.war.rowFrame, 13.5, 5.5, 13.5, 5.5, [358, 52]),
    table: warFrame(KGAME99_ASSETS.war.tableFrame, 13.5, 5, 9, 5, [358, 440]),
  },
});

export default function Kgame99RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
