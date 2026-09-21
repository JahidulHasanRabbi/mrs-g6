"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { WAR_FRAMES } from "./warFrames.generated";
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
    ...WAR_FRAMES,
    bossFrame: { aspect: 1.325, open: [7.4, 4.8, 8.2, 4.8] },
    earnTile: { frame: KGAME99_ASSETS.war.earnTile, box: [13, 21, 13, 21] },
    tablePad: [12, 12],
    frameInkSolid: "#0b2545",
    inkFrame: { text: "#0b2545", meta: "#1f4368", value: "#0b2545", dmg: "#8a3b00", crit: "#12630f" },
    // …but not every frame: row-frame's interior is rgb(1,63,134), where that
    // navy measured 1.0:1. Rows keep the light ink.
    darkFrames: [KGAME99_ASSETS.war.rowFrame],
  },
});

export default function Kgame99RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
