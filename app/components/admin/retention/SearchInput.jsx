"use client";

import { useEffect, useState } from "react";

// Debounced search input. Caller owns the canonical value; the component
// keeps its own draft state so typing feels instant, then flushes to onChange
// after a short pause.
//
// Debouncing reduces URL/router thrash when typing fast — fewer history pushes
// and fewer downstream re-renders.

const DEBOUNCE_MS = 250;

export default function SearchInput({ value = "", placeholder, onChange }) {
  const [draft, setDraft] = useState(value);

  // Keep draft in sync if the external value changes (e.g. URL navigation,
  // someone hits the back button).
  useEffect(() => {
    setDraft(value);
  }, [value]);

  // Flush draft to onChange after a quiet period.
  useEffect(() => {
    if (draft === value) return; // no-op when nothing changed
    const t = setTimeout(() => onChange?.(draft), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [draft, value, onChange]);

  return (
    <div className="flex items-center rounded-[8px] border border-[#f2cb7a] bg-[#141828] pl-2 pr-5 py-2">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-[10px] italic text-[#f6dda6] placeholder:text-[#f6dda6]/70 focus:outline-none min-w-[180px]"
      />
    </div>
  );
}
