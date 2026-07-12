"use client";

// /rpg — Phase 3 planet RPG mini-game.
//
// Navigation follows the leaderboard pattern: the ?view= query param is the
// single source of truth for which screen renders, so browser back/forward
// unwinds through the player's path. Transient things (battle scripts, open
// dialogs) stay in component state and never enter the URL.
//
// There is no RPG backend yet — every data call goes through the mock
// service in app/components/rpg/rpgApi.js (localStorage-backed, API-shaped).

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { HamburgerMenu } from "../components/hamburger";
import { RPG_VIEWS, RPG_COLORS, RPG_FONTS } from "../components/rpg/constants";
import * as rpgApi from "../components/rpg/rpgApi";
import { preloadRpgAssets } from "../components/rpg/rpgAssets";
import ScreenShell from "../components/rpg/ScreenShell";
import CharacterSelect from "../components/rpg/screens/CharacterSelect";
import RpgHome from "../components/rpg/screens/RpgHome";
import HeroItem from "../components/rpg/screens/HeroItem";
import AvatarLevel from "../components/rpg/screens/AvatarLevel";
import Challenge from "../components/rpg/screens/Challenge";
import Battle from "../components/rpg/screens/Battle";
import MysteryBox from "../components/rpg/screens/MysteryBox";
import RpgMissions from "../components/rpg/screens/RpgMissions";
import CheckIn from "../components/rpg/screens/CheckIn";
import InfoModal from "../components/rpg/InfoModal";

const VALID_VIEWS = new Set(Object.values(RPG_VIEWS));

function RpgPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authReady, memberUuid, userData, isLoadingProfile } = useUser();

  const viewParam = searchParams.get("view") || RPG_VIEWS.HOME;
  const view = VALID_VIEWS.has(viewParam) ? viewParam : RPG_VIEWS.HOME;

  const [profile, setProfile] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [battleScript, setBattleScript] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [createError, setCreateError] = useState(null);
  const seededRef = useRef(false);

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

  // Initial load + one-time token seeding. The RPG wallet starts from the
  // member's real token balance (once it has loaded) but is mock-only after
  // that — we never mutate the real balance without a backend.
  useEffect(() => {
    if (!authReady || seededRef.current) return;
    const balanceReady = Boolean(memberUuid) && !isLoadingProfile;
    // With a member session, wait until the real balance has loaded so the
    // one-time seed uses it; without one (dev/no auth) seed the playable
    // floor of 100 tokens immediately.
    if (memberUuid && !balanceReady) return;
    seededRef.current = true;
    const parsed = Number(String(userData?.balance ?? "").replace(/,/g, ""));
    const seedTokens = Number.isFinite(parsed) ? Math.max(Math.floor(parsed), 100) : 100;
    // No cancellation: the guard above makes this a one-shot, and dropping
    // the response on a dep change would strand the page on LOADING.
    rpgApi
      .getRpgProfile({ seedTokens })
      .then(setProfile)
      .catch(() => {});
  }, [authReady, memberUuid, isLoadingProfile, userData?.balance]);

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
      <div className="grid min-h-[100dvh] w-full place-items-center" style={{ background: "#07130d" }}>
        <p className="text-[14px] tracking-[3px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
          LOADING...
        </p>
      </div>
    );
  }

  const handleReset = (freshProfile) => {
    setProfile(freshProfile);
    setEquipment(null);
    setBattleScript(null);
    navigate(RPG_VIEWS.HOME, undefined, { replace: true });
  };

  if (!profile.hasHero) {
    return (
      <>
        <CharacterSelect onCreate={handleCreateHero} onInfoClick={openInfo} onMenuClick={openMenu} error={createError} />
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} onReset={handleReset} />
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
      >
        {view === RPG_VIEWS.HOME && (
          <RpgHome profile={profile} equipment={equipment} onNavigate={navigate} />
        )}
        {view === RPG_VIEWS.ITEMS && (
          <HeroItem equipment={equipment} onEquipmentUpdate={handleEquipmentUpdate} />
        )}
        {view === RPG_VIEWS.LEVEL && (
          <AvatarLevel profile={profile} onProfileUpdate={handleProfileUpdate} />
        )}
        {view === RPG_VIEWS.CHALLENGE && <Challenge onBattleStart={handleBattleStart} />}
        {view === RPG_VIEWS.BATTLE && battleScript && (
          <Battle
            script={battleScript}
            profile={profile}
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
        {view === RPG_VIEWS.CHECKIN && (
          <CheckIn onProfileUpdate={handleProfileUpdate} onNavigate={navigate} />
        )}
      </ScreenShell>

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} onReset={handleReset} />
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
