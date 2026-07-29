"use client";

// /admin/avatar/equipment — Equipment items catalog.
// Fixed set of 4 items (one per slot, seeded by the backend). There is no
// create or archive endpoint: admins can only rename and re-balance
// (PATCH name / power_bonus). slot_type is immutable.

import { useEffect, useState } from "react";
import { Pagination } from "../../../components/admin/members/DataTable";
import ModalShell from "../../../components/admin/penalty-kick/ModalShell";
import { useToast } from "../../../components/admin/ui/Toast";
import { getAvatarEquipmentItems, updateAvatarEquipmentItem } from "../../../api/adminApi";
import { EQUIPMENT_SLOT_LABELS, EQUIPMENT_SLOT_OPTIONS } from "../../../config/avatarOptions";
import {
  Card,
  CardHeader,
  EmptyRow,
  Field,
  INPUT_BASE,
  ResultsFooter,
  RowActions,
  Select,
  TableShell,
  Thead,
  apiErrorMessage,
} from "../../../components/admin/ui/GameUI";

const PAGE_SIZE = 7;

const COLUMNS = [
  { label: "ID", width: 80 },
  { label: "Name" },
  { label: "Slot" },
  { label: "Power Bonus" },
  { label: "Action", align: "right", width: 140 },
];

const FILTER_OPTIONS = [{ value: 0, label: "All Slots" }, ...EQUIPMENT_SLOT_OPTIONS];

function EditModal({ item, open, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", power_bonus: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !item) return;
    setForm({ name: item.name ?? "", power_bonus: item.power_bonus ?? 0 });
  }, [open, item]);

  const handleSave = async () => {
    const name = form.name.trim();
    const power = Number(form.power_bonus);
    if (!name) return toast.warning("Name is required");
    if (!Number.isInteger(power) || power < 0) return toast.warning("Power bonus must be a whole number of at least 0");
    setSaving(true);
    try {
      const updated = await updateAvatarEquipmentItem(item.uuid, { name, power_bonus: power });
      toast.success("Equipment item saved");
      onSaved(updated);
      onClose();
    } catch (err) {
      toast.error("Failed to save equipment item", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Edit Equipment Item" open={open} onClose={onClose} onSave={handleSave} saving={saving} width="max-w-[520px]">
      <div className="grid grid-cols-1 gap-4">
        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={INPUT_BASE}
          />
        </Field>
        <Field label="Slot" hint="The slot is fixed by the catalog and cannot be changed.">
          <input
            type="text"
            value={item ? EQUIPMENT_SLOT_LABELS[item.slot_type] ?? item.slot_type : ""}
            disabled
            className={INPUT_BASE}
          />
        </Field>
        <Field label="Power Bonus" hint="Battle power added while this item is equipped.">
          <input
            type="number"
            min="0"
            step="1"
            value={form.power_bonus}
            onChange={(e) => setForm((p) => ({ ...p, power_bonus: e.target.value }))}
            className={INPUT_BASE}
          />
        </Field>
      </div>
    </ModalShell>
  );
}

export default function EquipmentItemsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [slotFilter, setSlotFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = () => {
    setLoading(true);
    const params = { page, page_size: PAGE_SIZE };
    if (slotFilter) params.slot_type = slotFilter;
    getAvatarEquipmentItems(params)
      .then((data) => {
        const rows = data.results ?? data ?? [];
        setItems(rows);
        setTotal(data.count ?? rows.length);
      })
      .catch((err) => {
        setItems([]);
        setTotal(0);
        toast.error("Failed to load equipment items", { description: apiErrorMessage(err, "Please try again.") });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, slotFilter]);

  const handleSaved = (updated) => {
    // PATCH returns the fresh row — swap it in place, no refetch needed.
    setItems((prev) => prev.map((i) => (i.uuid === updated.uuid ? updated : i)));
    setEditing(null);
  };

  return (
    <Card>
      <CardHeader title="Equipment Items">
        <div className="w-44">
          <Select
            value={slotFilter}
            onChange={(v) => {
              setPage(1);
              setSlotFilter(v);
            }}
            options={FILTER_OPTIONS}
          />
        </div>
      </CardHeader>

      <div className="px-2 pb-2">
        <TableShell minWidth={720}>
          <Thead columns={COLUMNS} />
          <tbody>
            {loading ? (
              <EmptyRow colSpan={COLUMNS.length}>Loading equipment items...</EmptyRow>
            ) : items.length === 0 ? (
              <EmptyRow colSpan={COLUMNS.length}>No equipment items found.</EmptyRow>
            ) : (
              items.map((item) => (
                <tr key={item.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] text-white">{item.id}</td>
                  <td className="px-6 py-5 text-[12px] font-semibold text-white">{item.name}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{EQUIPMENT_SLOT_LABELS[item.slot_type] ?? item.slot_type}</td>
                  <td className="px-6 py-5 text-[12px] text-white">+{Number(item.power_bonus ?? 0).toLocaleString("en-US")}</td>
                  <td className="px-6 py-5">
                    <RowActions onEdit={() => setEditing(item)} />
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

      <EditModal item={editing} open={Boolean(editing)} onSaved={handleSaved} onClose={() => setEditing(null)} />
    </Card>
  );
}
