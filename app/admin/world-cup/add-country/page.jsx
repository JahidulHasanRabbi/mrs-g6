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

function AddCountryForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id");

  const { countries, upsertCountry } = useWorldCupSettings();
  const existing = editingId ? countries.find((c) => c.id === editingId) : null;

  const [form, setForm] = useState({
    id: editingId || "",
    country: "Brazil",
    rank: "3",
    totalPoints: "3,093",
    totalUsers: "12",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        id: existing.id,
        country: existing.country || "Brazil",
        rank: String(existing.rank ?? ""),
        totalPoints: String(existing.totalPoints ?? ""),
        totalUsers: String(existing.totalUsers ?? ""),
      });
    }
  }, [existing]);

  const setField = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const toNum = (s) => Number(String(s).replace(/[,\s#]/g, "")) || 0;

  const onSave = async () => {
    setSaving(true);
    upsertCountry({
      ...form,
      rank:        toNum(form.rank),
      totalPoints: toNum(form.totalPoints),
      totalUsers:  toNum(form.totalUsers),
    });
    await new Promise((r) => setTimeout(r, 200));
    setSaving(false);
    router.push("/admin/world-cup");
  };

  return (
    <FormChrome
      title={editingId ? "Edit Country" : "Add Country"}
      onBack={() => router.push("/admin/world-cup")}
      onSave={onSave}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country</label>
          <CountrySelect value={form.country} onChange={setField("country")} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Rank</label>
          <HashInput value={form.rank} onChange={setField("rank")} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Points</label>
          <input
            type="text"
            value={form.totalPoints}
            onChange={setField("totalPoints")}
            className={INPUT_BASE}
          />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Users</label>
          <input
            type="text"
            value={form.totalUsers}
            onChange={setField("totalUsers")}
            className={INPUT_BASE}
          />
        </div>
      </div>
    </FormChrome>
  );
}

export default function AddCountryPage() {
  return (
    <Suspense fallback={null}>
      <AddCountryForm />
    </Suspense>
  );
}
