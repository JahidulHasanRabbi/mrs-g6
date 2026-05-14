"use client";

import { ASSETS, GRAD_DARK, GRAD_GOLD, PERIODS } from "./constants";

// Daily / Monthly / Yearly toggle + Select Date button.
// Controlled component: parent owns the `period` string state.

export default function PeriodToggle({ period, onPeriodChange, onSelectDate }) {
  return (
    <div className="flex items-center gap-2">
      {PERIODS.map((p) => (
        <PeriodButton
          key={p}
          label={p}
          active={period === p}
          onClick={() => onPeriodChange?.(p)}
        />
      ))}
      <button
        type="button"
        onClick={onSelectDate}
        className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[12px] font-medium text-[#edba4d] transition hover:brightness-110"
        style={{ backgroundImage: GRAD_DARK }}
      >
        <img src={`${ASSETS}/calendar.svg`} alt="" className="h-4 w-4" />
        Select Date
      </button>
    </div>
  );
}

// Extracted so React can skip re-rendering inactive buttons when the active
// period changes (memoization handled via stable props from the parent).
function PeriodButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[12px] font-medium transition hover:brightness-110"
      style={{
        backgroundImage: active ? GRAD_GOLD : GRAD_DARK,
        color: active ? "#152044" : "#edba4d",
      }}
    >
      {label}
    </button>
  );
}
