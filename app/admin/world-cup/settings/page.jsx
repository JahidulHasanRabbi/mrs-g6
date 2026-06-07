"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import SettingsSection from "../../../components/admin/world-cup/SettingsSection";
import BannerTable from "../../../components/admin/world-cup/BannerTable";
import RewardTable from "../../../components/admin/world-cup/RewardTable";
import PlayerTable from "../../../components/admin/world-cup/PlayerTable";
import ConfirmArchive from "../../../components/admin/world-cup/ConfirmArchive";
import { normalizeCountryOptions } from "../../../components/admin/world-cup/countryOptions";
import {
  getWorldCupBanners,
  archiveWorldCupBanner,
  getWorldCupCountries,
  getWorldCupRewardItems,
  archiveWorldCupRewardItem,
  getWorldCupDummyPlayers,
  archiveWorldCupDummyPlayer,
} from "../../../api/adminApi";

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

function normalizeBanner(b) {
  return {
    id: b.uuid,
    uuid: b.uuid,
    title: b.title,
    label: b.label_text,
    section: b.section_title,
    subtitle: b.subtitle,
    description: b.description,
    image: b.image,
    location: b.location,
  };
}

function countryName(value, countriesById) {
  if (value == null || value === "") return "";
  return countriesById.get(String(value)) ?? String(value);
}

function normalizeReward(r, countriesById = new Map()) {
  return {
    id: r.uuid,
    uuid: r.uuid,
    name: r.reward_name,
    quantity: r.quantity,
    itemType: r.item_type_display ?? String(r.item_type),
    country: r.country_name ?? r.country_code ?? countryName(r.country, countriesById),
    description: r.description,
    image: r.image,
  };
}

function normalizePlayer(p, countriesById = new Map()) {
  return {
    id: p.uuid,
    uuid: p.uuid,
    name: p.player_name,
    country: p.country_name ?? p.country_code ?? countryName(p.country, countriesById),
    totalPoints: p.total_points ?? 0,
    totalWin: p.total_win ?? 0,
    winningStreak: p.winning_streak ?? 0,
    totalPrediction: p.total_prediction ?? 0,
  };
}

export default function WorldCupSettingsPage() {
  const router = useRouter();

  const [banners, setBanners] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [players, setPlayers] = useState([]);

  const [bannerPage, setBannerPage] = useState(1);
  const [rewardPage, setRewardPage] = useState(1);
  const [playerPage, setPlayerPage] = useState(1);

  const [archiveTarget, setArchiveTarget] = useState(null);

  useEffect(() => {
    Promise.all([
      getWorldCupCountries().catch(() => []),
      getWorldCupBanners().catch(() => []),
      getWorldCupRewardItems().catch(() => []),
      getWorldCupDummyPlayers().catch(() => []),
    ]).then(([countriesRes, bannersRes, rewardsRes, playersRes]) => {
      const countries = normalizeCountryOptions(countriesRes);
      const countriesById = new Map(
        countries.map((c) => [String(c.id ?? c.country ?? c.uuid), c.name]),
      );
      setBanners((bannersRes.results ?? bannersRes ?? []).map(normalizeBanner));
      setRewards((rewardsRes.results ?? rewardsRes ?? []).map((r) => normalizeReward(r, countriesById)));
      setPlayers((playersRes.results ?? playersRes ?? []).map((p) => normalizePlayer(p, countriesById)));
    });
  }, []);

  const pagedBanners = useMemo(() => banners.slice((bannerPage - 1) * PAGE_SIZE, bannerPage * PAGE_SIZE), [banners, bannerPage]);
  const pagedRewards = useMemo(() => rewards.slice((rewardPage - 1) * PAGE_SIZE, rewardPage * PAGE_SIZE), [rewards, rewardPage]);
  const pagedPlayers = useMemo(() => players.slice((playerPage - 1) * PAGE_SIZE, playerPage * PAGE_SIZE), [players, playerPage]);

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    const { type, item } = archiveTarget;
    try {
      if (type === "banner") {
        await archiveWorldCupBanner(item.uuid);
        setBanners((list) => list.filter((b) => b.uuid !== item.uuid));
      }
      if (type === "reward") {
        await archiveWorldCupRewardItem(item.uuid);
        setRewards((list) => list.filter((r) => r.uuid !== item.uuid));
      }
      if (type === "player") {
        await archiveWorldCupDummyPlayer(item.uuid);
        setPlayers((list) => list.filter((p) => p.uuid !== item.uuid));
      }
    } catch { /* ignore — item may already be archived */ }
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
          onEdit={(b) => router.push(`/admin/world-cup/settings/banner?uuid=${b.uuid}`)}
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
          onEdit={(r) => router.push(`/admin/world-cup/settings/reward?uuid=${r.uuid}`)}
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
          onEdit={(p) => router.push(`/admin/world-cup/settings/dummy?uuid=${p.uuid}`)}
          onArchive={(p) => setArchiveTarget({ type: "player", item: p })}
        />
        <PaginatedFooter total={players.length} page={playerPage} setPage={setPlayerPage} />
      </SettingsSection>

      <ConfirmArchive
        open={!!archiveTarget}
        title={
          archiveTarget?.type === "banner" ? "Archive banner?" :
          archiveTarget?.type === "reward" ? "Archive reward?" :
          "Archive player?"
        }
        message={
          archiveTarget
            ? `This will remove "${archiveTarget.item.name || archiveTarget.item.title}" from the list.`
            : ""
        }
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
