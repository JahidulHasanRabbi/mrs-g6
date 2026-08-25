"use client";

import { Suspense } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { THEME_IDS } from "../../../config/themes";
import { lazySkins } from "../skinRoute";

/**
 * Resolves the active theme's modal, mirroring how <ThemedActionButton> resolves
 * the active theme's button. Every themed dialog shares the same
 * `{ open, onClose, children }` signature, so shared skin-driven sections
 * (ThemedCheckInBoard / ThemedMartGrid) can pop a themed modal without each one
 * importing all six.
 *
 * On the default theme there is no themed dialog — `fallback` renders instead.
 */
// One chunk per skin, warmed at module scope — see lazySkins.
const DIALOGS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../acebet77/AcebetDialog"),
  [THEME_IDS.UBETCLUB]: () => import("../ubetclub/UbetDialog"),
  [THEME_IDS.EP369]: () => import("../ep369/Ep369Dialog"),
  [THEME_IDS.KGAME99]: () => import("../kgame99/KgameDialog"),
  [THEME_IDS.LV918]: () => import("../lv918/Lv918Dialog"),
  [THEME_IDS.N1GANG]: () => import("../n1gang/N1gangDialog"),
});

export default function ThemedDialog({ children, fallback = null, ...props }) {
  const { themeId } = useTheme();
  const Dialog = DIALOGS[themeId];

  if (!Dialog) return fallback;
  return (
    <Suspense fallback={fallback}>
      <Dialog {...props}>{children}</Dialog>
    </Suspense>
  );
}
