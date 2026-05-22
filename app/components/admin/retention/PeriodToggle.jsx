"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GRAD_DARK, GRAD_GOLD, PERIODS } from "./constants";
import DateRangePicker from "./DateRangePicker";

// Daily / Monthly / Yearly toggle + Select Date picker.
// Controlled `period` via props; the date range is URL-driven so it persists
// across navigation and is shareable. Every retention page that drops this
// component in gets a working Select Date button without extra wiring.
//
// When a date range is active (type=4), predefined period buttons appear
// inactive — clearing happens in the parent via onPeriodChange which also
// strips the URL params.

export default function PeriodToggle({ period, onPeriodChange, fromDate, toDate }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasDateRange = !!fromDate && !!toDate;

  // Write `from` / `to` to the URL while preserving other params (level, sort, q).
  // router.replace (not push) — date picks shouldn't bloat history.
  const handleApply = useCallback(
    (from, to) => {
      const next = new URLSearchParams(searchParams.toString());
      if (from) next.set("from", from);
      else next.delete("from");
      if (to) next.set("to", to);
      else next.delete("to");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      {PERIODS.map((p) => (
        <PeriodButton
          key={p}
          label={p}
          active={!hasDateRange && period === p}
          onClick={() => onPeriodChange?.(p)}
        />
      ))}
      <DateRangePicker fromDate={fromDate} toDate={toDate} onApply={handleApply} />
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
