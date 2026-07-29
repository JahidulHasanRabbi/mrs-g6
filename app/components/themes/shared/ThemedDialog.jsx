"use client";

import { useTheme } from "../../../contexts/ThemeContext";
import { THEME_IDS } from "../../../config/themes";
import AcebetDialog from "../acebet77/AcebetDialog";
import UbetDialog from "../ubetclub/UbetDialog";
import Ep369Dialog from "../ep369/Ep369Dialog";
import KgameDialog from "../kgame99/KgameDialog";
import Lv918Dialog from "../lv918/Lv918Dialog";
import N1gangDialog from "../n1gang/N1gangDialog";

/**
 * Resolves the active theme's modal, mirroring how <ThemedActionButton> resolves
 * the active theme's button. Every themed dialog shares the same
 * `{ open, onClose, children }` signature, so shared skin-driven sections
 * (ThemedCheckInBoard / ThemedMartGrid) can pop a themed modal without each one
 * importing all six.
 *
 * On the default theme there is no themed dialog — `fallback` renders instead.
 */
const DIALOGS = {
  [THEME_IDS.ACEBET77]: AcebetDialog,
  [THEME_IDS.UBETCLUB]: UbetDialog,
  [THEME_IDS.EP369]: Ep369Dialog,
  [THEME_IDS.KGAME99]: KgameDialog,
  [THEME_IDS.LV918]: Lv918Dialog,
  [THEME_IDS.N1GANG]: N1gangDialog,
};

export default function ThemedDialog({ children, fallback = null, ...props }) {
  const { themeId } = useTheme();
  const Dialog = DIALOGS[themeId];

  if (!Dialog) return fallback;
  return <Dialog {...props}>{children}</Dialog>;
}
