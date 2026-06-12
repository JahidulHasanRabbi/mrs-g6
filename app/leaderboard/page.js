"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import { LB_SCREENS, LB_TABS } from "../components/leaderboard/constants";
import { LBHeader } from "../components/leaderboard/primitives";
import { useCrowdAmbience } from "../components/leaderboard/useCrowdAmbience";
import {
  getMyProfile,
  confirmNation,
  clearNationSelection,
  getCountryRankings,
  getGlobalPlayers,
  getMyPredictions,
  getPredictionEligibility,
} from "../components/leaderboard/worldcupApi";
import { getFeatureStatus } from "../api/memberApi";
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
  country: LB_SCREENS.MY_COUNTRY,
  fixtures: LB_SCREENS.PREDICTIONS_LIST,
  "my-predictions": LB_SCREENS.MY_PREDICTIONS,
  "prize-country": LB_SCREENS.PRIZE_COUNTRY,
  "prize-players": LB_SCREENS.PRIZE_PLAYERS,
  "prize-predictions": LB_SCREENS.PRIZE_PREDICTIONS,
  "prize-info": LB_SCREENS.PRIZE_INFO,
};

const TAB_FROM_VIEW = {
  home: LB_TABS.COUNTRIES,
  country: LB_TABS.COUNTRIES,
  players: LB_TABS.PLAYERS,
  "my-predictions": LB_TABS.PREDICTIONS,
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
  const [maintenance, setMaintenance] = useState(null);
  const isMaintenance = maintenance === true;
  const { muted, toggleMuted } = useCrowdAmbience({ disabled: maintenance !== false });
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [joinBlocked, setJoinBlocked] = useState(null);
  const [profile, setProfile] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [countriesData, setCountriesData] = useState({ rows: [], loading: true });
  const [playersData, setPlayersData] = useState({ rows: [], loading: true });
  const [predictionsData, setPredictionsData] = useState({ rows: [], loading: true });
  const [predictionEligibility, setPredictionEligibility] = useState(null);

  useEffect(() => {
    getFeatureStatus()
      .then((s) => setMaintenance(Number(s?.leaderboard) === 2))
      .catch(() => setMaintenance(false));
  }, []);

  useEffect(() => {
    if (!isMaintenance || typeof document === "undefined") return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo({ top: 0, left: 0 });
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isMaintenance]);

  useEffect(() => {
    if (maintenance !== false) return;
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
  }, [authReady, memberUuid, maintenance]);

  // Prefetch all three leaderboard datasets in parallel so tabs are instant.
  useEffect(() => {
    if (maintenance !== false) return;
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
    getPredictionEligibility()
      .then((status) => { if (!cancelled) setPredictionEligibility(status); })
      .catch(() => { if (!cancelled) setPredictionEligibility(null); });
    return () => { cancelled = true; };
  }, [authReady, memberUuid, maintenance]);

  // If the URL points at a screen that needs transient state we don't have
  // (e.g. ?view=country after a reload), kick back to a safe view via replace
  // so we don't pollute history with a dead entry.
  useEffect(() => {
    if (maintenance !== false) return;
    if (view === "country" && !selectedCountry) {
      router.replace(pathname, { scroll: false });
    } else if (view === "prize-info" && !selectedPrize) {
      const params = new URLSearchParams();
      params.set("view", prizeTab === "players" ? "prize-players" : prizeTab === "predictions" ? "prize-predictions" : "prize-country");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [view, selectedCountry, selectedPrize, prizeTab, router, pathname, maintenance]);

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
    else if (tab === LB_TABS.PREDICTIONS) navigate("my-predictions");
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
    else if (prizeTab === "predictions") navigate("my-predictions");
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
        onSoundToggle={toggleMuted}
        soundMuted={muted}
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
                  eligibility={predictionEligibility}
                  onJoinNow={async () => {
                    try {
                      const status = await getPredictionEligibility();
                      setPredictionEligibility(status);
                      const totalPoints = Number(status?.total_points ?? profile.totalPoints ?? 0);
                      const requiredPoints = Number(status?.required_points ?? 3000);
                      if (!status?.eligible || totalPoints < requiredPoints) {
                        const additional = Math.max(0, requiredPoints - totalPoints);
                        setJoinBlocked({
                          title: `${requiredPoints.toLocaleString()} Points Required`,
                          message: additional > 0
                            ? `You need to accumulate an additional ${additional.toLocaleString()} points before you can participate again.`
                            : `You need at least ${requiredPoints.toLocaleString()} total points to join this prediction.`,
                        });
                        return;
                      }
                      navigate("fixtures");
                    } catch {
                      const totalPoints = Number(profile.totalPoints ?? 0);
                      if (totalPoints < 3000) {
                        const additional = 3000 - totalPoints;
                        setJoinBlocked({
                          title: "3,000 Points Required",
                          message: `You need to accumulate an additional ${additional.toLocaleString()} points before you can participate again.`,
                        });
                        return;
                      }
                      navigate("fixtures");
                    }
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
                    rows={predictionsData.rows}
                    loading={predictionsData.loading}
                    onViewPrize={openPrizePool}
                  />
                )}
              </div>
            )}

            {screen === LB_SCREENS.PREDICTIONS_LIST && (
              <PredictionsList
                predictions={predictionsData}
                onViewPrize={() => navigate("prize-predictions")}
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

      {isMaintenance && (
        <div className="fixed inset-x-0 top-[68px] bottom-[100px] z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div
            className="w-full max-w-[360px] rounded-[16px] border border-white/15 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
            style={{ backgroundColor: "rgba(7,25,13,0.95)" }}
          >
            <p
              className="text-[20px] font-bold"
              style={{ color: "#E9AF41", fontFamily: "'Lexend', sans-serif" }}
            >
              Leaderboard is under maintenance
            </p>
            <p
              className="mt-3 text-[12px] leading-5"
              style={{ color: "#a8bdb4", fontFamily: "'Lexend', sans-serif" }}
            >
              Please check back later.
            </p>
          </div>
        </div>
      )}

      {joinBlocked && (
        <NoticeModal
          title={joinBlocked.title}
          message={joinBlocked.message}
          onClose={() => setJoinBlocked(null)}
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
