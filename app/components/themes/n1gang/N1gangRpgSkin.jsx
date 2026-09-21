"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { WAR_FRAMES } from "./warFrames.generated";
import { N1GANG_ASSETS, N1GANG_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.N1GANG, N1GANG_ASSETS, N1GANG_COLORS, {
  // Measured off spin/panel-ornate.webp (1400x1050).
  panel: { slice: "4% 4.4% 8.3% 4.4% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1400x1120).
  tile: { slice: "9.0% 11.0% 16.0% 11.0% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #0a0a0a 0%, #17130a 55%, #2a2110 100%)" },
  // The tile art bakes its CTA pill in at [82, 93] % of height (measured).
  // Boss War frames — insets measured off public/assets/themes/n1gang/war/*.
  war: {
    ...WAR_FRAMES,
    bossFrame: { aspect: 1.08, open: [8.9, 8.0, 12.6, 8.0] },
    // No attack-btn art, so the ATTACK plaque falls back to this crown title
    // plaque. Center the label in its black panel (L R T B %) — the blind 0.14
    // bias dropped it toward the bottom rail. L/R keep it off the side diamonds.
    attackWindow: [18, 82, 35, 84],
    earnTile: { frame: N1GANG_ASSETS.war.earnTile, box: [22, 19, 19, 19], ctaBand: [82, 93] },
    // Asymmetric: table-frame.webp's left rail measures 2% (the bolts fade
    // into the backdrop) while its right measures 15.8%, so the left side
    // is the one that needs the clearance in padding rather than border.
    tablePad: [23, 8],
  },
});

export default function N1gangRpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
