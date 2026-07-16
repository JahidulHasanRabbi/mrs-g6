"use client";

import HomeComponent from "./components/home/Home";
import Acebet77Home from "./components/themes/acebet77/Acebet77Home";
import UbetclubHome from "./components/themes/ubetclub/UbetclubHome";
import Ep369Home from "./components/themes/ep369/Ep369Home";
import { useTheme } from "./contexts/ThemeContext";

export default function Home() {
  const { isAcebet77, isUbetclub, isEp369 } = useTheme();
  if (isAcebet77) return <Acebet77Home />;
  if (isUbetclub) return <UbetclubHome />;
  if (isEp369) return <Ep369Home />;
  return <HomeComponent />;
}
