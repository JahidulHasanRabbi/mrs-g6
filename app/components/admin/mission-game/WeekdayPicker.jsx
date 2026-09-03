"use client";

import { POPUP_WEEKDAYS } from "../../../config/missionPopupOptions";
import { GOLD_BG } from "../ui/GameUI";

// Empty selection means every day, matching how the eligibility fields treat
// "none selected" (client slide 6).
export default function WeekdayPicker({ value = [], onChange }) {
  const toggle = (day) => {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b);
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {POPUP_WEEKDAYS.map((day) => {
        const active = value.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(day.value)}
            title={day.label}
            className={`rounded-[8px] border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              active
                ? "border-[#f2cb7a] text-[#141828]"
                : "border-white/20 text-white/70 hover:bg-white/5"
            }`}
            style={active ? { backgroundImage: GOLD_BG } : undefined}
          >
            {day.short}
          </button>
        );
      })}
      {value.length === 0 && (
        <span className="self-center text-[12px] text-white/50">No day selected — runs every day</span>
      )}
    </div>
  );
}
