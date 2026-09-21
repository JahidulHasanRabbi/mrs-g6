"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../components/admin/members/DataTable";
import BossTable from "../../components/admin/boss-war/BossTable";
import {
  DepositPointModal,
  GameStatusModal,
  VipBonusModal,
} from "../../components/admin/boss-war/modals";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../components/admin/ui/Toast";
import * as adminApi from "../../api/adminApi";
import { GOLD_BG, describeApiError } from "../../components/admin/boss-war/constants";

const PAGE_SIZE = 7;

const ICON = {
  status: "/assets/admin/icons/lsicon-batch-check-outline.svg",
  coins: "/assets/admin/icons/iconoir-coins.svg",
  level: "/assets/admin/icons/icon-park-outline-level.svg",
};

function normalizeList(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function mapBoss(item) {
  return {
    id: item.uuid || item.id,
    numericId: item.id ?? null,
    uuid: item.uuid,
    name: item.name || "-",
    bossType: item.boss_type || "-",
    status: item.status || "-",
    hpMax: Number(item.hp_max ?? 0),
    hpRemaining: Number(item.hp_remaining ?? 0),
    rewardGem: item.reward_gem || "-",
    startsAt: item.starts_at,
    endsAt: item.ends_at,
    image: item.image || null,
    raw: item,
  };
}

function MaskIcon({ src, size = 16 }) {
  return (
    <span
      aria-hidden="true"
      className="block shrink-0 bg-current"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

function ActionButton({ children, icon, variant = "outline", onClick }) {
  if (variant === "filled") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition-opacity hover:opacity-90"
        style={{ backgroundImage: GOLD_BG }}
      >
        {icon}
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition-colors hover:bg-white/5"
    >
      {icon}
      {children}
    </button>
  );
}

function SimpleTable({ columns, rows, loading, empty, onEdit, onArchive }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px]">
          <thead>
            <tr className="text-left" style={{ backgroundImage: "linear-gradient(180deg, #141828 0%, #333333 99.75%)" }}>
              {columns.map((c) => (
                <th key={c.key} className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">
                  {c.label}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-[14px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-[13px] text-white/50">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-[13px] text-white/50">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  {columns.map((c) => (
                    <td key={c.key} className="px-6 py-5 text-[12px] text-white">
                      {c.render ? c.render(row) : row[c.key] ?? "-"}
                    </td>
                  ))}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(row)}
                        className="rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#141828] transition-opacity hover:opacity-90"
                        style={{ backgroundImage: GOLD_BG }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onArchive?.(row)}
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
  );
}

export default function BossWarPage() {
  const router = useRouter();
  const toast = useToast();

  const [bosses, setBosses] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const [gameStatus, setGameStatus] = useState(1);
  const [statusOpen, setStatusOpen] = useState(false);

  const [vipBonuses, setVipBonuses] = useState([]);
  const [vipLoading, setVipLoading] = useState(true);
  const [vipOpen, setVipOpen] = useState(false);
  const [vipTarget, setVipTarget] = useState(null);
  const [vipArchiveTarget, setVipArchiveTarget] = useState(null);
  const [tiers, setTiers] = useState([]);

  const [depositBands, setDepositBands] = useState([]);
  const [depositLoading, setDepositLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositTarget, setDepositTarget] = useState(null);
  const [depositArchiveTarget, setDepositArchiveTarget] = useState(null);

  const loadBosses = async () => {
    setLoading(true);
    try {
      const [items, settings] = await Promise.all([
        adminApi.getBossWarBosses(),
        adminApi.getBossWarSettings(),
      ]);
      setBosses(normalizeList(items).map(mapBoss));
      setGameStatus(Number(settings?.game_status ?? 1));
    } catch (error) {
      toast.error("Failed to load Boss War data", { description: describeApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const loadVipBonuses = async () => {
    setVipLoading(true);
    try {
      const data = await adminApi.getBossWarVipBonuses();
      setVipBonuses(normalizeList(data));
    } catch (error) {
      toast.error("Failed to load VIP bonuses", { description: describeApiError(error) });
    } finally {
      setVipLoading(false);
    }
  };

  const loadDepositBands = async () => {
    setDepositLoading(true);
    try {
      const data = await adminApi.getBossWarDepositPoints();
      setDepositBands(normalizeList(data));
    } catch (error) {
      toast.error("Failed to load deposit bands", { description: describeApiError(error) });
    } finally {
      setDepositLoading(false);
    }
  };

  const loadTiers = async () => {
    try {
      const data = await adminApi.getVipTiers();
      setTiers(normalizeList(data).map((t) => ({ uuid: t.uuid, name: t.name })));
    } catch {
      // The tier list only feeds a dropdown; a failure here is not worth a toast.
      setTiers([]);
    }
  };

  useEffect(() => {
    loadBosses();
    loadVipBonuses();
    loadDepositBands();
    loadTiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(bosses.length / PAGE_SIZE));
  const sortedBosses = useMemo(
    () => [...bosses].sort((a, b) => Number(a.numericId ?? 0) - Number(b.numericId ?? 0)),
    [bosses],
  );
  const pageBosses = useMemo(
    () => sortedBosses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedBosses, page],
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const confirmArchiveBoss = async () => {
    if (!archiveTarget?.uuid) return;
    try {
      await adminApi.archiveBossWarBoss(archiveTarget.uuid);
      toast.success("Boss archived");
      setArchiveTarget(null);
      await loadBosses();
    } catch (error) {
      toast.error("Failed to archive boss", { description: describeApiError(error) });
    }
  };

  return (
    <div className="rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-[26px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Bosses
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${gameStatus === 1 ? "bg-emerald-400/15 text-emerald-300" : "bg-red-400/15 text-red-300"}`}
          >
            {gameStatus === 1 ? "OPEN" : "CLOSED"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton icon={<MaskIcon src={ICON.status} />} onClick={() => setStatusOpen(true)}>
            Game Status
          </ActionButton>
          <ActionButton
            icon={<MaskIcon src={ICON.level} />}
            variant="filled"
            onClick={() => router.push("/admin/boss-war/add-boss")}
          >
            Add Boss
          </ActionButton>
        </div>
      </div>

      <div className="px-2 pb-2">
        {loading ? (
          <div className="px-6 py-12 text-center text-[13px] text-white/50">Loading bosses...</div>
        ) : (
          <BossTable
            bosses={pageBosses}
            onView={(b) => router.push(`/admin/boss-war/${b.uuid}`)}
            onEdit={(b) => router.push(`/admin/boss-war/add-boss?uuid=${b.uuid}`)}
            onArchive={setArchiveTarget}
          />
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-[10px] text-white/80">
          {bosses.length === 0
            ? "Showing 0 to 0 of 0 Results"
            : `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, bosses.length)} of ${bosses.length} Results`}
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <div className="border-t border-white/10 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[22px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            VIP Combat Bonus
          </h2>
          <ActionButton
            variant="filled"
            onClick={() => {
              setVipTarget(null);
              setVipOpen(true);
            }}
          >
            Add VIP Bonus
          </ActionButton>
        </div>
        <SimpleTable
          columns={[
            { key: "member_tier_name", label: "Member Tier" },
            { key: "critical_rate", label: "Critical Rate", render: (r) => `${r.critical_rate}%` },
            { key: "damage_bonus", label: "Damage Bonus", render: (r) => `×${r.damage_bonus}` },
          ]}
          rows={vipBonuses}
          loading={vipLoading}
          empty="No VIP bonuses configured."
          onEdit={(row) => {
            setVipTarget(row);
            setVipOpen(true);
          }}
          onArchive={setVipArchiveTarget}
        />
      </div>

      <div className="border-t border-white/10 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[22px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Deposit to Attack Point
          </h2>
          <ActionButton
            variant="filled"
            onClick={() => {
              setDepositTarget(null);
              setDepositOpen(true);
            }}
          >
            Add Deposit Band
          </ActionButton>
        </div>
        <SimpleTable
          columns={[
            { key: "deposit_amount", label: "Deposit Amount" },
            { key: "attack_point_amount", label: "Attack Points" },
          ]}
          rows={depositBands}
          loading={depositLoading}
          empty="No deposit bands configured."
          onEdit={(row) => {
            setDepositTarget(row);
            setDepositOpen(true);
          }}
          onArchive={setDepositArchiveTarget}
        />
      </div>

      <GameStatusModal
        open={statusOpen}
        initial={gameStatus}
        onClose={() => setStatusOpen(false)}
        onSave={async (payload) => {
          try {
            const res = await adminApi.updateBossWarSettings(payload);
            setGameStatus(Number(res?.game_status ?? payload.game_status));
            toast.success("Game status saved");
            setStatusOpen(false);
          } catch (error) {
            toast.error("Failed to save game status", { description: describeApiError(error) });
          }
        }}
      />

      <VipBonusModal
        open={vipOpen}
        initial={vipTarget}
        tiers={tiers}
        onClose={() => setVipOpen(false)}
        onSave={async (payload) => {
          try {
            if (vipTarget?.uuid) {
              await adminApi.updateBossWarVipBonus(vipTarget.uuid, payload);
              toast.success("VIP bonus updated");
            } else {
              await adminApi.createBossWarVipBonus(payload);
              toast.success("VIP bonus created");
            }
            setVipOpen(false);
            await loadVipBonuses();
          } catch (error) {
            toast.error("Failed to save VIP bonus", { description: describeApiError(error) });
          }
        }}
      />

      <DepositPointModal
        open={depositOpen}
        initial={depositTarget}
        onClose={() => setDepositOpen(false)}
        onSave={async (payload) => {
          try {
            if (depositTarget?.uuid) {
              await adminApi.updateBossWarDepositPoint(depositTarget.uuid, payload);
              toast.success("Deposit band updated");
            } else {
              await adminApi.createBossWarDepositPoint(payload);
              toast.success("Deposit band created");
            }
            setDepositOpen(false);
            await loadDepositBands();
          } catch (error) {
            toast.error("Failed to save deposit band", { description: describeApiError(error) });
          }
        }}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive boss?"
        message={archiveTarget ? `Archive ${archiveTarget.name}? It will be removed from the active list.` : ""}
        confirmLabel="Archive"
        tone="destructive"
        onConfirm={confirmArchiveBoss}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={!!vipArchiveTarget}
        title="Archive VIP bonus?"
        message={vipArchiveTarget ? `Archive the bonus for ${vipArchiveTarget.member_tier_name}?` : ""}
        confirmLabel="Archive"
        tone="destructive"
        onConfirm={async () => {
          try {
            await adminApi.archiveBossWarVipBonus(vipArchiveTarget.uuid);
            toast.success("VIP bonus archived");
            setVipArchiveTarget(null);
            await loadVipBonuses();
          } catch (error) {
            toast.error("Failed to archive VIP bonus", { description: describeApiError(error) });
          }
        }}
        onCancel={() => setVipArchiveTarget(null)}
      />

      <ConfirmDialog
        open={!!depositArchiveTarget}
        title="Archive deposit band?"
        message={depositArchiveTarget ? `Archive the ${depositArchiveTarget.deposit_amount} band?` : ""}
        confirmLabel="Archive"
        tone="destructive"
        onConfirm={async () => {
          try {
            await adminApi.archiveBossWarDepositPoint(depositArchiveTarget.uuid);
            toast.success("Deposit band archived");
            setDepositArchiveTarget(null);
            await loadDepositBands();
          } catch (error) {
            toast.error("Failed to archive deposit band", { description: describeApiError(error) });
          }
        }}
        onCancel={() => setDepositArchiveTarget(null)}
      />
    </div>
  );
}
