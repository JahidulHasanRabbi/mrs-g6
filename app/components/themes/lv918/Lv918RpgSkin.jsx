"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { WAR_FRAMES } from "./warFrames.generated";
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
    ...WAR_FRAMES,
    bossFrame: { aspect: 1.361, open: [6.1, 4.1, 5.6, 4.3] },
    // No attack-btn art, so the ATTACK plaque falls back to this crown title
    // plaque. Center the label in its recessed panel (L R T B %) instead of the
    // blind 0.14 bias, which dropped it onto the bottom bevel.
    attackWindow: [15, 85, 31, 85],
    // The only station whose HP bar is not gold (comps 2507:65, 2482:2):
    // a magenta ramp on a plum track, sampled off the comp.
    hp: { track: "#4b072a", fill: "linear-gradient(90deg, #d71b77 0%, #900147 100%)" },
    earnTile: { frame: LV918_ASSETS.war.earnTile, box: [18, 16, 21, 16], ctaBand: [78, 91] },
    tablePad: [8, 8],
  },
});

export default function Lv918RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
