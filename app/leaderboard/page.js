"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import { LB_SCREENS, LB_TABS } from "../components/leaderboard/constants";
import { LBHeader } from "../components/leaderboard/primitives";
import { getMyProfile, confirmNation, clearNationSelection } from "../components/leaderboard/worldcupApi";
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
import {
  PrizeTabs,
  CountryPrizesPanel,
  PlayerPrizesPanel,
  PredictionPrizesPanel,
  PrizeInfo,
} from "../components/leaderboard/PrizeScreens";

// /leaderboard root. The 11 Figma screens collapse into:
//   - NATION_SELECT  (first-time country picker)
//   - ONBOARDING     (4-slide "Become Top 10" carousel)
//   - Leaderboard tabs: COUNTRIES / GLOBAL_PLAYERS / MY_PREDICTIONS (+ MY_COUNTRY drill-in)
//   - Prize tabs:       PRIZE_COUNTRY / PRIZE_PLAYERS / PRIZE_PREDICTIONS (+ PRIZE_INFO detail)
//   - PREDICTIONS_LIST  (World Cup fixtures with Predict CTAs)
export default function LeaderboardPage() {
  const { authReady, memberUuid } = useUser();
  const [screen, setScreen] = useState(LB_SCREENS.COUNTRIES);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [activeTab, setActiveTab] = useState(LB_TABS.COUNTRIES);
  const [prizeTab, setPrizeTab] = useState("country");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState(null);

  useEffect(() => {
    if (!authReady || !memberUuid) return;
    getMyProfile()
      .then((p) => {
        const fresh =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("fresh") === "1";
        if (fresh) clearNationSelection();
        const next = fresh ? { ...p, hasNation: false, hasOnboarded: false } : p;
        setProfile(next);
      })
      .catch((err) => {
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
  }, [authReady, memberUuid]);

  // Nation Select is the last gate before the profile/leaderboard view, so
  // confirming a country drops the user straight into "My Profile".
  const handleConfirmNation = useCallback(async (country) => {
    setConfirmError(null);
    try {
      const result = await confirmNation(country.uuid);
      setProfile((p) => ({
        ...p,
        hasNation: true,
        hasOnboarded: true,
        countryCode: result.country_code ?? country.code,
        countryName: result.country_name ?? country.name,
        countryFlag: result.country_flag ?? country.flag,
      }));
      setActiveTab(LB_TABS.COUNTRIES);
      setScreen(LB_SCREENS.COUNTRIES);
    } catch (err) {
      setConfirmError(err?.data?.detail || err?.data?.details || err?.message || "Failed to save country. Please try again.");
    }
  }, []);

  // Onboarding's "Join Now" completes the intro carousel and advances to
  // Nation Select (a country must be chosen before reaching My Profile).
  const handleJoinNow = useCallback(() => {
    setProfile((p) => p ? { ...p, hasOnboarded: true } : p);
    setScreen(profile?.hasNation ? LB_SCREENS.COUNTRIES : LB_SCREENS.NATION_SELECT);
  }, [profile?.hasNation]);

  const onTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === LB_TABS.COUNTRIES) setScreen(LB_SCREENS.COUNTRIES);
    else if (tab === LB_TABS.PLAYERS) setScreen(LB_SCREENS.GLOBAL_PLAYERS);
    else setScreen(LB_SCREENS.MY_PREDICTIONS);
  };

  const onPrizeTabChange = (t) => {
    setPrizeTab(t);
    setScreen(
      t === "country" ? LB_SCREENS.PRIZE_COUNTRY :
      t === "players" ? LB_SCREENS.PRIZE_PLAYERS :
                        LB_SCREENS.PRIZE_PREDICTIONS,
    );
  };

  const openPrizePool = () => {
    if (activeTab === LB_TABS.COUNTRIES) {
      setPrizeTab("country");
      setScreen(LB_SCREENS.PRIZE_COUNTRY);
    } else if (activeTab === LB_TABS.PLAYERS) {
      setPrizeTab("players");
      setScreen(LB_SCREENS.PRIZE_PLAYERS);
    } else {
      setPrizeTab("predictions");
      setScreen(LB_SCREENS.PRIZE_PREDICTIONS);
    }
  };
  const backToLeaderboards = () => {
    if (prizeTab === "country") {
      setActiveTab(LB_TABS.COUNTRIES); setScreen(LB_SCREENS.COUNTRIES);
    } else if (prizeTab === "players") {
      setActiveTab(LB_TABS.PLAYERS); setScreen(LB_SCREENS.GLOBAL_PLAYERS);
    } else {
      setActiveTab(LB_TABS.PREDICTIONS); setScreen(LB_SCREENS.MY_PREDICTIONS);
    }
  };

  const isLeaderboardTabbed =
    screen === LB_SCREENS.COUNTRIES ||
    screen === LB_SCREENS.GLOBAL_PLAYERS ||
    screen === LB_SCREENS.MY_PREDICTIONS ||
    screen === LB_SCREENS.MY_COUNTRY;

  const isPrizeTabbed =
    screen === LB_SCREENS.PRIZE_COUNTRY ||
    screen === LB_SCREENS.PRIZE_PLAYERS ||
    screen === LB_SCREENS.PRIZE_PREDICTIONS;

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
                <PredictToWinCard onJoinNow={() => setScreen(LB_SCREENS.PREDICTIONS_LIST)} />
                <LeaderboardTabs activeTab={activeTab} onTabChange={onTabChange} />

                {screen === LB_SCREENS.COUNTRIES && (
                  <CountriesPanel
                    myCountryCode={profile.countryCode}
                    onCountrySelect={(c) => {
                      setSelectedCountry(c);
                      setScreen(LB_SCREENS.MY_COUNTRY);
                    }}
                    onViewPrize={openPrizePool}
                  />
                )}
                {screen === LB_SCREENS.GLOBAL_PLAYERS && (
                  <GlobalPlayersPanel myPlayerName={profile.name} onViewPrize={openPrizePool} />
                )}
                {screen === LB_SCREENS.MY_COUNTRY && selectedCountry && (
                  <MyCountryPanel
                    country={selectedCountry}
                    onChangeCountry={() => setScreen(LB_SCREENS.COUNTRIES)}
                    onViewPrize={openPrizePool}
                  />
                )}
                {screen === LB_SCREENS.MY_PREDICTIONS && (
                  <MyPredictionsPanel onViewPrize={openPrizePool} />
                )}
              </div>
            )}

            {screen === LB_SCREENS.PREDICTIONS_LIST && (
              <PredictionsList
                onMyPredictions={() => {
                  setActiveTab(LB_TABS.PREDICTIONS);
                  setScreen(LB_SCREENS.MY_PREDICTIONS);
                }}
              />
            )}

            {isPrizeTabbed && (
              <div className="flex flex-col items-center gap-3 px-4 pb-8 pt-2">
                <PrizeTabs active={prizeTab} onChange={onPrizeTabChange} />
                {screen === LB_SCREENS.PRIZE_COUNTRY && (
                  <CountryPrizesPanel
                    onViewLeaderboards={backToLeaderboards}
                    onViewDetails={(prize) => {
                      setSelectedPrize(prize);
                      setScreen(LB_SCREENS.PRIZE_INFO);
                    }}
                  />
                )}
                {screen === LB_SCREENS.PRIZE_PLAYERS && (
                  <PlayerPrizesPanel onViewLeaderboards={backToLeaderboards} />
                )}
                {screen === LB_SCREENS.PRIZE_PREDICTIONS && (
                  <PredictionPrizesPanel onViewPredictions={backToLeaderboards} />
                )}
              </div>
            )}

            {screen === LB_SCREENS.PRIZE_INFO && (
              <div className="flex flex-col items-center gap-3 px-4 pb-8 pt-2">
                <PrizeInfo prize={selectedPrize} onBack={() => setScreen(LB_SCREENS.PRIZE_COUNTRY)} />
              </div>
            )}
          </>
        )}
      </div>

      <FooterNav />

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} />}
    </div>
  );
}
