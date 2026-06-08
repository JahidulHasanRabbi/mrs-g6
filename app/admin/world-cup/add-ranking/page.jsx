"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../components/admin/world-cup/FormChrome";
import { normalizeCountryOptions } from "../../../components/admin/world-cup/countryOptions";
import {
  getWorldCupCountries,
  getWorldCupDummyPlayer,
  createWorldCupDummyPlayer,
  updateWorldCupDummyPlayer,
} from "../../../api/adminApi";

function ChevronIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CountrySelect({ value, onChange, countries }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} appearance-none pr-10`}
      >
        <option value="" style={{ background: "#041502", color: "white" }}>— Select country —</option>
        {countries.map((c) => {
          const countryValue = c.id ?? c.country ?? c.uuid;
          return (
            <option key={countryValue} value={countryValue} style={{ background: "#041502", color: "white" }}>
              {c.name}
            </option>
          );
        })}
      </select>
      <ChevronIcon />
    </div>
  );
}

function AddRankingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [countryOptions, setCountryOptions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    countryUuid: "",
    totalPoints: "",
    totalPrediction: "",
    totalWin: "",
    winningStreak: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getWorldCupCountries().then((d) => {
      setCountryOptions(normalizeCountryOptions(d));
    }).catch(() => {
      setCountryOptions(normalizeCountryOptions([]));
    });

    if (editingUuid) {
      getWorldCupDummyPlayer(editingUuid).then((d) => {
        setForm({
          name: d.player_name ?? "",
          countryUuid: d.country ?? d.country_uuid ?? "",
          totalPoints: String(d.total_points ?? ""),
          totalPrediction: String(d.total_prediction ?? ""),
          totalWin: String(d.total_win ?? ""),
          winningStreak: String(d.winning_streak ?? ""),
        });
      }).catch(() => {});
    }
  }, [editingUuid]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const toNum = (s) => Number(String(s).replace(/[,\s#]/g, "")) || 0;

  const onSave = async () => {
    if (!form.name) { setError("Player name is required."); return; }
    if (!form.countryUuid) { setError("Please select a country."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        player_name: form.name,
        country: form.countryUuid,
        total_points: toNum(form.totalPoints),
        total_prediction: toNum(form.totalPrediction),
        total_win: toNum(form.totalWin),
        winning_streak: toNum(form.winningStreak),
      };
      if (editingUuid) {
        await updateWorldCupDummyPlayer(editingUuid, payload);
      } else {
        await createWorldCupDummyPlayer(payload);
      }
      router.push("/admin/world-cup");
    } catch (e) {
      setError(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormChrome
      title={editingUuid ? "Edit Ranking" : "Add Ranking"}
      onBack={() => router.push("/admin/world-cup")}
      onSave={onSave}
      saving={saving}
    >
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Player Name</label>
          <input type="text" value={form.name} onChange={set("name")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country</label>
          <CountrySelect value={form.countryUuid} onChange={set("countryUuid")} countries={countryOptions} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Points</label>
          <input type="text" value={form.totalPoints} onChange={set("totalPoints")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Prediction</label>
          <input type="text" value={form.totalPrediction} onChange={set("totalPrediction")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Win</label>
          <input type="text" value={form.totalWin} onChange={set("totalWin")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Winning Streak</label>
          <input type="text" value={form.winningStreak} onChange={set("winningStreak")} className={INPUT_BASE} />
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
