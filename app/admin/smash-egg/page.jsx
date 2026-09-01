"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../components/admin/members/DataTable";
import RewardsTable from "../../components/admin/smash-egg/RewardsTable";
import RewardForm from "../../components/admin/smash-egg/RewardForm";
import SmashSequenceModal from "../../components/admin/smash-egg/SmashSequenceModal";
import CostSettingModal from "../../components/admin/penalty-kick/CostSettingModal";
import GameStatusModal from "../../components/admin/smash-egg/GameStatusModal";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import ImportSequenceModal, { ImportIcon } from "../../components/admin/ui/ImportSequenceModal";
import SequenceHistoryTable from "../../components/admin/ui/SequenceHistoryTable";
import { useToast } from "../../components/admin/ui/Toast";
import * as adminApi from "../../api/adminApi";
import { mapSmashEggItems, mapSmashEggSequences } from "../../api/responseMappers";
import { buildCurrentSequenceExportRows, downloadXlsx } from "../../lib/sequenceImport";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";
const PAGE_SIZE = 7;

const EGG_ICON = "/assets/admin/sidebar/icons/material-symbols-light-egg-outline-sharp.svg";
const LEVEL_ICON = "/assets/admin/icons/icon-park-outline-level.svg";
const COINS_ICON = "/assets/admin/icons/iconoir-coins.svg";
const STATUS_ICON = "/assets/admin/icons/lsicon-batch-check-outline.svg";

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

function itemTypeToApi(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "FREE CREDIT") return 1;
  if (normalized === "TOKEN") return 2;
  if (normalized === "PRIZE") return 3;
  if (normalized === "BATTLE POINT") return 4;
  return value;
}

// Field errors come back as { error, details: { position: ["..."] } }, so the
// usual `detail` lookup yields nothing for a duplicate position.
function describeApiError(error) {
  const details = error?.data?.details;
  if (typeof details === "string") return details;
  if (details && typeof details === "object") {
    const messages = Object.values(details).flat().filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  return error?.data?.detail || error?.message;
}

function buildItemPayload(data, includeImage = true) {
  const position = String(data.position ?? "").trim();

  const payload = {
    reward_name: data.name,
    item_type: itemTypeToApi(data.itemType),
    unlimited: Boolean(data.unlimited),
    // Explicit null clears a position; the API treats it the same as omitting.
    position: position === "" ? null : Number(position),
  };

  if (!payload.unlimited) {
    payload.quantity = Number(data.quantity) || 0;
  }

  if (data.itemType === "Free credit") {
    payload.min_withdraw = Number(data.minWithdraw) || 0;
    payload.max_withdraw = Number(data.maxWithdraw) || 0;
  }

  if (data.itemType === "Token") {
    payload.token_amount = Number(data.tokens) || 0;
  }

  if (data.itemType === "Battle Point") {
    payload.battle_point_amount = Number(data.battlePoints) || 0;
  }

  if (includeImage && data.image instanceof File) {
    payload.image = data.image;
  }

  return payload;
}

function mapSettings(data = {}) {
  return {
    cost: { cost: Number(data.cost_per_smash ?? 10) },
    status: {
      maintenance: Boolean(data.maintenance_mode),
      gameplay: Number(data.game_status ?? 1) === 1 && !data.maintenance_mode,
    },
  };
}

// Mirrors the Penalty Kick "Kick Sequences" table: lists the configured smash
// sequence in item_order, with reorder (Up/Down) and Delete actions.
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
                  No smash sequences configured.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] text-white">#{row.item_order}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{row.item_name || "-"}</td>
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

const HISTORY_PAGE_SIZE = 10;

export default function SmashEggPage() {
  const router = useRouter();
  const toast = useToast();
  const [rewards, setRewards] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Sequences live in their own paginated state, exactly like the Penalty Kick
  // page — and every change (add / delete / reorder) re-pulls them via
  // loadSequences so the table always reflects the server.
  const [sequences, setSequences] = useState([]);
  const [sequencePage, setSequencePage] = useState(1);
  const [sequenceTotal, setSequenceTotal] = useState(0);
  const [sequenceLoading, setSequenceLoading] = useState(true);

  const [historyRows, setHistoryRows] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [view, setView] = useState("list");
  const [formMode, setFormMode] = useState("add");
  const [editTarget, setEditTarget] = useState(null);
  const [sequenceOpen, setSequenceOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [sequenceDeleteTarget, setSequenceDeleteTarget] = useState(null);
  const [costData, setCostData] = useState({ cost: 10 });
  const [statusData, setStatusData] = useState({ gameplay: true, maintenance: false });

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsResponse, settingsResponse] = await Promise.all([
        adminApi.getSmashEggItems(),
        adminApi.getSmashEggSettings(),
      ]);
      setRewards(mapSmashEggItems(itemsResponse));
      const mappedSettings = mapSettings(settingsResponse);
      setCostData(mappedSettings.cost);
      setStatusData(mappedSettings.status);
    } catch (error) {
      toast.error("Failed to load Smash Egg data", {
        description: error?.data?.detail || error?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSequences = async (nextPage = sequencePage) => {
    setSequenceLoading(true);
    try {
      const data = await adminApi.getSmashEggSequences({ page: nextPage, page_size: PAGE_SIZE });
      const rows = mapSmashEggSequences(data);
      setSequences(rows);
      setSequenceTotal(Number(data?.count ?? rows.length));
      setSequencePage(nextPage);
    } catch (error) {
      toast.error("Failed to load smash sequences", {
        description: error?.data?.detail || error?.message,
      });
    } finally {
      setSequenceLoading(false);
    }
  };

  const loadImportHistory = async (nextPage = historyPage) => {
    setHistoryLoading(true);
    try {
      const data = await adminApi.getSmashEggSequenceImports({ page: nextPage, page_size: HISTORY_PAGE_SIZE });
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
      const current = await adminApi.getSmashEggSequenceCurrent();
      downloadXlsx(`smash-sequence-${new Date().toISOString().slice(0, 10)}.xlsx`, buildCurrentSequenceExportRows(current));
    } catch (error) {
      toast.error("Failed to export smash sequence", {
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

  const openAdd = () => {
    setFormMode("add");
    setEditTarget(null);
    setView("form");
  };

  const openEdit = (reward) => {
    setFormMode("edit");
    setEditTarget(reward);
    setView("form");
  };

  const handleSave = async (data) => {
    try {
      if (formMode === "edit" && editTarget) {
        await adminApi.updateSmashEggItem(editTarget.uuid, buildItemPayload(data, data.image instanceof File));
        toast.success("Reward updated");
      } else {
        await adminApi.createSmashEggItem(buildItemPayload(data));
        toast.success("Reward added");
      }
      await loadData();
      setView("list");
    } catch (error) {
      toast.error(formMode === "edit" ? "Failed to update reward" : "Failed to add reward", {
        description: describeApiError(error),
      });
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget?.uuid) return;
    try {
      await adminApi.archiveSmashEggItem(archiveTarget.uuid);
      toast.success("Reward archived");
      setArchiveTarget(null);
      await loadData();
    } catch (error) {
      toast.error("Failed to archive reward", {
        description: error?.data?.detail || error?.message,
      });
    }
  };

  const handleSequenceSave = async ({ position, rewardId }) => {
    try {
      await adminApi.createSmashEggSequence(position, rewardId);
      toast.success("Smash sequence saved");
      setSequenceOpen(false);
      await loadSequences(sequencePage);
    } catch (error) {
      toast.error("Failed to save smash sequence", {
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
      toast.success(`Imported ${response?.success_count ?? 0} smash sequence position${response?.success_count === 1 ? "" : "s"}`);
    }
    loadSequences(1);
    loadImportHistory(1);
  };

  const confirmSequenceDelete = async () => {
    if (!sequenceDeleteTarget?.uuid) return;
    try {
      await adminApi.deleteSmashEggSequence(sequenceDeleteTarget.uuid);
      toast.success("Smash sequence deleted");
      setSequenceDeleteTarget(null);
      await loadSequences(sequencePage);
    } catch (error) {
      toast.error("Failed to delete smash sequence", {
        description: error?.data?.detail || error?.message,
      });
    }
  };

  const moveSequence = async (index, delta) => {
    const target = sequences[index];
    const swap = sequences[index + delta];
    if (!target || !swap) return;
    try {
      await adminApi.changeSmashEggSequencesOrder([
        { sequence_uuid: target.uuid, item_order: swap.item_order },
        { sequence_uuid: swap.uuid, item_order: target.item_order },
      ]);
      toast.success("Smash sequence reordered");
      await loadSequences(sequencePage);
    } catch (error) {
      toast.error("Failed to reorder smash sequence", {
        description: error?.data?.detail || error?.message,
      });
    }
  };

  const saveSettings = async (payload, successMessage) => {
    const response = await adminApi.updateSmashEggSettings(payload);
    const mappedSettings = mapSettings(response);
    setCostData(mappedSettings.cost);
    setStatusData(mappedSettings.status);
    toast.success(successMessage);
  };

  if (view === "form") {
    return (
      <RewardForm
        mode={formMode}
        initial={editTarget}
        onBack={() => setView("list")}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <h2 className="text-[26px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Rewards
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCostOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5"
          >
            <MaskIcon src={COINS_ICON} />
            Cost Setting
          </button>
          <button
            type="button"
            onClick={() => setStatusOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5"
          >
            <MaskIcon src={STATUS_ICON} />
            Game Status
          </button>
          <button
            type="button"
            onClick={() => setSequenceOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5"
          >
            <MaskIcon src={EGG_ICON} />
            Smash Sequence
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90"
            style={{ backgroundImage: GOLD_BG }}
          >
            <MaskIcon src={LEVEL_ICON} />
            Add Reward
          </button>
        </div>
      </div>

      <div className="px-2 pb-2">
        {loading ? (
          <div className="px-6 py-12 text-center text-[13px] text-white/50">Loading rewards...</div>
        ) : (
          <RewardsTable rewards={pageRewards} onEdit={openEdit} onArchive={setArchiveTarget} />
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
            Smash Sequences
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
          onViewDetails={(uuid) => router.push(`/admin/smash-egg/sequence-history?uuid=${uuid}`)}
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

      <SmashSequenceModal
        open={sequenceOpen}
        rewards={rewards}
        sequences={sequences}
        onClose={() => setSequenceOpen(false)}
        onSave={handleSequenceSave}
      />

      <ImportSequenceModal
        open={importOpen}
        title="Import Smash Sequence"
        rewards={rewards.map((r) => ({ id: r.numericId, uuid: r.uuid, name: r.name }))}
        existingCount={sequenceTotal}
        templateFilename="smash-sequence-template.csv"
        importFn={adminApi.importSmashEggSequence}
        onImported={handleSequenceImported}
        onClose={() => setImportOpen(false)}
      />

      <CostSettingModal
        open={costOpen}
        initial={costData}
        label="Token cost per Smash"
        onClose={() => setCostOpen(false)}
        onSave={async (payload) => {
          try {
            await saveSettings({ cost_per_smash: Number(payload.cost) }, "Cost setting saved");
          } catch (error) {
            toast.error("Failed to save cost setting", { description: error?.data?.detail || error?.message });
          }
        }}
      />

      <GameStatusModal
        open={statusOpen}
        initial={statusData.gameplay}
        onClose={() => setStatusOpen(false)}
        onSave={async (isOpen) => {
          try {
            await saveSettings(
              { game_status: isOpen ? 1 : 2, maintenance_mode: false },
              "Game status saved",
            );
          } catch (error) {
            toast.error("Failed to save game status", { description: error?.data?.detail || error?.message });
          }
        }}
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
        title="Delete smash sequence?"
        message={sequenceDeleteTarget ? `Delete sequence #${sequenceDeleteTarget.item_order} for ${sequenceDeleteTarget.item_name || "this reward"}?` : ""}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmSequenceDelete}
        onCancel={() => setSequenceDeleteTarget(null)}
      />
    </div>
  );
}
