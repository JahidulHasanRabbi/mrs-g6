"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "../../../components/admin/retention/Pagination";
import {
  ASSETS,
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../components/admin/retention/constants";
import {
  getCrmAssignments,
  statusLabelToInt,
  updateCrmAssignment,
} from "../../../api/crmApi";

// Retention Settings — Member Assignment.
// Two views toggled by ?view=:
//   - default          → assignment table (Edit button per row)
//   - ?view=edit&id=X  → edit form, prefilled from row X; saves level, criteria, retention target, and PIC

const STATUSES = ["Active", "Inactive"];

const PAGE_SIZE = 7;

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(value);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function stripCurrency(value) {
  return String(value ?? "").replace(/^RM\s*/i, "").replace(/,/g, "");
}

function normalizeAssignmentStatus(value) {
  if (value === 1 || value === "1") return "Active";
  if (value === 2 || value === "2") return "Inactive";
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "ACTIVE") return "Active";
  if (normalized === "INACTIVE") return "Inactive";
  return value || "Inactive";
}

function firstPresent(...values) {
  return values.find((value) => value !== null && value !== undefined && String(value) !== "") || "";
}


function mapAssignment(row, idx = 0) {
  return {
    id: row.uuid || row.id || idx + 1,
    uuid: row.uuid,
    name: row.full_name || "—",
    picUuid: firstPresent(row.pic_uuid, row.admin_uuid, row.user_uuid, row.pic?.uuid, row.admin?.uuid),
    avatar: `${ASSETS}/avatar-${(idx % 5) + 1}.jpg`,
    level: row.level || "—",
    members: formatNumber(row.target_members),
    retain: formatCurrency(row.retain_criteria),
    upgrade: formatCurrency(row.upgrade_criteria),
    target: formatCurrency(row.retention_target),
    status: normalizeAssignmentStatus(row.status),
  };
}

// Bridge between table row shape and the form field shape. The form models a
// "member level" (name = level label, pic = assigned PIC) so we map column
// values in/out at the parent rather than letting the form know about row
// internals like avatars/VIP badge.
function rowToFormValues(row) {
  return {
    name: row.level,
    status: row.status,
    retain: stripCurrency(row.retain),
    upgrade: stripCurrency(row.upgrade),
    target: stripCurrency(row.target),
    picUuid: row.picUuid,
    pic: row.name,
  };
}


export default function RetentionSettingsPage() {
  return (
    <Suspense>
      <RetentionSettingsContent />
    </Suspense>
  );
}

function RetentionSettingsContent() {
  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCrmAssignments({ page, page_size: PAGE_SIZE });
      const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setRows(results.map(mapAssignment));
      setTotal(Number.isFinite(res?.count) ? res.count : results.length);
    } catch (err) {
      console.error("[retention-settings] assignments failed", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const viewParam = searchParams.get("view");
  const editIdParam = searchParams.get("id");
  const editingRow =
    viewParam === "edit" && editIdParam
      ? rows.find((r) => String(r.id) === editIdParam)
      : null;

  const mode = viewParam === "add" ? "add" : editingRow ? "edit" : "list";

  const handleSave = useCallback(
    async (values) => {
      const payload = {
        name: values.name,
        status: statusLabelToInt(values.status),
        retain_criteria: stripCurrency(values.retain),
        upgrade_criteria: stripCurrency(values.upgrade),
        retention_target: stripCurrency(values.target),
        pic_uuid: editingRow?.picUuid,
      };
      try {
        if (editingRow?.uuid) await updateCrmAssignment(editingRow.uuid, payload);
        await loadAssignments();
      } catch (err) {
        console.error("[retention-settings] save failed", err);
        throw err;
      }
    },
    [editingRow, loadAssignments]
  );

  return (
    <>
      <PageHeader />
      {mode === "list" ? (
        <AssignmentListSection
          rows={rows}
          total={total}
          page={page}
          loading={loading}
          onAssignmentsChanged={loadAssignments}
        />
      ) : (
        <MemberLevelForm
          key={editingRow ? `edit-${editingRow.id}` : "add"}
          mode={mode}
          initialValues={editingRow ? rowToFormValues(editingRow) : null}
          onSave={handleSave}
        />
      )}
    </>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-col gap-1 px-2">
      <span className="text-[12px] font-medium leading-[18px] text-white">ADMIN DASHBOARD</span>
      <h1
        className="bg-clip-text text-transparent font-bold whitespace-nowrap"
        style={{
          backgroundImage: GRAD_GOLD,
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: "clamp(32px, 5vw, 46px)",
          lineHeight: "1.2",
          letterSpacing: "-1px",
        }}
      >
        Member Assignment
      </h1>
    </div>
  );
}

function AssignmentListSection({ rows, total, page, loading, onAssignmentsChanged }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToEditView = useCallback(
    (id) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("view", "edit");
      next.set("id", String(id));
      router.push(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  return (
    <section className="flex w-full flex-col overflow-clip rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-wrap items-center gap-4 p-6 w-full">
        <h2
          className="flex-1 text-white font-bold whitespace-nowrap"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Assignment List
        </h2>
      </header>

      <div className="w-full overflow-x-auto scrollbar-admin">
        <div style={{ minWidth: 900 }}>
        <TableHeader />
        <div className="flex w-full flex-col">
          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
          ) : rows.length === 0 ? (
            <div className="px-6 py-10 text-center b-4 text-white/60">No assignments found.</div>
          ) : rows.map((row, idx) => (
            <AssignmentRow
              key={`${row.id || "assignment"}-${idx}`}
              row={row}
              onEdit={() => goToEditView(row.id)}
            />
          ))}
        </div>
        </div>
      </div>
        <Pagination
          from={showingFrom}
          to={showingTo}
          total={total}
          currentPage={safePage}
          pageCount={pageCount}
          onPageChange={(nextPage) => {
            const next = new URLSearchParams(searchParams.toString());
            if (nextPage > 1) next.set("page", String(nextPage));
            else next.delete("page");
            router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname);
          }}
        />

    </section>
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-start justify-between" style={{ backgroundImage: GRAD_DARK }}>
      <HeaderCell label="Member Assignment" widthClass="w-[200px]" />
      <HeaderCell label="Level" />
      <HeaderCell label="No. of Members" />
      <HeaderCell label="Retain Criteria" />
      <HeaderCell label="Upgrade Criteria" />
      <HeaderCell label="Retention Target" />
      <HeaderCell label="Status" />
      <HeaderCell label="Action" widthClass="w-[110px]" align="end" />
    </div>
  );
}

function HeaderCell({ label, widthClass = "flex-1 min-w-0", align = "start" }) {
  const alignClass = align === "end" ? "items-end" : "items-start";
  return (
    <div className={`flex flex-col px-6 py-4 ${widthClass} ${alignClass}`}>
      <p className="b-4 font-medium text-white whitespace-nowrap">{label}</p>
    </div>
  );
}

function AssignmentRow({ row, onEdit }) {
  const statusActive = row.status === "Active";
  return (
    <div className="flex w-full items-center -mb-px border-b border-white/5">
      <div className="flex h-full w-[200px] shrink-0 items-center gap-3 p-6">
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <img src={row.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 items-center">
          <span className="b-4 text-white break-words leading-[18px]">{row.name}</span>
        </div>
      </div>
      <DataCell value={row.level} />
      <DataCell value={row.members} />
      <DataCell value={row.retain} />
      <DataCell value={row.upgrade} />
      <DataCell value={row.target} />
      <div className="flex flex-1 min-w-0 items-center self-stretch">
        <div className="flex h-full flex-1 flex-col justify-center p-6">
          <span
            className={
              "inline-flex w-fit items-center rounded-[6px] px-3 py-1 b-5 font-semibold text-white whitespace-nowrap " +
              (statusActive ? "bg-[#22c55e]" : "bg-[#ef4444]")
            }
          >
            {row.status}
          </span>
        </div>
      </div>
      <div className="flex h-full w-[110px] shrink-0 items-center justify-end p-6">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${row.name}'s level`}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] px-4 py-2 text-[12px] font-semibold text-[#152044] transition hover:brightness-110"
          style={{ backgroundImage: GRAD_GOLD }}
        >
          <PencilGlyph />
          Edit
        </button>
      </div>
    </div>
  );
}

function DataCell({ value }) {
  return (
    <div className="flex flex-1 min-w-0 items-center self-stretch">
      <div className="flex h-full flex-1 flex-col justify-center p-6">
        <span className="b-4 text-white break-words leading-[18px]">{value}</span>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex w-full items-center border-b border-white/5">
      <div className="flex w-[200px] shrink-0 items-center gap-3 p-6">
        <SkeletonCircle />
        <SkeletonBar width="70%" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-1 min-w-0 items-center p-6">
          <SkeletonBar width={i % 2 === 0 ? "68%" : "52%"} />
        </div>
      ))}
      <div className="flex w-[110px] shrink-0 items-center p-6">
        <span className="relative block h-9 w-[76px] overflow-hidden rounded-[8px] bg-[#e9af41]/20 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#e9af41]/30 before:to-transparent" />
      </div>
    </div>
  );
}

function SkeletonBar({ width }) {
  return (
    <span
      className="relative block h-3 overflow-hidden rounded bg-white/[0.07] before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.1] before:to-transparent"
      style={{ width }}
    />
  );
}

function SkeletonCircle() {
  return (
    <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/[0.07] before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.1] before:to-transparent" />
  );
}

function MemberLevelForm({ mode, initialValues, onSave }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEdit = mode === "edit";

  // useState lazy initializers run once at mount — fine here because the
  // parent unmounts/remounts the form via URL changes when switching between
  // add/edit/list, so we never need to re-sync from props mid-life.
  const [name, setName] = useState(() => initialValues?.name ?? "Level 2");
  const [status, setStatus] = useState(() => initialValues?.status ?? "Active");
  const [retain, setRetain] = useState(() => initialValues?.retain ?? "10,000");
  const [upgrade, setUpgrade] = useState(() => initialValues?.upgrade ?? "1,000");
  const [target, setTarget] = useState(() => initialValues?.target ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const goBack = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("view");
    next.delete("id");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError("");
    try {
      await onSave({ name, status, retain, upgrade, target });
      goBack();
    } catch {
      setSaveError("Failed to save assignment. Please check the values and try again.");
    } finally {
      setSaving(false);
    }
  }, [name, status, retain, upgrade, target, onSave, goBack]);

  return (
    <section className="flex w-full flex-col gap-6 rounded-[16px] bg-[#041502] p-8 shadow-[0_-4px_12px_-2px_#dea220]">
      <h2
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage: GRAD_GOLD,
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "26px",
          lineHeight: "39px",
        }}
      >
        {isEdit ? "Edit Member Assignment" : "Add Member Assignment"}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField label="Level">
          <TextInput value={name} onChange={setName} />
        </FormField>
        <FormField label="Status">
          <Select value={status} onChange={setStatus} options={STATUSES} />
        </FormField>
        <FormField label="Retain Criteria">
          <RmInput value={retain} onChange={setRetain} />
        </FormField>
        <FormField label="Upgrade Criteria">
          <RmInput value={upgrade} onChange={setUpgrade} />
        </FormField>
        <FormField label="Retention Target">
          <RmInput value={target} onChange={setTarget} />
        </FormField>
      </div>

      {saveError && (
        <p className="rounded-[8px] border border-[#fb3748] bg-[#d00416]/20 px-4 py-2 text-[12px] text-[#fb3748]">
          {saveError}
        </p>
      )}

      <div className="mt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-medium text-white transition hover:bg-white/5"
        >
          <ArrowBackGlyph />
          Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#152044] transition hover:brightness-110 disabled:opacity-60"
          style={{ backgroundImage: GRAD_GOLD }}
        >
          <CheckGlyph />
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Save"}
        </button>
      </div>
    </section>
  );
}

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="b-2 font-semibold text-white">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-[8px] border border-[#f2cb7a] bg-transparent px-3 text-[14px] text-white focus:outline-none"
    />
  );
}

function RmInput({ value, onChange }) {
  return (
    <div className="flex h-10 items-center rounded-[8px] border border-[#f2cb7a] bg-transparent px-3">
      <span className="b-3 font-semibold text-[#eaad2c]">RM</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-2 flex-1 bg-transparent text-[14px] text-white focus:outline-none"
      />
    </div>
  );
}

function Select({ value, onChange, options }) {
  return <CustomSelect value={value} onChange={onChange} options={options.map((opt) => ({ value: opt, label: opt }))} />;
}

function CustomSelect({ value, onChange, options, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        className="flex h-10 w-full items-center justify-between gap-3 rounded-[8px] border border-[#f2cb7a] bg-transparent px-3 text-left text-[14px] text-white focus:outline-none"
      >
        <span className={selected ? "min-w-0 break-words" : "text-white/45"}>
          {selected?.label || placeholder}
        </span>
        <ChevronGlyph open={open} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-[8px] border border-[#f2cb7a] bg-[#050805] py-1 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-[13px] text-white/40">No options</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-[13px] leading-[18px] ${
                    option.value === value ? "bg-[#eaad2c] text-black" : "text-white hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ChevronGlyph({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 transition-transform"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M4 6l4 4 4-4" stroke="#eaad2c" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Inline SVG glyphs ──────────────────────────────────────────────────


function PencilGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M1.5 9.5L8 3l1.5 1.5L3 11H1.5V9.5zM7 3l1.5-1.5a1 1 0 011.4 0L11 2.5a1 1 0 010 1.4L9.5 5.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowBackGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M6 2L1 7l5 5M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
