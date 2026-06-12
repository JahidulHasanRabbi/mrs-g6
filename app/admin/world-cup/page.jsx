"use client";

import { useEffect, useRef, useState } from "react";
import DashboardMetrics from "../../components/admin/world-cup/DashboardMetrics";
import RealTimeRanking, { thresholdFor } from "../../components/admin/world-cup/RealTimeRanking";
import { getWorldCupRankingRealtime } from "../../api/adminApi";
import { periodFilterParams } from "../../components/admin/world-cup/periodFilters";

const RANKING_PAGE_SIZE = 10;

function normalizePlayer(p) {
  return {
    id: p.country_uuid ?? p.uuid ?? Math.random().toString(),
    name: p.player_name,
    country: p.country_name,
    penaltyKickPoints: p.penalty_kick_points ?? 0,
    depositPoints: p.deposit_points ?? 0,
    totalPoints: p.total_points ?? 0,
    countryRank: p.country_rank,
    globalRank: p.global_rank,
    totalWin: p.total_win ?? 0,
    winningStreak: p.winning_streak ?? 0,
    totalPrediction: p.total_prediction ?? 0,
    _raw: p,
  };
}

function normalizeCountry(c) {
  return {
    id: c.uuid ?? Math.random().toString(),
    country: c.name ?? c.country_name,
    rank: c.rank,
    totalPoints: c.total_points ?? 0,
    totalUsers: c.total_users ?? 0,
    _raw: c,
  };
}

export default function WorldCupDashboardPage() {
  const [view, setView] = useState("global");
  const [period, setPeriod] = useState("Daily");
  const [range, setRange] = useState({ from: null, to: null });
  const [winFilter, setWinFilter] = useState("all");
  const [streakFilter, setStreakFilter] = useState("all");
  const [players, setPlayers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [playerPage, setPlayerPage] = useState(1);
  const [countryPage, setCountryPage] = useState(1);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [countryTotal, setCountryTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const rankingRequestRef = useRef(0);

  const filterParams = periodFilterParams(period, range);
  // total_win/winning_streak thresholds only apply to the player board
  const winMin = thresholdFor(winFilter);
  const streakMin = thresholdFor(streakFilter);

  const loadRanking = () => {
    const requestId = rankingRequestRef.current + 1;
    rankingRequestRef.current = requestId;
    setRefreshing(true);
    const playerParams = { ...filterParams, page: playerPage, page_size: RANKING_PAGE_SIZE };
    if (winMin != null) playerParams.total_win = winMin;
    if (streakMin != null) playerParams.winning_streak = streakMin;

    Promise.all([
      getWorldCupRankingRealtime(playerParams).then((d) => {
        if (rankingRequestRef.current !== requestId) return;
        const rows = d.results ?? d ?? [];
        setPlayers(rows.map(normalizePlayer));
        const count = Number(d?.count);
        setPlayerTotal(Number.isFinite(count) ? count : rows.length);
      }).catch(() => {
        if (rankingRequestRef.current !== requestId) return;
        setPlayers([]);
        setPlayerTotal(0);
      }),
      getWorldCupRankingRealtime({
        ...filterParams,
        scope: "country",
        page: countryPage,
        page_size: RANKING_PAGE_SIZE,
      }).then((d) => {
        if (rankingRequestRef.current !== requestId) return;
        const rows = d.results ?? d ?? [];
        setCountries(rows.map(normalizeCountry));
        const count = Number(d?.count);
        setCountryTotal(Number.isFinite(count) ? count : rows.length);
      }).catch(() => {
        if (rankingRequestRef.current !== requestId) return;
        setCountries([]);
        setCountryTotal(0);
      }),
    ]).finally(() => {
      if (rankingRequestRef.current === requestId) setRefreshing(false);
    });
  };

  useEffect(() => {
    loadRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, range.from, range.to, winFilter, streakFilter, playerPage, countryPage, refreshKey]);

  useEffect(() => {
    setPlayerPage(1);
    setCountryPage(1);
  }, [period, range.from, range.to]);

  const playerTotalPages = Math.max(1, Math.ceil(playerTotal / RANKING_PAGE_SIZE));
  const countryTotalPages = Math.max(1, Math.ceil(countryTotal / RANKING_PAGE_SIZE));

  useEffect(() => {
    if (playerPage > playerTotalPages) setPlayerPage(playerTotalPages);
  }, [playerPage, playerTotalPages]);

  useEffect(() => {
    if (countryPage > countryTotalPages) setCountryPage(countryTotalPages);
  }, [countryPage, countryTotalPages]);

  const handleWinFilter = (value) => {
    setPlayerPage(1);
    setWinFilter(value);
  };

  const handleStreakFilter = (value) => {
    setPlayerPage(1);
    setStreakFilter(value);
  };

  const onRefresh = () => {
    if (refreshing) return;
    setWinFilter("all");
    setStreakFilter("all");
    setPlayerPage(1);
    setCountryPage(1);
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardMetrics
        period={period}
        range={range}
        onPeriodChange={setPeriod}
        onRangeChange={setRange}
      />
      <RealTimeRanking
        view={view}
        onChangeView={setView}
        players={players}
        countries={countries}
        winFilter={winFilter}
        streakFilter={streakFilter}
        onChangeWinFilter={handleWinFilter}
        onChangeStreakFilter={handleStreakFilter}
        refreshing={refreshing}
        onRefresh={onRefresh}
        playerPage={Math.min(playerPage, playerTotalPages)}
        playerTotal={playerTotal}
        playerTotalPages={playerTotalPages}
        countryPage={Math.min(countryPage, countryTotalPages)}
        countryTotal={countryTotal}
        countryTotalPages={countryTotalPages}
        pageSize={RANKING_PAGE_SIZE}
        onChangePlayerPage={setPlayerPage}
        onChangeCountryPage={setCountryPage}
      />
    </div>
  );
}
