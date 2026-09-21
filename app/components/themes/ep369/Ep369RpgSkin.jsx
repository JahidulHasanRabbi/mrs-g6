"use client";

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { WAR_FRAMES } from "./warFrames.generated";
import { EP369_ASSETS, EP369_COLORS } from "./assets";

const SKIN = buildRpgSkin(THEME_IDS.EP369, EP369_ASSETS, EP369_COLORS, {
  // Measured off spin/panel.webp (1400x788).
  panel: { slice: "29.8% 10.4% 18.5% 8.9% fill" },
  // Slot-tile opening, measured off checkin/board-frame.webp (1254x1254).
  tile: { slice: "17.7% 14.0% 17.6% 13.6% fill" },
  chrome: { bar: "radial-gradient(120% 160% at 50% 60%, #001002 0%, #05200d 50%, #093017 100%)" },
  nav: { centerBox: { w: 71, h: 71 } },
  // Boss War frames — insets measured off public/assets/themes/ep369/war/*.
  war: {
    ...WAR_FRAMES,
    bossFrame: { aspect: 1.339, open: [13.4, 9.2, 13.5, 9.2] },
    // Tighter than the shared default: ep369's ivy-heavy rails read as too far
    // apart at 10px.
    earnTile: { frame: EP369_ASSETS.war.earnTile, box: [16, 19, 16, 19], gap: 2 },
    // The corner gems reach 17% into card-frame.webp — the auto-measure sees
    // only the 3.4% rail, so the TIME column was landing on them.
    tablePad: [14, 14],
    // card-frame.webp hangs ivy well past the metal rail the auto-measure
    // picks up (it fades into the dark backdrop, under the detail threshold),
    // so the generated pad still let the ATTACK button sit in the vines.
    attackInset: 14,
  },
});

export default function Ep369RpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
