"use client";

import { Suspense } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { THEME_IDS } from "../../../config/themes";
import { lazySkins } from "../skinRoute";

/**
 * Themed chrome for member pages whose content isn't skinned yet (profile,
 * leaderboard, vip, mart, missions, personal-data). Renders the active theme's
 * shell — full-bleed lucky-spin background + themed ThemeHeader + themed bottom
 * nav — around whatever children it's given.
 *
 * On the default theme it returns children untouched, so callers keep their own
 * default MRS chrome (AppLayout's header/footer, or the page's own).
 *
 * All six shells share an identical prop signature (bg, onInfoClick, balance,
 * title, showNav, showHeader, contentPadding, bgOverlay), so any of those props
 * pass straight through. The background is each theme's lucky-spin scene, matching
 * the terms-and-conditions page.
 *
 * This component sits in the root layout, so it is the one place where bundling
 * all six shells cost every member on every page — hence the lazy split. Each
 * chunk carries its own assets map alongside the shell.
 */
const SHELLS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("./shells/AcebetShellEntry"),
  [THEME_IDS.UBETCLUB]: () => import("./shells/UbetclubShellEntry"),
  [THEME_IDS.EP369]: () => import("./shells/Ep369ShellEntry"),
  [THEME_IDS.KGAME99]: () => import("./shells/KgameShellEntry"),
  [THEME_IDS.LV918]: () => import("./shells/Lv918ShellEntry"),
  [THEME_IDS.N1GANG]: () => import("./shells/N1gangShellEntry"),
});

export default function ThemedPageShell({ children, ...shellProps }) {
  const { themeId } = useTheme();
  const Shell = SHELLS[themeId];

  // Default theme: no themed chrome — caller renders its own.
  if (!Shell) return children;

  return (
    <Suspense fallback={<div className="min-h-screen w-full skin-backdrop" />}>
      <Shell {...shellProps}>{children}</Shell>
    </Suspense>
  );
}
