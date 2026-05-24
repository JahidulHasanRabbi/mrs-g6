"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import { useWorldCupSettings } from "../../../../contexts/WorldCupSettingsContext";

const COUNTRIES = [
  "Brazil", "Germany", "Argentina", "USA", "England", "Japan", "Portugal", "Spain", "France", "Italy",
];

const STATUS_OPTIONS = ["Ongoing", "Upcoming", "Ended"];

function ChevronIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} appearance-none pr-10`}
      >
        {placeholder !== undefined && (
          <option value="" style={{ background: "#041502", color: "white" }}>{placeholder}</option>
        )}
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#041502", color: "white" }}>{o}</option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

function MatchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id");

  const { matches, upsertMatch } = useWorldCupSettings();
  const existing = editingId ? matches.find((m) => m.id === editingId) : null;

  const [form, setForm] = useState({
    id: editingId || "",
    matchNo: "3",
    team1: "Germany",
    team2: "Brazil",
    date: "2026-06-03",
    timeH: "03",
    timeM: "20",
    predictionA: "30",
    predictionB: "70",
    status: "Ongoing",
    winner: "Brazil",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      const [hh = "03", mm = "00"] = (existing.time || "03:00").split(":");
      setForm({
        id: existing.id,
        matchNo: String(existing.matchNo ?? ""),
        team1: existing.team1 || "",
        team2: existing.team2 || "",
        date: existing.date || "",
        timeH: hh.padStart(2, "0"),
        timeM: mm.padStart(2, "0"),
        predictionA: String(existing.predictionA ?? ""),
        predictionB: String(existing.predictionB ?? ""),
        status: existing.status || "Ongoing",
        winner: existing.winner || "",
      });
    }
  }, [existing]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const onSave = async () => {
    setSaving(true);
    upsertMatch({
      id: form.id,
      matchNo: Number(form.matchNo) || 0,
      team1: form.team1,
      team2: form.team2,
      date: form.date,
      time: `${String(form.timeH).padStart(2, "0")}:${String(form.timeM).padStart(2, "0")}`,
      predictionA: Number(form.predictionA) || 0,
      predictionB: Number(form.predictionB) || 0,
      status: form.status,
      winner: form.status === "Ended" ? form.winner : "",
    });
    await new Promise((r) => setTimeout(r, 200));
    setSaving(false);
    router.push("/admin/world-cup/predictions");
  };

  return (
    <FormChrome
      title={editingId ? "Edit Match" : "Add Match"}
      onBack={() => router.push("/admin/world-cup/predictions")}
      onSave={onSave}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Match No.</label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-4 text-[14px] text-[#e9af41]">#</span>
            <input type="number" min="1" value={form.matchNo} onChange={set("matchNo")} className={`${INPUT_BASE} pl-9`} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country 1</label>
          <Select value={form.team1} onChange={set("team1")} options={COUNTRIES} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country 2</label>
          <Select value={form.team2} onChange={set("team2")} options={COUNTRIES} />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Date</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input type="date" value={form.date} onChange={set("date")} className={`${INPUT_BASE} pl-10 [color-scheme:dark]`} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Time</label>
          <div className={`${INPUT_BASE} flex items-center gap-2 px-3 py-2.5`}>
            <input
              type="number"
              min="0"
              max="23"
              value={form.timeH}
              onChange={(e) => set("timeH")(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
              className="w-12 bg-transparent text-center text-[14px] text-white focus:outline-none"
            />
            <span className="text-white/60">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={form.timeM}
              onChange={(e) => set("timeM")(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
              className="w-12 bg-transparent text-center text-[14px] text-white focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Prediction</label>
          <div className={`${INPUT_BASE} flex items-center gap-2 px-3 py-2.5`}>
            <span className="text-[#e9af41]">%</span>
            <input
              type="number"
              min="0"
              max="100"
              value={form.predictionA}
              onChange={set("predictionA")}
              className="w-14 bg-transparent text-center text-[14px] text-white focus:outline-none"
            />
            <span className="text-white/60">:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={form.predictionB}
              onChange={set("predictionB")}
              className="w-14 bg-transparent text-center text-[14px] text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Status</label>
          <Select value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Winner</label>
          <Select
            value={form.winner}
            onChange={set("winner")}
            options={[form.team1, form.team2].filter(Boolean)}
            placeholder="—"
          />
        </div>
        <div />
      </div>
    </FormChrome>
  );
}

export default function AddMatchPage() {
  return (
    <Suspense fallback={null}>
      <MatchForm />
    </Suspense>
  );
}
