"use client";

// Colored priority chip used in retention member tables and the Member Alert
// page. Accepts either a string ("High"|"Medium"|"Low") or the int the API
// emits (1=High, 2=Medium, 3=Low). Unknown values render as a neutral pill so
// the table still aligns.

const PRIORITY_LABELS = { 1: "High", 2: "Medium", 3: "Low", 4: "Inactive" };

const PRIORITY_COLORS = {
  High:     { bg: "#fb3748", color: "#ffffff" },
  Medium:   { bg: "#ffe9bc", color: "#a86b00" },
  Low:      { bg: "#84ebb4", color: "#179451" },
  Inactive: { bg: "#3a4255", color: "#a0aec0" },
};

// Case-insensitive lookup of the known labels, since the API may send any
// casing (e.g. "INACTIVE", "high", "Low Priority").
const LABEL_BY_LOWER = Object.keys(PRIORITY_COLORS).reduce((acc, key) => {
  acc[key.toLowerCase()] = key;
  return acc;
}, {});

// API may return "Low Priority", "High Priority", "Medium Priority", plain
// "Low" etc., or all-caps like "INACTIVE" — match regardless of case.
function normalize(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return PRIORITY_LABELS[value] || null;
  // Strip " Priority" suffix: "Low Priority" → "Low"
  const stripped = String(value).trim().replace(/\s*priority$/i, "").trim();
  if (LABEL_BY_LOWER[stripped.toLowerCase()]) return LABEL_BY_LOWER[stripped.toLowerCase()];
  const asInt = Number.parseInt(stripped, 10);
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
