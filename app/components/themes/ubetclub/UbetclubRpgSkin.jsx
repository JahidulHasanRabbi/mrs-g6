"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { UBET_ASSETS, UBET_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.UBETCLUB, UBET_ASSETS, UBET_COLORS, {
  // Measured off spin/panel.webp (1400x1050).
  panel: { slice: "26.8% 10.5% 17.1% 10.4% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1254x1254).
  tile: { slice: "18.7% 17.4% 19.1% 17.3% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #18080a 0%, #300b0c 50%, #480e0f 100%)" },
});

export default function UbetclubRpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
