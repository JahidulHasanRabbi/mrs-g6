"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import { LB_SCREENS, LB_TABS } from "../components/leaderboard/constants";
import { LBHeader } from "../components/leaderboard/primitives";
import {
  getMyProfile,
  confirmNation,
  clearNationSelection,
  getCountryRankings,
  getGlobalPlayers,
  getMyPredictions,
} from "../components/leaderboard/worldcupApi";
import ProfileCard from "../components/leaderboard/ProfileCard";
import PredictToWinCard from "../components/leaderboard/PredictToWinCard";
import NationSelect from "../components/leaderboard/NationSelect";
import Onboarding from "../components/leaderboard/Onboarding";
import {
  LeaderboardTabs,
  CountriesPanel,
  GlobalPlayersPanel,
  MyCountryPanel,
  MyPredictionsPanel,
} from "../components/leaderboard/RankingScreens";
import PredictionsList from "../components/leaderboard/PredictionsList";
import InfoModal from "../components/leaderboard/InfoModal";
import NoticeModal from "../components/leaderboard/NoticeModal";
import {
  PrizeTabs,
  CountryPrizesPanel,
  PlayerPrizesPanel,
  PredictionPrizesPanel,
  PrizeInfo,
} from "../components/leaderboard/PrizeScreens";

// URL → in-page screen. `view` query param is the single source of nav truth
// so browser back/forward unwinds through the user's path instead of leaving
// the route entirely. Modals (PredictModal, InfoModal, NoticeModal) stay as
// transient state — they are not navigation.
const SCREEN_FROM_VIEW = {
  home: LB_SCREENS.COUNTRIES,
  players: LB_SCREENS.GLOBAL_PLAYERS,
  predictions: LB_SCREENS.MY_PREDICTIONS,
  country: LB_SCREENS.MY_COUNTRY,
  fixtures: LB_SCREENS.PREDICTIONS_LIST,
  "prize-country": LB_SCREENS.PRIZE_COUNTRY,
  "prize-players": LB_SCREENS.PRIZE_PLAYERS,
  "prize-predictions": LB_SCREENS.PRIZE_PREDICTIONS,
  "prize-info": LB_SCREENS.PRIZE_INFO,
};

const TAB_FROM_VIEW = {
  home: LB_TABS.COUNTRIES,
  country: LB_TABS.COUNTRIES,
  players: LB_TABS.PLAYERS,
  predictions: LB_TABS.PREDICTIONS,
};

// `pt` (prize tab) is a secondary param so PRIZE_INFO can remember which
// prize-pool tab the user came from, even when browser-back lands them there.
const DEFAULT_PRIZE_TAB = "country";

function LeaderboardPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get("view") || "home";
  const ptParam = searchParams.get("pt");
  const screen = SCREEN_FROM_VIEW[view] ?? LB_SCREENS.COUNTRIES;
  const activeTab = TAB_FROM_VIEW[view] ?? LB_TABS.COUNTRIES;
  const prizeTab =
    view === "prize-players" ? "players" :
    view === "prize-predictions" ? "predictions" :
    view === "prize-country" ? "country" :
    view === "prize-info" ? (ptParam || DEFAULT_PRIZE_TAB) :
    DEFAULT_PRIZE_TAB;

  const navigate = useCallback(
    (nextView, extra) => {
      const params = new URLSearchParams();
      if (nextView && nextView !== "home") params.set("view", nextView);
      if (extra?.pt) params.set("pt", extra.pt);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const { authReady, memberUuid } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [joinBlocked, setJoinBlocked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [countriesData, setCountriesData] = useState({ rows: [], loading: true });
  const [playersData, setPlayersData] = useState({ rows: [], loading: true });
  const [predictionsData, setPredictionsData] = useState({ rows: [], loading: true });

  useEffect(() => {
    if (!authReady || !memberUuid) return;
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (cancelled) return;
        const fresh =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("fresh") === "1";
        if (fresh) clearNationSelection();
        const next = fresh ? { ...p, hasNation: false, hasOnboarded: false } : p;
        setProfile(next);
      })
      .catch((err) => {
        if (cancelled) return;
        // 401 → auth system will clear tokens; any other failure (404 for
        // new users, network error) → start the onboarding flow from scratch.
        if (err?.status !== 401) {
          setProfile({
            name: "", hasNation: false, hasOnboarded: false,
            totalPoints: 0, globalRank: 0, countryRank: 0,
            winningStreak: 0, totalPredictions: 0, totalWins: 0,
            countryCode: null, countryName: null, countryFlag: null,
          });
        }
      });
    return () => { cancelled = true; };
  }, [authReady, memberUuid]);

  // Prefetch all three leaderboard datasets in parallel so tabs are instant.
  useEffect(() => {
    if (!authReady || !memberUuid) return;
    let cancelled = false;
    getCountryRankings()
      .then((rows) => { if (!cancelled) setCountriesData({ rows, loading: false }); })
      .catch(() => { if (!cancelled) setCountriesData({ rows: [], loading: false }); });
    getGlobalPlayers()
      .then((rows) => { if (!cancelled) setPlayersData({ rows, loading: false }); })
      .catch(() => { if (!cancelled) setPlayersData({ rows: [], loading: false }); });
    getMyPredictions()
      .then((rows) => { if (!cancelled) setPredictionsData({ rows, loading: false }); })
      .catch(() => { if (!cancelled) setPredictionsData({ rows: [], loading: false }); });
    return () => { cancelled = true; };
  }, [authReady, memberUuid]);

  // If the URL points at a screen that needs transient state we don't have
  // (e.g. ?view=country after a reload), kick back to a safe view via replace
  // so we don't pollute history with a dead entry.
  useEffect(() => {
    if (view === "country" && !selectedCountry) {
      router.replace(pathname, { scroll: false });
    } else if (view === "prize-info" && !selectedPrize) {
      const params = new URLSearchParams();
      params.set("view", prizeTab === "players" ? "prize-players" : prizeTab === "predictions" ? "prize-predictions" : "prize-country");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [view, selectedCountry, selectedPrize, prizeTab, router, pathname]);

  // Nation Select is the last gate before the profile/leaderboard view, so
  // confirming a country drops the user straight into "My Profile".
  const handleConfirmNation = useCallback(async (country) => {
    setConfirmError(null);
    try {
      const result = await confirmNation(country.id);
      setProfile((p) => ({
        ...p,
        hasNation: true,
        hasOnboarded: true,
        countryId: result.country,
        countryCode: result.country_code,
        countryName: result.country_name,
        countryFlag: null,
      }));
    } catch (err) {
      setConfirmError(err?.data?.detail || err?.data?.details || err?.message || "Failed to save country. Please try again.");
    }
  }, []);

  // Onboarding's "Join Now" completes the intro carousel; the gates below
  // (needsOnboarding / needsNation / unlocked) route the user from here.
  const handleJoinNow = useCallback(() => {
    setProfile((p) => p ? { ...p, hasOnboarded: true } : p);
  }, []);

  const onTabChange = (tab) => {
    if (tab === LB_TABS.PLAYERS) navigate("players");
    else if (tab === LB_TABS.PREDICTIONS) navigate("predictions");
    else navigate("home");
  };

  const onPrizeTabChange = (t) => {
    navigate(t === "players" ? "prize-players" : t === "predictions" ? "prize-predictions" : "prize-country");
  };

  const openPrizePool = () => {
    if (activeTab === LB_TABS.PLAYERS) navigate("prize-players");
    else if (activeTab === LB_TABS.PREDICTIONS) navigate("prize-predictions");
    else navigate("prize-country");
  };

  const backToLeaderboards = () => {
    if (prizeTab === "players") navigate("players");
    else if (prizeTab === "predictions") navigate("predictions");
    else navigate("home");
  };

  const isLeaderboardTabbed =
    screen === LB_SCREENS.COUNTRIES ||
    screen === LB_SCREENS.GLOBAL_PLAYERS ||
    screen === LB_SCREENS.MY_PREDICTIONS ||
    screen === LB_SCREENS.MY_COUNTRY;

  const isPrizeTabbed =
    screen === LB_SCREENS.PRIZE_COUNTRY ||
    screen === LB_SCREENS.PRIZE_PLAYERS ||
    screen === LB_SCREENS.PRIZE_PREDICTIONS ||
    screen === LB_SCREENS.PRIZE_INFO;

  // Hard gate: onboarding and nation selection are driven by the profile
  // flags, not by `screen`, so no in-page navigation can leak the profile.
  // My Profile (and everything past it) only renders once the customer has
  // both onboarded AND chosen a country.
  const needsOnboarding = profile && !profile.hasOnboarded;
  const needsNation = profile && profile.hasOnboarded && !profile.hasNation;
  const unlocked = profile && profile.hasOnboarded && profile.hasNation;

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
      style={{ background: "radial-gradient(circle at top, #1e2c2a 0%, #121414 55%, #0a0c0c 100%)" }}
    >
      <LBHeader
        onInfoClick={() => setIsInfoOpen(true)}
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <div className="flex-1 pb-[140px]">
        {needsOnboarding && (
          <Onboarding onJoinNow={handleJoinNow} />
        )}

        {needsNation && (
          <NationSelect onConfirm={handleConfirmNation} error={confirmError} />
        )}

        {unlocked && (
          <>
            {isLeaderboardTabbed && (
              <div className="flex flex-col items-center gap-6 px-4 pb-8 pt-2">
                <ProfileCard profile={profile} />
                <PredictToWinCard
                  onJoinNow={() => {
                    // Spec slide 10: members need ≥ 3,000 total points to join predictions.
                    if ((profile.totalPoints ?? 0) < 3000) {
                      setJoinBlocked(true);
                      return;
                    }
                    navigate("fixtures");
                  }}
                />
                <LeaderboardTabs activeTab={activeTab} onTabChange={onTabChange} />

                {screen === LB_SCREENS.COUNTRIES && (
                  <CountriesPanel
                    myCountryCode={profile.countryCode}
                    onCountrySelect={(c) => {
                      setSelectedCountry(c);
                      navigate("country");
                    }}
                    onViewPrize={openPrizePool}
                    rows={countriesData.rows}
                    loading={countriesData.loading}
                  />
                )}
                {screen === LB_SCREENS.GLOBAL_PLAYERS && (
                  <GlobalPlayersPanel
                    myPlayerName={profile.name}
                    onViewPrize={openPrizePool}
                    rows={playersData.rows}
                    loading={playersData.loading}
                  />
                )}
                {screen === LB_SCREENS.MY_COUNTRY && selectedCountry && (
                  <MyCountryPanel
                    country={selectedCountry}
                    onChangeCountry={() => navigate("home")}
                    onViewPrize={openPrizePool}
                  />
                )}
                {screen === LB_SCREENS.MY_PREDICTIONS && (
                  <MyPredictionsPanel
                    onViewPrize={openPrizePool}
                    rows={predictionsData.rows}
                    loading={predictionsData.loading}
                  />
                )}
              </div>
            )}

            {screen === LB_SCREENS.PREDICTIONS_LIST && (
              <PredictionsList
                predictions={predictionsData}
              />
            )}

            {isPrizeTabbed && (
              <div className="flex flex-col items-center gap-3 px-4 pb-8 pt-2">
                {screen !== LB_SCREENS.PRIZE_INFO && (
                  <PrizeTabs active={prizeTab} onChange={onPrizeTabChange} />
                )}
                {screen === LB_SCREENS.PRIZE_COUNTRY && (
                  <CountryPrizesPanel
                    onViewLeaderboards={backToLeaderboards}
                    onViewDetails={(prize) => {
                      setSelectedPrize(prize);
                      navigate("prize-info", { pt: "country" });
                    }}
                  />
                )}
                {screen === LB_SCREENS.PRIZE_PLAYERS && (
                  <PlayerPrizesPanel
                    onViewLeaderboards={backToLeaderboards}
                    onViewDetails={(prize) => {
                      setSelectedPrize(prize);
                      navigate("prize-info", { pt: "players" });
                    }}
                  />
                )}
                {screen === LB_SCREENS.PRIZE_PREDICTIONS && (
                  <PredictionPrizesPanel onViewPredictions={backToLeaderboards} />
                )}
                {screen === LB_SCREENS.PRIZE_INFO && selectedPrize && (
                  <PrizeInfo prize={selectedPrize} onBack={() => router.back()} />
                )}
              </div>
            )}
          </>
        )}
      </div>

      <FooterNav />

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} />}

      {joinBlocked && (
        <NoticeModal
          title="3,000 Points Required"
          message="You need at least 3,000 total points to join this prediction."
          onClose={() => setJoinBlocked(false)}
        />
      )}
    </div>
  );
}

// useSearchParams() requires a Suspense boundary at the route level when the
// page opts out of static rendering, which this client component does.
export default function LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <LeaderboardPageInner />
    </Suspense>
  );
}
