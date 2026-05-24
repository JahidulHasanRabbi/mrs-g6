"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import SettingsSection from "../../../components/admin/world-cup/SettingsSection";
import BannerTable from "../../../components/admin/world-cup/BannerTable";
import RewardTable from "../../../components/admin/world-cup/RewardTable";
import PlayerTable from "../../../components/admin/world-cup/PlayerTable";
import ConfirmArchive from "../../../components/admin/world-cup/ConfirmArchive";
import { useWorldCupSettings } from "../../../contexts/WorldCupSettingsContext";

const PAGE_SIZE = 7;

function PaginatedFooter({ total, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
      <p className="text-[10px] text-white/80">
        Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)} to {Math.min(page * PAGE_SIZE, total)} of {total} Results
      </p>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

export default function WorldCupSettingsPage() {
  const router = useRouter();
  const {
    banners, archiveBanner,
    rewards, archiveReward,
    players, archivePlayer,
  } = useWorldCupSettings();

  const [bannerPage, setBannerPage] = useState(1);
  const [rewardPage, setRewardPage] = useState(1);
  const [playerPage, setPlayerPage] = useState(1);

  const [archiveTarget, setArchiveTarget] = useState(null); // { type, item }

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

  const confirmArchive = () => {
    if (!archiveTarget) return;
    if (archiveTarget.type === "banner") archiveBanner(archiveTarget.item.id);
    if (archiveTarget.type === "reward") archiveReward(archiveTarget.item.id);
    if (archiveTarget.type === "player") archivePlayer(archiveTarget.item.id);
    setArchiveTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        title="Banner Information"
        addLabel="Add Banner Information"
        onAdd={() => router.push("/admin/world-cup/settings/banner")}
      >
        <BannerTable
          banners={pagedBanners}
          onEdit={(b) => router.push(`/admin/world-cup/settings/banner?id=${b.id}`)}
          onArchive={(b) => setArchiveTarget({ type: "banner", item: b })}
        />
        <PaginatedFooter total={banners.length} page={bannerPage} setPage={setBannerPage} />
      </SettingsSection>

      <SettingsSection
        title="Rewards"
        addLabel="Add Reward"
        onAdd={() => router.push("/admin/world-cup/settings/reward")}
      >
        <RewardTable
          rewards={pagedRewards}
          onEdit={(r) => router.push(`/admin/world-cup/settings/reward?id=${r.id}`)}
          onArchive={(r) => setArchiveTarget({ type: "reward", item: r })}
        />
        <PaginatedFooter total={rewards.length} page={rewardPage} setPage={setRewardPage} />
      </SettingsSection>

      <SettingsSection
        title="Player Data (Dummy)"
        addLabel="Add Dummy Data"
        onAdd={() => router.push("/admin/world-cup/settings/dummy")}
      >
        <PlayerTable
          players={pagedPlayers}
          onEdit={(p) => router.push(`/admin/world-cup/settings/dummy?id=${p.id}`)}
          onArchive={(p) => setArchiveTarget({ type: "player", item: p })}
        />
        <PaginatedFooter total={players.length} page={playerPage} setPage={setPlayerPage} />
      </SettingsSection>

      <ConfirmArchive
        open={!!archiveTarget}
        title={
          archiveTarget?.type === "banner"
            ? "Archive banner?"
            : archiveTarget?.type === "reward"
            ? "Archive reward?"
            : "Archive player?"
        }
        message={
          archiveTarget
            ? `This will remove "${archiveTarget.item.name || archiveTarget.item.title}" from the list. You can re-add it later.`
            : ""
        }
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
