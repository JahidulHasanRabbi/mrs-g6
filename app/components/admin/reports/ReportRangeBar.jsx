"use client";

// Shared Daily/Monthly/Yearly + custom-range filter bar for admin reports.
// Usage Report and Reward Report both drive every one of their API calls off
// one of these — this is the single control, factored out so the two pages
// can't drift into different date-range behaviour.

import RangePicker from "../RangePicker";

export function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const QUICK_FILTERS = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Inclusive { from, to } window ending today; "custom" returns null (handled
// by the RangePicker instead). "monthly" is day 1 of the current month
// through today — not the end of the month — same as "yearly" running from
// Jan 1 through today.
export function presetRange(preset) {
  const today = new Date();
  if (preset === "daily") {
    const iso = toIso(today);
    return { from: iso, to: iso };
  }
  if (preset === "monthly") {
    return { from: toIso(new Date(today.getFullYear(), today.getMonth(), 1)), to: toIso(today) };
  }
  if (preset === "yearly") {
    return { from: toIso(new Date(today.getFullYear(), 0, 1)), to: toIso(today) };
  }
  return null;
}

export function formatRangeLabel(range) {
  if (!range?.from || !range?.to) return "Select range";
  const fmt = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };
  return range.from === range.to ? fmt(range.from) : `${fmt(range.from)} – ${fmt(range.to)}`;
}

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PresetButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-semibold transition ${active ? "border-[#f2cb7a] text-[#141828] shadow-[0_2px_10px_rgba(222,162,32,0.25)]" : "border-[#f2cb7a]/40 text-[#fbeed2] hover:bg-white/5"}`}
      style={active ? { backgroundImage: GOLD_BG } : undefined}
    >
      {children}
    </button>
  );
}

// `rightSlot` renders extra controls (e.g. Usage Report's Game dropdown) to
// the right of the range controls — Reward Report passes nothing.
export default function ReportRangeBar({ preset, range, onPreset, onRangeChange, rightSlot }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-black/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_FILTERS.map((filter) => (
          <PresetButton key={filter.value} active={preset === filter.value} onClick={() => onPreset(filter.value)}>
            <CalendarIcon />
            {filter.label}
          </PresetButton>
        ))}
        <RangePicker
          fromDate={range.from}
          toDate={range.to}
          onApply={(from, to) => {
            if (from && to) onRangeChange({ from, to });
          }}
          align="left"
          trigger={({ open }) => (
            <button
              type="button"
              onClick={open}
              className={`inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-semibold transition ${preset === "custom" ? "border-[#f2cb7a] text-[#141828]" : "border-[#f2cb7a]/40 text-[#fbeed2] hover:bg-white/5"}`}
              style={preset === "custom" ? { backgroundImage: GOLD_BG } : undefined}
            >
              <CalendarIcon />
              {preset === "custom" ? formatRangeLabel(range) : "Custom"}
            </button>
          )}
        />
        {preset !== "custom" ? <span className="ml-1 hidden text-[12px] text-white/45 lg:inline">{formatRangeLabel(range)}</span> : null}
      </div>
      {rightSlot ? <div className="flex flex-wrap items-center gap-2">{rightSlot}</div> : null}
    </div>
  );
}
