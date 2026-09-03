"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { LV918_ASSETS, LV918_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.LV918, LV918_ASSETS, LV918_COLORS, {
  // Measured off spin/panel-ornate.webp (1400x788).
  panel: { slice: "18.4% 11% 22% 6.5% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1254x1254).
  tile: { slice: "18.7% 16.9% 18.7% 16.7% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #2a0a1f 0%, #6b0a32 55%, #984291 100%)" },
  nav: { centerBox: { w: 71, h: 65 } },
  // The panel interior is bright pink, so text inside a frame takes the
  // theme's ink instead of cream (same rule as the check-in board).
  onPanel: {
    text: LV918_COLORS.inkStrong,
    textDim: LV918_COLORS.inkMuted,
    title: LV918_COLORS.inkTitle,
    value: LV918_COLORS.inkGold,
    slotLabel: LV918_COLORS.inkMuted,
    slotEmpty: LV918_COLORS.inkSoft,
  },
});

export default function Lv918RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
