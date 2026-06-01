"use client";

import GlassCard from "./GlassCard";
import GreenCta from "./GreenCta";
import { COLORS, ICONS } from "./constants";

function HistoryRow({ row }) {
  const amountColor =
    row.outcome === "goal" ? COLORS.primary : COLORS.red;
  const amountSign = row.amount > 0 ? "+" : "";
  return (
    <div
      className="flex items-center justify-between gap-3 py-2"
      style={{ opacity: row.claimed ? 0.35 : 1 }}
    >
      <div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px]"
        style={{ backgroundColor: COLORS.greenSoft20 }}
      >
        <span
          aria-hidden="true"
          className="block h-5 w-5 bg-current"
          style={{
            color: "#fff",
            WebkitMaskImage: `url(${ICONS.soccer})`,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
            maskImage: `url(${ICONS.soccer})`,
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "contain",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col leading-tight">
        <span
          className="text-[14px] font-medium"
          style={{ color: COLORS.textPrimary, fontFamily: "'Lexend', sans-serif" }}
        >
          {row.label}
        </span>
        <span
          className="text-[10px]"
          style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
        >
          {row.sub}
        </span>
      </div>
      <span
        className="text-[14px] font-bold"
        style={{
          color: amountColor,
          fontFamily: "'Anybody', 'Lexend', sans-serif",
        }}
      >
        {amountSign}
        {row.amount.toFixed(2)}
      </span>
    </div>
  );
}

export default function HistoryDialog({ rows = [], onClose, onRedeemAll }) {
  return (
    <GlassCard>
      <div
        className="mb-4 w-full rounded-[4px] px-4 py-2 text-[14px] tracking-[0.5px] uppercase"
        style={{
          backgroundColor: COLORS.greenSoft10,
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          lineHeight: "15px",
        }}
      >
        Game History
      </div>

      <div
        className="mb-4 max-h-[280px] divide-y overflow-y-auto"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {rows.length === 0 ? (
          <p
            className="py-6 text-center text-[12px]"
            style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
          >
            No history yet — go score a goal.
          </p>
        ) : (
          rows.map((r) => <HistoryRow key={r.id} row={r} />)
        )}
      </div>

      <GreenCta onClick={onRedeemAll} showPlayIcon={false}>
        Redeem All
      </GreenCta>
    </GlassCard>
  );
}
