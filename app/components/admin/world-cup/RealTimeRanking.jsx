"use client";

import { useEffect, useRef, useState } from "react";
import PlayerTable from "./PlayerTable";
import CountryRankingTable from "./CountryRankingTable";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";
const DARK_BG = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function ChevronDownIcon({ open = false }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function RefreshIcon({ spinning = false }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={spinning ? { animation: "spin 0.6s linear" } : undefined}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-[#0c1018] p-1">
      <button
        type="button"
        onClick={() => onChange("global")}
        className={`inline-flex items-center gap-1.5 rounded-[8px] px-4 py-1.5 text-[12px] font-semibold transition-opacity ${
          value === "global" ? "text-[#141828]" : "text-white/80 hover:text-white"
        }`}
        style={value === "global" ? { backgroundImage: GOLD_BG } : undefined}
      >
        <GlobeIcon />
        Global
      </button>
      <button
        type="button"
        onClick={() => onChange("country")}
        className={`inline-flex items-center gap-1.5 rounded-[8px] px-4 py-1.5 text-[12px] font-semibold transition-opacity ${
          value === "country" ? "text-[#141828]" : "text-white/80 hover:text-white"
        }`}
        style={value === "country" ? { backgroundImage: GOLD_BG } : undefined}
      >
        <FlagIcon />
        Country
      </button>
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const display = selected ? `${label} ${selected.label}` : label;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center justify-between gap-3 rounded-[8px] border border-[#f2cb7a]/60 px-3 py-2 text-[12px] font-medium text-white transition hover:brightness-110"
        style={{ backgroundImage: DARK_BG }}
      >
        <span>{display}</span>
        <ChevronDownIcon open={open} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 min-w-[160px] overflow-hidden rounded-[8px] border border-[#f2cb7a] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          style={{ backgroundImage: DARK_BG }}
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                className={
                  "w-full px-4 py-2 text-left text-[12px] transition " +
                  (opt.value === value
                    ? "bg-white/5 text-[#eaad2c]"
                    : "text-[#f6dda6] hover:bg-white/5")
                }
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const WIN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "gte10", label: "≥ 10" },
  { value: "gte20", label: "≥ 20" },
  { value: "gte30", label: "≥ 30" },
];

export const STREAK_OPTIONS = [
  { value: "all", label: "All" },
  { value: "gte5", label: "≥ 5" },
  { value: "gte10", label: "≥ 10" },
  { value: "gte15", label: "≥ 15" },
];

export function thresholdFor(value) {
  if (!value || value === "all") return undefined;
  const m = value.match(/gte(\d+)/);
  return m ? Number(m[1]) : undefined;
}

export default function RealTimeRanking({
  view,
  onChangeView,
  players,
  countries,
  winFilter,
  streakFilter,
  onChangeWinFilter,
  onChangeStreakFilter,
  refreshing,
  onRefresh,
}) {
  const isGlobal = view === "global";
  const visibleTotal = isGlobal ? players.length : countries.length;

  return (
    <section className="overflow-hidden rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <header className="flex flex-col gap-4 p-4 sm:p-6">
        <ViewToggle value={view} onChange={onChangeView} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            className="text-[20px] font-bold tracking-[-0.5px] text-white sm:text-[22px]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Real Time Ranking
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {isGlobal && (
              <>
                <FilterDropdown
                  label="Total Win"
                  value={winFilter}
                  options={WIN_OPTIONS}
                  onChange={onChangeWinFilter}
                />
                <FilterDropdown
                  label="Winning Streak"
                  value={streakFilter}
                  options={STREAK_OPTIONS}
                  onChange={onChangeStreakFilter}
                />
              </>
            )}
            <span className="hidden text-[11px] text-white/60 sm:inline">
              Showing {visibleTotal}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a]/60 px-3 py-2 text-[12px] font-semibold text-[#e9af41] transition hover:brightness-110"
              style={{ backgroundImage: DARK_BG }}
            >
              <RefreshIcon spinning={refreshing} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="px-2 pb-2">
        {isGlobal ? (
          <PlayerTable players={players} />
        ) : (
          <CountryRankingTable countries={countries} />
        )}
      </div>
    </section>
  );
}
