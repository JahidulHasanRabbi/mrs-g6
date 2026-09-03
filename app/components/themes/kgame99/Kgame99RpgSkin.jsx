"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { KGAME99_ASSETS, KGAME99_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.KGAME99, KGAME99_ASSETS, KGAME99_COLORS, {
  // Measured off spin/panel-ornate.webp (1254x1254).
  panel: { slice: "8.1% 23% 10.1% 23.1% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1024x1024).
  tile: { slice: "17.5% 13.9% 17.0% 13.8% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #061527 0%, #0a2a4a 50%, #0a4e9e 100%)" },
  nav: { centerBox: { w: 74, h: 72 } },
});

export default function Kgame99RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
