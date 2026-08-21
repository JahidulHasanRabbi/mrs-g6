"use client";

import { Suspense } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { THEME_IDS } from "../../../config/themes";
import { lazySkins } from "../skinRoute";

/**
 * Renders the ACTIVE theme's ornate button (the shared "gold" variant — solid
 * gold plaque with dark script text, which every theme provides) so buttons on
 * the shared member pages (leaderboard, missions, …) match the theme instead of
 * a flat recolored default.
 *
 * On the default (unthemed) portal there is no ornate button, so the caller's
 * own `fallback` node is rendered untouched — each page keeps its default look.
 *
 * All five theme buttons share the prop signature
 *   { children, onClick, variant, disabled, className, textSize }
 * so onClick / disabled / className / textSize pass straight through.
 */
// One chunk per skin, warmed at module scope — see lazySkins. This component
// reaches the home page via <CheckInBoard>, so bundling all six buttons here
// dragged every skin's asset map onto the first screen a member sees.
const THEME_BUTTONS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../acebet77/AcebetButton"),
  [THEME_IDS.UBETCLUB]: () => import("../ubetclub/UbetButton"),
  [THEME_IDS.EP369]: () => import("../ep369/Ep369Button"),
  [THEME_IDS.KGAME99]: () => import("../kgame99/KgameButton"),
  [THEME_IDS.LV918]: () => import("../lv918/Lv918Button"),
  [THEME_IDS.N1GANG]: () => import("../n1gang/N1gangButton"),
});

export default function ThemedActionButton({
  children,
  fallback = null,
  textSize = 18,
  ...props
}) {
  const { themeId } = useTheme();
  const Btn = THEME_BUTTONS[themeId];

  if (!Btn) return fallback;

  return (
    <Suspense fallback={fallback}>
      <Btn variant="gold" textSize={textSize} {...props}>
        {children}
      </Btn>
    </Suspense>
  );
}
