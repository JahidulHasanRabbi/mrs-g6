"use client";

import HomeComponent from "./components/home/Home";
import Acebet77Home from "./components/themes/acebet77/Acebet77Home";
import { useTheme } from "./contexts/ThemeContext";

export default function Home() {
  const { isAcebet77 } = useTheme();
  if (isAcebet77) return <Acebet77Home />;
  return <HomeComponent />;
}
