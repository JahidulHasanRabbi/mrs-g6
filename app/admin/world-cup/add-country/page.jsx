"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../components/admin/world-cup/FormChrome";
import {
  getWorldCupCountries,
  getWorldCupDummyCountry,
  createWorldCupDummyCountry,
  updateWorldCupDummyCountry,
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
        {countries.map((c) => (
          <option key={c.uuid} value={c.uuid} style={{ background: "#041502", color: "white" }}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

function AddCountryForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [countryOptions, setCountryOptions] = useState([]);
  const [form, setForm] = useState({
    countryUuid: "",
    totalPoints: "",
    totalUsers: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getWorldCupCountries().then((d) => {
      setCountryOptions(d.results ?? d ?? []);
    }).catch(() => {});

    if (editingUuid) {
      getWorldCupDummyCountry(editingUuid).then((d) => {
        setForm({
          countryUuid: d.country_uuid ?? "",
          totalPoints: String(d.total_points ?? ""),
          totalUsers: String(d.total_users ?? ""),
        });
      }).catch(() => {});
    }
  }, [editingUuid]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const toNum = (s) => Number(String(s).replace(/[,\s]/g, "")) || 0;

  const onSave = async () => {
    if (!form.countryUuid) { setError("Please select a country."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        country_uuid: form.countryUuid,
        total_points: toNum(form.totalPoints),
        total_users: toNum(form.totalUsers),
      };
      if (editingUuid) {
        await updateWorldCupDummyCountry(editingUuid, payload);
      } else {
        await createWorldCupDummyCountry(payload);
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
      title={editingUuid ? "Edit Country" : "Add Country"}
      onBack={() => router.push("/admin/world-cup")}
      onSave={onSave}
      saving={saving}
    >
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country</label>
          <CountrySelect value={form.countryUuid} onChange={set("countryUuid")} countries={countryOptions} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Points</label>
          <input type="text" value={form.totalPoints} onChange={set("totalPoints")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Users</label>
          <input type="text" value={form.totalUsers} onChange={set("totalUsers")} className={INPUT_BASE} />
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
