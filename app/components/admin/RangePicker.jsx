"use client";

// Admin date-range picker with preset shortcuts + two-month side-by-side
// calendar, modeled after the Duralux template the team referenced.
//
//   ┌──────────────────┬───────────────────────────┐
//   │ TODAY            │  Apr 2026        May 2026 │
//   │ YESTERDAY        │  S M T W T F S    S M T … │
//   │ LAST 7 DAYS      │  ...              ...     │
//   │ LAST 30 DAYS  ◄─ │  active range highlighted │
//   │ THIS MONTH       │                           │
//   │ LAST MONTH       │                           │
//   │ CUSTOM RANGE     │                           │
//   ├──────────────────┴───────────────────────────┤
//   │ 04/20/2026 — 05/19/2026   [Cancel] [Apply]   │
//   └──────────────────────────────────────────────┘
//
// `fromDate`/`toDate` are ISO `YYYY-MM-DD` strings, matching the rest of the
// admin date plumbing. `onApply(fromIso, toIso)` is fired once when the user
// confirms; Cancel closes without committing. Nothing is committed while the
// user is still scrubbing through dates.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = MONTH_LABELS.map((m) => m.slice(0, 3));

// ── Date helpers ────────────────────────────────────────────────────────

function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIso(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(date, from, to) {
  if (!from || !to) return false;
  const t = date.getTime();
  return t > from.getTime() && t < to.getTime();
}

function isoOrNull(date) {
  return date ? toIso(date) : null;
}

function formatTrigger(fromIso, toIso) {
  const from = parseIso(fromIso);
  const to = parseIso(toIso);
  if (!from || !to) return null;
  const f = `${MONTH_SHORT[from.getMonth()]} ${from.getDate()}, ${from.getFullYear() % 100}`;
  const t = `${MONTH_SHORT[to.getMonth()]} ${to.getDate()}, ${to.getFullYear() % 100}`;
  return `${f} – ${t}`;
}

function formatPanelLabel(date) {
  if (!date) return "—";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

// ── Preset definitions ──────────────────────────────────────────────────

// Each preset resolves (from, to) relative to "today" so the user always sees
// up-to-date ranges. `id: "custom"` is the manual mode used when the active
// selection no longer matches any preset.
const PRESETS = [
  {
    id: "today",
    label: "Today",
    range: (today) => ({ from: today, to: today }),
  },
  {
    id: "yesterday",
    label: "Yesterday",
    range: (today) => {
      const d = addDays(today, -1);
      return { from: d, to: d };
    },
  },
  {
    id: "last7",
    label: "Last 7 Days",
    range: (today) => ({ from: addDays(today, -6), to: today }),
  },
  {
    id: "last30",
    label: "Last 30 Days",
    range: (today) => ({ from: addDays(today, -29), to: today }),
  },
  {
    id: "thisMonth",
    label: "This Month",
    range: (today) => ({ from: startOfMonth(today), to: endOfMonth(today) }),
  },
  {
    id: "lastMonth",
    label: "Last Month",
    range: (today) => {
      const lm = addMonths(today, -1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    },
  },
  {
    id: "custom",
    label: "Custom Range",
    range: null, // Manual: keep whatever the user has set.
  },
];

function detectPreset(from, to, today) {
  if (!from || !to) return null;
  for (const p of PRESETS) {
    if (!p.range) continue;
    const r = p.range(today);
    if (isSameDay(r.from, from) && isSameDay(r.to, to)) return p.id;
  }
  return "custom";
}

// ── Calendar grid ───────────────────────────────────────────────────────

function buildCells(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Sunday-first (0=Sun..6=Sat) to match the WEEKDAY_LABELS above.
  const lead = first.getDay();
  const total = last.getDate();
  const cells = [];

  if (lead > 0) {
    const prevTotal = new Date(year, month, 0).getDate();
    for (let i = lead - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevTotal - i);
      cells.push({ date: d, inMonth: false });
    }
  }
  for (let day = 1; day <= total; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length < 42) {
    const last2 = cells[cells.length - 1].date;
    cells.push({ date: addDays(last2, 1), inMonth: false });
  }
  return cells;
}

// ── Component ───────────────────────────────────────────────────────────

// Approximate panel dimensions — used by auto-flip logic to avoid overflow.
const PANEL_WIDTH = 640;
const PANEL_HEIGHT = 380;

export default function RangePicker({
  fromDate,
  toDate,
  onApply,
  trigger,
  align = "left",
  placeholder = "Select Date",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const triggerLabel = formatTrigger(fromDate, toDate) || placeholder;
  const wrapperRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, bottom: undefined, left: 0, align: "left" });

  const reposition = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Auto-flip to right-alignment when panel would spill off the right edge.
    let resolvedAlign = align;
    if (align === "left" && r.left + PANEL_WIDTH > window.innerWidth - 16) {
      resolvedAlign = "right";
    }
    // Auto-flip upward when panel would spill off the bottom of the viewport.
    // Coordinates are viewport-relative (no scrollY adjustment) because the
    // popover is rendered inside a `fixed inset-0` container.
    const openUpward = r.bottom + PANEL_HEIGHT > window.innerHeight - 8;
    setPosition({
      top: openUpward ? undefined : r.bottom + 8,
      bottom: openUpward ? window.innerHeight - r.top + 8 : undefined,
      left: resolvedAlign === "right" ? r.right : r.left,
      align: resolvedAlign,
    });
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen, reposition]);

  return (
    <div ref={wrapperRef} className="inline-flex">
      {trigger ? (
        trigger({ open: () => setIsOpen(true), label: triggerLabel, hasValue: !!fromDate && !!toDate })
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 h-9 rounded-[8px] px-3 py-2 border border-[#f2cb7a] text-[12px] text-[#edba4d] transition hover:brightness-110"
          style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.7%)" }}
        >
          <CalendarIcon />
          <span className="whitespace-nowrap font-medium">{triggerLabel}</span>
        </button>
      )}
      {isOpen && (
        <RangePickerPopover
          fromIso={fromDate}
          toIso={toDate}
          onClose={() => setIsOpen(false)}
          onApply={(f, t) => {
            onApply?.(f, t);
            setIsOpen(false);
          }}
          position={position}
        />
      )}
    </div>
  );
}

function RangePickerPopover({ fromIso, toIso, onClose, onApply, position }) {
  const align = position.align;
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  // Internal scrub state. We only push back to the parent on Apply, so the
  // user can preview presets without committing.
  const [from, setFrom] = useState(parseIso(fromIso));
  const [to, setTo] = useState(parseIso(toIso));
  // Tracks which end of the range the next calendar click sets.
  const [pickingEnd, setPickingEnd] = useState("from");

  // The right calendar shows "this month"; the left shows the previous month
  // by default, but the user can move both with the chevrons.
  const [viewMonth, setViewMonth] = useState(() => {
    const base = parseIso(fromIso) || today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const activePreset = detectPreset(from, to, today);

  const applyPreset = (preset) => {
    if (!preset.range) {
      // Custom — leave the current values, just switch indicator
      return;
    }
    const r = preset.range(today);
    setFrom(r.from);
    setTo(r.to);
    setPickingEnd("from");
    // Reframe the calendars on the new selection so the user can see it.
    setViewMonth(new Date(r.from.getFullYear(), r.from.getMonth(), 1));
  };

  const handleCellClick = (date) => {
    if (pickingEnd === "from") {
      setFrom(date);
      // If the existing `to` is now before the new `from`, drop it.
      if (to && date.getTime() > to.getTime()) setTo(null);
      setPickingEnd("to");
      return;
    }
    // pickingEnd === "to"
    if (from && date.getTime() < from.getTime()) {
      // User clicked earlier than the from-date → treat that as a new from.
      setFrom(date);
      setTo(null);
      setPickingEnd("to");
      return;
    }
    setTo(date);
    setPickingEnd("from");
  };

  // ── Close on Escape ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const leftMonth = viewMonth;
  const rightMonth = addMonths(viewMonth, 1);

  const panel = (
    <div
      className="fixed inset-0 z-[1000]"
      onMouseDown={onClose}
    >
      <div
        // Anchored to trigger in viewport space (fixed container = no scrollY offset).
        // Flips right/left and up/down automatically via reposition().
        className="absolute"
        style={{
          top: position.top,
          bottom: position.bottom,
          left: align === "right" ? undefined : position.left,
          right: align === "right" ? `calc(100vw - ${position.left}px)` : undefined,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col w-[560px] sm:w-[640px] rounded-[12px] border border-[#f2cb7a] bg-[#0a0e1d] shadow-[0_0_24px_rgba(222,162,32,0.25)] overflow-hidden">
          <div className="flex">
            <PresetRail activePreset={activePreset} onSelect={applyPreset} />
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setViewMonth((v) => addMonths(v, -1))}
                  className="flex h-6 w-6 items-center justify-center rounded text-[#eaad2c] hover:bg-white/5"
                >
                  <ChevronLeft />
                </button>
                <div className="flex flex-1 items-center justify-around">
                  <span className="text-[14px] font-semibold text-white">
                    {MONTH_LABELS[leftMonth.getMonth()]} {leftMonth.getFullYear()}
                  </span>
                  <span className="text-[14px] font-semibold text-white">
                    {MONTH_LABELS[rightMonth.getMonth()]} {rightMonth.getFullYear()}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setViewMonth((v) => addMonths(v, 1))}
                  className="flex h-6 w-6 items-center justify-center rounded text-[#eaad2c] hover:bg-white/5"
                >
                  <ChevronRight />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <CalendarGrid month={leftMonth} from={from} to={to} today={today} onPick={handleCellClick} />
                <CalendarGrid month={rightMonth} from={from} to={to} today={today} onPick={handleCellClick} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/30 px-4 py-3">
            <span className="text-[12px] font-medium text-white">
              {formatPanelLabel(from)} – {formatPanelLabel(to)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[8px] border border-[#f2cb7a]/50 px-4 py-1.5 text-[12px] font-medium text-[#edba4d] hover:brightness-110"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onApply(isoOrNull(from), isoOrNull(to))}
                disabled={!from || !to}
                className="rounded-[8px] px-4 py-1.5 text-[12px] font-semibold text-[#141828] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

function PresetRail({ activePreset, onSelect }) {
  return (
    <ul className="flex flex-col w-[148px] shrink-0 border-r border-white/10 bg-black/30">
      {PRESETS.map((p) => {
        const active = p.id === activePreset;
        return (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className={`flex w-full items-center justify-start px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.5px] transition-colors ${
                active
                  ? "text-[#141828]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              style={
                active
                  ? { backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" }
                  : undefined
              }
            >
              {p.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CalendarGrid({ month, from, to, today, onPick }) {
  const cells = useMemo(() => buildCells(month.getFullYear(), month.getMonth()), [month]);
  return (
    <div className="grid grid-cols-7 gap-y-1 text-center">
      {WEEKDAY_LABELS.map((w) => (
        <span key={w} className="text-[10px] font-semibold uppercase text-white/50 py-1">
          {w}
        </span>
      ))}
      {cells.map((cell, i) => {
        const inMonth = cell.inMonth;
        const isFrom = inMonth && from && isSameDay(cell.date, from);
        const isTo = inMonth && to && isSameDay(cell.date, to);
        const isEnd = isFrom || isTo;
        const inRange = inMonth && isBetween(cell.date, from, to);
        const isToday = inMonth && isSameDay(cell.date, today);

        return (
          <button
            type="button"
            key={i}
            onClick={() => inMonth && onPick(cell.date)}
            disabled={!inMonth}
            className={`relative flex h-8 items-center justify-center text-[12px] transition-colors ${
              !inMonth ? "cursor-default text-white/25" : "text-white"
            } ${inRange ? "bg-[rgba(234,173,44,0.18)]" : ""} ${
              isEnd ? "" : `rounded-[6px] ${inMonth ? "hover:bg-white/5" : ""}`
            }`}
          >
            <span
              className={
                isEnd
                  ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#eaad2c] text-[#141828] font-semibold"
                  : isToday
                  ? "flex h-7 w-7 items-center justify-center rounded-full border border-[#eaad2c]"
                  : ""
              }
            >
              {cell.date.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
