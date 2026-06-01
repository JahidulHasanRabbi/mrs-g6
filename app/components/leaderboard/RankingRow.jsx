"use client";

import { LB_COLORS } from "./constants";
import { Flag } from "./primitives";

function rankColor(rank) {
  if (rank === 1) return LB_COLORS.primary;
  if (rank === 2) return LB_COLORS.goldStrong;
  if (rank === 3) return LB_COLORS.cyan;
  return LB_COLORS.textWhite;
}

function rowStyle(highlight) {
  if (highlight) {
    return {
      background: LB_COLORS.panelLight,
      border: `1px solid ${LB_COLORS.borderGreen50}`,
      boxShadow: "0 0 10px 0 rgba(84,233,138,0.8), 0 0 20px 0 rgba(84,233,138,0.4)",
    };
  }
  return { background: LB_COLORS.panelLight };
}

export function RankingRow({ rank, code, name, points, trail, highlight }) {
  const color = rankColor(rank);
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
          {name}
        </span>
        {code && <Flag code={code} size={24} />}
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
