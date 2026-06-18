"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import SettingsSection from "../../../components/admin/world-cup/SettingsSection";
import MatchesTable from "../../../components/admin/world-cup/MatchesTable";
import { normalizeMatchCountryOptions } from "../../../components/admin/world-cup/countryOptions";
import { getWorldCupMatchCountries, getWorldCupMatches } from "../../../api/adminApi";
import { getWorldCupKickoffParts } from "../../../lib/worldcupDateTime";

const PAGE_SIZE = 7;

const STATUS_DISPLAY = { 1: "Upcoming", 2: "Ongoing", 3: "Ended" };

function countryName(value, countriesById) {
  if (value == null || value === "") return "";
  return countriesById.get(String(value)) ?? String(value);
}

function normalizeMatch(m, countriesById = new Map()) {
  const kickoff = getWorldCupKickoffParts(m.kickoff_at);
  const teamHome = m.team_home ?? m.team_home_uuid;
  const teamAway = m.team_away ?? m.team_away_uuid;
  const winner = m.winner ?? m.winner_uuid;
  const isDraw = Number(m.status) === 3 && (winner === null || winner === undefined || winner === "");
  return {
    id: m.uuid,
    uuid: m.uuid,
    matchNo: m.group_label ?? "",
    team1: m.team_home_name ?? countryName(teamHome, countriesById),
    team2: m.team_away_name ?? countryName(teamAway, countriesById),
    team1Uuid: teamHome,
    team2Uuid: teamAway,
    date: kickoff?.date ?? "",
    time: kickoff?.time ?? "",
    predictionA: "-",
    predictionB: "-",
    winner: isDraw ? "Draw" : (m.winner_name ?? countryName(winner, countriesById)),
    status: STATUS_DISPLAY[m.status] ?? "Upcoming",
    _raw: m,
  };
}

export default function PredictionsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      getWorldCupMatchCountries().catch(() => []),
      getWorldCupMatches().catch(() => []),
    ]).then(([countriesRes, matchesRes]) => {
      const countries = normalizeMatchCountryOptions(countriesRes);
      const countriesById = new Map(
        countries.map((c) => [String(c.id ?? c.country ?? c.uuid), c.name]),
      );
      const STATUS_ORDER = { 1: 0, 2: 1, 3: 2 };
      const sorted = (matchesRes.results ?? matchesRes ?? [])
        .slice()
        .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0));
      setMatches(sorted.map((m) => normalizeMatch(m, countriesById)));
    });
  }, []);

  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageMatches = useMemo(() => matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [matches, page]);

  return (
    <SettingsSection
      title="Match Table"
      addLabel="Add Match"
      onAdd={() => router.push("/admin/world-cup/predictions/add")}
    >
      <MatchesTable
        matches={pageMatches}
        onEdit={(m) => router.push(`/admin/world-cup/predictions/add?uuid=${m.uuid}`)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <p className="text-[10px] text-white/80">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)} to {Math.min(page * PAGE_SIZE, total)} of {total} Results
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </SettingsSection>
  );
}
