"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import SettingsSection from "../../../components/admin/world-cup/SettingsSection";
import ConfirmArchive from "../../../components/admin/world-cup/ConfirmArchive";
import TurnoverRewardTable from "../../../components/admin/leaderboards/turnover/TurnoverRewardTable";
import TurnoverPlayerTable from "../../../components/admin/leaderboards/turnover/TurnoverPlayerTable";
import PayoutScheduleCard from "../../../components/admin/leaderboards/turnover/PayoutScheduleCard";
import PayoutLogTable from "../../../components/admin/leaderboards/turnover/PayoutLogTable";
import RankingTable from "../../../components/admin/leaderboards/RankingTable";
import { useToast } from "../../../components/admin/ui/Toast";
import {
  getTurnoverRewardItems,
  archiveTurnoverRewardItem,
  getTurnoverDummyPlayers,
  getTurnoverAdminRanking,
  getTurnoverPayoutLogs,
} from "../../../api/adminApi";

const PAGE_SIZE = 7;

const ITEM_TYPE_LABELS = { 1: "Free Credit", 2: "Item", 3: "Token", 4: "Other" };

function PaginatedFooter({ total, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
      <p className="text-[10px] text-white/80">
        Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)} to{" "}
        {Math.min(page * PAGE_SIZE, total)} of {total} Results
      </p>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function errorMessage(error) {
  return error?.data?.detail || error?.data?.message || error?.message || "Please try again.";
}

function normalizeReward(r) {
  return {
    id: r.uuid,
    uuid: r.uuid,
    name: r.reward_name ?? "",
    quantity: r.quantity ?? 0,
    position: r.position ?? "",
    itemType: ITEM_TYPE_LABELS[r.item_type] ?? String(r.item_type ?? ""),
    image: r.image ?? null,
  };
}

function normalizePlayer(p) {
  return {
    id: p.uuid,
    uuid: p.uuid,
    name: p.player ?? "",
    rank: p.rank ?? 0,
    totalTurnover: p.total_turnover ?? 0,
  };
}

function normalizeRanking(row) {
  return {
    id: row.member_id ?? row.rank,
    rank: row.rank ?? 0,
    memberId: row.member_id ?? "",
    fullName: row.full_name ?? "",
    amount: row.amount ?? 0,
    count: row.count ?? 0,
  };
}

export default function TurnoverSettingsPage() {
  const router = useRouter();
  const toast = useToast();

  const [rewards, setRewards] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [payoutLogs, setPayoutLogs] = useState([]);
  const [payoutLogCount, setPayoutLogCount] = useState(0);

  const [rewardPage, setRewardPage] = useState(1);
  const [playerPage, setPlayerPage] = useState(1);
  const [rankingPage, setRankingPage] = useState(1);
  const [payoutLogPage, setPayoutLogPage] = useState(1);

  const [archiveTarget, setArchiveTarget] = useState(null);

  const loadRewardsAndPlayers = () => {
    Promise.all([
      getTurnoverRewardItems().catch(() => null),
      getTurnoverDummyPlayers().catch(() => null),
      getTurnoverAdminRanking().catch(() => null),
    ]).then(([rewardsRes, playersRes, rankingRes]) => {
      const rList = rewardsRes ? (rewardsRes.results ?? rewardsRes) : [];
      const pList = playersRes ? (playersRes.results ?? playersRes) : [];
      const rankingList = rankingRes ? (rankingRes.results ?? rankingRes) : [];
      setRewards((Array.isArray(rList) ? rList : []).map(normalizeReward));
      setPlayers((Array.isArray(pList) ? pList : []).map(normalizePlayer));
      setRankings((Array.isArray(rankingList) ? rankingList : []).map(normalizeRanking));
    });
  };

  const loadPayoutLogs = (page = payoutLogPage) => {
    getTurnoverPayoutLogs({ page, page_size: PAGE_SIZE })
      .then((res) => {
        const list = res?.results ?? res ?? [];
        setPayoutLogs(Array.isArray(list) ? list : []);
        setPayoutLogCount(res?.count ?? (Array.isArray(list) ? list.length : 0));
      })
      .catch((error) => toast.error("Failed to load payout logs", { description: errorMessage(error) }));
  };

  useEffect(() => {
    loadRewardsAndPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPayoutLogs(payoutLogPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payoutLogPage]);

  const pagedRewards = useMemo(
    () => rewards.slice((rewardPage - 1) * PAGE_SIZE, rewardPage * PAGE_SIZE),
    [rewards, rewardPage],
  );
  const pagedPlayers = useMemo(
    () => players.slice((playerPage - 1) * PAGE_SIZE, playerPage * PAGE_SIZE),
    [players, playerPage],
  );
  const pagedRankings = useMemo(
    () => rankings.slice((rankingPage - 1) * PAGE_SIZE, rankingPage * PAGE_SIZE),
    [rankings, rankingPage],
  );

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveTurnoverRewardItem(archiveTarget.uuid);
      setRewards((list) => list.filter((r) => r.uuid !== archiveTarget.uuid));
      toast.success("Reward archived");
    } catch (error) {
      toast.error("Failed to archive reward", { description: errorMessage(error) });
    }
    setArchiveTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        title="Reward Items"
        addLabel="Add Reward"
        onAdd={() => router.push("/admin/leaderboards/turnover/reward")}
      >
        <TurnoverRewardTable
          rewards={pagedRewards}
          onEdit={(r) => router.push(`/admin/leaderboards/turnover/reward?uuid=${r.uuid}`)}
          onArchive={(r) => setArchiveTarget(r)}
        />
        <PaginatedFooter total={rewards.length} page={rewardPage} setPage={setRewardPage} />
      </SettingsSection>

      <SettingsSection
        title="Player Data (Dummy)"
        addLabel="Add Dummy Data"
        onAdd={() => router.push("/admin/leaderboards/turnover/dummy")}
      >
        <TurnoverPlayerTable
          players={pagedPlayers}
          onEdit={(p) => router.push(`/admin/leaderboards/turnover/dummy?uuid=${p.uuid}`)}
        />
        <PaginatedFooter total={players.length} page={playerPage} setPage={setPlayerPage} />
      </SettingsSection>

      <SettingsSection title="Ranking (Real Members)">
        <RankingTable rows={pagedRankings} type="turnover" />
        <PaginatedFooter total={rankings.length} page={rankingPage} setPage={setRankingPage} />
      </SettingsSection>

      <PayoutScheduleCard />

      <SettingsSection title="Payout Logs">
        <PayoutLogTable rows={payoutLogs} />
        <PaginatedFooter total={payoutLogCount} page={payoutLogPage} setPage={setPayoutLogPage} />
      </SettingsSection>

      <ConfirmArchive
        open={!!archiveTarget}
        title="Archive reward?"
        message={archiveTarget ? `This will remove "${archiveTarget.name}" from the list.` : ""}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
