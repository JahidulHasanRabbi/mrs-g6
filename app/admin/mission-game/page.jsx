"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../components/admin/members/DataTable";
import MissionsTable from "../../components/admin/mission-game/MissionsTable";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import { archiveMission, getMissions, getMissionSettings, updateMissionSettings } from "../../api/adminApi";
import {
  MISSION_ACTION_LABELS,
  MISSION_CATEGORY_LABELS,
  MISSION_RESET_TYPE_LABELS,
  MISSION_TYPE_LABELS,
} from "../../config/missionOptions";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";
const PAGE_SIZE = 7;

function normalizeMission(m) {
  const rewardParts = [];
  const tokens = Number(m.reward_token_quantity ?? 0);
  const battlePoints = Number(m.reward_battle_point_quantity ?? 0);
  if (tokens > 0) rewardParts.push(`${tokens.toLocaleString("en-US")} Tokens`);
  if (battlePoints > 0) rewardParts.push(`${battlePoints.toLocaleString("en-US")} BP`);
  return {
    id: m.uuid,
    uuid: m.uuid,
    name: m.mission_name,
    category: MISSION_CATEGORY_LABELS[m.category] ?? m.category,
    description: m.description || "-",
    missionType: MISSION_TYPE_LABELS[m.mission_type] ?? m.mission_type,
    resetType: MISSION_RESET_TYPE_LABELS[m.reset_type] ?? m.reset_type,
    condition: MISSION_ACTION_LABELS[m.condition_action] ?? m.condition_action,
    reward: rewardParts.join(" + ") || "No reward",
    limitControl: m.limit_control == null ? "Unlimited" : m.limit_control,
    target: m.accumulate_target,
    _raw: m,
  };
}

function LevelIcon() {
  return (
    <span
      aria-hidden="true"
      className="block h-4 w-4 shrink-0 bg-current"
      style={{
        WebkitMaskImage: "url(/assets/admin/icons/icon-park-outline-level.svg)",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: "url(/assets/admin/icons/icon-park-outline-level.svg)",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

function PopOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="13" height="11" rx="2" />
      <path d="M8 20h13V9" />
    </svg>
  );
}

function MaintenanceToggle({ checked, onChange, saving }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.03] px-4 py-2">
      <span className="text-[13px] text-[#fbeed2]">Maintenance Mode</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={saving}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
          checked ? "bg-[#e9af41]" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[23px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

export default function MissionGamePage() {
  const router = useRouter();
  const [missions, setMissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadMissions = () => {
    setLoading(true);
    getMissions({ page, page_size: PAGE_SIZE })
      .then((data) => {
        const rows = data.results ?? data ?? [];
        setMissions(rows.map(normalizeMission));
        setTotal(data.count ?? rows.length);
      })
      .catch(() => {
        setMissions([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    getMissionSettings()
      .then((s) => setMaintenance(Boolean(s?.maintenance_mode)))
      .catch(() => {});
  }, []);

  const handleMaintenanceChange = async (value) => {
    setMaintenance(value);
    setSavingMaintenance(true);
    try {
      await updateMissionSettings({ maintenance_mode: value });
    } catch {
      setMaintenance(!value);
    } finally {
      setSavingMaintenance(false);
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget?.uuid) return;
    setArchiving(true);
    try {
      await archiveMission(archiveTarget.uuid);
      setArchiveTarget(null);
      loadMissions();
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <h2
          className="text-[26px] font-bold tracking-[-1px] text-white"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Missions
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <MaintenanceToggle
            checked={maintenance}
            onChange={handleMaintenanceChange}
            saving={savingMaintenance}
          />
          <button
            type="button"
            onClick={() => router.push("/admin/mission-game/pop-out")}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5"
          >
            <PopOutIcon />
            Pop-out Setting
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/mission-game/add")}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90"
            style={{ backgroundImage: GOLD_BG }}
          >
            <LevelIcon />
            Add Mission
          </button>
        </div>
      </div>

      <div className="px-2 pb-2">
        <MissionsTable
          missions={missions}
          loading={loading}
          onEdit={(m) => router.push(`/admin/mission-game/add?uuid=${m.uuid}`)}
          onArchive={setArchiveTarget}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-[10px] text-white/80">
          Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} Results
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive mission?"
        message={archiveTarget ? `Archive "${archiveTarget.name}"? Members lose any in-progress claim on it.` : ""}
        confirmLabel="Archive"
        tone="destructive"
        loading={archiving}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
