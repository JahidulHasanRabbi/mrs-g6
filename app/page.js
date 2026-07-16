"use client";

import HomeComponent from "./components/home/Home";
import Acebet77Home from "./components/themes/acebet77/Acebet77Home";
import UbetclubHome from "./components/themes/ubetclub/UbetclubHome";
import { useTheme } from "./contexts/ThemeContext";

export default function Home() {
  const { isAcebet77, isUbetclub } = useTheme();
  if (isAcebet77) return <Acebet77Home />;
  if (isUbetclub) return <UbetclubHome />;
  return <HomeComponent />;
}
