"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import {
  getWorldCupCountries,
  getWorldCupMatch,
  createWorldCupMatch,
  updateWorldCupMatch,
  settleWorldCupMatch,
} from "../../../../api/adminApi";

// API status: 1=Upcoming, 2=Closed (ongoing), 3=Settled (ended via settle endpoint)
const STATUS_OPTIONS = [
  { value: 1, label: "Upcoming" },
  { value: 2, label: "Ongoing" },
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
        {countries.map((c) => (
          <option key={c.uuid} value={c.uuid} style={{ background: "#041502", color: "white" }}>{c.name}</option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
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
    getWorldCupCountries().then((d) => setCountryOptions(d.results ?? d ?? [])).catch(() => {});

    if (editingUuid) {
      getWorldCupMatch(editingUuid).then((m) => {
        const kickoff = m.kickoff_at ? new Date(m.kickoff_at) : null;
        setIsSettled(m.status === 3);
        setForm({
          groupLabel: m.group_label ?? "",
          team1Uuid: m.team_home_uuid ?? "",
          team2Uuid: m.team_away_uuid ?? "",
          date: kickoff ? kickoff.toISOString().slice(0, 10) : "",
          timeH: kickoff ? String(kickoff.getHours()).padStart(2, "0") : "12",
          timeM: kickoff ? String(kickoff.getMinutes()).padStart(2, "0") : "00",
          status: m.status === 3 ? 2 : (m.status ?? 1),
          winnerUuid: m.winner_uuid ?? "",
        });
      }).catch(() => {});
    }
  }, [editingUuid]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

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
        team_home_uuid: form.team1Uuid,
        team_away_uuid: form.team2Uuid,
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

      // If user picked a winner, settle the match.
      if (form.winnerUuid && savedUuid) {
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
    (c) => c.uuid === form.team1Uuid || c.uuid === form.team2Uuid,
  );

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
          <CountrySelect value={form.team1Uuid} onChange={set("team1Uuid")} countries={countryOptions} placeholder="— Select —" />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country 2 (Away)</label>
          <CountrySelect value={form.team2Uuid} onChange={set("team2Uuid")} countries={countryOptions} placeholder="— Select —" />
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
            onChange={set("winnerUuid")}
            countries={winnerOptions}
            placeholder="— No winner yet —"
          />
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
