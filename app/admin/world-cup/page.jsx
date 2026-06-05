"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardMetrics from "../../components/admin/world-cup/DashboardMetrics";
import RealTimeRanking from "../../components/admin/world-cup/RealTimeRanking";
import { getWorldCupRanking } from "../../api/adminApi";

function normalizePlayer(p) {
  return {
    id: p.country_uuid ?? p.uuid ?? Math.random().toString(),
    name: p.player_name,
    country: p.country_name,
    totalPoints: p.total_points ?? 0,
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
  const router = useRouter();
  const [view, setView] = useState("global");
  const [players, setPlayers] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    getWorldCupRanking().then((d) => {
      const rows = d.results ?? d ?? [];
      setPlayers(rows.map(normalizePlayer));
    }).catch(() => {});

    getWorldCupRanking({ scope: "country" }).then((d) => {
      const rows = d.results ?? d ?? [];
      setCountries(rows.map(normalizeCountry));
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <DashboardMetrics />
      <RealTimeRanking
        view={view}
        onChangeView={setView}
        players={players}
        countries={countries}
        onEditPlayer={(p) => router.push(`/admin/world-cup/add-ranking?uuid=${p._raw.uuid ?? ""}`)}
        onEditCountry={(c) => router.push(`/admin/world-cup/add-country?uuid=${c._raw.uuid ?? ""}`)}
        onAddRanking={() => router.push("/admin/world-cup/add-ranking")}
        onAddCountry={() => router.push("/admin/world-cup/add-country")}
      />
    </div>
  );
}
