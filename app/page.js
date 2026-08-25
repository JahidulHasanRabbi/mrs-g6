"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HomeComponent from "./components/home/Home";
import { THEME_IDS } from "./config/themes";
import { lazySkins, skinFor } from "./components/themes/skinRoute";
import RedeemLinkScreen from "./components/redeem-link/RedeemLinkScreen";
import { readRedeemParams } from "./components/redeem-link/redeemLinkMemberUtils.mjs";
import { useTheme } from "./contexts/ThemeContext";

// One chunk per skin, warmed at module scope so the active theme starts
// loading before the first client render.
const SKINS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("./components/themes/acebet77/Acebet77Home"),
  [THEME_IDS.UBETCLUB]: () => import("./components/themes/ubetclub/UbetclubHome"),
  [THEME_IDS.EP369]: () => import("./components/themes/ep369/Ep369Home"),
  [THEME_IDS.KGAME99]: () => import("./components/themes/kgame99/Kgame99Home"),
  [THEME_IDS.LV918]: () => import("./components/themes/lv918/Lv918Home"),
  [THEME_IDS.N1GANG]: () => import("./components/themes/n1gang/N1gangHome"),
});

// useSearchParams needs a Suspense boundary during prerender. The outer
// LayoutShell boundary also keeps the active skin visible while route chunks
// are loading.
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full skin-backdrop" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const { linkUuid, origin } = readRedeemParams(searchParams);

  // Redeem links keep their dedicated flow. Normal home navigation uses the
  // active theme's lazy route entry.
  if (linkUuid) {
    return <RedeemLinkScreen linkUuid={linkUuid} origin={origin} />;
  }

  const { themeId } = useTheme();
  const skin = skinFor(SKINS, themeId);
  if (skin) return skin;

  return <HomeComponent />;
}
