"use client";

import CheckInBoard from "../components/home/CheckInBoard";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_IDS } from "../config/themes";
import { lazySkins, skinFor } from "../components/themes/skinRoute";

// One chunk per skin, warmed at module scope — see lazySkins.
const SKINS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../components/themes/acebet77/Acebet77DailyCheckInPage"),
  [THEME_IDS.UBETCLUB]: () => import("../components/themes/ubetclub/UbetclubDailyCheckInPage"),
  [THEME_IDS.EP369]: () => import("../components/themes/ep369/Ep369DailyCheckInPage"),
  [THEME_IDS.KGAME99]: () => import("../components/themes/kgame99/Kgame99DailyCheckInPage"),
  [THEME_IDS.LV918]: () => import("../components/themes/lv918/Lv918DailyCheckInPage"),
  [THEME_IDS.N1GANG]: () => import("../components/themes/n1gang/N1gangDailyCheckInPage"),
});

/**
 * Daily Check-in. Each theme draws its own board (Figma "Check in" frames in the
 * MRS Theme Engine file); the default portal reuses the same <CheckInBoard> it
 * shows on the home page.
 *
 * Page chrome is supplied by AppLayout — <ThemedPageShell> for themed members,
 * the default green header/footer otherwise.
 */
export default function DailyCheckInPage() {
  const { themeId } = useTheme();

  const skin = skinFor(SKINS, themeId);
  if (skin) return skin;

  return (
    <div className="w-full pt-4">
      <CheckInBoard />
    </div>
  );
}
