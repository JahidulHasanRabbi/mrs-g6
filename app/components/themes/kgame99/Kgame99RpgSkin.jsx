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
    timerAspect: 3.42,
    card: warFrame(KGAME99_ASSETS.war.cardFrame, 16.3, 12.0, 13.4, 11.6, [358, 160], { art: [1000, 738] }),
    statCard: warFrame(KGAME99_ASSETS.war.statCard, 18.7, 8.3, 13.7, 8.1, [358, 96], { art: [762, 262] }),
    table: warFrame(KGAME99_ASSETS.war.tableFrame, 16.3, 12.0, 13.4, 11.6, [358, 440], { art: [1000, 738] }),
    row: warFrame(KGAME99_ASSETS.war.rowFrame, 16.1, 5.8, 14.3, 5.5, [358, 52], { art: [1000, 230] }),
    plaque: warFrame(KGAME99_ASSETS.war.plaque, 18.8, 13.2, 16.6, 13.4, [358, 213], { art: [991, 991] }),
    titleInset: { top: 18, right: 8, bottom: 16, left: 7 },
    frameInkSolid: "#0b2545",
    inkFrame: { text: "#0b2545", meta: "#1f4368", value: "#0b2545", dmg: "#8a3b00", crit: "#12630f" },
  },
});

export default function Kgame99RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
