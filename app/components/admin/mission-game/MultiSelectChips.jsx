"use client";

import { GOLD_BG } from "../ui/GameUI";

// Optional audience filter (client slide 6 §7). Selecting nothing means "all",
// so the empty state says so rather than looking unset.
export default function MultiSelectChips({
  options = [],
  value = [],
  onChange,
  emptyMeans = "All",
  loading = false,
}) {
  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  if (loading) {
    return <p className="text-[13px] text-white/50">Loading...</p>;
  }

  if (options.length === 0) {
    return <p className="text-[13px] text-white/50">None available.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex max-h-[132px] flex-wrap gap-2 overflow-y-auto scrollbar-admin pr-1">
        {options.map((o) => {
          const active = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(o.value)}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                active
                  ? "border-[#f2cb7a] text-[#141828]"
                  : "border-white/20 text-white/70 hover:bg-white/5"
              }`}
              style={active ? { backgroundImage: GOLD_BG } : undefined}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {value.length === 0 && (
        <span className="text-[12px] text-white/50">Nothing selected — applies to {emptyMeans}.</span>
      )}
    </div>
  );
}
