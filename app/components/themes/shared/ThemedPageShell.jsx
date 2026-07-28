"use client";

import { useTheme } from "../../../contexts/ThemeContext";
import { THEME_IDS } from "../../../config/themes";
import AcebetShell from "../acebet77/AcebetShell";
import UbetclubShell from "../ubetclub/UbetclubShell";
import Ep369Shell from "../ep369/Ep369Shell";
import KgameShell from "../kgame99/KgameShell";
import Lv918Shell from "../lv918/Lv918Shell";
import { ACEBET_ASSETS } from "../acebet77/assets";
import { UBET_ASSETS } from "../ubetclub/assets";
import { EP369_ASSETS } from "../ep369/assets";
import { KGAME99_ASSETS } from "../kgame99/assets";
import { LV918_ASSETS } from "../lv918/assets";
import N1gangShell from "../n1gang/N1gangShell";
import { N1GANG_ASSETS } from "../n1gang/assets";

/**
 * Themed chrome for member pages whose content isn't skinned yet (profile,
 * leaderboard, vip, mart, missions, personal-data). Renders the active theme's
 * shell — full-bleed lucky-spin background + themed ThemeHeader + themed bottom
 * nav — around whatever children it's given.
 *
 * On the default theme it returns children untouched, so callers keep their own
 * default MRS chrome (AppLayout's header/footer, or the page's own).
 *
 * All five shells share an identical prop signature (bg, onInfoClick, balance,
 * title, showNav, showHeader, contentPadding, bgOverlay), so any of those props
 * pass straight through. The background is each theme's lucky-spin scene, matching
 * the terms-and-conditions page.
 */
const SHELLS = {
  [THEME_IDS.ACEBET77]: { Shell: AcebetShell, bg: ACEBET_ASSETS.spin.bg },
  [THEME_IDS.UBETCLUB]: { Shell: UbetclubShell, bg: UBET_ASSETS.spin.bg },
  [THEME_IDS.EP369]: { Shell: Ep369Shell, bg: EP369_ASSETS.spin.bg },
  [THEME_IDS.KGAME99]: { Shell: KgameShell, bg: KGAME99_ASSETS.spin.bg },
  [THEME_IDS.LV918]: { Shell: Lv918Shell, bg: LV918_ASSETS.spin.bg },
  [THEME_IDS.N1GANG]: { Shell: N1gangShell, bg: N1GANG_ASSETS.spin.bg },
};

export default function ThemedPageShell({ children, ...shellProps }) {
  const { themeId } = useTheme();
  const entry = SHELLS[themeId];

  // Default theme: no themed chrome — caller renders its own.
  if (!entry) return children;

  const { Shell, bg } = entry;
  return (
    <Shell bg={bg} {...shellProps}>
      {children}
    </Shell>
  );
}
