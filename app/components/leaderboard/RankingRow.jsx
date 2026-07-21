"use client";

import { LB_COLORS } from "./constants";
import { Flag } from "./primitives";

function rankColor(rank) {
  if (rank === 1) return LB_COLORS.primary;
  if (rank === 2) return LB_COLORS.goldStrong;
  if (rank === 3) return LB_COLORS.cyan;
  return LB_COLORS.textWhite;
}

function maskName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "A***s";
  const chars = [...trimmed];
  if (chars.length === 1) return `${chars[0]}***`;
  if (chars.length === 2) return `${chars[0]}*${chars[1]}`;
  const first = chars[0];
  const last = chars[chars.length - 1];
  const stars = "*".repeat(Math.max(3, Math.min(chars.length - 2, 5)));
  return `${first}${stars}${last}`;
}

function rowStyle(highlight) {
  if (highlight) {
    return {
      background: LB_COLORS.panelLight,
      border: `1px solid ${LB_COLORS.borderGreen50}`,
      boxShadow: "0 0 10px 0 rgba(var(--lb-accent-rgb), 0.8), 0 0 20px 0 rgba(var(--lb-accent-rgb), 0.4)",
    };
  }
  return { background: LB_COLORS.panelLight };
}

export function RankingRow({ rank, code, flag, name, points, trail, highlight, mask }) {
  const color = rankColor(rank);
  const displayName = mask ? maskName(name) : name;
  return (
    <div
      className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3"
      style={rowStyle(highlight)}
    >
      <div className="w-7 text-[14px]" style={{ color, fontFamily: "'Lexend',sans-serif" }}>
        #{rank}
      </div>
      <div className="flex flex-1 items-center gap-2">
        <span className="truncate text-[14px]" style={{ color, fontFamily: "'Lexend',sans-serif" }}>
          {displayName}
        </span>
        {(code || flag) && <Flag code={code} src={flag} size={24} />}
      </div>
      {typeof points === "number" && (
        <div className="w-[60px] text-center text-[12px]" style={{ color: "#fff", fontFamily: "'Lexend',sans-serif" }}>
          {points.toLocaleString()}
        </div>
      )}
      {trail !== undefined && (
        <div className="w-[40px] text-right text-[12px]" style={{ color: "#fff", fontFamily: "'Lexend',sans-serif" }}>
          {typeof trail === "number" ? trail.toLocaleString() : trail}
        </div>
      )}
    </div>
  );
}

export function RankingHeader({ columns }) {
  return (
    <div className="flex w-full items-center gap-3 px-1">
      {columns.map((c, i) => (
        <div
          key={i}
          className="text-[10px] uppercase"
          style={{
            color: LB_COLORS.textPrimary,
            fontFamily: "'Lexend',sans-serif",
            flex: c.flex ?? "0 0 auto",
            width: c.width,
            textAlign: c.align ?? "left",
          }}
        >
          {c.label}
        </div>
      ))}
    </div>
  );
}
