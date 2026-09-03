"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../components/admin/members/DataTable";
import RewardsTable from "../../components/admin/penalty-kick/RewardsTable";
import KeeperDifficultyModal from "../../components/admin/penalty-kick/KeeperDifficultyModal";
import GameStatusModal from "../../components/admin/penalty-kick/GameStatusModal";
import CostSettingModal from "../../components/admin/penalty-kick/CostSettingModal";
import KickSequenceModal from "../../components/admin/penalty-kick/KickSequenceModal";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import ImportSequenceModal, { ImportIcon } from "../../components/admin/ui/ImportSequenceModal";
import SequenceHistoryTable from "../../components/admin/ui/SequenceHistoryTable";
import { useToast } from "../../components/admin/ui/Toast";
import * as adminApi from "../../api/adminApi";
import { buildCurrentSequenceExportRows, downloadXlsx } from "../../lib/sequenceImport";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";
const PAGE_SIZE = 7;
const HISTORY_PAGE_SIZE = 10;

const DIFFICULTY_TO_KEY = { 1: "easy", 2: "medium", 3: "hard" };
const KEY_TO_DIFFICULTY = { easy: 1, medium: 2, hard: 3 };

function normalizeList(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function mapReward(item) {
  return {
    id: item.uuid || item.id,
    numericId: item.id ?? null,
    uuid: item.uuid,
    name: item.reward_name || "-",
    quantity: item.quantity ?? 0,
    itemType: item.item_type || "-",
    unlimited: Boolean(item.unlimited),
    image: item.image || null,
    raw: item,
  };
}

function mapSettings(data = {}) {
  const selected = DIFFICULTY_TO_KEY[data.goalkeeper_difficulty] || "easy";
  return {
    keeper: {
      easy: data.easy_probability ?? 75,
      medium: data.medium_probability ?? 50,
      hard: data.hard_probability ?? 25,
      selected,
    },
    cost: { cost: Number(data.cost_per_kick ?? 10) },
    status: {
      maintenance: Boolean(data.maintenance_mode),
      gameplay: Number(data.game_status ?? 1) === 1 && !data.maintenance_mode,
    },
  };
}

function mapSequence(item) {
  return {
    id: item.uuid || item.id,
    uuid: item.uuid,
    itemOrder: Number(item.item_order ?? 0),
    itemName: item.item_name || "-",
    itemUuid: item.item_uuid,
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

const ICON = {
  keeper: "/assets/admin/icons/pepicons-pencil-hands-clapping.svg",
  coins: "/assets/admin/icons/iconoir-coins.svg",
  check: "/assets/admin/icons/lsicon-batch-check-outline.svg",
  soccer: "/assets/admin/icons/lucide-lab-soccer-ball.svg",
  level: "/assets/admin/icons/icon-park-outline-level.svg",
};

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

function SequenceTable({ rows, loading, onDelete, onMove }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="bg-gradient-to-b from-[#141828] to-[#333333] text-left">
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Position</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Reward</th>
              <th className="px-6 py-4 text-right text-[14px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-[13px] text-white/50">
                  Loading sequences...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-[13px] text-white/50">
                  No kick sequences configured.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] text-white">#{row.itemOrder}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{row.itemName}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onMove?.(index, -1)}
                        disabled={index === 0}
                        className="rounded-[8px] border border-[#f2cb7a] px-3 py-2 text-[12px] text-[#eaad2c] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove?.(index, 1)}
                        disabled={index === rows.length - 1}
                        className="rounded-[8px] border border-[#f2cb7a] px-3 py-2 text-[12px] text-[#eaad2c] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(row)}
                        className="rounded-[8px] border border-red-400/70 px-3 py-2 text-[12px] text-red-300"
                      >
                        Delete
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

export default function PenaltyKickPage() {
  const router = useRouter();
  const toast = useToast();
  const [rewards, setRewards] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [sequencePage, setSequencePage] = useState(1);
  const [sequenceTotal, setSequenceTotal] = useState(0);
  const [sequenceLoading, setSequenceLoading] = useState(true);
  const [sequenceDeleteTarget, setSequenceDeleteTarget] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [keeperOpen, setKeeperOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sequenceOpen, setSequenceOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const [keeperData, setKeeperData] = useState({ easy: 75, medium: 50, hard: 25, selected: "easy" });
  const [costData, setCostData] = useState({ cost: 10 });
  const [statusData, setStatusData] = useState({ gameplay: true, maintenance: false });

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, settings] = await Promise.all([
        adminApi.getPenaltyKickItems(),
        adminApi.getPenaltyKickSettings(),
      ]);
      setRewards(normalizeList(items).map(mapReward));
      const mappedSettings = mapSettings(settings);
      setKeeperData(mappedSettings.keeper);
      setCostData(mappedSettings.cost);
      setStatusData(mappedSettings.status);
    } catch (error) {
      toast.error("Failed to load penalty kick data", {
        description: error?.data?.detail || error?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSequences = async (nextPage = sequencePage) => {
    setSequenceLoading(true);
    try {
      const data = await adminApi.getPenaltyKickSequences({ page: nextPage, page_size: PAGE_SIZE });
      setSequences(normalizeList(data).map(mapSequence));
      setSequenceTotal(Number(data?.count ?? normalizeList(data).length));
      setSequencePage(nextPage);
    } catch (error) {
      toast.error("Failed to load kick sequences", {
        description: error?.data?.detail || error?.message,
      });
    } finally {
      setSequenceLoading(false);
    }
  };

  const loadImportHistory = async (nextPage = historyPage) => {
    setHistoryLoading(true);
    try {
      const data = await adminApi.getPenaltyKickSequenceImports({ page: nextPage, page_size: HISTORY_PAGE_SIZE });
      setHistoryRows(data?.results || []);
      setHistoryTotal(Number(data?.count ?? 0));
      setHistoryPage(nextPage);
    } catch (error) {
      toast.error("Failed to load sequence import history", {
        description: error?.data?.detail || error?.message,
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExportSequence = async () => {
    setExporting(true);
    try {
      const current = await adminApi.getPenaltyKickSequenceCurrent();
      downloadXlsx(`kick-sequence-${new Date().toISOString().slice(0, 10)}.xlsx`, buildCurrentSequenceExportRows(current));
    } catch (error) {
      toast.error("Failed to export kick sequence", {
        description: error?.data?.detail || error?.message,
      });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadData();
    loadSequences(1);
    loadImportHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(rewards.length / PAGE_SIZE));
  // Sorted by reward ID before slicing, so pagination reflects the same
  // global order the table defaults to, not just the API's response order.
  const sortedRewards = useMemo(
    () => [...rewards].sort((a, b) => Number(a.numericId ?? 0) - Number(b.numericId ?? 0)),
    [rewards],
  );
  const pageRewards = useMemo(
    () => sortedRewards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedRewards, page],
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const saveSettings = async (payload, successMessage) => {
    const response = await adminApi.updatePenaltyKickSettings(payload);
    const mapped = mapSettings(response);
    setKeeperData(mapped.keeper);
    setCostData(mapped.cost);
    setStatusData(mapped.status);
    toast.success(successMessage);
  };

  const confirmArchive = async () => {
    if (!archiveTarget?.uuid) return;
    try {
      await adminApi.archivePenaltyKickItem(archiveTarget.uuid);
      toast.success("Reward archived");
      setArchiveTarget(null);
      await loadData();
    } catch (error) {
      toast.error("Failed to archive reward", {
        description: error?.data?.detail || error?.message,
      });
    }
  };

  const confirmSequenceDelete = async () => {
    if (!sequenceDeleteTarget?.uuid) return;
    try {
      await adminApi.deletePenaltyKickSequence(sequenceDeleteTarget.uuid);
      toast.success("Kick sequence deleted");
      setSequenceDeleteTarget(null);
      await loadSequences(sequencePage);
    } catch (error) {
      toast.error("Failed to delete kick sequence", {
        description: error?.data?.detail || error?.message,
      });
    }
  };

  const handleSequenceImported = (response) => {
    if (response?.failed_count) {
      toast.warning(`Imported with ${response.failed_count} row${response.failed_count === 1 ? "" : "s"} rejected`, {
        description: `${response.success_count ?? 0} saved. See the result above for details.`,
      });
    } else {
      toast.success(`Imported ${response?.success_count ?? 0} kick sequence position${response?.success_count === 1 ? "" : "s"}`);
    }
    loadSequences(1);
    loadImportHistory(1);
  };

  const moveSequence = async (index, delta) => {
    const target = sequences[index];
    const swap = sequences[index + delta];
    if (!target || !swap) return;
    try {
      await adminApi.reorderPenaltyKickSequences([
        { sequence_uuid: target.uuid, item_order: swap.itemOrder },
        { sequence_uuid: swap.uuid, item_order: target.itemOrder },
      ]);
      toast.success("Kick sequence reordered");
      await loadSequences(sequencePage);
    } catch (error) {
      toast.error("Failed to reorder kick sequence", {
        description: error?.data?.detail || error?.message,
      });
    }
  };

  return (
    <div className="rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <h2 className="text-[26px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Rewards
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton icon={<MaskIcon src={ICON.keeper} />} onClick={() => setKeeperOpen(true)}>
            Keeper Difficulty
          </ActionButton>
          <ActionButton icon={<MaskIcon src={ICON.coins} />} onClick={() => setCostOpen(true)}>
            Cost Setting
          </ActionButton>
          <ActionButton icon={<MaskIcon src={ICON.check} />} onClick={() => setStatusOpen(true)}>
            Game Status
          </ActionButton>
          <ActionButton icon={<MaskIcon src={ICON.soccer} />} onClick={() => setSequenceOpen(true)}>
            Kick Sequence
          </ActionButton>
          <ActionButton
            icon={<MaskIcon src={ICON.level} />}
            variant="filled"
            onClick={() => router.push("/admin/penalty-kick/add-reward")}
          >
            Add Reward
          </ActionButton>
        </div>
      </div>

      <div className="px-2 pb-2">
        {loading ? (
          <div className="px-6 py-12 text-center text-[13px] text-white/50">Loading rewards...</div>
        ) : (
          <RewardsTable
            rewards={pageRewards}
            onEdit={(r) => router.push(`/admin/penalty-kick/add-reward?id=${r.uuid}`)}
            onArchive={setArchiveTarget}
          />
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-[10px] text-white/80">
          {rewards.length === 0
            ? "Showing 0 to 0 of 0 Results"
            : `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, rewards.length)} of ${rewards.length} Results`}
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <div className="border-t border-white/10 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[22px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Kick Sequences
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportSequence}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-5 py-2 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export Sequence"}
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-5 py-2 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5"
            >
              <ImportIcon />
              Import Sequence
            </button>
          </div>
        </div>
        <SequenceTable
          rows={sequences}
          loading={sequenceLoading}
          onDelete={setSequenceDeleteTarget}
          onMove={moveSequence}
        />
        <div className="flex items-center justify-between py-3">
          <p className="text-[10px] text-white/80">
            {sequenceTotal === 0
              ? "Showing 0 to 0 of 0 Results"
              : `Showing ${(sequencePage - 1) * PAGE_SIZE + 1} to ${Math.min(sequencePage * PAGE_SIZE, sequenceTotal)} of ${sequenceTotal} Results`}
          </p>
          <Pagination
            currentPage={sequencePage}
            totalPages={Math.max(1, Math.ceil(sequenceTotal / PAGE_SIZE))}
            onPageChange={loadSequences}
          />
        </div>
      </div>

      <div className="border-t border-white/10 p-6">
        <h2 className="mb-4 text-[22px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Sequence Import History
        </h2>
        <SequenceHistoryTable
          rows={historyRows}
          loading={historyLoading}
          onViewDetails={(uuid) => router.push(`/admin/penalty-kick/sequence-history?uuid=${uuid}`)}
        />
        <div className="flex items-center justify-between py-3">
          <p className="text-[10px] text-white/80">
            {historyTotal === 0
              ? "Showing 0 to 0 of 0 Results"
              : `Showing ${(historyPage - 1) * HISTORY_PAGE_SIZE + 1} to ${Math.min(historyPage * HISTORY_PAGE_SIZE, historyTotal)} of ${historyTotal} Results`}
          </p>
          <Pagination
            currentPage={historyPage}
            totalPages={Math.max(1, Math.ceil(historyTotal / HISTORY_PAGE_SIZE))}
            onPageChange={loadImportHistory}
          />
        </div>
      </div>

      <KeeperDifficultyModal
        open={keeperOpen}
        initial={keeperData}
        onClose={() => setKeeperOpen(false)}
        onSave={async (payload) => {
          try {
            await saveSettings({
              goalkeeper_difficulty: KEY_TO_DIFFICULTY[payload.selected] || 1,
              easy_probability: payload.easy,
              medium_probability: payload.medium,
              hard_probability: payload.hard,
            }, "Keeper difficulty saved");
          } catch (error) {
            toast.error("Failed to save keeper difficulty", { description: error?.data?.detail || error?.message });
          }
        }}
      />
      <CostSettingModal
        open={costOpen}
        initial={costData}
        onClose={() => setCostOpen(false)}
        onSave={async (payload) => {
          try {
            await saveSettings({ cost_per_kick: Number(payload.cost) }, "Cost setting saved");
          } catch (error) {
            toast.error("Failed to save cost setting", { description: error?.data?.detail || error?.message });
          }
        }}
      />
      <GameStatusModal
        open={statusOpen}
        initial={statusData}
        onClose={() => setStatusOpen(false)}
        onSave={async (payload) => {
          try {
            await saveSettings(
              { game_status: payload.gameplay ? 1 : 2, maintenance_mode: Boolean(payload.maintenance) },
              "Game status saved",
            );
          } catch (error) {
            toast.error("Failed to save game status", { description: error?.data?.detail || error?.message });
          }
        }}
      />
      <KickSequenceModal
        open={sequenceOpen}
        rewards={rewards.map((r) => ({ id: r.uuid, name: r.name }))}
        onClose={() => setSequenceOpen(false)}
        onSave={async (payload) => {
          try {
            await adminApi.createPenaltyKickSequence(payload.position, payload.rewardId);
            toast.success("Kick sequence saved");
            await loadSequences(sequencePage);
          } catch (error) {
            toast.error("Failed to save kick sequence", { description: error?.data?.detail || error?.message });
          }
        }}
      />

      <ImportSequenceModal
        open={importOpen}
        title="Import Kick Sequence"
        rewards={rewards.map((r) => ({ id: r.numericId, uuid: r.uuid, name: r.name }))}
        existingCount={sequenceTotal}
        templateFilename="kick-sequence-template.csv"
        importFn={adminApi.importPenaltyKickSequence}
        onImported={handleSequenceImported}
        onClose={() => setImportOpen(false)}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive reward?"
        message={archiveTarget ? `Archive ${archiveTarget.name}? This reward will be removed from the active list.` : ""}
        confirmLabel="Archive"
        tone="destructive"
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
      <ConfirmDialog
        open={!!sequenceDeleteTarget}
        title="Delete kick sequence?"
        message={sequenceDeleteTarget ? `Delete sequence #${sequenceDeleteTarget.itemOrder} for ${sequenceDeleteTarget.itemName}?` : ""}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmSequenceDelete}
        onCancel={() => setSequenceDeleteTarget(null)}
      />
    </div>
  );
}
