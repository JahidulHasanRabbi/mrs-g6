"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "../../../components/admin/retention/Pagination";
import SetTargetModal from "../../../components/admin/retention/SetTargetModal";
import {
  ASSETS,
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../components/admin/retention/constants";
import {
  createCrmAssignment,
  getCrmAssignments,
  setCrmAssignmentTarget,
  statusLabelToInt,
  updateCrmAssignment,
  getCrmUsers,
} from "../../../api/crmApi";

// Retention Settings — Member Assignment.
// Three views toggled by ?view=:
//   - default       → assignment table + actions (Retention Set Target / Add Member level)
//   - ?view=add     → inline "Add Member Level" form with Back/Save
//   - ?view=edit&id=X → same form, prefilled from row X, saves back to it
// The Set Target action opens a portal-rendered modal.

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

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function firstPresent(...values) {
  return values.find((value) => value !== null && value !== undefined && String(value) !== "") || "";
}

function normalizePic(user) {
  const uuid = firstPresent(
    user?.uuid,
    user?.id,
    user?.admin_uuid,
    user?.user_uuid,
    user?.pic_uuid,
    user?.admin?.uuid,
    user?.user?.uuid
  );

  return {
    ...user,
    uuid,
    isValidUuid: isUuid(uuid),
    label: user?.full_name || user?.name || user?.username || uuid || "Unknown PIC",
  };
}

function invalidPicMessage(pic) {
  const label = pic?.label || "selected PIC";
  const uuid = pic?.uuid || "empty";
  return `Cannot save: ${label} has invalid pic_uuid "${uuid}". The assignment API requires a real UUID, but /admins/users/ returned this value.`;
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
    status: row.status || "Inactive",
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
    picUuid: row.picUuid,
    pic: row.name,
  };
}

function applyFormToRow(row, values) {
  return {
    ...row,
    level: values.name,
    status: values.status,
    retain: `RM ${values.retain.replace(/^RM\s*/i, "")}`,
    upgrade: values.upgrade,
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
  // PIC list from GET /admins/users/ — each entry has { uuid, full_name, ... }
  const [pics, setPics] = useState([]);

  useEffect(() => {
    getCrmUsers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setPics(results.map(normalizePic).filter((pic) => pic.uuid));
      })
      .catch((err) => console.error("[retention-settings] users load failed", err));
  }, []);

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
      // Look up PIC UUID from the real users list (GET /admins/users/)
      const selectedPic = pics.find((u) => u.uuid === values.picUuid);
      const picUuid = selectedPic?.uuid || values.picUuid;
      if (!picUuid) {
        alert("Cannot save: please select a valid PIC from the list.");
        return;
      }
      if (!isUuid(picUuid)) {
        alert(invalidPicMessage(selectedPic || { uuid: picUuid }));
        return;
      }
      const payload = {
        name: values.name,
        status: statusLabelToInt(values.status),
        retain_criteria: stripCurrency(values.retain),
        upgrade_criteria: stripCurrency(values.upgrade),
        pic_uuid: picUuid,
      };
      try {
        if (editingRow?.uuid) await updateCrmAssignment(editingRow.uuid, payload);
        else await createCrmAssignment(payload);
        await loadAssignments();
      } catch (err) {
        console.error("[retention-settings] save failed", err);
      }
    },
    [editingRow, loadAssignments, pics]
  );

  return (
    <>
      <PageHeader />
      {mode === "list" ? (
        <AssignmentListSection rows={rows} total={total} page={page} loading={loading} pics={pics} />
      ) : (
        <MemberLevelForm
          key={editingRow ? `edit-${editingRow.id}` : "add"}
          mode={mode}
          initialValues={editingRow ? rowToFormValues(editingRow) : null}
          onSave={handleSave}
          pics={pics}
        />
      )}
    </>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-col gap-1 px-2">
      <span className="b-4 text-white leading-[18px]">ADMIN DASHBOARD</span>
      <h1
        className="h-4 bg-clip-text text-transparent whitespace-nowrap"
        style={{ backgroundImage: GRAD_GOLD }}
      >
        Member Assignment
      </h1>
    </div>
  );
}

function AssignmentListSection({ rows, total, page, loading, pics = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [targetOpen, setTargetOpen] = useState(false);

  const goToAddView = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("view", "add");
    next.delete("id");
    router.push(`${pathname}?${next.toString()}`);
  }, [pathname, router, searchParams]);

  const goToEditView = useCallback(
    (id) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("view", "edit");
      next.set("id", String(id));
      router.push(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleSaveTarget = useCallback(async (payload) => {
    const selectedPic = pics.find(
      (u) => u.uuid === payload.picUuid || u.label === payload.pic
    );
    const picUuid = payload.picUuid || selectedPic?.uuid;
    if (!picUuid) {
      alert("Cannot set target: please select a valid PIC from the list.");
      return;
    }
    if (!isUuid(picUuid)) {
      alert(invalidPicMessage(selectedPic || { uuid: picUuid }));
      return;
    }
    try {
      await setCrmAssignmentTarget({
        pic_uuid: picUuid,
        deposit: stripCurrency(payload.target),
      });
    } catch (err) {
      console.error("[retention-settings] set target failed", err);
    }
  }, [pics]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  return (
    <section className="flex w-full flex-col overflow-clip rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-wrap items-center gap-4 p-6 w-full">
        <h2 className="h-7 flex-1 text-white" style={{ letterSpacing: "-2px" }}>
          Assignment List
        </h2>
        <button
          type="button"
          onClick={() => setTargetOpen(true)}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] px-5 py-2 text-[14px] font-medium text-white transition hover:bg-white/5"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <TargetGlyph />
          Retention Set Target
        </button>
        <button
          type="button"
          onClick={goToAddView}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] px-5 py-2 text-[14px] font-semibold text-[#152044] transition hover:brightness-110"
          style={{ backgroundImage: GRAD_GOLD }}
        >
          <PlusGlyph />
          Add Member Assignment
        </button>
      </header>

      <div className="flex w-full flex-col overflow-clip">
        <TableHeader />
        <div className="flex w-full flex-col">
          {loading ? (
            <div className="px-6 py-10 text-center b-4 text-white/60">Loading...</div>
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
      </div>

      <SetTargetModal
        isOpen={targetOpen}
        onClose={() => setTargetOpen(false)}
        onSave={handleSaveTarget}
        pics={pics}
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
          <span className="b-4 text-white whitespace-nowrap">{row.name}</span>
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
        <span className="b-4 text-white whitespace-nowrap">{value}</span>
      </div>
    </div>
  );
}

function MemberLevelForm({ mode, initialValues, onSave, pics }) {
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
  const picOptions = pics?.length ? pics : [];
  const [picUuid, setPicUuid] = useState(() => initialValues?.picUuid ?? picOptions[0]?.uuid ?? "");

  useEffect(() => {
    if (!picUuid && picOptions[0]?.uuid) setPicUuid(picOptions[0].uuid);
  }, [picOptions, picUuid]);

  const goBack = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("view");
    next.delete("id");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const handleSave = useCallback(async () => {
    await onSave({ name, status, retain, upgrade, picUuid });
    goBack();
  }, [name, status, retain, upgrade, picUuid, onSave, goBack]);

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
        <FormField label="Choose PIC">
          <PicSelect value={picUuid} onChange={setPicUuid} options={picOptions} />
        </FormField>
      </div>

      <div className="mt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-medium text-white transition hover:bg-white/5"
        >
          <ArrowBackGlyph />
          Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#152044] transition hover:brightness-110"
          style={{ backgroundImage: GRAD_GOLD }}
        >
          <CheckGlyph />
          {isEdit ? "Save Changes" : "Save"}
        </button>
      </div>
    </section>
  );
}

function PicSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-[8px] border border-[#f2cb7a] bg-transparent px-3 text-[14px] text-white focus:outline-none appearance-none"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M4 6l4 4 4-4' stroke='%23eaad2c' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        paddingRight: "30px",
      }}
    >
      {options.map((pic) => (
        <option key={pic.uuid} value={pic.uuid} className="bg-[#041502]">
          {pic.label}
        </option>
      ))}
    </select>
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
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-[8px] border border-[#f2cb7a] bg-transparent px-3 text-[14px] text-white focus:outline-none appearance-none"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M4 6l4 4 4-4' stroke='%23eaad2c' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        paddingRight: "30px",
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#041502]">
          {opt}
        </option>
      ))}
    </select>
  );
}

// ── Inline SVG glyphs ──────────────────────────────────────────────────

function TargetGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="0.8" fill="currentColor" />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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
