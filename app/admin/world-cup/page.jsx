"use client";

import { useEffect, useState } from "react";
import DashboardMetrics from "../../components/admin/world-cup/DashboardMetrics";
import RealTimeRanking, { thresholdFor } from "../../components/admin/world-cup/RealTimeRanking";
import { getWorldCupRankingRealtime } from "../../api/adminApi";
import { periodFilterParams } from "../../components/admin/world-cup/periodFilters";

function normalizePlayer(p) {
  return {
    id: p.country_uuid ?? p.uuid ?? Math.random().toString(),
    name: p.player_name,
    country: p.country_name,
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
  const [refreshing, setRefreshing] = useState(false);

  const filterParams = periodFilterParams(period, range);
  // total_win/winning_streak thresholds only apply to the player board
  const winMin = thresholdFor(winFilter);
  const streakMin = thresholdFor(streakFilter);

  const loadRanking = () => {
    setRefreshing(true);
    const playerParams = { ...filterParams };
    if (winMin != null) playerParams.total_win = winMin;
    if (streakMin != null) playerParams.winning_streak = streakMin;

    Promise.all([
      getWorldCupRankingRealtime(playerParams).then((d) => {
        const rows = d.results ?? d ?? [];
        setPlayers(rows.map(normalizePlayer));
      }).catch(() => {}),
      getWorldCupRankingRealtime({ ...filterParams, scope: "country" }).then((d) => {
        const rows = d.results ?? d ?? [];
        setCountries(rows.map(normalizeCountry));
      }).catch(() => {}),
    ]).finally(() => setRefreshing(false));
  };

  useEffect(() => {
    loadRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, range.from, range.to, winFilter, streakFilter]);

  const onRefresh = () => {
    if (refreshing) return;
    setWinFilter("all");
    setStreakFilter("all");
    loadRanking();
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
        onChangeWinFilter={setWinFilter}
        onChangeStreakFilter={setStreakFilter}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </div>
  );
}
