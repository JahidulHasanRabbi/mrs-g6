"use client";

import { useEffect, useRef, useState } from "react";
import { ASSETS, GRAD_DARK } from "./constants";

// Generic single-select dropdown driven by an external `value`. Caller decides
// where the state lives (URL, local state, etc.).
//
// Options: [{ value, label }]. The currently-selected option's label is shown
// on the button; if no value matches, `placeholder` is used.

export default function FilterDropdown({
  value,
  options,
  placeholder,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder ?? "Select";

  // Click-outside to close. Stored on the ref so the listener doesn't have to
  // rebind when label changes.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const handlePick = (next) => {
    onChange?.(next);
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#f6dda6] transition hover:brightness-110"
        style={{ backgroundImage: GRAD_DARK }}
      >
        {label}
        <img
          src={`${ASSETS}/chevron-down.svg`}
          alt=""
          className="h-4 w-4 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 min-w-[160px] overflow-hidden rounded-[8px] border border-[#f2cb7a] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          style={{ backgroundImage: GRAD_DARK }}
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => handlePick(opt.value)}
                className={
                  "w-full px-4 py-2 text-left text-[12px] transition " +
                  (opt.value === value
                    ? "text-[#eaad2c] bg-white/5"
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
