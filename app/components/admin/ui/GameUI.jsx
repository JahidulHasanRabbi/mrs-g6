"use client";

// Shared gold-theme primitives for game admin pages (currently used by the
// RPG section; extracted from the markup penalty-kick / smash-egg inline in
// their page files so new game admins don't re-paste it).
//
// This file only covers the small gold-styled building blocks. The bigger
// shared pieces stay in their own modules and are imported directly by pages:
//   - ModalShell    ← components/admin/penalty-kick/ModalShell
//   - ConfirmDialog ← components/admin/ui/ConfirmDialog
//   - useToast      ← components/admin/ui/Toast (provided by app/admin/layout.jsx)
//   - Pagination    ← components/admin/members/DataTable
//   - StatusBadge   ← components/admin/ui/StatusBadge (wrapped by StatusPill below)

import StatusBadge from "./StatusBadge";

export const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";
export const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40 disabled:opacity-40";

// Header/action icons shared with the other game admin pages.
export const ICONS = {
  level: "/assets/admin/icons/icon-park-outline-level.svg",
  coins: "/assets/admin/icons/iconoir-coins.svg",
  check: "/assets/admin/icons/lsicon-batch-check-outline.svg",
  dice: "/assets/admin/sidebar/icons/cil-casino.svg",
  gift: "/assets/admin/sidebar/icons/mynaui-gift.svg",
  crown: "/assets/admin/sidebar/icons/tabler-crown.svg",
  settings: "/assets/admin/sidebar/icons/retention-settings.svg",
};

export function MaskIcon({ src, size = 16 }) {
  return (
    <span
      aria-hidden="true"
      className="block shrink-0 bg-current"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

export function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 3 3-11 11H7.5v-3l11-11Z" />
    </svg>
  );
}

export function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-6">
      <h2
        className="text-[26px] font-bold tracking-[-1px] text-white"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {title}
      </h2>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

// Header buttons — penalty-kick's ActionButton: outline by default, `filled`
// (gold) for the primary CTA of the page.
export function ActionButton({ children, icon, variant = "outline", onClick, disabled }) {
  if (variant === "filled") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundImage: GOLD_BG }}
      >
        {icon}
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50"
    >
      {icon}
      {children}
    </button>
  );
}

// Row actions — RewardsTable's explicit buttons: gold "Edit" plus an optional
// dark-outline "Archive". Right-aligned inside the Action cell.
export function RowActions({ onEdit, onArchive, editLabel = "Edit", archiveLabel = "Archive" }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#141828] transition-opacity hover:opacity-90"
          style={{ backgroundImage: GOLD_BG }}
        >
          <EditIcon />
          {editLabel}
        </button>
      )}
      {onArchive && (
        <button
          type="button"
          onClick={onArchive}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#eaad2c] transition-opacity hover:opacity-90"
          style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.75%)" }}
        >
          <ArchiveIcon />
          {archiveLabel}
        </button>
      )}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h3
      className="mb-4 mt-2 bg-clip-text text-[18px] font-bold text-transparent"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}
    >
      {children}
    </h3>
  );
}

export function Field({ label, children, hint, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[14px] font-semibold text-white">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-white/40">{hint}</p>}
    </div>
  );
}

// `placeholder` adds a leading empty option; values stay numbers unless the
// option keys are non-numeric (uuids), so existing numeric callers are unchanged.
export function Select({ value, onChange, options, disabled, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? "" : Number.isNaN(Number(raw)) ? raw : Number(raw));
        }}
        disabled={disabled}
        className={`${INPUT_BASE} appearance-none pr-10`}
      >
        {placeholder && (
          <option value="" style={{ background: "#041502", color: "white" }}>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>
            {o.label}
          </option>
        ))}
      </select>
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
    </div>
  );
}

// Date input. Two behaviours the bare <input type="date"> can't give us:
//   1. clicking anywhere in the box opens the picker, not just the tiny icon
//      (the native input is stretched over the whole field and calls
//      showPicker() — same trick as BannerForm / RedemptionItemDialog);
//   2. the value always reads dd/mm/yyyy, since the native control renders in
//      the browser's locale (mm/dd/yyyy on US machines) and can't be forced.
// The value in/out stays the ISO yyyy-mm-dd the API expects.
export function formatDateDMY(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

export function DateField({ value, onChange, disabled, placeholder = "dd/mm/yyyy", min, max }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value || ""}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.currentTarget.showPicker?.()}
        onFocus={(e) => e.currentTarget.showPicker?.()}
        disabled={disabled}
        // Transparent native control on top: it owns the click target and the
        // picker, while the styled layer below shows the dd/mm/yyyy text.
        className="absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        aria-label={placeholder}
      />
      <div className={`${INPUT_BASE} flex items-center justify-between gap-2 ${disabled ? "opacity-40" : ""}`}>
        <span className={value ? "text-white" : "text-white/40"}>{value ? formatDateDMY(value) : placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
    </div>
  );
}

export function TimeField({ value, onChange, disabled, placeholder = "--:--" }) {
  return (
    <input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`${INPUT_BASE} [color-scheme:dark]`}
    />
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {label && <span className="text-[14px] text-white">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
          checked ? "bg-[#e9af41]" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[23px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

// Pulls the most useful message out of an apiRequest error (DRF shapes vary) —
// used as the `description` of toast.error calls.
export function apiErrorMessage(err, fallback) {
  const data = err?.data;
  if (typeof data === "string") return data;
  if (data) {
    if (data.detail) return String(data.detail);
    if (data.error) {
      // Validation errors come as { error, details: { field: ["msg"] } }; some
      // endpoints send a plain sentence as `details` instead.
      const details = data.details;
      if (typeof details === "string") return details;
      if (details && typeof details === "object") {
        for (const [key, val] of Object.entries(details)) {
          const msg = Array.isArray(val) ? val[0] : val;
          if (typeof msg === "string") return key === "non_field_errors" ? msg : `${key}: ${msg}`;
        }
      }
      return String(data.error);
    }
    for (const [key, val] of Object.entries(data)) {
      const msg = Array.isArray(val) ? val[0] : val;
      if (typeof msg === "string") return key === "non_field_errors" ? msg : `${key}: ${msg}`;
    }
  }
  return err?.message || fallback;
}

// Table shell + header, matching RewardsTable (px-6, 14px header text).
export function TableShell({ minWidth = 900, children }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function Thead({ columns }) {
  return (
    <thead>
      <tr
        className="text-left"
        style={{ backgroundImage: "linear-gradient(180deg, #141828 0%, #333333 99.75%)" }}
      >
        {columns.map((c) => (
          <th
            key={c.label}
            className={`px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] ${
              c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""
            }`}
            style={c.width ? { width: c.width } : undefined}
          >
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-[13px] text-white/50">
        {children}
      </td>
    </tr>
  );
}

// Boolean convenience wrapper over the shared StatusBadge.
export function StatusPill({ active, activeLabel = "Active", inactiveLabel = "Inactive" }) {
  return <StatusBadge tone={active ? "success" : "neutral"}>{active ? activeLabel : inactiveLabel}</StatusBadge>;
}

// Footer row: "Showing x to y of z Results" + Pagination slot.
export function ResultsFooter({ page, pageSize, total, children }) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <p className="text-[10px] text-white/80">
        Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} Results
      </p>
      {children}
    </div>
  );
}
