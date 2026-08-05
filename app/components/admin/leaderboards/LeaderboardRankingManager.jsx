"use client";

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../members/DataTable";
import SettingsSection from "../world-cup/SettingsSection";
import ConfirmArchive from "../world-cup/ConfirmArchive";
import { useToast } from "../ui/Toast";
import RankingTable from "./RankingTable";
import ExclusionsTable from "./ExclusionsTable";
import AddExclusionsModal from "./AddExclusionsModal";
import {
  archiveLeaderboardExclusion,
  createLeaderboardExclusions,
  getLeaderboardExclusions,
  getLeaderboardRealRanking,
} from "../../../api/adminApi";

const PAGE_SIZE = 7;

function Footer({ total, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
      <p className="text-[10px] text-white/80">Showing {first} to {last} of {total} Results</p>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}

function errorMessage(error) {
  return error?.data?.detail || error?.data?.message || error?.message || "Please try again.";
}

function normalizeRanking(row, type) {
  return {
    id: row.member_id ?? row.rank,
    rank: row.rank ?? 0,
    memberId: row.member_id ?? "",
    fullName: row.full_name ?? "",
    amount: row.amount ?? 0,
    count: type === "referral" ? (row.new_member ?? row.count ?? 0) : (row.count ?? 0),
  };
}

const RANKING_TYPES = { deposit: 1, withdrawal: 2, referral: 3 };

export default function LeaderboardRankingManager({ rows = [], type = "deposit" }) {
  const toast = useToast();
  const [rankings, setRankings] = useState(rows);
  const [rankingPage, setRankingPage] = useState(1);
  const [exclusions, setExclusions] = useState([]);
  const [exclusionCount, setExclusionCount] = useState(0);
  const [exclusionPage, setExclusionPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [memberIds, setMemberIds] = useState("");
  const [addError, setAddError] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  useEffect(() => setRankings(rows), [rows]);

  useEffect(() => {
    let active = true;
    getLeaderboardExclusions({ page: exclusionPage, page_size: PAGE_SIZE })
      .then((response) => {
        if (!active) return;
        const list = response?.results ?? response ?? [];
        setExclusions(Array.isArray(list) ? list : []);
        setExclusionCount(response?.count ?? (Array.isArray(list) ? list.length : 0));
      })
      .catch((error) => {
        if (active) toast.error("Failed to load excluded members", { description: errorMessage(error) });
      });
    return () => { active = false; };
  }, [exclusionPage, toast]);

  const pagedRankings = useMemo(
    () => rankings.slice((rankingPage - 1) * PAGE_SIZE, rankingPage * PAGE_SIZE),
    [rankings, rankingPage],
  );

  const reloadExclusions = async (page = exclusionPage) => {
    const response = await getLeaderboardExclusions({ page, page_size: PAGE_SIZE });
    const list = response?.results ?? response ?? [];
    setExclusions(Array.isArray(list) ? list : []);
    setExclusionCount(response?.count ?? (Array.isArray(list) ? list.length : 0));
  };

  const reloadRankings = async () => {
    const response = await getLeaderboardRealRanking(RANKING_TYPES[type]);
    const list = response?.results ?? response ?? [];
    setRankings((Array.isArray(list) ? list : []).map((row) => normalizeRanking(row, type)));
    setRankingPage(1);
  };

  const refreshTables = async (page = exclusionPage) => {
    const results = await Promise.allSettled([reloadRankings(), reloadExclusions(page)]);
    if (results.some((result) => result.status === "rejected")) {
      toast.warning("The change was saved, but some table data could not be refreshed.");
    }
  };

  const confirmAction = async () => {
    if (!target || busy) return;
    setBusy(true);
    try {
      if (target.kind === "ranking") {
        const response = await createLeaderboardExclusions([Number(target.item.memberId)]);
        if (response?.not_found?.includes(Number(target.item.memberId))) {
          throw new Error("This member could not be found.");
        }
        setExclusionPage(1);
        await refreshTables(1);
        toast.success("Member archived from leaderboards");
      } else {
        await archiveLeaderboardExclusion(target.item.uuid);
        const nextCount = Math.max(0, exclusionCount - 1);
        const lastPage = Math.max(1, Math.ceil(nextCount / PAGE_SIZE));
        const nextPage = Math.min(exclusionPage, lastPage);
        setExclusionPage(nextPage);
        await refreshTables(nextPage);
        toast.success("Exclusion archived", { description: "The member is eligible for leaderboards again." });
      }
      setTarget(null);
    } catch (error) {
      toast.error("Archive failed", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const addExclusions = async () => {
    const parts = memberIds.split(/[\s,]+/).filter(Boolean);
    const parsed = parts.map(Number);
    if (parts.length === 0) {
      setAddError("Enter at least one member ID.");
      return;
    }
    if (parsed.some((id) => !Number.isInteger(id) || id < 1)) {
      setAddError("Member IDs must be positive whole numbers.");
      return;
    }

    const uniqueIds = [...new Set(parsed)];
    setAddError("");
    setAddBusy(true);
    try {
      const response = await createLeaderboardExclusions(uniqueIds);
      const added = response?.added ?? [];
      const alreadyExcluded = response?.already_excluded ?? [];
      const notFound = response?.not_found ?? [];
      if (added.length === 0 && alreadyExcluded.length === 0 && notFound.length > 0) {
        setAddError(`Member IDs not found: ${notFound.join(", ")}`);
        return;
      }

      setExclusionPage(1);
      await refreshTables(1);
      setAddOpen(false);
      setMemberIds("");

      if (added.length > 0) {
        toast.success(`${added.length} member${added.length === 1 ? "" : "s"} added to exclusions`, {
          description: `Member IDs: ${added.join(", ")}`,
        });
      }
      if (alreadyExcluded.length > 0) {
        toast.info(`${alreadyExcluded.length} member${alreadyExcluded.length === 1 ? " is" : "s are"} already excluded`, {
          description: `Member IDs: ${alreadyExcluded.join(", ")}`,
        });
      }
      if (notFound.length > 0) {
        toast.warning(`${notFound.length} member ID${notFound.length === 1 ? " was" : "s were"} not found`, {
          description: `Member IDs: ${notFound.join(", ")}`,
        });
      }
    } catch (error) {
      setAddError(errorMessage(error));
    } finally {
      setAddBusy(false);
    }
  };

  return (
    <>
      <SettingsSection title="Ranking Table">
        <RankingTable rows={pagedRankings} type={type} onArchive={(item) => setTarget({ kind: "ranking", item })} />
        <Footer total={rankings.length} page={rankingPage} onPageChange={setRankingPage} />
      </SettingsSection>

      <SettingsSection
        title="Excluded Members"
        addLabel="Add Exclusion"
        onAdd={() => {
          setAddError("");
          setAddOpen(true);
        }}
      >
        <ExclusionsTable rows={exclusions} onArchive={(item) => setTarget({ kind: "exclusion", item })} />
        <Footer total={exclusionCount} page={exclusionPage} onPageChange={setExclusionPage} />
      </SettingsSection>

      <ConfirmArchive
        open={!!target}
        busy={busy}
        title={target?.kind === "ranking" ? "Archive member from leaderboards?" : "Archive exclusion?"}
        message={
          target?.kind === "ranking"
            ? `Member ${target.item.memberId} will be removed from every leaderboard and monthly reward eligibility.`
            : `Member ${target?.item?.member_id} will return to all leaderboards and become reward-eligible again.`
        }
        onConfirm={confirmAction}
        onCancel={() => !busy && setTarget(null)}
      />

      <AddExclusionsModal
        open={addOpen}
        value={memberIds}
        busy={addBusy}
        error={addError}
        onChange={(value) => {
          setMemberIds(value);
          if (addError) setAddError("");
        }}
        onSubmit={addExclusions}
        onClose={() => {
          if (addBusy) return;
          setAddOpen(false);
          setMemberIds("");
          setAddError("");
        }}
      />
    </>
  );
}
