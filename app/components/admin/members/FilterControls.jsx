"use client";

import { useState, useEffect, useRef } from "react";

export const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

/**
 * Reusable gold-gradient dropdown filter.
 * Renders a toggle button and a dropdown panel with "All" + supplied options.
 */
export function FilterDropdown({ label, options, value, onChange, align = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-9 rounded px-3 py-2 shrink-0 transition-opacity hover:opacity-90"
        style={{ background: GOLD_BG }}
      >
        <span className="font-['Times_New_Roman'] text-[14px] text-black whitespace-nowrap">
          {value || label}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={`absolute top-full mt-1 z-50 min-w-[180px] max-h-[280px] overflow-y-auto rounded-lg border border-[rgba(255,255,132,0.3)] bg-[#0f2618] shadow-xl ${align === "right" ? "right-0" : "left-0"}`}>
          <button
            key="all-option"
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-3 py-2.5 font-['Times_New_Roman'] text-[13px] transition-colors ${
              !value
                ? "text-[#e9af41] bg-[rgba(233,175,65,0.1)]"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            All
          </button>
          {options.map((opt, index) => (
            <button
              type="button"
              key={`${opt}-${index}`}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 font-['Times_New_Roman'] text-[13px] border-t border-white/5 transition-colors ${
                value === opt
                  ? "text-[#e9af41] bg-[rgba(233,175,65,0.1)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Gold-gradient date-range filter with From / To date inputs.
 */
export function DateFilter({ label, fromDate, toDate, onFromChange, onToChange, align = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const hasValue = fromDate || toDate;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-9 rounded px-3 py-2 shrink-0 transition-opacity hover:opacity-90"
        style={{ background: GOLD_BG }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="font-['Times_New_Roman'] text-[14px] text-black whitespace-nowrap">{label}</span>
        {hasValue && <span className="w-1.5 h-1.5 rounded-full bg-[#06b800]" />}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={`absolute top-full mt-1 z-50 w-[260px] rounded-lg border border-[rgba(255,255,132,0.3)] bg-[#0f2618] shadow-xl p-3 flex flex-col gap-2.5 ${align === "right" ? "right-0" : "left-0"}`}>
          <label className="font-['Times_New_Roman'] text-[12px] text-white/60">From</label>
          <input
            type="date"
            value={fromDate}
            onClick={(e) => {
              try {
                e.target.showPicker();
              } catch (err) {}
            }}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full h-9 rounded px-2.5 bg-white/10 border border-white/10 font-['Times_New_Roman'] text-[13px] text-white outline-none focus:border-[#e9af41]/50 [color-scheme:dark]"
          />
          <label className="font-['Times_New_Roman'] text-[12px] text-white/60">To</label>
          <input
            type="date"
            value={toDate}
            onClick={(e) => {
              try {
                e.target.showPicker();
              } catch (err) {}
            }}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full h-9 rounded px-2.5 bg-white/10 border border-white/10 font-['Times_New_Roman'] text-[13px] text-white outline-none focus:border-[#e9af41]/50 [color-scheme:dark]"
          />
          <button
            type="button"
            onClick={() => { onFromChange(""); onToChange(""); }}
            className="font-['Times_New_Roman'] text-[12px] text-[#e9af41] hover:underline self-end mt-1"
          >
            Clear dates
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Gold-gradient text search input with clear button.
 */
export function TextSearchInput({ placeholder, value, onChange }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-[140px] sm:w-[160px] rounded px-3 py-2 font-['Times_New_Roman'] text-[14px] text-black italic placeholder:text-black/50 outline-none"
        style={{ background: GOLD_BG }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black text-[16px] leading-none"
        >
          &times;
        </button>
      )}
    </div>
  );
}
