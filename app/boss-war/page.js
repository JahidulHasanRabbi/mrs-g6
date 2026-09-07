"use client";

// /boss-war — Phase 3 Boss War mini-game (Figma a83SqWgqIGNF6dJD1aP13w,
// sections 2656:3435-3439 + 2657:5353: one 12-screen row per station).
//
// Same shape as /avatar: ?view= is the navigation truth, the RPG shell and
// per-theme skins are reused (the comps share the Avatar top bar + nav), and
// every data call goes through app/components/boss-war/bossWarApi.js.

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { useGameSessionPing, GAME_SESSION_IDS } from "../hooks/useGameSessionPing";
import { useRpgSkin } from "../components/rpg/rpgSkin";
import {
  GameClosedOverlay,
  GameLoadingGate,
  RpgSkinShell,
  useViewNavigation,
} from "../components/rpg/gameShell";
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

// Views that need a boss in the URL; without one they bounce to the list.
const BOSS_VIEWS = new Set([WAR_VIEWS.BATTLE, WAR_VIEWS.RESULTS, WAR_VIEWS.LEADERBOARD]);

// The theme resolves after first paint, so the skin provider swaps and this
// page remounts once per load. Keep the last status/AP per member so the
// remount re-renders instantly instead of flashing the LOADING gate; the
// effect below still refetches in the background.
const bootCache = { memberUuid: null, status: null, ap: null };

function BossWarInner() {
  const skin = useRpgSkin();
  const searchParams = useSearchParams();
  const { authReady, memberUuid } = useUser();
  useGameSessionPing(GAME_SESSION_IDS.BOSS_WAR);
  const cached = bootCache.memberUuid === memberUuid;

  const viewParam = searchParams.get("view") || WAR_VIEWS.LIST;
  const view = VALID_VIEWS.has(viewParam) ? viewParam : WAR_VIEWS.LIST;
  const bossId = searchParams.get("boss");

  const [status, setStatus] = useState(cached ? bootCache.status : null);
  const [ap, setAp] = useState(cached ? bootCache.ap : null);
  const [loadError, setLoadError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const loadedRef = useRef(false);

  const navigate = useViewNavigation(WAR_VIEWS.LIST);

  useEffect(() => {
    preloadWarAssets();
  }, []);

  // One-shot initial load. Screens fetch their own data and push AP updates
  // back up, so the balance stays live without a second request here.
  useEffect(() => {
    if (!authReady || loadedRef.current) return;
    loadedRef.current = true;
    // Status only: the list and battle screens both return the AP balance with
    // their own payload and push it up through onApUpdate.
    warApi
      .getGameStatus()
      .then((s) => {
        Object.assign(bootCache, { memberUuid, status: s });
        setStatus(s);
      })
      .catch((err) => setLoadError(err?.message || "Could not load Boss War. Please try again."));
  }, [authReady, memberUuid]);

  useEffect(() => {
    if (BOSS_VIEWS.has(view) && !bossId) navigate(WAR_VIEWS.LIST, undefined, { replace: true });
  }, [view, bossId, navigate]);

  const handleApUpdate = useCallback((next) => {
    if (!next) return;
    bootCache.ap = next;
    setAp(next);
  }, []);

  const showNotice = useCallback((title, message) => setNotice({ title, message }), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const openInfo = useCallback(() => navigate(WAR_VIEWS.INFO), [navigate]);

  if (!status) {
    return <GameLoadingGate skin={skin} message={loadError} font={skin.war.font} />;
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
        backgroundImage={skin.war.bg || undefined}
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

      {!status.open && <GameClosedOverlay skin={skin} title="Boss War is currently closed" font={skin.war.font} />}

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

// Skin shell outside the Suspense boundary on purpose — see gameShell.jsx.
export default function BossWarPage() {
  return (
    <RpgSkinShell>
      <Suspense fallback={null}>
        <BossWarInner />
      </Suspense>
    </RpgSkinShell>
  );
}
