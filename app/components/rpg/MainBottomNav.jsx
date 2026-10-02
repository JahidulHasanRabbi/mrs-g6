"use client";

// The portal's own bottom navigation (Leaderboards / Hot / Home / Profile / Chat) for game
// screens that sit outside the Avatar hub: each theme's ornate bar, else the default FooterNav.
// Same per-theme map the Penalty Kick page uses.

import { Suspense } from "react";
import { FooterNav } from "../footer";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_IDS } from "../../config/themes";
import { lazySkins } from "../themes/skinRoute";

const NAVS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../themes/acebet77/AcebetBottomNav"),
  [THEME_IDS.UBETCLUB]: () => import("../themes/ubetclub/UbetclubBottomNav"),
  [THEME_IDS.EP369]: () => import("../themes/ep369/Ep369BottomNav"),
  [THEME_IDS.KGAME99]: () => import("../themes/kgame99/KgameBottomNav"),
  [THEME_IDS.LV918]: () => import("../themes/lv918/Lv918BottomNav"),
  [THEME_IDS.N1GANG]: () => import("../themes/n1gang/N1gangBottomNav"),
  [THEME_IDS.KINGREWARDS]: () => import("../themes/kingrewards/KingRewardsBottomNav"),
});

export default function MainBottomNav() {
  const { themeId } = useTheme();
  const ThemedNav = NAVS[themeId];
  return ThemedNav ? (
    <Suspense fallback={null}>
      <ThemedNav />
    </Suspense>
  ) : (
    <FooterNav />
  );
}
