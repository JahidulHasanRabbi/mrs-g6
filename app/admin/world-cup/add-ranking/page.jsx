"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../components/admin/world-cup/FormChrome";
import { useWorldCupSettings } from "../../../contexts/WorldCupSettingsContext";

const COUNTRIES = [
  "Brazil", "Argentina", "USA", "Germany", "England", "Japan", "Portugal", "Spain", "France", "Italy",
];

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#e9af41"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CountrySelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} appearance-none pr-10`}
      >
        {COUNTRIES.map((c) => (
          <option key={c} value={c} style={{ background: "#041502", color: "white" }}>
            {c}
          </option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

function HashInput({ value, onChange }) {
  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-4 text-[14px] text-[#e9af41]">#</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} pl-9`}
      />
    </div>
  );
}

function AddRankingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id");

  const { players, upsertPlayer } = useWorldCupSettings();
  const existing = editingId ? players.find((p) => p.id === editingId) : null;

  const [form, setForm] = useState({
    id: editingId || "",
    name: "Exclusive Rewards",
    country: "Brazil",
    totalPoints: "3,093",
    countryRank: "3",
    globalRank: "3",
    totalPrediction: "Brazil",
    totalWin: "12",
    winningStreak: "3",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        id: existing.id,
        name: existing.name || "",
        country: existing.country || "Brazil",
        totalPoints: String(existing.totalPoints ?? ""),
        countryRank: String(existing.countryRank ?? ""),
        globalRank: String(existing.globalRank ?? ""),
        totalPrediction: String(existing.totalPrediction ?? ""),
        totalWin: String(existing.totalWin ?? ""),
        winningStreak: String(existing.winningStreak ?? ""),
      });
    }
  }, [existing]);

  const setField = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const toNum = (s) => Number(String(s).replace(/[,\s#]/g, "")) || 0;

  const onSave = async () => {
    setSaving(true);
    upsertPlayer({
      ...form,
      totalPoints:     toNum(form.totalPoints),
      countryRank:     toNum(form.countryRank),
      globalRank:      toNum(form.globalRank),
      totalPrediction: toNum(form.totalPrediction),
      totalWin:        toNum(form.totalWin),
      winningStreak:   toNum(form.winningStreak),
    });
    await new Promise((r) => setTimeout(r, 200));
    setSaving(false);
    router.push("/admin/world-cup");
  };

  return (
    <FormChrome
      title={editingId ? "Edit Ranking" : "Add Ranking"}
      onBack={() => router.push("/admin/world-cup")}
      onSave={onSave}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Player Name</label>
          <input type="text" value={form.name} onChange={setField("name")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country</label>
          <CountrySelect value={form.country} onChange={setField("country")} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Points</label>
          <input type="text" value={form.totalPoints} onChange={setField("totalPoints")} className={INPUT_BASE} />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country Rank</label>
          <HashInput value={form.countryRank} onChange={setField("countryRank")} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Global Rank</label>
          <HashInput value={form.globalRank} onChange={setField("globalRank")} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Prediction</label>
          <input type="text" value={form.totalPrediction} onChange={setField("totalPrediction")} className={INPUT_BASE} />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Win</label>
          <input type="text" value={form.totalWin} onChange={setField("totalWin")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Winning Streak</label>
          <input type="text" value={form.winningStreak} onChange={setField("winningStreak")} className={INPUT_BASE} />
        </div>
      </div>
    </FormChrome>
  );
}

export default function AddRankingPage() {
  return (
    <Suspense fallback={null}>
      <AddRankingForm />
    </Suspense>
  );
}
