"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import { normalizeMatchCountryOptions } from "../../../../components/admin/world-cup/countryOptions";
import {
  getWorldCupMatchCountries,
  getWorldCupMatch,
  createWorldCupMatch,
  updateWorldCupMatch,
  settleWorldCupMatch,
} from "../../../../api/adminApi";

// API status: 1=Upcoming, 2=Closed, 3=Settled (ended via settle endpoint)
const STATUS_OPTIONS = [
  { value: 1, label: "Upcoming" },
  { value: 2, label: "Closed" },
];

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
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT_BASE} appearance-none pr-10`}>
        {placeholder !== undefined && (
          <option value="" style={{ background: "#041502", color: "white" }}>{placeholder}</option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>{o.label}</option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

function CountrySelect({ value, onChange, countries, placeholder }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT_BASE} appearance-none pr-10`}>
        {placeholder && <option value="" style={{ background: "#041502", color: "white" }}>{placeholder}</option>}
        {countries.map((c) => {
          const countryValue = c.id ?? c.country ?? c.uuid;
          return (
            <option key={countryValue} value={countryValue} style={{ background: "#041502", color: "white" }}>{c.name}</option>
          );
        })}
      </select>
      <ChevronIcon />
    </div>
  );
}

function countryValue(country) {
  return country?.id ?? country?.country ?? country?.uuid;
}

function MatchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [countryOptions, setCountryOptions] = useState([]);
  const [form, setForm] = useState({
    groupLabel: "",
    team1Uuid: "",
    team2Uuid: "",
    date: "",
    timeH: "12",
    timeM: "00",
    status: 1,
    winnerUuid: "",
  });
  const [isSettled, setIsSettled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getWorldCupMatchCountries().then((d) => setCountryOptions(normalizeMatchCountryOptions(d))).catch(() => {
      setCountryOptions(normalizeMatchCountryOptions([]));
    });

    if (editingUuid) {
      getWorldCupMatch(editingUuid).then((m) => {
        const kickoff = m.kickoff_at ? new Date(m.kickoff_at) : null;
        setIsSettled(m.status === 3);
        setForm({
          groupLabel: m.group_label ?? "",
          team1Uuid: m.team_home ?? m.team_home_uuid ?? "",
          team2Uuid: m.team_away ?? m.team_away_uuid ?? "",
          date: kickoff ? kickoff.toISOString().slice(0, 10) : "",
          timeH: kickoff ? String(kickoff.getHours()).padStart(2, "0") : "12",
          timeM: kickoff ? String(kickoff.getMinutes()).padStart(2, "0") : "00",
          status: m.status === 3 ? 2 : (m.status ?? 1),
          winnerUuid: m.winner ?? m.winner_uuid ?? "",
        });
      }).catch(() => {});
    }
  }, [editingUuid]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));
  const setTeam = (key, otherKey) => (v) => {
    const nextValue = typeof v === "object" && v?.target ? v.target.value : v;
    setForm((p) => {
      const otherValue = String(p[otherKey]) === String(nextValue) ? "" : p[otherKey];
      const nextTeam1 = key === "team1Uuid" ? nextValue : otherValue;
      const nextTeam2 = key === "team2Uuid" ? nextValue : otherValue;
      const winnerStillValid =
        String(p.winnerUuid) === "0" ||
        String(p.winnerUuid) === String(nextTeam1) ||
        String(p.winnerUuid) === String(nextTeam2);
      return {
        ...p,
        [key]: nextValue,
        [otherKey]: otherValue,
        winnerUuid: winnerStillValid ? p.winnerUuid : "",
      };
    });
  };

  const buildKickoff = () => {
    if (!form.date) return null;
    return `${form.date}T${String(form.timeH).padStart(2, "0")}:${String(form.timeM).padStart(2, "0")}:00`;
  };

  const onSave = async () => {
    if (!form.team1Uuid || !form.team2Uuid) { setError("Both teams are required."); return; }
    if (!form.date) { setError("Date is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        team_home: Number(form.team1Uuid),
        team_away: Number(form.team2Uuid),
        group_label: form.groupLabel || undefined,
        kickoff_at: buildKickoff(),
        status: Number(form.status),
      };

      let savedUuid = editingUuid;
      if (editingUuid) {
        await updateWorldCupMatch(editingUuid, payload);
      } else {
        const result = await createWorldCupMatch(payload);
        savedUuid = result.uuid;
      }

      // If user picked a winner, settle the match. Backend requires the match
      // to be closed before a winner can be declared.
      if (form.winnerUuid !== "" && savedUuid && Number(form.status) === 2) {
        await settleWorldCupMatch(savedUuid, form.winnerUuid);
      }

      router.push("/admin/world-cup/predictions");
    } catch (e) {
      setError(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // Teams available in the winner dropdown (only when we have both teams).
  const winnerOptions = countryOptions.filter(
    (c) => String(countryValue(c)) === String(form.team1Uuid) || String(countryValue(c)) === String(form.team2Uuid),
  );
  const team1Options = countryOptions.filter((c) => String(countryValue(c)) !== String(form.team2Uuid));
  const team2Options = countryOptions.filter((c) => String(countryValue(c)) !== String(form.team1Uuid));

  return (
    <FormChrome
      title={editingUuid ? "Edit Match" : "Add Match"}
      onBack={() => router.push("/admin/world-cup/predictions")}
      onSave={onSave}
      saving={saving}
    >
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {isSettled && (
        <p className="mb-4 text-sm text-yellow-400">This match is settled. Editing is limited.</p>
      )}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Group Label</label>
          <input type="text" placeholder="e.g. Group A" value={form.groupLabel} onChange={set("groupLabel")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country 1 (Home)</label>
          <CountrySelect value={form.team1Uuid} onChange={setTeam("team1Uuid", "team2Uuid")} countries={team1Options} placeholder="— Select —" />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country 2 (Away)</label>
          <CountrySelect value={form.team2Uuid} onChange={setTeam("team2Uuid", "team1Uuid")} countries={team2Options} placeholder="— Select —" />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Date</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input type="date" value={form.date} onChange={set("date")} className={`${INPUT_BASE} pl-10 [color-scheme:dark]`} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Time</label>
          <div className={`${INPUT_BASE} flex items-center gap-2 px-3 py-2.5`}>
            <input type="number" min="0" max="23" value={form.timeH} onChange={(e) => set("timeH")(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} className="w-12 bg-transparent text-center text-[14px] text-white focus:outline-none" />
            <span className="text-white/60">:</span>
            <input type="number" min="0" max="59" value={form.timeM} onChange={(e) => set("timeM")(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} className="w-12 bg-transparent text-center text-[14px] text-white focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Status</label>
          <Select value={form.status} onChange={(v) => setForm((p) => ({ ...p, status: Number(v) }))} options={STATUS_OPTIONS} />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Declare Winner (settles match)</label>
          <CountrySelect
            value={form.winnerUuid}
            onChange={Number(form.status) === 2 ? set("winnerUuid") : () => {}}
            countries={[{ id: 0, name: "Draw" }, ...winnerOptions]}
            placeholder="— No winner yet —"
          />
          <p className="mt-2 text-[11px] leading-[16px] text-white/55">
            Match status must be Closed before declaring a winner.
          </p>
        </div>
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
