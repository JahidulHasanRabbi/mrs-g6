"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import SettingsSection from "../../../components/admin/world-cup/SettingsSection";
import MatchesTable from "../../../components/admin/world-cup/MatchesTable";
import { useWorldCupSettings } from "../../../contexts/WorldCupSettingsContext";

const PAGE_SIZE = 7;

export default function PredictionsPage() {
  const router = useRouter();
  const { matches } = useWorldCupSettings();
  const [page, setPage] = useState(1);

  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageMatches = useMemo(
    () => matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [matches, page],
  );

  return (
    <SettingsSection
      title="Match Table"
      addLabel="Add Match"
      onAdd={() => router.push("/admin/world-cup/predictions/add")}
    >
      <MatchesTable
        matches={pageMatches}
        onEdit={(m) => router.push(`/admin/world-cup/predictions/add?id=${m.id}`)}
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
