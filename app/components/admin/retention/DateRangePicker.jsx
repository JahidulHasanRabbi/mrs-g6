"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ASSETS, GRAD_DARK, GRAD_GOLD } from "./constants";

// Two-step date range picker matching Figma nodes 176:7434 (From) / 176:7593 (To).
// Renders a button that opens a calendar modal; picking a date and clicking
// Next switches to the "to" modal; Apply commits via onApply(fromIso, toIso).
//
// Dates are passed in/out as ISO YYYY-MM-DD strings so they're URL-safe.
// No external date library — calendar math is small enough to do inline,
// which keeps the client bundle lean (Vercel `bundle-barrel-imports`).

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Hoisted comparison so we don't recompute "today" inside the calendar render.
function getTodayIso() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

function toIso(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function parseIso(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
}

function formatShort(iso) {
  const p = parseIso(iso);
  if (!p) return null;
  const monthShort = MONTH_LABELS[p.month].slice(0, 3);
  return `${p.day} ${monthShort}`;
}

// Number of days in (month, year). Month is 0-indexed.
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Day of week of the 1st of the month, in Monday-first numbering (0=Mon..6=Sun).
function firstWeekdayMondayFirst(year, month) {
  const sunFirst = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  return (sunFirst + 6) % 7;
}

export default function DateRangePicker({ fromDate, toDate, onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("from"); // "from" | "to"
  const [tempFrom, setTempFrom] = useState(fromDate ?? null);
  const [tempTo, setTempTo] = useState(toDate ?? null);

  const openPicker = useCallback(() => {
    setTempFrom(fromDate ?? null);
    setTempTo(toDate ?? null);
    setStep("from");
    setIsOpen(true);
  }, [fromDate, toDate]);

  const close = useCallback(() => setIsOpen(false), []);

  const handleNext = useCallback(() => {
    if (!tempFrom) return; // Require a from-date before moving on
    setStep("to");
  }, [tempFrom]);

  const handleApply = useCallback(() => {
    if (!tempFrom || !tempTo) return;
    onApply?.(tempFrom, tempTo);
    setIsOpen(false);
  }, [tempFrom, tempTo, onApply]);

  // Close on Escape — small UX win, no other dependencies so the effect is cheap.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const triggerLabel = useMemo(() => {
    if (fromDate && toDate) return `${formatShort(fromDate)} – ${formatShort(toDate)}`;
    return "Select Date";
  }, [fromDate, toDate]);

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[12px] font-medium text-[#edba4d] transition hover:brightness-110"
        style={{ backgroundImage: GRAD_DARK }}
      >
        <img src={`${ASSETS}/calendar.svg`} alt="" className="h-4 w-4" />
        {triggerLabel}
      </button>

      {isOpen && (
        <CalendarModal
          step={step}
          initialIso={step === "from" ? tempFrom : tempTo}
          todayIso={getTodayIso()}
          onSelect={(iso) => (step === "from" ? setTempFrom(iso) : setTempTo(iso))}
          onCancel={close}
          onPrimary={step === "from" ? handleNext : handleApply}
          primaryLabel={step === "from" ? "Next" : "Apply"}
          primaryDisabled={step === "from" ? !tempFrom : !tempTo}
        />
      )}
    </>
  );
}

function CalendarModal({
  step,
  initialIso,
  todayIso,
  onSelect,
  onCancel,
  onPrimary,
  primaryLabel,
  primaryDisabled,
}) {
  const title = step === "from" ? "Select From Date" : "Select to Date";

  // The currently-visible month. Initialized from the existing selection or
  // today.  Local state — never lifted, so navigating months in the modal
  // doesn't ripple into the parent.
  const [view, setView] = useState(() => {
    const initial = parseIso(initialIso) ?? parseIso(todayIso);
    return { year: initial.year, month: initial.month };
  });

  const cells = useMemo(() => buildCalendarCells(view.year, view.month), [view.year, view.month]);
  const selected = initialIso;

  const prevMonth = () => {
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  };
  const nextMonth = () => {
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));
  };

  // Render at document.body so the modal escapes any parent stacking context
  // (e.g. the admin layout's <motion.aside>). The check guards SSR where
  // `document` isn't defined.
  if (typeof document === "undefined") return null;

  const modal = (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onClick={onCancel}
    >
      <motion.div
        className="w-full max-w-[334px] rounded-[16px] border border-[#f2cb7a] bg-[#0a0e1d] p-5 shadow-[0_0_24px_rgba(222,162,32,0.25)]"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <p className="text-center b-3 text-white font-semibold">{title}</p>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[20px] font-bold text-white">
            {MONTH_LABELS[view.month]} {view.year}
          </p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="flex h-4 w-4 items-center justify-center text-[#eaad2c] hover:brightness-125"
            >
              <Triangle direction="up" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="flex h-4 w-4 items-center justify-center text-[#eaad2c] hover:brightness-125"
            >
              <Triangle direction="down" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-y-2 text-center">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w} className="b-4 text-[#eaad2c]">{w}</span>
          ))}
          {cells.map((cell) => (
            <DayCell
              key={cell.iso}
              cell={cell}
              isSelected={cell.iso === selected}
              isToday={cell.iso === todayIso}
              onClick={() => onSelect(cell.iso)}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[12px] font-medium text-[#edba4d] transition hover:brightness-110"
            style={{ backgroundImage: GRAD_DARK }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="flex-1 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[12px] font-semibold text-[#152044] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            {primaryLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}

function DayCell({ cell, isSelected, isToday, onClick }) {
  const isOtherMonth = !cell.inMonth;
  // Selected = gold filled circle; current-month = white; other-month = dim;
  // today (when not selected) gets a small gold dot under the number.
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-8 w-full items-center justify-center text-[12px]"
    >
      <span
        className={
          isSelected
            ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#eaad2c] text-[#152044] font-semibold"
            : `text-white ${isOtherMonth ? "opacity-30" : ""}`
        }
      >
        {cell.day}
      </span>
      {isToday && !isSelected && (
        <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#eaad2c]" />
      )}
    </button>
  );
}

function Triangle({ direction }) {
  const points = direction === "up" ? "6,2 10,8 2,8" : "2,2 10,2 6,8";
  return (
    <svg width="12" height="10" viewBox="0 0 12 10">
      <polygon points={points} fill="currentColor" />
    </svg>
  );
}

// Build the 6-week calendar grid for (year, month). Cells outside the month
// borrow days from the previous/next month so the grid is always 42 cells.
function buildCalendarCells(year, month) {
  const total = daysInMonth(year, month);
  const firstDow = firstWeekdayMondayFirst(year, month);
  const cells = [];

  // Previous month overflow.
  if (firstDow > 0) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevTotal = daysInMonth(prevYear, prevMonth);
    for (let i = firstDow - 1; i >= 0; i--) {
      const day = prevTotal - i;
      cells.push({ day, iso: toIso(prevYear, prevMonth, day), inMonth: false });
    }
  }

  // Current month.
  for (let day = 1; day <= total; day++) {
    cells.push({ day, iso: toIso(year, month, day), inMonth: true });
  }

  // Next month overflow to fill 42 cells (6 rows).
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay, iso: toIso(nextYear, nextMonth, nextDay), inMonth: false });
    nextDay++;
  }

  return cells;
}
