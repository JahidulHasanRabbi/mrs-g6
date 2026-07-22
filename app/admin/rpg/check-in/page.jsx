"use client";

// /admin/rpg/check-in — Avatar check-in settings.
//
// GET  /avatar/check-in-settings/  → { check_in_terms, rewards: [day rows] }
// POST /avatar/check-in-settings/  → { check_in_terms?, day_settings: [...] }
//
// day_settings is a FULL replacement (days missing from the list are deleted),
// so every save posts all 7 rows. check_in_terms is only updated when sent, so
// day edits omit it and the terms modal sends it explicitly. This page is the
// single place check-in terms are edited (not duplicated on Game Settings).

import { useEffect, useState } from "react";
import ModalShell from "../../../components/admin/penalty-kick/ModalShell";
import { useToast } from "../../../components/admin/ui/Toast";
import { getAvatarCheckInSettings, updateAvatarCheckInSettings } from "../../../api/adminApi";
import {
  ActionButton,
  Card,
  CardHeader,
  EmptyRow,
  Field,
  ICONS,
  INPUT_BASE,
  MaskIcon,
  RowActions,
  StatusPill,
  TableShell,
  Thead,
  Toggle,
  apiErrorMessage,
} from "../../../components/admin/ui/GameUI";

const COLUMNS = [
  { label: "Day" },
  { label: "Battle Point Min" },
  { label: "Battle Point Max" },
  { label: "Multiplier" },
  { label: "Special" },
  { label: "Display Text" },
  { label: "Action", align: "right", width: 140 },
];

const defaultDay = (day) => ({
  day,
  battle_point_minimum: 0,
  battle_point_maximum: 0,
  is_special: false,
  multiplier: 1,
  display_text: "",
});

// Always present days 1..7 in order; the API list is authoritative where it
// has a row, defaults fill the rest (saving then creates them server-side).
function normalizeRewards(rewards) {
  const byDay = new Map((rewards || []).map((r) => [r.day, r]));
  return [1, 2, 3, 4, 5, 6, 7].map((day) => ({ ...defaultDay(day), ...(byDay.get(day) || {}) }));
}

function toDaySettings(rows) {
  return rows.map((r) => ({
    day: r.day,
    battle_point_minimum: Number(r.battle_point_minimum),
    battle_point_maximum: Number(r.battle_point_maximum),
    is_special: Boolean(r.is_special),
    multiplier: Number(r.multiplier),
    display_text: r.display_text || "",
  }));
}

function DayEditModal({ row, open, onClose, onSave, saving }) {
  const toast = useToast();
  const [form, setForm] = useState(defaultDay(1));

  useEffect(() => {
    if (!open || !row) return;
    setForm({
      battle_point_minimum: row.battle_point_minimum,
      battle_point_maximum: row.battle_point_maximum,
      is_special: Boolean(row.is_special),
      multiplier: row.multiplier,
      display_text: row.display_text || "",
    });
  }, [open, row]);

  const set = (key) => (v) => setForm((p) => ({ ...p, [key]: v }));

  const handleSave = () => {
    const min = Number(form.battle_point_minimum);
    const max = Number(form.battle_point_maximum);
    const mult = Number(form.multiplier);
    if (!Number.isInteger(min) || min < 0) return toast.warning("Minimum must be a whole number of at least 0");
    if (!Number.isInteger(max) || max < 0) return toast.warning("Maximum must be a whole number of at least 0");
    if (max < min) return toast.warning("Maximum must not be below minimum");
    if (!Number.isInteger(mult) || mult < 1) return toast.warning("Multiplier must be a whole number of at least 1");
    onSave({ ...row, ...form });
  };

  return (
    <ModalShell title={`Edit Day ${row?.day ?? ""}`} open={open} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Battle Point Minimum">
          <input
            type="number"
            min="0"
            step="1"
            value={form.battle_point_minimum}
            onChange={(e) => set("battle_point_minimum")(e.target.value)}
            className={INPUT_BASE}
          />
        </Field>
        <Field label="Battle Point Maximum">
          <input
            type="number"
            min="0"
            step="1"
            value={form.battle_point_maximum}
            onChange={(e) => set("battle_point_maximum")(e.target.value)}
            className={INPUT_BASE}
          />
        </Field>
        <Field label="Multiplier" hint="Claim amount = random(min, max) × multiplier">
          <input
            type="number"
            min="1"
            step="1"
            value={form.multiplier}
            onChange={(e) => set("multiplier")(e.target.value)}
            className={INPUT_BASE}
          />
        </Field>
        <Field label="Special Day">
          <div className="pt-2">
            <Toggle checked={form.is_special} onChange={set("is_special")} label={form.is_special ? "Yes" : "No"} />
          </div>
        </Field>
        <div className="col-span-2">
          <Field label="Display Text" hint="Optional — shown to members on the check-in calendar.">
            <input
              type="text"
              value={form.display_text}
              onChange={(e) => set("display_text")(e.target.value)}
              className={INPUT_BASE}
            />
          </Field>
        </div>
      </div>
    </ModalShell>
  );
}

function TermsModal({ open, terms, onClose, onSave, saving }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) return;
    setValue(terms ?? "");
  }, [open, terms]);

  return (
    <ModalShell title="Check-In Terms & Conditions" open={open} onClose={onClose} onSave={() => onSave(value)} saving={saving}>
      <Field label="Terms & Conditions" hint="Shown on the member check-in page.">
        <textarea
          rows={7}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Terms & conditions shown on the member check-in page"
          className={INPUT_BASE}
        />
      </Field>
    </ModalShell>
  );
}

export default function RpgCheckInSettingsPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const hydrate = (data) => {
    setRows(normalizeRewards(data?.rewards));
    setTerms(data?.check_in_terms ?? "");
  };

  useEffect(() => {
    getAvatarCheckInSettings()
      .then(hydrate)
      .catch((err) =>
        toast.error("Failed to load check-in settings", { description: apiErrorMessage(err, "Please refresh the page.") }),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveDay = async (updatedRow) => {
    setSaving(true);
    try {
      const nextRows = rows.map((r) => (r.day === updatedRow.day ? updatedRow : r));
      // Full replacement — always post all 7 days; terms untouched (omitted).
      const data = await updateAvatarCheckInSettings({ day_settings: toDaySettings(nextRows) });
      hydrate(data);
      setEditingDay(null);
      toast.success(`Day ${updatedRow.day} saved`);
    } catch (err) {
      toast.error("Failed to save day settings", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTerms = async (nextTerms) => {
    setSaving(true);
    try {
      const data = await updateAvatarCheckInSettings({
        check_in_terms: nextTerms,
        day_settings: toDaySettings(rows),
      });
      hydrate(data);
      setTermsOpen(false);
      toast.success("Check-in terms saved");
    } catch (err) {
      toast.error("Failed to save check-in terms", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Check-In Settings">
        <ActionButton icon={<MaskIcon src={ICONS.check} />} onClick={() => setTermsOpen(true)} disabled={loading}>
          Terms &amp; Conditions
        </ActionButton>
      </CardHeader>

      <div className="px-2 pb-2">
        <TableShell minWidth={860}>
          <Thead columns={COLUMNS} />
          <tbody>
            {loading ? (
              <EmptyRow colSpan={COLUMNS.length}>Loading check-in settings...</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={COLUMNS.length}>No check-in days configured.</EmptyRow>
            ) : (
              rows.map((r) => (
                <tr key={r.day} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] font-bold text-white">Day {r.day}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{Number(r.battle_point_minimum).toLocaleString("en-US")} BP</td>
                  <td className="px-6 py-5 text-[12px] text-white">{Number(r.battle_point_maximum).toLocaleString("en-US")} BP</td>
                  <td className="px-6 py-5 text-[12px] text-white">×{r.multiplier}</td>
                  <td className="px-6 py-5 text-[12px]">
                    <StatusPill active={Boolean(r.is_special)} activeLabel="Special" inactiveLabel="Normal" />
                  </td>
                  <td className="px-6 py-5 text-[12px] text-white">
                    {r.display_text || <span className="text-white/40">Auto</span>}
                  </td>
                  <td className="px-6 py-5">
                    <RowActions onEdit={() => setEditingDay(r)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </div>

      <div className="px-6 py-4">
        <p className="text-[12px] text-white/35">
          {terms ? `Terms: ${terms.slice(0, 120)}${terms.length > 120 ? "…" : ""}` : "No check-in terms set yet."}
        </p>
      </div>

      <DayEditModal
        row={editingDay}
        open={Boolean(editingDay)}
        saving={saving}
        onSave={handleSaveDay}
        onClose={() => setEditingDay(null)}
      />
      <TermsModal open={termsOpen} terms={terms} saving={saving} onSave={handleSaveTerms} onClose={() => setTermsOpen(false)} />
    </Card>
  );
}
