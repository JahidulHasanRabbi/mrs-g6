"use client";

// /admin/rpg/bosses — Boss catalog.
// Fixed set of 4 bosses (one per planet, seeded by the backend). No create or
// archive endpoint: admins re-balance stats and toggle is_active (inactive
// bosses are hidden from members). planet is immutable.

import { useEffect, useState } from "react";
import { Pagination } from "../../../components/admin/members/DataTable";
import ModalShell from "../../../components/admin/penalty-kick/ModalShell";
import { useToast } from "../../../components/admin/ui/Toast";
import { getAvatarBosses, updateAvatarBoss } from "../../../api/adminApi";
import {
  BOSS_NAME_BY_PLANET,
  EQUIPMENT_SLOT_LABELS,
  EQUIPMENT_SLOT_OPTIONS,
  PLANET_LABELS,
} from "../../../config/avatarOptions";
import {
  Card,
  CardHeader,
  EmptyRow,
  Field,
  INPUT_BASE,
  ResultsFooter,
  RowActions,
  Select,
  StatusPill,
  TableShell,
  Thead,
  Toggle,
  apiErrorMessage,
} from "../../../components/admin/ui/GameUI";

const PAGE_SIZE = 7;

const COLUMNS = [
  { label: "Planet" },
  { label: "Boss" },
  { label: "Power Required" },
  { label: "HP" },
  { label: "Dice Threshold" },
  { label: "Equipment Reward" },
  { label: "Status" },
  { label: "Action", align: "right", width: 140 },
];

function EditModal({ boss, open, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    power_required: 0,
    hp: 0,
    dice_threshold: 1,
    equipment_reward_slot: 1,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !boss) return;
    setForm({
      power_required: boss.power_required ?? 0,
      hp: boss.hp ?? 0,
      dice_threshold: boss.dice_threshold ?? 1,
      equipment_reward_slot: boss.equipment_reward_slot ?? 1,
      is_active: Boolean(boss.is_active),
    });
  }, [open, boss]);

  const set = (key) => (v) => setForm((p) => ({ ...p, [key]: v }));

  const handleSave = async () => {
    const power = Number(form.power_required);
    const hp = Number(form.hp);
    const threshold = Number(form.dice_threshold);
    if (!Number.isInteger(power) || power < 0) return toast.warning("Power required must be a whole number of at least 0");
    if (!Number.isInteger(hp) || hp < 0) return toast.warning("HP must be a whole number of at least 0");
    if (!Number.isInteger(threshold) || threshold < 1) return toast.warning("Dice threshold must be a whole number of at least 1");
    setSaving(true);
    try {
      const updated = await updateAvatarBoss(boss.uuid, {
        power_required: power,
        hp,
        dice_threshold: threshold,
        equipment_reward_slot: Number(form.equipment_reward_slot),
        is_active: Boolean(form.is_active),
      });
      toast.success("Boss saved");
      onSaved(updated);
      onClose();
    } catch (err) {
      toast.error("Failed to save boss", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={`Edit ${boss ? BOSS_NAME_BY_PLANET[boss.planet] ?? "Boss" : "Boss"}`}
      open={open}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Planet" hint="The planet is fixed by the catalog and cannot be changed.">
          <input
            type="text"
            value={boss ? PLANET_LABELS[boss.planet] ?? boss.planet : ""}
            disabled
            className={INPUT_BASE}
          />
        </Field>
        <Field label="Power Required" hint="Members need this much battle power to challenge.">
          <input
            type="number"
            min="0"
            step="1"
            value={form.power_required}
            onChange={(e) => set("power_required")(e.target.value)}
            className={INPUT_BASE}
          />
        </Field>
        <Field label="HP" hint="Display only — does not affect the battle outcome.">
          <input
            type="number"
            min="0"
            step="1"
            value={form.hp}
            onChange={(e) => set("hp")(e.target.value)}
            className={INPUT_BASE}
          />
        </Field>
        <Field label="Dice Threshold" hint="Dice total needed to defeat the boss.">
          <input
            type="number"
            min="1"
            step="1"
            value={form.dice_threshold}
            onChange={(e) => set("dice_threshold")(e.target.value)}
            className={INPUT_BASE}
          />
        </Field>
        <Field label="Equipment Reward Slot" hint="Mystery box equipment drops use this slot.">
          <Select value={form.equipment_reward_slot} onChange={set("equipment_reward_slot")} options={EQUIPMENT_SLOT_OPTIONS} />
        </Field>
        <Field label="Active" hint="Inactive bosses are hidden from members.">
          <div className="pt-2">
            <Toggle checked={form.is_active} onChange={set("is_active")} label={form.is_active ? "Active" : "Inactive"} />
          </div>
        </Field>
      </div>
    </ModalShell>
  );
}

export default function BossesPage() {
  const toast = useToast();
  const [bosses, setBosses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = () => {
    setLoading(true);
    getAvatarBosses({ page, page_size: PAGE_SIZE })
      .then((data) => {
        const rows = data.results ?? data ?? [];
        setBosses(rows);
        setTotal(data.count ?? rows.length);
      })
      .catch((err) => {
        setBosses([]);
        setTotal(0);
        toast.error("Failed to load bosses", { description: apiErrorMessage(err, "Please try again.") });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSaved = (updated) => {
    setBosses((prev) => prev.map((b) => (b.uuid === updated.uuid ? updated : b)));
    setEditing(null);
  };

  return (
    <Card>
      <CardHeader title="Bosses" />

      <div className="px-2 pb-2">
        <TableShell minWidth={980}>
          <Thead columns={COLUMNS} />
          <tbody>
            {loading ? (
              <EmptyRow colSpan={COLUMNS.length}>Loading bosses...</EmptyRow>
            ) : bosses.length === 0 ? (
              <EmptyRow colSpan={COLUMNS.length}>No bosses found.</EmptyRow>
            ) : (
              bosses.map((b) => (
                <tr key={b.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] text-white">{PLANET_LABELS[b.planet] ?? b.planet}</td>
                  <td className="px-6 py-5 text-[12px] font-semibold text-white">{BOSS_NAME_BY_PLANET[b.planet] ?? "-"}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{Number(b.power_required ?? 0).toLocaleString("en-US")}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{Number(b.hp ?? 0).toLocaleString("en-US")}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{b.dice_threshold}</td>
                  <td className="px-6 py-5 text-[12px] text-white">
                    {EQUIPMENT_SLOT_LABELS[b.equipment_reward_slot] ?? b.equipment_reward_slot}
                  </td>
                  <td className="px-6 py-5 text-[12px]">
                    <StatusPill active={Boolean(b.is_active)} />
                  </td>
                  <td className="px-6 py-5">
                    <RowActions onEdit={() => setEditing(b)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </div>

      <ResultsFooter page={page} pageSize={PAGE_SIZE} total={total}>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </ResultsFooter>

      <EditModal boss={editing} open={Boolean(editing)} onSaved={handleSaved} onClose={() => setEditing(null)} />
    </Card>
  );
}
