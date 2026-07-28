"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createMission, getMission, updateMission } from "../../../api/adminApi";
import {
  MISSION_ACTION_OPTIONS,
  MISSION_CATEGORY_OPTIONS,
  MISSION_RESET_TYPE_OPTIONS,
  MISSION_TYPE_OPTIONS,
} from "../../../config/missionOptions";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";
const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";
const REWARD_TYPE_OPTIONS = [
  { value: 1, label: "Token" },
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
  endDate: "",
  accumulateTarget: 1,
  rewardType: 1,
  rewardQuantity: 0,
  limitControl: "",
};

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[14px] text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${
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

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${INPUT_BASE} appearance-none pr-10`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

function DateInput({ value, onChange, disabled }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${INPUT_BASE} [color-scheme:dark] disabled:opacity-40`}
    />
  );
}

function SectionTitle({ children }) {
  return (
    <h3
      className="mb-4 mt-2 bg-clip-text text-[18px] font-bold text-transparent"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}
    >
      {children}
    </h3>
  );
}

function dateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
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
    endDate: dateOnly(api.end_date),
    accumulateTarget: api.accumulate_target ?? 1,
    rewardType,
    rewardQuantity:
      rewardType === 2
        ? battlePointQuantity
        : Number(api.reward_token_quantity ?? 0),
    limitControl: api.limit_control ?? "",
  };
}

function toPayload(form) {
  const rewardQuantity = Math.max(0, Number(form.rewardQuantity) || 0);
  const isBattlePointReward = Number(form.rewardType) === 2;
  const payload = {
    mission_name: form.missionName.trim(),
    category: Number(form.category),
    description: form.description.trim() || null,
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
    payload.start_date = form.startDate;
    payload.end_date = form.endDate;
  }
  return payload;
}

function AddMissionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingUuid = searchParams.get("uuid") || null;
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingUuid) return;
    setLoading(true);
    getMission(editingUuid)
      .then((data) => setForm(toForm(data)))
      .catch((err) => setError(err?.data?.detail || err?.message || "Failed to load mission."))
      .finally(() => setLoading(false));
  }, [editingUuid]);

  const set = (key) => (v) => setForm((p) => ({ ...p, [key]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.missionName.trim()) {
      setError("Mission name is required.");
      return;
    }
    if (form.timeBased && (!form.startDate || !form.endDate)) {
      setError("Start date and end date are required for time based missions.");
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingUuid) await updateMission(editingUuid, payload);
      else await createMission(payload);
      router.push("/admin/mission-game");
    } catch (err) {
      setError(err?.data?.detail || err?.data?.error || err?.message || "Failed to save mission.");
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
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-white">End Date</label>
                <DateInput value={form.endDate} onChange={set("endDate")} disabled={!form.timeBased} />
              </div>
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
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundImage: GOLD_BG }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
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
