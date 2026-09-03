"use client";

// Single-date and time-of-day pickers for the Pop-out Promotion form.
// Native <input type="date">/<input type="time"> display in whatever format
// the browser's OS locale picks, which isn't the dd/mm/yyyy + hh:mm AM/PM the
// admin panel wants everywhere. These render that fixed format themselves and
// open a themed popover calendar / hour-minute-period picker on click, while
// keeping the same underlying value shape (ISO "YYYY-MM-DD" / 24h "HH:MM") so
// the rest of the form and the API payload builder don't need to change.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIso(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDdMmYyyy(iso) {
  const date = parseIso(iso);
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCells(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const lead = first.getDay();
  const total = last.getDate();
  const cells = [];
  if (lead > 0) {
    const prevTotal = new Date(year, month, 0).getDate();
    for (let i = lead - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, prevTotal - i), inMonth: false });
  }
  for (let day = 1; day <= total; day++) cells.push({ date: new Date(year, month, day), inMonth: true });
  while (cells.length < 42) {
    const lastDate = cells[cells.length - 1].date;
    cells.push({ date: new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1), inMonth: false });
  }
  return cells;
}

// Shared trigger button + popover positioning, portal-rendered so the panel
// escapes the sidebar/table's own stacking and scroll containers.
function usePopoverPosition(isOpen) {
  const anchorRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const reposition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPosition({ top: r.bottom + 6, left: r.left });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen, reposition]);

  return { anchorRef, position };
}

function TriggerButton({ anchorRef, onClick, disabled, children, icon }) {
  return (
    <button
      ref={anchorRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[42px] w-full items-center justify-between gap-2 rounded-[8px] border border-[#f2cb7a]/60 bg-transparent px-4 text-[13px] text-white transition-colors hover:border-[#f2cb7a] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className={children ? "" : "text-white/40"}>{children || "Select"}</span>
      {icon}
    </button>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eaad2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eaad2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  );
}

// ── Date ────────────────────────────────────────────────────────────────

export function PromoDateInput({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const { anchorRef, position } = usePopoverPosition(isOpen);

  return (
    <>
      <TriggerButton anchorRef={anchorRef} onClick={() => setIsOpen(true)} disabled={disabled} icon={<CalendarIcon />}>
        {formatDdMmYyyy(value)}
      </TriggerButton>
      {isOpen && (
        <DatePopover
          value={value}
          position={position}
          onClose={() => setIsOpen(false)}
          onPick={(iso) => {
            onChange(iso);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}

function DatePopover({ value, position, onClose, onPick }) {
  const selected = parseIso(value);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(() => selected || new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const cells = buildCells(viewMonth.getFullYear(), viewMonth.getMonth());

  return createPortal(
    <div className="fixed inset-0 z-[1000]" onMouseDown={onClose}>
      <div
        className="absolute w-[280px] rounded-[12px] border border-[#f2cb7a] bg-[#0a0e1d] p-3 shadow-[0_0_24px_rgba(222,162,32,0.25)]"
        style={{ top: position.top, left: position.left }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <button type="button" aria-label="Previous month" onClick={() => setViewMonth((v) => addMonths(v, -1))} className="rounded p-1 text-[#eaad2c] hover:bg-white/5">
            ‹
          </button>
          <span className="text-[13px] font-semibold text-white">
            {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </span>
          <button type="button" aria-label="Next month" onClick={() => setViewMonth((v) => addMonths(v, 1))} className="rounded p-1 text-[#eaad2c] hover:bg-white/5">
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w} className="text-[10px] font-semibold uppercase text-white/50">{w}</span>
          ))}
          {cells.map((cell, i) => {
            const isSelected = cell.inMonth && selected && isSameDay(cell.date, selected);
            const isToday = cell.inMonth && isSameDay(cell.date, today);
            return (
              <button
                type="button"
                key={i}
                disabled={!cell.inMonth}
                onClick={() => onPick(toIso(cell.date))}
                className={`flex h-8 items-center justify-center rounded-[6px] text-[12px] ${
                  !cell.inMonth ? "cursor-default text-white/20" : "text-white hover:bg-white/10"
                }`}
              >
                <span
                  className={
                    isSelected
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#eaad2c] font-semibold text-[#141828]"
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
      </div>
    </div>,
    document.body,
  );
}

// ── Time ────────────────────────────────────────────────────────────────

function to12Hour(hour24) {
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, period };
}

function to24Hour(hour12, period) {
  let hour = hour12 % 12;
  if (period === "PM") hour += 12;
  return hour;
}

function formatHhMmA(value) {
  if (!value) return "";
  const [h, m] = String(value).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const { hour12, period } = to12Hour(h);
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function PromoTimeInput({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const { anchorRef, position } = usePopoverPosition(isOpen);

  return (
    <>
      <TriggerButton anchorRef={anchorRef} onClick={() => setIsOpen(true)} disabled={disabled} icon={<ClockIcon />}>
        {formatHhMmA(value)}
      </TriggerButton>
      {isOpen && (
        <TimePopover
          value={value}
          position={position}
          onClose={() => setIsOpen(false)}
          onPick={(hhmm) => {
            onChange(hhmm);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}

function TimePopover({ value, position, onClose, onPick }) {
  const [h, m] = value ? value.split(":").map(Number) : [0, 0];
  const initial = to12Hour(Number.isNaN(h) ? 0 : h);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(Number.isNaN(m) ? 0 : m);
  const [period, setPeriod] = useState(initial.period);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const commit = () => {
    const hour24 = to24Hour(hour12, period);
    onPick(`${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000]" onMouseDown={onClose}>
      <div
        className="absolute w-[220px] rounded-[12px] border border-[#f2cb7a] bg-[#0a0e1d] p-3 shadow-[0_0_24px_rgba(222,162,32,0.25)]"
        style={{ top: position.top, left: position.left }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-3 grid grid-cols-3 gap-2">
          <TimeColumn label="Hour" values={HOURS_12} selected={hour12} onSelect={setHour12} format={(v) => String(v).padStart(2, "0")} />
          <TimeColumn label="Min" values={MINUTES} selected={minute} onSelect={setMinute} format={(v) => String(v).padStart(2, "0")} />
          <TimeColumn label="" values={["AM", "PM"]} selected={period} onSelect={setPeriod} format={(v) => v} />
        </div>
        <button
          type="button"
          onClick={commit}
          className="w-full rounded-[8px] py-2 text-[12px] font-semibold text-[#141828] hover:brightness-110"
          style={{ backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" }}
        >
          Set Time
        </button>
      </div>
    </div>,
    document.body,
  );
}

function TimeColumn({ label, values, selected, onSelect, format }) {
  return (
    <div className="flex flex-col">
      {label && <span className="mb-1 text-center text-[10px] font-semibold uppercase text-white/40">{label}</span>}
      <div className="scrollbar-admin flex h-[132px] flex-col gap-1 overflow-y-auto rounded-[6px] border border-white/10 p-1">
        {values.map((v) => {
          const isActive = v === selected;
          return (
            <button
              type="button"
              key={v}
              onClick={() => onSelect(v)}
              className={`shrink-0 rounded-[4px] py-1 text-[12px] transition-colors ${
                isActive ? "font-semibold text-[#141828]" : "text-white/70 hover:bg-white/10"
              }`}
              style={isActive ? { backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" } : undefined}
            >
              {format(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
