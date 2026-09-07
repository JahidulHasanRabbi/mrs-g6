"use client";

import { buildRpgSkin, RpgSkinProvider, warFrame } from "../../rpg/rpgSkin";
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
  // The tile art bakes its CTA pill in at [78, 91] % of height (measured).
  // Boss War frames — insets measured off public/assets/themes/lv918/war/*.
  war: {
    timerAspect: 3.52,
    card: warFrame(LV918_ASSETS.war.cardFrame, 4.8, 3.6, 5.5, 3.9, [358, 160], { art: [1000, 805] }),
    statCard: warFrame(LV918_ASSETS.war.statCard, 12.8, 7.6, 13.3, 8.1, [358, 96], { art: [1000, 188] }),
    table: warFrame(LV918_ASSETS.war.tableFrame, 4.8, 3.6, 5.5, 3.9, [358, 440], { art: [1000, 805] }),
    row: warFrame(LV918_ASSETS.war.rowFrame, 12.8, 7.6, 13.3, 8.1, [358, 52], { art: [1000, 188] }),
    plaque: warFrame(LV918_ASSETS.war.plaque, 20.0, 10.9, 4.8, 8.2, [358, 213], { art: [622, 479] }),
    titleInset: { top: 15, right: 3, bottom: 13, left: 5 },
    earnTile: { frame: LV918_ASSETS.war.earnTile, ctaBand: [78, 91], inset: 13 },
  },
});

export default function Lv918RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
