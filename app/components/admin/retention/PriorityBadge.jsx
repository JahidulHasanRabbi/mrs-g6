"use client";

// Colored priority chip used in retention member tables and the Member Alert
// page. Accepts either a string ("High"|"Medium"|"Low") or the int the API
// emits (1=High, 2=Medium, 3=Low). Unknown values render as a neutral pill so
// the table still aligns.

const PRIORITY_LABELS = { 1: "High", 2: "Medium", 3: "Low" };

const PRIORITY_COLORS = {
  High:   { bg: "#fb3748", color: "#ffffff" },
  Medium: { bg: "#ffe9bc", color: "#a86b00" },
  Low:    { bg: "#84ebb4", color: "#179451" },
};

function normalize(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return PRIORITY_LABELS[value] || null;
  const str = String(value).trim();
  if (PRIORITY_COLORS[str]) return str;
  const asInt = Number.parseInt(str, 10);
  return Number.isFinite(asInt) ? PRIORITY_LABELS[asInt] || null : null;
}

export default function PriorityBadge({ value }) {
  const label = normalize(value);
  if (!label) {
    return (
      <span className="text-[12px] font-medium text-white/60 leading-[18px] whitespace-nowrap">
        —
      </span>
    );
  }
  const palette = PRIORITY_COLORS[label];
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[12px] font-semibold leading-[18px] whitespace-nowrap"
      style={{ backgroundColor: palette.bg, color: palette.color }}
    >
      {label}
    </span>
  );
}
