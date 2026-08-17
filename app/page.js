"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HomeComponent from "./components/home/Home";
import Acebet77Home from "./components/themes/acebet77/Acebet77Home";
import UbetclubHome from "./components/themes/ubetclub/UbetclubHome";
import Ep369Home from "./components/themes/ep369/Ep369Home";
import Kgame99Home from "./components/themes/kgame99/Kgame99Home";
import Lv918Home from "./components/themes/lv918/Lv918Home";
import N1gangHome from "./components/themes/n1gang/N1gangHome";
import RedeemLinkScreen from "./components/redeem-link/RedeemLinkScreen";
import { readRedeemParams } from "./components/redeem-link/redeemLinkMemberUtils.mjs";
import { useTheme } from "./contexts/ThemeContext";

// useSearchParams needs a Suspense boundary during prerender.
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const { linkUuid, origin } = readRedeemParams(searchParams);

  // Theming is handled in ThemeContext, which resolves the skin from the `o`
  // station URL carried by the link itself.
  if (linkUuid) {
    return <RedeemLinkScreen linkUuid={linkUuid} origin={origin} />;
  }

  return <ThemedHome />;
}

function ThemedHome() {
  const { isAcebet77, isUbetclub, isEp369, isKgame99, isLv918, isN1gang } = useTheme();
  if (isAcebet77) return <Acebet77Home />;
  if (isUbetclub) return <UbetclubHome />;
  if (isEp369) return <Ep369Home />;
  if (isKgame99) return <Kgame99Home />;
  if (isLv918) return <Lv918Home />;
  if (isN1gang) return <N1gangHome />;
  return <HomeComponent />;
}
