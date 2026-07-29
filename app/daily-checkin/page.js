"use client";

import CheckInBoard from "../components/home/CheckInBoard";
import { useTheme } from "../contexts/ThemeContext";
import Acebet77DailyCheckInPage from "../components/themes/acebet77/Acebet77DailyCheckInPage";
import UbetclubDailyCheckInPage from "../components/themes/ubetclub/UbetclubDailyCheckInPage";
import Ep369DailyCheckInPage from "../components/themes/ep369/Ep369DailyCheckInPage";
import Kgame99DailyCheckInPage from "../components/themes/kgame99/Kgame99DailyCheckInPage";
import Lv918DailyCheckInPage from "../components/themes/lv918/Lv918DailyCheckInPage";
import N1gangDailyCheckInPage from "../components/themes/n1gang/N1gangDailyCheckInPage";

/**
 * Daily Check-in. Each theme draws its own board (Figma "Check in" frames in the
 * MRS Theme Engine file); the default portal reuses the same <CheckInBoard> it
 * shows on the home page.
 *
 * Page chrome is supplied by AppLayout — <ThemedPageShell> for themed members,
 * the default green header/footer otherwise.
 */
export default function DailyCheckInPage() {
  const { isAcebet77, isUbetclub, isEp369, isKgame99, isLv918, isN1gang } = useTheme();

  if (isAcebet77) return <Acebet77DailyCheckInPage />;
  if (isUbetclub) return <UbetclubDailyCheckInPage />;
  if (isEp369) return <Ep369DailyCheckInPage />;
  if (isKgame99) return <Kgame99DailyCheckInPage />;
  if (isLv918) return <Lv918DailyCheckInPage />;
  if (isN1gang) return <N1gangDailyCheckInPage />;

  return (
    <div className="w-full pt-4">
      <CheckInBoard />
    </div>
  );
}
