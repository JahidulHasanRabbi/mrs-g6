"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { WAR_FRAMES } from "./warFrames.generated";
import { ACEBET_ASSETS, ACEBET_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.ACEBET77, ACEBET_ASSETS, ACEBET_COLORS, {
  // Measured off spin/panel-ornate.webp (1400x1050).
  panel: { slice: "17.2% 9.5% 16.4% 8.6% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1351x1164).
  tile: { slice: "15.7% 12.6% 15.0% 12.4% fill" },
  // Comp 2450:1903 — warm brown bar rather than the theme's near-black dark.
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #221e10 0%, #3e280a 100%)" },
  // The tile art bakes its CTA pill in at [82, 93] % of height (measured).
  // Boss War frames — insets measured off public/assets/themes/acebet77/war/*.
  war: {
    ...WAR_FRAMES,
    bossFrame: { aspect: 1.08, open: [8.9, 8.0, 12.6, 8.0] },
    // No attack-btn art, so the ATTACK plaque falls back to this crown title
    // plaque. Center the label in its black panel (L R T B %) — the blind 0.14
    // bias dropped it toward the bottom rail. L/R keep it off the side diamonds.
    attackWindow: [18, 82, 35, 84],
    earnTile: { frame: ACEBET_ASSETS.war.earnTile, box: [22, 19, 19, 19], ctaBand: [82, 93] },
    // card-frame.webp keeps its gem-and-filigree corners inside 10% of the
    // art, so the table needs little more than the frame's own pad.
    tablePad: [6, 6],
  },
});

export default function Acebet77RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
