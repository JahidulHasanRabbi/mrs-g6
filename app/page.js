"use client";

import HomeComponent from "./components/home/Home";
import Acebet77Home from "./components/themes/acebet77/Acebet77Home";
import UbetclubHome from "./components/themes/ubetclub/UbetclubHome";
import Ep369Home from "./components/themes/ep369/Ep369Home";
import Kgame99Home from "./components/themes/kgame99/Kgame99Home";
import Lv918Home from "./components/themes/lv918/Lv918Home";
import { useTheme } from "./contexts/ThemeContext";

export default function Home() {
  const { isAcebet77, isUbetclub, isEp369, isKgame99, isLv918 } = useTheme();
  if (isAcebet77) return <Acebet77Home />;
  if (isUbetclub) return <UbetclubHome />;
  if (isEp369) return <Ep369Home />;
  if (isKgame99) return <Kgame99Home />;
  if (isLv918) return <Lv918Home />;
  return <HomeComponent />;
}
