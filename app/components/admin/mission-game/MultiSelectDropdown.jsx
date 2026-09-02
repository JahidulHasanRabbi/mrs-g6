"use client";

// Closed-by-default multi-select for the Pop-out Promotion eligibility
// fields. MultiSelectChips (an always-open chip cloud) took too much vertical
// space once Wallet VIP had a dozen+ options — this collapses into one
// dropdown row, showing picked items as small tags inside the trigger and a
// checklist in a popover, same pattern as the date/time pickers.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function usePopoverPosition(isOpen) {
  const anchorRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const reposition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPosition({ top: r.bottom + 6, left: r.left, width: r.width });
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

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#eaad2c]">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function MultiSelectDropdown({
  options = [],
  value = [],
  onChange,
  emptyMeans = "all",
  loading = false,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { anchorRef, position } = usePopoverPosition(isOpen);
  const labelByValue = new Map(options.map((o) => [o.value, o.label]));

  const toggle = (v) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={loading}
        className="flex min-h-[42px] w-full items-center justify-between gap-2 rounded-[8px] border border-[#f2cb7a]/60 bg-transparent px-3 py-2 text-left text-[13px] text-white transition-colors hover:border-[#f2cb7a] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <span className="text-white/50">Loading...</span>
        ) : value.length === 0 ? (
          <span className="text-white/40">{placeholder || `Applies to ${emptyMeans}`}</span>
        ) : (
          <span className="flex flex-1 flex-wrap gap-1.5">
            {value.map((v) => (
              <span
                key={v}
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#141828]"
                style={{ backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" }}
              >
                {labelByValue.get(v) ?? v}
              </span>
            ))}
          </span>
        )}
        <ChevronDown />
      </button>
      {isOpen && (
        <DropdownPanel
          options={options}
          value={value}
          onToggle={toggle}
          onClear={() => onChange([])}
          onClose={() => setIsOpen(false)}
          position={position}
          emptyMeans={emptyMeans}
        />
      )}
    </>
  );
}

function DropdownPanel({ options, value, onToggle, onClear, onClose, position, emptyMeans }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]" onMouseDown={onClose}>
      <div
        className="absolute flex max-h-[280px] flex-col rounded-[12px] border border-[#f2cb7a] bg-[#0a0e1d] shadow-[0_0_24px_rgba(222,162,32,0.25)]"
        style={{ top: position.top, left: position.left, width: Math.max(position.width, 220) }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="scrollbar-admin flex-1 overflow-y-auto p-2">
          {options.length === 0 ? (
            <p className="px-2 py-3 text-[12px] text-white/50">None available.</p>
          ) : (
            options.map((o) => {
              const checked = value.includes(o.value);
              return (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-2 rounded-[6px] px-2 py-1.5 text-[13px] text-white hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(o.value)}
                    className="h-3.5 w-3.5 accent-[#eaad2c]"
                  />
                  {o.label}
                </label>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
          <span className="text-[11px] text-white/40">
            {value.length === 0 ? `Applies to ${emptyMeans}` : `${value.length} selected`}
          </span>
          <div className="flex gap-2">
            {value.length > 0 && (
              <button type="button" onClick={onClear} className="text-[12px] font-medium text-[#edba4d] hover:brightness-110">
                Clear
              </button>
            )}
            <button type="button" onClick={onClose} className="text-[12px] font-semibold text-[#eaad2c] hover:brightness-110">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
