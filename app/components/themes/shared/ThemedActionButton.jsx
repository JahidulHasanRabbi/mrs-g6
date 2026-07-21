"use client";

import { useTheme } from "../../../contexts/ThemeContext";
import { THEME_IDS } from "../../../config/themes";
import AcebetButton from "../acebet77/AcebetButton";
import UbetButton from "../ubetclub/UbetButton";
import Ep369Button from "../ep369/Ep369Button";
import KgameButton from "../kgame99/KgameButton";
import Lv918Button from "../lv918/Lv918Button";

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
const THEME_BUTTONS = {
  [THEME_IDS.ACEBET77]: AcebetButton,
  [THEME_IDS.UBETCLUB]: UbetButton,
  [THEME_IDS.EP369]: Ep369Button,
  [THEME_IDS.KGAME99]: KgameButton,
  [THEME_IDS.LV918]: Lv918Button,
};

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
    <Btn variant="gold" textSize={textSize} {...props}>
      {children}
    </Btn>
  );
}
