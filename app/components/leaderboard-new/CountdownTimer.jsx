"use client";

import { useState, useEffect, useCallback } from "react";

function parseTimeLeft(endDate) {
  const diff = Math.max(0, endDate - Date.now());
  return {
    days: String(Math.floor(diff / 86400000)).padStart(2, "0"),
    hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
    mins: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
    secs: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
  };
}

export default function CountdownTimer({ endDate, color = "#ff8c00" }) {
  const [time, setTime] = useState(() => parseTimeLeft(endDate));

  useEffect(() => {
    const id = setInterval(() => setTime(parseTimeLeft(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const units = [
    { value: time.days, label: "DAYS" },
    { value: time.hours, label: "HOURS" },
    { value: time.mins, label: "MINS" },
    { value: time.secs, label: "SECS" },
  ];

  return (
    <div
      className="w-full rounded-lg p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 items-center"
      style={{
        backgroundColor: "var(--lb-card-overlay)",
        border: `1px solid ${color}`,
        boxShadow: `0 3px 6px 0 ${color}4D`,
      }}
    >
      <p
        className="text-xs font-bold tracking-[1.2px] text-center"
        style={{ color, fontFamily: "var(--font-inter)" }}
      >
        CAMPAIGN ENDS IN
      </p>
      <div className="flex items-start gap-2 sm:gap-4 justify-center">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-start gap-2 sm:gap-4">
            <div className="flex flex-col items-center">
              <span
                className="text-2xl sm:text-[32px] leading-8 text-[#e5e2e1]"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {u.value}
              </span>
              <span
                className="text-[10px] sm:text-xs font-semibold tracking-[1.2px]"
                style={{
                  color: color === "#ff8c00" ? "#ffb965" : color,
                  fontFamily: "var(--font-jetbrains-mono)",
                }}
              >
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                className="text-2xl sm:text-[32px] leading-[48px]"
                style={{
                  color: color === "#ff8c00" ? "#ffb965" : color,
                  fontFamily: "var(--font-jetbrains-mono)",
                }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
