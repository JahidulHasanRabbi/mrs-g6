"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardMetrics from "../../components/admin/world-cup/DashboardMetrics";
import RealTimeRanking from "../../components/admin/world-cup/RealTimeRanking";
import { useWorldCupSettings } from "../../contexts/WorldCupSettingsContext";

export default function WorldCupDashboardPage() {
  const router = useRouter();
  const { players, countries } = useWorldCupSettings();
  const [view, setView] = useState("global");

  return (
    <div className="flex flex-col gap-6">
      <DashboardMetrics />
      <RealTimeRanking
        view={view}
        onChangeView={setView}
        players={players}
        countries={countries}
        onEditPlayer={(p) => router.push(`/admin/world-cup/add-ranking?id=${p.id}`)}
        onEditCountry={(c) => router.push(`/admin/world-cup/add-country?id=${c.id}`)}
        onAddRanking={() => router.push("/admin/world-cup/add-ranking")}
        onAddCountry={() => router.push("/admin/world-cup/add-country")}
      />
    </div>
  );
}
