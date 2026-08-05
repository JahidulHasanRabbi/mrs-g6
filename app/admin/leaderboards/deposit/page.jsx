"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import SettingsSection from "../../../components/admin/world-cup/SettingsSection";
import InformationTable from "../../../components/admin/leaderboards/deposit/InformationTable";
import DepositRewardTable from "../../../components/admin/leaderboards/deposit/DepositRewardTable";
import DepositPlayerTable from "../../../components/admin/leaderboards/deposit/DepositPlayerTable";
import LeaderboardRankingManager from "../../../components/admin/leaderboards/LeaderboardRankingManager";
import ConfirmArchive from "../../../components/admin/world-cup/ConfirmArchive";
import {
  getDepositBanners,
  archiveDepositBanner,
  getDepositRewardItems,
  archiveDepositRewardItem,
  getDepositDummyPlayers,
  getLeaderboardRealRanking,
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

function normalizeBanner(b) {
  return {
    id: b.uuid,
    uuid: b.uuid,
    description: b.information ?? "",
    termsCondition: b.terms_and_conditions ?? "",
  };
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
    totalDeposit: p.total_deposit ?? 0,
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

export default function DepositSettingsPage() {
  const router = useRouter();

  const [banners, setBanners] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rankings, setRankings] = useState([]);

  const [bannerPage, setBannerPage] = useState(1);
  const [rewardPage, setRewardPage] = useState(1);
  const [playerPage, setPlayerPage] = useState(1);

  const [archiveTarget, setArchiveTarget] = useState(null);

  useEffect(() => {
    Promise.all([
      getDepositBanners().catch(() => null),
      getDepositRewardItems().catch(() => null),
      getDepositDummyPlayers().catch(() => null),
      getLeaderboardRealRanking(1).catch(() => null),
    ]).then(([bannersRes, rewardsRes, playersRes, rankingRes]) => {
      const bList = bannersRes ? (bannersRes.results ?? bannersRes) : [];
      const rList = rewardsRes ? (rewardsRes.results ?? rewardsRes) : [];
      const pList = playersRes ? (playersRes.results ?? playersRes) : [];
      const rankingList = rankingRes ? (rankingRes.results ?? rankingRes) : [];
      setBanners((Array.isArray(bList) ? bList : []).map(normalizeBanner));
      setRewards((Array.isArray(rList) ? rList : []).map(normalizeReward));
      setPlayers((Array.isArray(pList) ? pList : []).map(normalizePlayer));
      setRankings((Array.isArray(rankingList) ? rankingList : []).map(normalizeRanking));
    });
  }, []);

  const pagedBanners = useMemo(
    () => banners.slice((bannerPage - 1) * PAGE_SIZE, bannerPage * PAGE_SIZE),
    [banners, bannerPage],
  );
  const pagedRewards = useMemo(
    () => rewards.slice((rewardPage - 1) * PAGE_SIZE, rewardPage * PAGE_SIZE),
    [rewards, rewardPage],
  );
  const pagedPlayers = useMemo(
    () => players.slice((playerPage - 1) * PAGE_SIZE, playerPage * PAGE_SIZE),
    [players, playerPage],
  );

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    const { type, item } = archiveTarget;
    try {
      if (type === "reward") {
        await archiveDepositRewardItem(item.uuid);
        setRewards((list) => list.filter((r) => r.uuid !== item.uuid));
      }
      if (type === "banner") {
        await archiveDepositBanner(item.uuid);
        setBanners((list) => list.filter((b) => b.uuid !== item.uuid));
      }
    } catch { /* item may already be archived */ }
    setArchiveTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        title="Information"
        addLabel="Add Information"
        onAdd={() => router.push("/admin/leaderboards/deposit/banner")}
      >
        <InformationTable
          items={pagedBanners}
          onEdit={(b) => router.push(`/admin/leaderboards/deposit/banner?uuid=${b.uuid}`)}
        />
        <PaginatedFooter total={banners.length} page={bannerPage} setPage={setBannerPage} />
      </SettingsSection>

      <SettingsSection
        title="Rewards"
        addLabel="Add Reward"
        onAdd={() => router.push("/admin/leaderboards/deposit/reward")}
      >
        <DepositRewardTable
          rewards={pagedRewards}
          onEdit={(r) => router.push(`/admin/leaderboards/deposit/reward?uuid=${r.uuid}`)}
          onArchive={(r) => setArchiveTarget({ type: "reward", item: r })}
        />
        <PaginatedFooter total={rewards.length} page={rewardPage} setPage={setRewardPage} />
      </SettingsSection>

      <SettingsSection
        title="Player Data (Dummy)"
        addLabel="Add Dummy Data"
        onAdd={() => router.push("/admin/leaderboards/deposit/dummy")}
      >
        <DepositPlayerTable
          players={pagedPlayers}
          onEdit={(p) => router.push(`/admin/leaderboards/deposit/dummy?uuid=${p.uuid}`)}
        />
        <PaginatedFooter total={players.length} page={playerPage} setPage={setPlayerPage} />
      </SettingsSection>

      <LeaderboardRankingManager rows={rankings} type="deposit" />

      <ConfirmArchive
        open={!!archiveTarget}
        title={
          archiveTarget?.type === "reward"
            ? "Archive reward?"
            : "Archive item?"
        }
        message={
          archiveTarget
            ? `This will remove "${archiveTarget.item.name || archiveTarget.item.description}" from the list.`
            : ""
        }
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
