"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../../components/admin/retention/constants";

// Role Setting (Add / Edit) — Figma 168:2454. Two-column toggle grid for
// MRS Access and Retention System Access. Same chrome as the rest of
// /admin/settings/* (auth guard + RetentionTopBar via the settings layout).
//
// Note on alignment: the Figma lays each toggle out as `[label] [toggle]`
// with only an 8px gap, so labels of different widths leave toggles at
// different horizontal positions and the column ends up ragged. We fix this
// by giving every row `justify-between`, so the toggle always pins to the
// right edge of the 317px column regardless of label length.

const PAGE_WIDTH_MAX = 1112;
const COL_WIDTH = 317.33;

// Module-level constants — match the existing user-access pattern and
// avoid re-allocating these arrays on every render (per Vercel React
// guidelines on hoisting non-reactive data).
const MRS_ACCESS_FIELDS = [
  { id: "spin",            label: "Spin Panel" },
  { id: "memberList",      label: "Member List" },
  { id: "pointsMall",      label: "Points Redemption Mall" },
  { id: "pointsGift",      label: "Points Redemption Gift" },
  { id: "prizeSettings",   label: "Prize Settings" },
  { id: "vipPanel",        label: "VIP Membership Panel" },
  { id: "userLogs",        label: "User Logs" },
  { id: "dailyLimits",     label: "Daily Limits" },
  { id: "framesSettings",  label: "Frames Settings" },
  { id: "checkinRewards",  label: "Check-in Rewards" },
  { id: "reports",         label: "Reports" },
  { id: "userManagement",  label: "User Management" },
  { id: "notification",    label: "Notification" },
];

const RETENTION_ACCESS_FIELDS = [
  { id: "hidePhone",        label: "Hide Member Phone Numbers" },
  { id: "noOtherRetention", label: "No Access to Other Retention" },
  { id: "assignedOnly",     label: "Only Access Other Assigned Members" },
  { id: "viewWinLossOnly",  label: "View Own Members Deposit & Win/Loss Only" },
];

const STATUS_OPTIONS = ["Active", "Inactive"];

// Mock store keyed by id — when wired up this becomes an `/admin/roles/:id`
// fetch. The "new" id falls through to defaults so Add Role and Edit can
// share the exact same view.
const MOCK_ROLE_LOOKUP = {
  "1": { name: "Retention",            status: "Active" },
  "2": { name: "Lucky Spin Manager",   status: "Active" },
  "3": { name: "Prize Moderator",      status: "Active" },
  "4": { name: "Game Master",          status: "Active" },
  "5": { name: "Supervisor Retention", status: "Inactive" },
};

const DEFAULT_TOGGLE_STATE = (() => {
  const state = {};
  for (const f of MRS_ACCESS_FIELDS) state[f.id] = true;
  for (const f of RETENTION_ACCESS_FIELDS) state[f.id] = true;
  return state;
})();

export default function RoleSettingPage({ params }) {
  // Next 16 passes route params as a Promise — `use()` unwraps it so the
  // component can stay a leaf without an effect.
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const initialRole = useMemo(() => {
    if (isNew) return { name: "", status: "Active" };
    return MOCK_ROLE_LOOKUP[id] ?? { name: "", status: "Active" };
  }, [id, isNew]);

  const [name, setName] = useState(initialRole.name);
  const [status, setStatus] = useState(initialRole.status);
  const [mrsAccess, setMrsAccess] = useState(true);
  const [retentionAccess, setRetentionAccess] = useState(true);
  const [toggles, setToggles] = useState(DEFAULT_TOGGLE_STATE);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const updateToggle = (key, next) =>
    setToggles((prev) => ({ ...prev, [key]: next }));

  const goBack = () => router.push("/admin/settings/role-management");

  const confirmDelete = () => {
    // Mock — eventually call adminApi.deleteRole(id). For now, close the
    // prompt and navigate back to the list.
    setShowDeletePrompt(false);
    goBack();
  };

  return (
    <>
      <PageHeader />
      <div className="w-full">
        <div
          className="flex flex-col items-stretch rounded-[16px] bg-[#05060a] p-6 md:p-10 shadow-[0_0_1.5px_#dea220]"
          style={{ maxWidth: PAGE_WIDTH_MAX }}
        >
          <div className="flex flex-col gap-6 w-full">
            <h2
              className="bg-clip-text text-transparent font-bold whitespace-nowrap"
              style={{
                backgroundImage: GRAD_GOLD,
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: "26px",
                lineHeight: "39px",
                letterSpacing: "-2px",
              }}
            >
              {isNew ? "Add Role" : "Edit Role"}
            </h2>

            <div className="flex flex-col gap-6 md:flex-row md:gap-10 md:flex-wrap">
              <FieldColumn>
                <FieldLabel>Role Name</FieldLabel>
                <TextInput
                  value={name}
                  onChange={setName}
                  placeholder="Enter role name"
                />
              </FieldColumn>
              <FieldColumn>
                <FieldLabel>Status</FieldLabel>
                <SelectInput
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                />
              </FieldColumn>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:gap-10 md:items-start md:flex-wrap">
              <FieldColumn>
                <SectionToggleRow
                  label="MRS Access"
                  checked={mrsAccess}
                  onChange={setMrsAccess}
                />
                {MRS_ACCESS_FIELDS.map((field) => (
                  <ToggleRow
                    key={field.id}
                    label={field.label}
                    checked={!!toggles[field.id]}
                    disabled={!mrsAccess}
                    onChange={(v) => updateToggle(field.id, v)}
                  />
                ))}
              </FieldColumn>

              <FieldColumn>
                <SectionToggleRow
                  label="Retention System Access"
                  checked={retentionAccess}
                  onChange={setRetentionAccess}
                />
                {RETENTION_ACCESS_FIELDS.map((field) => (
                  <ToggleRow
                    key={field.id}
                    label={field.label}
                    checked={!!toggles[field.id]}
                    disabled={!retentionAccess}
                    onChange={(v) => updateToggle(field.id, v)}
                  />
                ))}
              </FieldColumn>
            </div>

            <FooterActions
              isNew={isNew}
              onBack={goBack}
              onDelete={() => setShowDeletePrompt(true)}
              onSave={goBack}
            />
          </div>
        </div>
      </div>

      {showDeletePrompt && (
        <DeleteRoleModal
          onCancel={() => setShowDeletePrompt(false)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">
          ADMIN DASHBOARD
        </span>
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
          Role Setting
        </h1>
      </div>
    </div>
  );
}

// ── Layout primitives ───────────────────────────────────────────────────

// Fixed-width column on md+, full-width on mobile. The fixed width is what
// makes every toggle in the column line up — combined with `justify-between`
// on the rows, the knob always lands flush with the column's right edge.
function FieldColumn({ children }) {
  return (
    <div
      className="flex flex-col gap-2 w-full"
      style={{ maxWidth: COL_WIDTH, flexBasis: COL_WIDTH }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <span
      className="text-[18px] font-medium text-[#f6dda6] leading-[27px] whitespace-nowrap"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </span>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 text-[12px] font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#eaad2c]"
      style={{ fontFamily: "Inter, sans-serif", lineHeight: "18px" }}
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full rounded-[8px] border border-[#fbeed2] bg-transparent pl-4 pr-10 py-3 text-[12px] font-medium text-white focus:outline-none focus:border-[#eaad2c] cursor-pointer"
        style={{ fontFamily: "Inter, sans-serif", lineHeight: "18px" }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#05060a] text-white">
            {opt}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#eaad2c]"
      >
        <ChevronDownIcon />
      </span>
    </div>
  );
}

// Section header toggle (MRS Access / Retention System Access). Larger 46px
// track and 20px knob per Figma B-1 spec.
function SectionToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex w-full items-center justify-between py-3">
      <span
        className="text-[18px] font-medium text-[#f6dda6] leading-[27px] whitespace-nowrap"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </span>
      <Toggle size="lg" checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

// Sub-field row. Always `justify-between` so the toggle pins to the column's
// right edge — this is the alignment fix vs the Figma's `gap-[8px]` layout
// where labels of varying widths pushed toggles around horizontally.
function ToggleRow({ label, checked, onChange, disabled }) {
  return (
    <div
      className={`flex w-full items-center justify-between gap-2 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <span
        className="text-[12px] font-medium text-white leading-[18px]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </span>
      <Toggle
        size="sm"
        checked={checked}
        onChange={onChange}
        ariaLabel={label}
        disabled={disabled}
      />
    </div>
  );
}

// Two-size toggle. `lg` matches the section header (46×24, 20px knob),
// `sm` matches the sub-field rows (32×17, 13px knob). Knob position is
// computed from track width so the math stays correct if sizes change.
function Toggle({ size = "sm", checked, onChange, ariaLabel, disabled }) {
  const isLarge = size === "lg";
  const trackW = isLarge ? 46 : 32;
  const trackH = isLarge ? 24 : 17;
  const knob = isLarge ? 20 : 13;
  const pad = 2;
  const offX = checked ? trackW - knob - pad : pad;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 rounded-full transition-colors ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{
        width: trackW,
        height: trackH,
        backgroundColor: checked ? "#eaad2c" : "#3a3a3a",
        boxShadow: checked
          ? "inset 0 0 0 1px rgba(208,208,208,0.18)"
          : "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      <span
        className="absolute rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.22)]"
        style={{
          width: knob,
          height: knob,
          top: (trackH - knob) / 2,
          left: offX,
          transition: "left 0.18s ease",
        }}
      />
    </button>
  );
}

// ── Footer actions ──────────────────────────────────────────────────────

function FooterActions({ isNew, onBack, onDelete, onSave }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
      <ActionButton variant="back" onClick={onBack} />
      {!isNew && <ActionButton variant="delete" onClick={onDelete} />}
      <ActionButton variant="save" onClick={onSave} />
    </div>
  );
}

// ── Delete Role modal — Figma 271:9782 ──────────────────────────────────

// Confirmation prompt opened by the footer Delete button. "Back" closes
// the modal (returns to the form unchanged); "Delete" runs onConfirm —
// which today does the mock close+redirect, but is the hook for the real
// adminApi.deleteRole call once the backend lands.
function DeleteRoleModal({ onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete role"
    >
      <div
        className="w-full max-w-[420px] rounded-[16px] bg-[#010c01] px-10 py-8 sm:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-[12px] bg-[rgba(208,4,22,0.75)]"
            style={{
              boxShadow:
                "0 -2px 40px 0 rgba(208,4,22,0.15), 0 0 55px 0 rgba(208,4,22,0.5)",
            }}
          >
            <LargeTrashIcon />
          </div>
          <h3
            className="mb-2 text-center font-bold text-[#edba4d]"
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "22px",
              lineHeight: "33px",
            }}
          >
            Delete Role?
          </h3>
          <p
            className="mb-8 max-w-[320px] px-4 text-center text-[12px] font-medium text-[#fbeed2]"
            style={{ fontFamily: "Inter, sans-serif", lineHeight: "18px" }}
          >
            The role and its Retention assignments will be deleted
          </p>
          <div className="flex w-full items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:bg-white/5"
              style={{ letterSpacing: "-1px" }}
            >
              <ArrowLeftIcon />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#fb3748] bg-[#d00416] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:brightness-110"
              style={{ letterSpacing: "-1px" }}
            >
              <TrashIcon />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LargeTrashIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ActionButton({ variant, onClick }) {
  if (variant === "back") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:bg-white/5"
        style={{ letterSpacing: "-1px" }}
      >
        <ArrowLeftIcon />
        <span>Back</span>
      </button>
    );
  }
  if (variant === "delete") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#fb3748] bg-[#d00416] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:brightness-110"
        style={{ letterSpacing: "-1px" }}
      >
        <TrashIcon />
        <span>Delete</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <CheckIcon />
      <span>Save</span>
    </button>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fbeed2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fbeed2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#141828"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
