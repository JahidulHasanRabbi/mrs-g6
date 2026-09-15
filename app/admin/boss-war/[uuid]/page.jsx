"use client";

// Boss detail — everything about one boss lives here: summary, its own Settle
// Payouts action, aggregated statistics, the damage leaderboard, and the
// reward table for that boss.

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BossStats from "../../../components/admin/boss-war/BossStats";
import BossLeaderboard from "../../../components/admin/boss-war/BossLeaderboard";
import RewardItemModal from "../../../components/admin/boss-war/RewardItemModal";
import ConfirmDialog from "../../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../../components/admin/ui/Toast";
import * as adminApi from "../../../api/adminApi";
import { GOLD_BG, describeApiError } from "../../../components/admin/boss-war/constants";

const STATUS_STYLES = {
  UPCOMING: "bg-sky-400/15 text-sky-300",
  ACTIVE: "bg-emerald-400/15 text-emerald-300",
  DEFEATED: "bg-amber-400/15 text-amber-300",
  ENDED: "bg-white/10 text-white/60",
};

// The attack report is the only per-boss data source, so stats are aggregated
// from it. One page of this size covers any realistic single-boss event.
const STATS_PAGE_SIZE = 100;

function normalizeList(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionTitle({ children, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-[22px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {children}
      </h2>
      {action}
    </div>
  );
}

export default function BossDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const bossUuid = params?.uuid;

  const [boss, setBoss] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [ranking, setRanking] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [settling, setSettling] = useState(false);

  const loadBoss = useCallback(async () => {
    if (!bossUuid) return;
    setLoading(true);
    try {
      setBoss(await adminApi.getBossWarBoss(bossUuid));
    } catch (error) {
      toast.error("Failed to load boss", { description: describeApiError(error) });
    } finally {
      setLoading(false);
    }
  }, [bossUuid, toast]);

  const loadItems = useCallback(async () => {
    if (!bossUuid) return;
    setItemsLoading(true);
    try {
      const data = await adminApi.getBossWarRewardItems(bossUuid);
      // Archived items keep coming back in the list with a timestamp, so they
      // are filtered out here rather than by the API.
      setItems(normalizeList(data).filter((i) => !i.archived));
    } catch (error) {
      toast.error("Failed to load reward items", { description: describeApiError(error) });
    } finally {
      setItemsLoading(false);
    }
  }, [bossUuid, toast]);

  const loadRanking = useCallback(async () => {
    if (!bossUuid) return;
    setRankingLoading(true);
    try {
      setRanking(normalizeList(await adminApi.getBossWarRanking(bossUuid)));
    } catch (error) {
      toast.error("Failed to load leaderboard", { description: describeApiError(error) });
    } finally {
      setRankingLoading(false);
    }
  }, [bossUuid, toast]);

  const loadStats = useCallback(async (bossData) => {
    if (!bossUuid) return;
    setStatsLoading(true);
    try {
      const [attacks, rewards] = await Promise.all([
        adminApi.getBossWarAttackReport({ boss_uuid: bossUuid, page_size: STATS_PAGE_SIZE }),
        adminApi.getBossWarRewardReport({ boss_uuid: bossUuid, page_size: 1 }),
      ]);
      const rows = normalizeList(attacks);
      setStats({
        totalAttacks: Number(attacks?.count ?? rows.length),
        players: new Set(rows.map((r) => r.member_uuid)).size,
        criticals: rows.filter((r) => r.is_critical).length,
        apSpent: rows.reduce((sum, r) => sum + Number(r.ap_used ?? 0), 0),
        rewardsPaid: Number(rewards?.count ?? 0),
        hpMax: Number(bossData?.hp_max ?? 0),
        hpRemaining: Number(bossData?.hp_remaining ?? 0),
      });
    } catch (error) {
      toast.error("Failed to load statistics", { description: describeApiError(error) });
    } finally {
      setStatsLoading(false);
    }
  }, [bossUuid, toast]);

  useEffect(() => {
    loadBoss();
    loadItems();
    loadRanking();
  }, [loadBoss, loadItems, loadRanking]);

  // Stats need the boss HP figures, so they follow the boss load.
  useEffect(() => {
    if (boss) loadStats(boss);
  }, [boss, loadStats]);

  const amountOf = (item) => {
    if (item.credit_amount != null) return `${item.credit_amount} Credit`;
    if (item.token_amount != null) return `${item.token_amount} KR Coins`;
    if (item.battle_point_amount != null) return `${item.battle_point_amount} BP`;
    if (item.attack_point_amount != null) return `${item.attack_point_amount} AP`;
    return "-";
  };

  const positionOf = (item) => {
    if (item.position_start == null) return "-";
    if (item.position_end == null) return `#${item.position_start}`;
    return `#${item.position_start}–#${item.position_end}`;
  };

  if (loading) {
    return (
      <div className="rounded-[16px] bg-[#041502] p-6 text-center text-[13px] text-white/60 shadow-[0_-4px_12px_-2px_#dea220]">
        Loading boss...
      </div>
    );
  }

  if (!boss) {
    return (
      <div className="rounded-[16px] bg-[#041502] p-6 text-center text-[13px] text-white/60 shadow-[0_-4px_12px_-2px_#dea220]">
        Boss not found.{" "}
        <button type="button" onClick={() => router.push("/admin/boss-war")} className="text-[#eaad2c] underline">
          Back to Boss War
        </button>
      </div>
    );
  }

  const hpPct = boss.hp_max > 0 ? Math.round((boss.hp_remaining / boss.hp_max) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary + per-boss actions */}
      <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[8px] bg-white/5">
              {boss.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={boss.image} alt={boss.name} className="h-full w-full object-cover" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="1.5" fill="#e9af41" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[26px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {boss.name}
                </h2>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_STYLES[boss.status] || "bg-white/10 text-white/70"}`}>
                  {boss.status}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">
                  {boss.boss_type}
                </span>
                <span className="rounded-full bg-[#f2cb7a]/15 px-3 py-1 text-[11px] font-semibold text-[#f2cb7a]">
                  {boss.reward_gem}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-white">
                  HP {Number(boss.hp_remaining ?? 0).toLocaleString("en-US")} / {Number(boss.hp_max ?? 0).toLocaleString("en-US")}
                </span>
                <span className="h-2 w-[240px] overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-[#e9af41]" style={{ width: `${hpPct}%` }} />
                </span>
              </div>
              <p className="text-[12px] text-white/50">
                {formatDate(boss.starts_at)} → {formatDate(boss.ends_at)}
              </p>
              <p className="text-[12px] text-white/50">
                Damage {boss.min_damage}–{boss.max_damage} · Crit {boss.base_critical_rate}% · ×{boss.critical_multiplier}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/boss-war")}
              className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition-colors hover:bg-white/5"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setSettleOpen(true)}
              className="rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#eaad2c] transition-opacity hover:opacity-90"
              style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.75%)" }}
            >
              Settle Payouts
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/boss-war/add-boss?uuid=${boss.uuid}`)}
              className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition-opacity hover:opacity-90"
              style={{ backgroundImage: GOLD_BG }}
            >
              Edit Boss
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
        <SectionTitle>Statistics</SectionTitle>
        <BossStats stats={stats || { totalAttacks: 0, players: 0, criticals: 0, apSpent: 0, rewardsPaid: 0, hpMax: 0, hpRemaining: 0 }} loading={statsLoading} />
      </div>

      {/* Leaderboard */}
      <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
        <SectionTitle>Leaderboard</SectionTitle>
        <BossLeaderboard rows={ranking} loading={rankingLoading} />
      </div>

      {/* Reward items */}
      <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
        <SectionTitle
          action={
            <button
              type="button"
              onClick={() => {
                setEditTarget(null);
                setModalOpen(true);
              }}
              className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition-opacity hover:opacity-90"
              style={{ backgroundImage: GOLD_BG }}
            >
              Add Reward Item
            </button>
          }
        >
          Reward Items
        </SectionTitle>

        <div className="overflow-hidden rounded-[12px] border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="text-left" style={{ backgroundImage: "linear-gradient(180deg, #141828 0%, #333333 99.75%)" }}>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">ID</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Reward Type</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Reward Name</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Rank</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Item Type</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Amount</th>
                  <th className="px-6 py-4 text-center text-[14px] font-semibold text-[#fbeed2]">Image</th>
                  <th className="px-6 py-4 text-right text-[14px] font-semibold text-[#fbeed2]">Action</th>
                </tr>
              </thead>
              <tbody>
                {itemsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-[13px] text-white/50">
                      Loading reward items...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-[13px] text-white/50">
                      No reward items for this boss yet.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                      <td className="px-6 py-5 text-[12px] text-white/70">{item.id ?? "-"}</td>
                      <td className="px-6 py-5 text-[12px] text-white">{item.reward_type}</td>
                      <td className="px-6 py-5 text-[12px] text-white">{item.reward_name}</td>
                      <td className="px-6 py-5 text-[12px] text-white">{positionOf(item)}</td>
                      <td className="px-6 py-5 text-[12px] text-white">{item.item_type}</td>
                      <td className="px-6 py-5 text-[12px] text-white">{amountOf(item)}</td>
                      <td className="px-6 py-5">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-[4px] bg-white/5">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.reward_name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-white/40">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditTarget(item);
                              setModalOpen(true);
                            }}
                            className="rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#141828] transition-opacity hover:opacity-90"
                            style={{ backgroundImage: GOLD_BG }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setArchiveTarget(item)}
                            className="rounded-[8px] border border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#eaad2c] transition-opacity hover:opacity-90"
                            style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.75%)" }}
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RewardItemModal
        open={modalOpen}
        initial={editTarget}
        bossUuid={bossUuid}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          setModalOpen(false);
          await loadItems();
        }}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive reward item?"
        message={archiveTarget ? `Archive ${archiveTarget.reward_name}?` : ""}
        confirmLabel="Archive"
        tone="destructive"
        onConfirm={async () => {
          try {
            await adminApi.archiveBossWarRewardItem(bossUuid, archiveTarget.uuid);
            toast.success("Reward item archived");
            setArchiveTarget(null);
            await loadItems();
          } catch (error) {
            toast.error("Failed to archive reward item", { description: describeApiError(error) });
          }
        }}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={settleOpen}
        title="Settle payouts for this boss?"
        message={`Credit every due reward for ${boss.name}. The boss must be defeated or ended.`}
        confirmLabel="Settle"
        tone="primary"
        loading={settling}
        onConfirm={async () => {
          setSettling(true);
          try {
            const res = await adminApi.settleBossWarPayouts({ boss_uuid: bossUuid });
            toast.success(`Settled — ${res?.credited ?? 0} reward(s) credited`);
            setSettleOpen(false);
            await loadBoss();
          } catch (error) {
            toast.error("Failed to settle payouts", { description: describeApiError(error) });
          } finally {
            setSettling(false);
          }
        }}
        onCancel={() => setSettleOpen(false)}
      />
    </div>
  );
}
