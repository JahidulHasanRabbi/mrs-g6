"use client";

const TONE = {
  success: { fg: "#84ebb4", bg: "rgba(132,235,180,0.12)", border: "rgba(132,235,180,0.35)", dot: "#84ebb4" },
  warning: { fg: "#ffd27a", bg: "rgba(255,210,122,0.12)", border: "rgba(255,210,122,0.35)", dot: "#ffd27a" },
  danger:  { fg: "#fb6b6b", bg: "rgba(251,107,107,0.12)", border: "rgba(251,107,107,0.40)", dot: "#fb3748" },
  info:    { fg: "#7ab8ff", bg: "rgba(122,184,255,0.12)", border: "rgba(122,184,255,0.35)", dot: "#7ab8ff" },
  neutral: { fg: "rgba(255,255,255,0.75)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.18)", dot: "rgba(255,255,255,0.6)" },
};

/**
 * Status pill — use instead of plain-text statuses in tables.
 *
 * Includes a colored dot so status is conveyed by shape AND color
 * (checklist #11: don't rely on color alone).
 */
export default function StatusBadge({ tone = "neutral", children, showDot = true, className = "" }) {
  const c = TONE[tone] || TONE.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium border ${className}`}
      style={{ color: c.fg, background: c.bg, borderColor: c.border }}
    >
      {showDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: c.dot }}
          aria-hidden="true"
        />
      )}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
