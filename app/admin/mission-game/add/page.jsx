"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createMission, getMission, updateMission } from "../../../api/adminApi";
import { apiErrorMessage } from "../../../components/admin/ui/GameUI";
import {
  MISSION_ACTION_OPTIONS,
  MISSION_CATEGORY_OPTIONS,
  MISSION_RESET_TYPE_OPTIONS,
  MISSION_TYPE_OPTIONS,
} from "../../../config/missionOptions";

import {
  DateInput,
  Field,
  GOLD_BG,
  INPUT_BASE,
  SectionTitle,
  Select,
  TimeInput,
  Toggle,
} from "../../../components/admin/mission-game/formControls";
import ConfirmDialog from "../../../components/admin/ui/ConfirmDialog";

const REWARD_TYPE_OPTIONS = [
  { value: 1, label: "KR Coins" },
  { value: 2, label: "Battle Point (BP)" },
];

const EMPTY_FORM = {
  missionName: "",
  category: 1,
  description: "",
  missionType: 1,
  resetType: 4,
  conditionAction: 1,
  timeBased: false,
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  accumulateTarget: 1,
  rewardType: 1,
  rewardQuantity: 0,
  limitControl: "",
};

function dateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

// Accepts "HH:MM[:SS]" or the time half of an ISO datetime; anything else
// (a bare date) has no time to read.
function timeOnly(value) {
  if (!value) return "";
  const text = String(value);
  const candidate = text.includes("T") ? text.split("T")[1] : text;
  return /^\d{2}:\d{2}/.test(candidate) ? candidate.slice(0, 5) : "";
}

function toForm(api) {
  const battlePointQuantity = Number(api.reward_battle_point_quantity ?? 0);
  const rewardType = battlePointQuantity > 0 ? 2 : 1;
  return {
    missionName: api.mission_name ?? "",
    category: api.category ?? 1,
    description: api.description ?? "",
    missionType: api.mission_type ?? 1,
    resetType: api.reset_type ?? 4,
    conditionAction: api.condition_action ?? 1,
    timeBased: !!api.is_time_based,
    startDate: dateOnly(api.start_date),
    startTime: timeOnly(api.start_time ?? api.start_date),
    endDate: dateOnly(api.end_date),
    endTime: timeOnly(api.end_time ?? api.end_date),
    accumulateTarget: api.accumulate_target ?? 1,
    rewardType,
    rewardQuantity:
      rewardType === 2
        ? battlePointQuantity
        : Number(api.reward_token_quantity ?? 0),
    limitControl: api.limit_control ?? "",
  };
}

// The backend field carries the whole moment now (date + time), not a bare
// date — there is no separate start_time/end_time on the model.
function combineDateTime(date, time) {
  if (!date) return null;
  return `${date}T${time || "00:00"}:00`;
}

function toPayload(form) {
  const rewardQuantity = Math.max(0, Number(form.rewardQuantity) || 0);
  const isBattlePointReward = Number(form.rewardType) === 2;
  const payload = {
    mission_name: form.missionName.trim(),
    category: Number(form.category),
    // The API rejects a null description ("This field may not be null"), so an
    // empty box sends "" rather than null.
    description: form.description.trim(),
    mission_type: Number(form.missionType),
    reset_type: Number(form.resetType),
    condition_action: Number(form.conditionAction),
    is_time_based: !!form.timeBased,
    accumulate_target: Math.max(1, Number(form.accumulateTarget) || 1),
    reward_token_quantity: isBattlePointReward ? 0 : rewardQuantity,
    reward_battle_point_quantity: isBattlePointReward ? rewardQuantity : 0,
    limit_control: form.limitControl === "" ? null : Math.max(1, Number(form.limitControl) || 1),
  };
  if (form.timeBased) {
    payload.start_date = combineDateTime(form.startDate, form.startTime);
    payload.end_date = combineDateTime(form.endDate, form.endTime);
  }
  return payload;
}

function AddMissionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingUuid = searchParams.get("uuid") || null;
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingUuid) return;
    setLoading(true);
    getMission(editingUuid)
      .then((data) => setForm(toForm(data)))
      .catch((err) => setError(apiErrorMessage(err, "Failed to load mission.")))
      .finally(() => setLoading(false));
  }, [editingUuid]);

  const set = (key) => (v) => setForm((p) => ({ ...p, [key]: v }));

  const handleSaveClick = () => {
    setError("");
    if (!form.missionName.trim()) {
      setError("Mission name is required.");
      return;
    }
    if (form.timeBased && (!form.startDate || !form.endDate)) {
      setError("Start date and end date are required for time based missions.");
      return;
    }
    setConfirmingSave(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingUuid) await updateMission(editingUuid, payload);
      else await createMission(payload);
      router.push("/admin/mission-game");
    } catch (err) {
      setConfirmingSave(false);
      setError(apiErrorMessage(err, "Failed to save mission."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
      <h2
        className="mb-6 bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent"
        style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}
      >
        {editingUuid ? "Edit Mission" : "Add Mission"}
      </h2>

      {error && <p className="mb-4 rounded-[8px] border border-red-500/40 bg-red-500/10 px-4 py-2 text-[13px] text-red-200">{error}</p>}
      {loading ? <p className="py-8 text-center text-[13px] text-white/60">Loading mission...</p> : (
        <>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-white">Mission Name</label>
              <input type="text" value={form.missionName} onChange={(e) => set("missionName")(e.target.value)} className={INPUT_BASE} />
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-white">Mission Category</label>
              <Select value={form.category} onChange={set("category")} options={MISSION_CATEGORY_OPTIONS} />
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-white">Description</label>
              <input type="text" value={form.description} onChange={(e) => set("description")(e.target.value)} className={INPUT_BASE} />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-white">Mission Type</label>
              <Select value={form.missionType} onChange={set("missionType")} options={MISSION_TYPE_OPTIONS} />
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-white">Reset Type</label>
              <Select value={form.resetType} onChange={set("resetType")} options={MISSION_RESET_TYPE_OPTIONS} />
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Mission Target</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-white">Action</label>
                <Select value={form.conditionAction} onChange={set("conditionAction")} options={MISSION_ACTION_OPTIONS} />
              </div>
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-white">Accumulate Target</label>
                <input type="number" min="1" value={form.accumulateTarget} onChange={(e) => set("accumulateTarget")(e.target.value)} className={INPUT_BASE} />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Condition Builder</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <div>
                <label className="mb-4 block text-[14px] font-semibold text-white">Time Based</label>
                <Toggle checked={form.timeBased} onChange={set("timeBased")} label="Active" />
              </div>
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-white">Start Date</label>
                <DateInput value={form.startDate} onChange={set("startDate")} disabled={!form.timeBased} />
              </div>
              <Field label="Start Time">
                <TimeInput value={form.startTime} onChange={set("startTime")} disabled={!form.timeBased} />
              </Field>
              <div className="hidden md:block" aria-hidden="true" />
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-white">End Date</label>
                <DateInput value={form.endDate} onChange={set("endDate")} disabled={!form.timeBased} />
              </div>
              <Field label="End Time">
                <TimeInput value={form.endTime} onChange={set("endTime")} disabled={!form.timeBased} />
              </Field>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Reward</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-white">Reward Type</label>
                <Select value={form.rewardType} onChange={set("rewardType")} options={REWARD_TYPE_OPTIONS} />
              </div>
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-white">Reward Quantity</label>
                <input type="number" min="0" value={form.rewardQuantity} onChange={(e) => set("rewardQuantity")(e.target.value)} className={INPUT_BASE} />
              </div>
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-white">Limit Control</label>
                <input type="number" min="1" placeholder="Unlimited" value={form.limitControl} onChange={(e) => set("limitControl")(e.target.value)} className={INPUT_BASE} />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/mission-game")}
          disabled={saving}
          className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={saving || loading}
          className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundImage: GOLD_BG }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmingSave}
        title={editingUuid ? "Update mission?" : "Create mission?"}
        message={
          editingUuid
            ? `Save these changes to "${form.missionName}"? Members already in progress on it keep their current progress.`
            : `Create the mission "${form.missionName}"? It becomes available to members immediately.`
        }
        confirmLabel={editingUuid ? "Save Changes" : "Create"}
        tone="primary"
        loading={saving}
        onConfirm={handleSave}
        onCancel={() => setConfirmingSave(false)}
      />
    </div>
  );
}

export default function AddMissionPage() {
  return (
    <Suspense fallback={null}>
      <AddMissionForm />
    </Suspense>
  );
}
