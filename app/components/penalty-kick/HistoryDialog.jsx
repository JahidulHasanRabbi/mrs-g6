"use client";

import GlassCard from "./GlassCard";
import GreenCta from "./GreenCta";
import { COLORS, ICONS } from "./constants";

function formatAmount(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

function HistoryRow({ row }) {
  const amount = Number(row.amount ?? 0);
  const hasAmount = Number.isFinite(amount) && amount > 0;
  const amountText = hasAmount ? `+${formatAmount(amount)}` : "Pending";

  return (
    <div
      className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-[10px] border border-white/[0.06] bg-white/[0.035] px-3 py-3"
      style={{ opacity: row.claimed ? 0.38 : 1 }}
    >
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px]"
        style={{
          background: "linear-gradient(145deg, rgba(84,233,138,0.28), rgba(84,233,138,0.08))",
          border: "1px solid rgba(84,233,138,0.16)",
        }}
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

      <div className="min-w-0">
        <p
          className="truncate text-[14px] font-semibold leading-tight"
          style={{ color: COLORS.textPrimary, fontFamily: "'Lexend', sans-serif" }}
        >
          {row.label}
        </p>
        <p
          className="mt-1 truncate text-[10px] uppercase tracking-[0.4px]"
          style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
        >
          {row.sub}
        </p>
      </div>

      <div className="text-right">
        <p
          className="text-[13px] font-bold"
          style={{
            color: hasAmount ? COLORS.primary : "rgba(255,255,255,0.48)",
            fontFamily: "'Anybody', 'Lexend', sans-serif",
          }}
        >
          {amountText}
        </p>
      </div>
    </div>
  );
}

function PageButton({ children, disabled, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[15px] text-white/75 transition-colors hover:border-[#54e98a]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export default function HistoryDialog({
  rows = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onClose,
  onRedeemAll,
}) {
  const hasRedeemableRows = rows.length > 0;

  return (
    <GlassCard
      className="max-w-[390px] p-5"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.38), 0 0 34px rgba(84,233,138,0.08)" }}
    >
      <div
        className="mb-4 flex items-center justify-between rounded-[10px] px-4 py-3"
        style={{
          background: "linear-gradient(90deg, rgba(84,233,138,0.16), rgba(84,233,138,0.06))",
          border: "1px solid rgba(84,233,138,0.10)",
        }}
      >
        <h3
          className="text-[15px] font-bold uppercase tracking-[0.8px]"
          style={{ color: COLORS.primary, fontFamily: "'Lexend', sans-serif" }}
        >
          Game History
        </h3>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{
            backgroundColor: COLORS.greenSoft10,
            color: COLORS.textMuted,
            fontFamily: "'Lexend', sans-serif",
          }}
        >
          {rows.length} rewards
        </span>
      </div>

      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b from-[#101812] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-5 bg-gradient-to-t from-[#101812] to-transparent" />
        <div className="history-scroll flex max-h-[312px] flex-col gap-2 overflow-y-auto pr-1">
          {rows.length === 0 ? (
            <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.035] px-4 py-8 text-center">
              <p
                className="text-[13px]"
                style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
              >
                No rewards waiting to redeem.
              </p>
            </div>
          ) : (
            rows.map((r) => <HistoryRow key={r.id} row={r} />)
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mb-4 flex items-center justify-center gap-3">
          <PageButton
            label="Previous page"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            {"<"}
          </PageButton>
          <span
            className="min-w-[58px] text-center text-[12px] font-semibold"
            style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
          >
            {currentPage} / {totalPages}
          </span>
          <PageButton
            label="Next page"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            {">"}
          </PageButton>
        </div>
      )}

      {hasRedeemableRows ? (
        <GreenCta onClick={onRedeemAll} showPlayIcon={false} className="py-3.5 text-[15px]">
          Redeem All
        </GreenCta>
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-[8px] px-5 py-3.5 text-[15px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: "rgba(132, 143, 137, 0.38)",
            color: "rgba(255,255,255,0.45)",
            boxShadow: "0 4px 0 rgba(55, 62, 58, 0.65)",
            fontFamily: "'Lexend', sans-serif",
          }}
        >
          Redeem All
        </button>
      )}

      <style jsx>{`
        .history-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(84, 233, 138, 0.42) transparent;
        }
        .history-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .history-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .history-scroll::-webkit-scrollbar-thumb {
          background: rgba(84, 233, 138, 0.42);
          border-radius: 999px;
        }
      `}</style>
    </GlassCard>
  );
}
