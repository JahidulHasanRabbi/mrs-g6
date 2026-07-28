"use client";

// /rpg — Phase 3 planet RPG mini-game.
//
// Navigation follows the leaderboard pattern: the ?view= query param is the
// single source of truth for which screen renders, so browser back/forward
// unwinds through the player's path. Transient things (battle scripts, open
// dialogs) stay in component state and never enter the URL.
//
// Every data call goes through app/components/rpg/rpgApi.js, which adapts the
// /avatar/* member API (app/api/memberApi.js) into the screens' view-models.

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { HamburgerMenu } from "../components/hamburger";
import { RPG_VIEWS, RPG_COLORS, RPG_FONTS } from "../components/rpg/constants";
import * as rpgApi from "../components/rpg/rpgApi";
import { preloadRpgAssets, arenaFor, RPG_IMAGES } from "../components/rpg/rpgAssets";
import ScreenShell from "../components/rpg/ScreenShell";
import CharacterSelect from "../components/rpg/screens/CharacterSelect";
import RpgHome from "../components/rpg/screens/RpgHome";
import HeroItem from "../components/rpg/screens/HeroItem";
import AvatarLevel from "../components/rpg/screens/AvatarLevel";
import Challenge from "../components/rpg/screens/Challenge";
import Battle from "../components/rpg/screens/Battle";
import MysteryBox from "../components/rpg/screens/MysteryBox";
import RpgMissions from "../components/rpg/screens/RpgMissions";
import InfoModal from "../components/rpg/InfoModal";

const VALID_VIEWS = new Set(Object.values(RPG_VIEWS));

function RpgPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authReady, memberUuid, updateUserData } = useUser();

  const viewParam = searchParams.get("view") || RPG_VIEWS.HOME;
  const view = VALID_VIEWS.has(viewParam) ? viewParam : RPG_VIEWS.HOME;

  const [profile, setProfile] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [battleScript, setBattleScript] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const loadedRef = useRef(false);

  // Keep the global header BP balance aligned with the RPG's authoritative
  // profile after initial load, mission claims, boxes, battles, and level-ups.
  useEffect(() => {
    if (profile?.bp == null) return;
    const battlePoints = Number(profile.bp);
    updateUserData({
      battlePoints: Number.isFinite(battlePoints)
        ? battlePoints.toLocaleString("en-US")
        : "0",
    });
    // profile.bp is the only value that should trigger this synchronization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.bp]);

  const navigate = useCallback(
    (nextView, extra, opts) => {
      const params = new URLSearchParams();
      if (nextView && nextView !== RPG_VIEWS.HOME) params.set("view", nextView);
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
    preloadRpgAssets();
  }, []);

  // Initial load. The profile (level, BP, power) comes from
  // /avatar/member-avatar/profile/, the token balance from the member record —
  // both real, both authoritative.
  useEffect(() => {
    if (!authReady || loadedRef.current) return;
    loadedRef.current = true;
    // No cancellation: the guard above makes this a one-shot, and dropping
    // the response on a dep change would strand the page on LOADING.
    rpgApi
      .getRpgProfile()
      .then(setProfile)
      .catch((err) => setLoadError(err?.message || "Could not load the game. Please try again."));
  }, [authReady, memberUuid]);

  // Equipment powers the Home slot chips; refresh when the hero exists and
  // whenever the player lands on a screen that shows gear (a mystery box may
  // have dropped equipment in the meantime).
  useEffect(() => {
    if (!profile?.hasHero) return undefined;
    let cancelled = false;
    rpgApi
      .getEquipment()
      .then((eq) => {
        if (!cancelled) setEquipment(eq);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profile?.hasHero, view]);

  // ?view=battle without a live script (reload, stale link) has nothing to
  // animate — bounce to the challenge list without polluting history.
  useEffect(() => {
    if (view === RPG_VIEWS.BATTLE && !battleScript) {
      navigate(RPG_VIEWS.CHALLENGE, undefined, { replace: true });
    }
  }, [view, battleScript, navigate]);

  const handleBattleStart = useCallback(
    (script) => {
      setBattleScript(script);
      if (script?.profile) setProfile(script.profile);
      navigate(RPG_VIEWS.BATTLE, { boss: script.boss.id });
    },
    [navigate],
  );

  // Mutations return fresh profile views — screens push them back up here so
  // the HUD stays live without refetch loops.
  const handleProfileUpdate = useCallback((p) => {
    if (p) setProfile(p);
  }, []);

  const handleEquipmentUpdate = useCallback((eq) => {
    if (eq) {
      setEquipment(eq);
      if (eq.profile) setProfile(eq.profile);
    }
  }, []);

  const handleCreateHero = useCallback(
    async (gender) => {
      setCreateError(null);
      try {
        const p = await rpgApi.createHero(gender);
        setProfile(p);
        navigate(RPG_VIEWS.HOME);
      } catch (err) {
        setCreateError(err?.message || "Could not create your hero. Please try again.");
      }
    },
    [navigate],
  );

  const openInfo = useCallback(() => setInfoOpen(true), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);

  // ------------------------------------------------------------------
  // Gates
  // ------------------------------------------------------------------

  if (!profile) {
    return (
      <div className="grid min-h-[100dvh] w-full place-items-center px-[32px]" style={{ background: "#07130d" }}>
        <p
          className="text-center text-[14px] leading-[22px] tracking-[3px]"
          style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}
        >
          {loadError || "LOADING..."}
        </p>
      </div>
    );
  }

  if (!profile.hasHero) {
    return (
      <>
        <CharacterSelect
          onCreate={handleCreateHero}
          onInfoClick={openInfo}
          onMenuClick={openMenu}
          error={createError}
          profile={profile}
        />
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} profile={profile} />
      </>
    );
  }

  return (
    <>
      <ScreenShell
        view={view}
        profile={profile}
        onNavigate={navigate}
        onInfoClick={openInfo}
        onMenuClick={openMenu}
        backgroundImage={
          view === RPG_VIEWS.BATTLE && battleScript
            ? arenaFor(battleScript.boss.id)
            : view === RPG_VIEWS.HOME
              ? RPG_IMAGES.homeRealm
              : undefined
        }
        fit={view === RPG_VIEWS.BATTLE}
        // Client feedback: the battle screen hides the Level/EXP/Token/BP strip
        // so the boss and hero are the focus (and get its vertical space).
        hideHud={view === RPG_VIEWS.BATTLE}
      >
        {view === RPG_VIEWS.HOME && (
          <RpgHome profile={profile} equipment={equipment} onNavigate={navigate} />
        )}
        {view === RPG_VIEWS.ITEMS && (
          <HeroItem profile={profile} equipment={equipment} onEquipmentUpdate={handleEquipmentUpdate} />
        )}
        {view === RPG_VIEWS.LEVEL && (
          <AvatarLevel profile={profile} onProfileUpdate={handleProfileUpdate} />
        )}
        {view === RPG_VIEWS.CHALLENGE && <Challenge onBattleStart={handleBattleStart} />}
        {view === RPG_VIEWS.BATTLE && battleScript && (
          <Battle
            script={battleScript}
            profile={profile}
            equipment={equipment}
            onClaimBox={() => navigate(RPG_VIEWS.BOX, { box: battleScript.boxId })}
            onExit={() => navigate(RPG_VIEWS.CHALLENGE)}
          />
        )}
        {view === RPG_VIEWS.BOX && (
          <MysteryBox
            boxId={searchParams.get("box")}
            onProfileUpdate={handleProfileUpdate}
            onNavigate={navigate}
          />
        )}
        {view === RPG_VIEWS.MISSIONS && (
          <RpgMissions onProfileUpdate={handleProfileUpdate} onNavigate={navigate} />
        )}
      </ScreenShell>

      {/* game_status 2 — reads still work, every action is refused by the API.
          Same overlay treatment as the penalty-kick closed state. */}
      {!profile.gameOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div className="w-full max-w-[360px] rounded-[16px] border border-white/15 bg-[#071906]/95 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
            <p className="text-[20px] font-bold" style={{ color: RPG_COLORS.gold, fontFamily: RPG_FONTS.display }}>
              RPG is currently closed
            </p>
            <p className="mt-3 text-[12px] leading-5" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
              Please check back later.
            </p>
          </div>
        </div>
      )}

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} profile={profile} />
    </>
  );
}

// useSearchParams() requires a route-level Suspense boundary in Next 16 when
// the page opts out of static rendering (same as app/leaderboard/page.js).
export default function RpgPage() {
  return (
    <Suspense fallback={null}>
      <RpgPageInner />
    </Suspense>
  );
}
