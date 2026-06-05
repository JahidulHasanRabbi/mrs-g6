"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import SettingsSection from "../../../components/admin/world-cup/SettingsSection";
import MatchesTable from "../../../components/admin/world-cup/MatchesTable";
import { getWorldCupMatches } from "../../../api/adminApi";

const PAGE_SIZE = 7;

const STATUS_DISPLAY = { 1: "Upcoming", 2: "Ongoing", 3: "Ended" };

function normalizeMatch(m) {
  const kickoff = m.kickoff_at ? new Date(m.kickoff_at) : null;
  return {
    id: m.uuid,
    uuid: m.uuid,
    matchNo: m.group_label ?? "",
    team1: m.team_home_name ?? "",
    team2: m.team_away_name ?? "",
    team1Uuid: m.team_home_uuid,
    team2Uuid: m.team_away_uuid,
    date: kickoff ? kickoff.toISOString().slice(0, 10) : "",
    time: kickoff ? kickoff.toTimeString().slice(0, 5) : "",
    predictionA: "-",
    predictionB: "-",
    winner: m.winner_name ?? "",
    status: STATUS_DISPLAY[m.status] ?? "Upcoming",
    _raw: m,
  };
}

export default function PredictionsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getWorldCupMatches().then((d) => {
      setMatches((d.results ?? d ?? []).map(normalizeMatch));
    }).catch(() => {});
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
