"use client";

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../../components/admin/members/DataTable";
import RewardsTable from "../../components/admin/smash-egg/RewardsTable";
import RewardForm from "../../components/admin/smash-egg/RewardForm";
import SmashSequenceModal from "../../components/admin/smash-egg/SmashSequenceModal";
import CostSettingModal from "../../components/admin/penalty-kick/CostSettingModal";
import GameStatusModal from "../../components/admin/penalty-kick/GameStatusModal";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../components/admin/ui/Toast";
import * as adminApi from "../../api/adminApi";
import { mapSmashEggItems, mapSmashEggSequences } from "../../api/responseMappers";

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
  return value;
}

function buildItemPayload(data, includeImage = true) {
  const payload = {
    reward_name: data.name,
    item_type: itemTypeToApi(data.itemType),
    unlimited: Boolean(data.unlimited),
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

export default function SmashEggPage() {
  const toast = useToast();
  const [rewards, setRewards] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState("list");
  const [formMode, setFormMode] = useState("add");
  const [editTarget, setEditTarget] = useState(null);
  const [sequenceOpen, setSequenceOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [costData, setCostData] = useState({ cost: 10 });
  const [statusData, setStatusData] = useState({ gameplay: true, maintenance: false });

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsResponse, sequencesResponse, settingsResponse] = await Promise.all([
        adminApi.getSmashEggItems(),
        adminApi.getSmashEggSequences(),
        adminApi.getSmashEggSettings(),
      ]);
      setRewards(mapSmashEggItems(itemsResponse));
      setSequences(mapSmashEggSequences(sequencesResponse));
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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(rewards.length / PAGE_SIZE));
  const pageRewards = useMemo(
    () => rewards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rewards, page],
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
        description: error?.data?.detail || error?.message,
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
      await loadData();
    } catch (error) {
      toast.error("Failed to save smash sequence", {
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

      <SmashSequenceModal
        open={sequenceOpen}
        rewards={rewards}
        sequences={sequences}
        onClose={() => setSequenceOpen(false)}
        onSave={handleSequenceSave}
      />

      <CostSettingModal
        open={costOpen}
        initial={costData}
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

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive reward?"
        message={archiveTarget ? `Archive ${archiveTarget.name}? This reward will be removed from the active list.` : ""}
        confirmLabel="Archive"
        tone="destructive"
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
