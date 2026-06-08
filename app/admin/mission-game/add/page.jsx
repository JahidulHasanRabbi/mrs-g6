"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";

const MISSION_CATEGORIES = [
  { value: "free_credit",   label: "Free Credit" },
  { value: "min_withdraw",  label: "Min withdraw" },
  { value: "max_withdraw",  label: "Max withdraw" },
  { value: "prize",         label: "Prize" },
  { value: "token",         label: "Token" },
];

const MISSION_TYPES = [
  { value: "repeatable",    label: "Repeatable" },
  { value: "one_time",      label: "One Time" },
];

const RESET_TYPES = [
  { value: "daily",         label: "Daily" },
  { value: "weekly",        label: "Weekly" },
  { value: "monthly",       label: "Monthly" },
];

const ACTIONS = [
  { value: "",              label: "Action" },
  { value: "login",         label: "Login" },
  { value: "deposit",       label: "Deposit" },
  { value: "play",          label: "Play game" },
];

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
        onChange={(e) => onChange(e.target.value)}
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

function DateInput({ value, onChange }) {
  return (
    <div className="relative">
      <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} pl-10 [color-scheme:dark]`}
      />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3
      className="mb-4 mt-2 bg-clip-text text-[18px] font-bold text-transparent"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundImage: "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)",
      }}
    >
      {children}
    </h3>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AddMissionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "BMW M3",
    category: "free_credit",
    description: "This is a mission",
    missionType: "repeatable",
    resetType: "weekly",
    action: "",
    accumulate: true,
    target: 23,
    timeBased: true,
    startDate: "2026-06-03",
    endDate: "2026-06-20",
    tokenQuantity: "3,000",
    limitControl: "300",
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (v) => setForm((p) => ({ ...p, [key]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    router.push("/admin/mission-game");
  };

  return (
    <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
      <h2
        className="mb-6 bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          backgroundImage: "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)",
        }}
      >
        Add Mission
      </h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Mission Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            className={INPUT_BASE}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Mission Category</label>
          <Select value={form.category} onChange={set("category")} options={MISSION_CATEGORIES} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            className={INPUT_BASE}
          />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Mission Type</label>
          <Select value={form.missionType} onChange={set("missionType")} options={MISSION_TYPES} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Reset Type</label>
          <Select value={form.resetType} onChange={set("resetType")} options={RESET_TYPES} />
        </div>
        <div />
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <SectionTitle>Mission Target</SectionTitle>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Action</label>
            <Select value={form.action} onChange={set("action")} options={ACTIONS} />
          </div>
          <div>
            <label className="mb-4 block text-[14px] font-semibold text-white">Accumulate</label>
            <Toggle
              checked={form.accumulate}
              onChange={set("accumulate")}
              label="Active"
            />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Set Target</label>
            <input
              type="number"
              value={form.target}
              onChange={(e) => set("target")(Number(e.target.value))}
              className={INPUT_BASE}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <SectionTitle>Condition Builder</SectionTitle>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
          <div>
            <label className="mb-4 block text-[14px] font-semibold text-white">Time Based</label>
            <Toggle
              checked={form.timeBased}
              onChange={set("timeBased")}
              label="Active"
            />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Start Date</label>
            <DateInput value={form.startDate} onChange={set("startDate")} />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">End Date</label>
            <DateInput value={form.endDate} onChange={set("endDate")} />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <SectionTitle>Reward</SectionTitle>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Token Quantity</label>
            <input
              type="text"
              value={form.tokenQuantity}
              onChange={(e) => set("tokenQuantity")(e.target.value)}
              className={INPUT_BASE}
            />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Limit Control</label>
            <input
              type="text"
              value={form.limitControl}
              onChange={(e) => set("limitControl")(e.target.value)}
              className={INPUT_BASE}
            />
          </div>
          <div />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/mission-game")}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          <BackIcon />
          Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundImage: GOLD_BG }}
        >
          <CheckIcon />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
