"use client";

// /boss-war — Phase 3 Boss War mini-game (Figma a83SqWgqIGNF6dJD1aP13w,
// sections 2656:3435-3439 + 2657:5353: one 12-screen row per station).
//
// Same shape as /avatar: ?view= is the navigation truth, the RPG shell and
// per-theme skins are reused (the comps share the Avatar top bar + nav), and
// every data call goes through app/components/boss-war/bossWarApi.js.

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_IDS } from "../config/themes";
import { lazySkins } from "../components/themes/skinRoute";
import { useGameSessionPing, GAME_SESSION_IDS } from "../hooks/useGameSessionPing";
import { RPG_DEFAULT_SKIN, RpgSkinProvider, useRpgSkin } from "../components/rpg/rpgSkin";
import { HamburgerMenu } from "../components/hamburger";
import ScreenShell from "../components/rpg/ScreenShell";
import NoticeModal from "../components/rpg/NoticeModal";
import { WAR_VIEWS } from "../components/boss-war/constants";
import * as warApi from "../components/boss-war/bossWarApi";
import { preloadWarAssets } from "../components/boss-war/warAssets";
import BossList from "../components/boss-war/screens/BossList";
import BossBattle from "../components/boss-war/screens/BossBattle";
import Results from "../components/boss-war/screens/Results";
import WarLeaderboard from "../components/boss-war/screens/WarLeaderboard";
import Rewards from "../components/boss-war/screens/Rewards";
import History from "../components/boss-war/screens/History";
import HowToEarn from "../components/boss-war/screens/HowToEarn";
import BossInfo from "../components/boss-war/screens/BossInfo";

const VALID_VIEWS = new Set(Object.values(WAR_VIEWS));

// Same six skin chunks the Avatar game uses — the Boss War comps are drawn in
// the same station chrome, and buildRpgSkin carries the `war` token block.
const WAR_SKINS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../components/themes/acebet77/Acebet77RpgSkin"),
  [THEME_IDS.UBETCLUB]: () => import("../components/themes/ubetclub/UbetclubRpgSkin"),
  [THEME_IDS.EP369]: () => import("../components/themes/ep369/Ep369RpgSkin"),
  [THEME_IDS.KGAME99]: () => import("../components/themes/kgame99/Kgame99RpgSkin"),
  [THEME_IDS.LV918]: () => import("../components/themes/lv918/Lv918RpgSkin"),
  [THEME_IDS.N1GANG]: () => import("../components/themes/n1gang/N1gangRpgSkin"),
});

function WarSkinShell({ children }) {
  const { themeId } = useTheme();
  const Skin = WAR_SKINS[themeId];
  if (!Skin) return <RpgSkinProvider skin={RPG_DEFAULT_SKIN}>{children}</RpgSkinProvider>;
  return <Skin>{children}</Skin>;
}

// Views that need a boss in the URL; without one they bounce to the list.
const BOSS_VIEWS = new Set([WAR_VIEWS.BATTLE, WAR_VIEWS.RESULTS, WAR_VIEWS.LEADERBOARD]);

function BossWarInner() {
  const skin = useRpgSkin();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authReady } = useUser();
  useGameSessionPing(GAME_SESSION_IDS.BOSS_WAR);

  const viewParam = searchParams.get("view") || WAR_VIEWS.LIST;
  const view = VALID_VIEWS.has(viewParam) ? viewParam : WAR_VIEWS.LIST;
  const bossId = searchParams.get("boss");

  const [status, setStatus] = useState(null);
  const [ap, setAp] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const loadedRef = useRef(false);

  const navigate = useCallback(
    (nextView, extra, opts) => {
      const params = new URLSearchParams();
      if (nextView && nextView !== WAR_VIEWS.LIST) params.set("view", nextView);
      if (extra) {
        Object.entries(extra).forEach(([k, v]) => {
          if (v != null) params.set(k, String(v));
        });
      }
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (opts?.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router, pathname],
  );

  useEffect(() => {
    preloadWarAssets();
  }, []);

  // One-shot initial load: game status + the member's Attack Points. Screens
  // fetch their own data and push AP updates back up so the HUD stays live.
  useEffect(() => {
    if (!authReady || loadedRef.current) return;
    loadedRef.current = true;
    Promise.all([warApi.getGameStatus(), warApi.getAttackPoints()])
      .then(([s, a]) => {
        setStatus(s);
        setAp(a);
      })
      .catch((err) => setLoadError(err?.message || "Could not load Boss War. Please try again."));
  }, [authReady]);

  useEffect(() => {
    if (BOSS_VIEWS.has(view) && !bossId) navigate(WAR_VIEWS.LIST, undefined, { replace: true });
  }, [view, bossId, navigate]);

  const handleApUpdate = useCallback((next) => {
    if (next) setAp(next);
  }, []);

  const showNotice = useCallback((title, message) => setNotice({ title, message }), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const openInfo = useCallback(() => navigate(WAR_VIEWS.INFO), [navigate]);

  if (!status) {
    return (
      <div className="grid min-h-[100dvh] w-full place-items-center px-[32px]" style={{ background: skin.surface }}>
        <p
          className="text-center text-[14px] leading-[22px] tracking-[3px]"
          style={{ color: skin.c.textDim, fontFamily: skin.war.font }}
        >
          {loadError || "LOADING..."}
        </p>
      </div>
    );
  }

  const shared = { ap, onApUpdate: handleApUpdate, onNavigate: navigate, onNotice: showNotice, bossId };

  return (
    <>
      <ScreenShell
        view={view}
        onNavigate={navigate}
        onInfoClick={openInfo}
        onMenuClick={openMenu}
        hideHud
        title="Boss War"
        titleFont={skin.war.font}
        titleClassName="text-[24px] font-bold leading-none"
        navLinkBase="/avatar"
        navActiveTab={null}
      >
        {view === WAR_VIEWS.LIST && <BossList {...shared} />}
        {view === WAR_VIEWS.BATTLE && bossId && <BossBattle {...shared} />}
        {view === WAR_VIEWS.RESULTS && bossId && <Results {...shared} />}
        {view === WAR_VIEWS.LEADERBOARD && bossId && <WarLeaderboard {...shared} />}
        {view === WAR_VIEWS.REWARDS && <Rewards {...shared} />}
        {view === WAR_VIEWS.HISTORY && <History {...shared} />}
        {view === WAR_VIEWS.EARN && <HowToEarn {...shared} />}
        {view === WAR_VIEWS.INFO && <BossInfo {...shared} />}
      </ScreenShell>

      {!status.open && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div
            className="w-full max-w-[360px] rounded-[16px] border border-white/15 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
            style={{ background: `${skin.surface}f2` }}
          >
            <p className="text-[20px] font-bold" style={{ color: skin.c.value, fontFamily: skin.war.font }}>
              Boss War is currently closed
            </p>
            <p className="mt-3 text-[12px] leading-5" style={{ color: skin.c.textDim, fontFamily: skin.war.font }}>
              Please check back later.
            </p>
          </div>
        </div>
      )}

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <NoticeModal
        open={Boolean(notice)}
        title={notice?.title || ""}
        message={notice?.message}
        confirmLabel="OK"
        onClose={() => setNotice(null)}
      />
    </>
  );
}

// Skin shell outside the Suspense boundary on purpose — see app/avatar/page.js.
export default function BossWarPage() {
  return (
    <WarSkinShell>
      <Suspense fallback={null}>
        <BossWarInner />
      </Suspense>
    </WarSkinShell>
  );
}
