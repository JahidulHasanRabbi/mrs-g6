"use client";

import HomeComponent from "./components/home/Home";
import { THEME_IDS } from "./config/themes";
import { lazySkins, skinFor } from "./components/themes/skinRoute";
import { useTheme } from "./contexts/ThemeContext";

// One chunk per skin, warmed at module scope — see lazySkins.
const SKINS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("./components/themes/acebet77/Acebet77Home"),
  [THEME_IDS.UBETCLUB]: () => import("./components/themes/ubetclub/UbetclubHome"),
  [THEME_IDS.EP369]: () => import("./components/themes/ep369/Ep369Home"),
  [THEME_IDS.KGAME99]: () => import("./components/themes/kgame99/Kgame99Home"),
  [THEME_IDS.LV918]: () => import("./components/themes/lv918/Lv918Home"),
  [THEME_IDS.N1GANG]: () => import("./components/themes/n1gang/N1gangHome"),
});

export default function Home() {
  const { themeId } = useTheme();

  const skin = skinFor(SKINS, themeId);
  if (skin) return skin;
  return <HomeComponent />;
}
