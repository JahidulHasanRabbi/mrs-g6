"use client";

import { useEffect, useState, useCallback } from "react";
import GlassCard from "./GlassCard";
import GreenCta from "./GreenCta";
import { COLORS, ICONS } from "./constants";
import { getMemberRewardHistory } from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";

const PRIZE_PAGE_SIZE = 10;

const ITEM_TYPE_DISPLAY = {
  "1": "Credit",
  "TOKEN": "Token",
  "2": "Token",
  "FREE CREDIT": "Credit",
  "3": "Prize",
  "PRIZE": "Prize",
  "4": "Score",
  "WORLD CUP SCORE": "Score",
  "5": "BP",
  "BATTLE POINT": "BP",
};

function formatAmount(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

function HistoryRow({ row }) {
  const amount = Number(row.amount ?? 0);
  const hasAmount = Number.isFinite(amount) && amount > 0;
  const typeLabel = ITEM_TYPE_DISPLAY[String(row.sub || "").toUpperCase()] || row.sub || "—";
  const amountText = hasAmount
    ? typeLabel === "BP"
      ? `+${amount.toLocaleString("en-US")} BP`
      : `+${formatAmount(amount)}`
    : typeLabel;

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

function mapPrizeRow(r) {
  const amount = Number(r.amount ?? 0);
  return {
    id: r.uuid,
    label: r.reward_name || "Reward",
    sub: r.item_type || "PRIZE",
    amount: Number.isFinite(amount) ? amount : 0,
    claimed: false,
  };
}

export default function HistoryDialog({
  rows = [],
  total = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onClose,
  onRedeemAll,
}) {
  const [activeTab, setActiveTab] = useState("game");
  const [prizeRows, setPrizeRows] = useState([]);
  const [prizePage, setPrizePage] = useState(1);
  const [prizeTotal, setPrizeTotal] = useState(0);
  const [prizeLoading, setPrizeLoading] = useState(false);
  const [prizeFailed, setPrizeFailed] = useState(false);

  const loadPrizePage = useCallback(async (page) => {
    const memberUuid = tokenStorage.getMemberUuid();
    if (!memberUuid) return;
    setPrizeLoading(true);
    try {
      const res = await getMemberRewardHistory(memberUuid, { page, page_size: PRIZE_PAGE_SIZE });
      setPrizeRows((res?.results || []).map(mapPrizeRow));
      setPrizeTotal(Number(res?.count ?? 0));
      setPrizePage(page);
      setPrizeFailed(false);
    } catch {
      setPrizeRows([]);
      setPrizeFailed(true);
    } finally {
      setPrizeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "prize" && prizeRows.length === 0 && !prizeLoading && !prizeFailed) {
      loadPrizePage(1);
    }
  }, [activeTab, prizeRows.length, prizeLoading, prizeFailed, loadPrizePage]);

  const prizeTotalPages = Math.max(1, Math.ceil(prizeTotal / PRIZE_PAGE_SIZE));
  const hasRedeemableRows = rows.length > 0;

  const activeRows = activeTab === "game" ? rows : prizeRows;
  const activeCurrentPage = activeTab === "game" ? currentPage : prizePage;
  const activeTotalPages = activeTab === "game" ? totalPages : prizeTotalPages;
  const handlePageChange = activeTab === "game" ? onPageChange : loadPrizePage;

  return (
    <GlassCard
      className="max-w-[390px] p-5"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.38), 0 0 34px rgba(84,233,138,0.08)" }}
    >
      <div
        className="mb-3 flex items-center justify-between rounded-[10px] px-4 py-3"
        style={{
          background: "linear-gradient(90deg, rgba(84,233,138,0.16), rgba(84,233,138,0.06))",
          border: "1px solid rgba(84,233,138,0.10)",
        }}
      >
        <h3
          className="text-[15px] font-bold uppercase tracking-[0.8px]"
          style={{ color: COLORS.primary, fontFamily: "'Lexend', sans-serif" }}
        >
          {activeTab === "game" ? "Game History" : "Prize History"}
        </h3>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{
            backgroundColor: COLORS.greenSoft10,
            color: COLORS.textMuted,
            fontFamily: "'Lexend', sans-serif",
          }}
        >
          {activeTab === "game" ? `${total} rewards` : `${prizeTotal} total`}
        </span>
      </div>

      <div className="mb-3 flex gap-2">
        {["game", "prize"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-[8px] py-2 text-[11px] font-semibold uppercase tracking-[0.5px] transition-colors"
            style={{
              background: activeTab === tab ? "rgba(84,233,138,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeTab === tab ? "rgba(84,233,138,0.35)" : "rgba(255,255,255,0.08)"}`,
              color: activeTab === tab ? COLORS.primary : "rgba(255,255,255,0.45)",
              fontFamily: "'Lexend', sans-serif",
            }}
          >
            {tab === "game" ? "Game History" : "Prize History"}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b from-[#101812] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-5 bg-gradient-to-t from-[#101812] to-transparent" />
        <div className="history-scroll flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1">
          {prizeLoading && activeTab === "prize" ? (
            <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.035] px-4 py-8 text-center">
              <p
                className="text-[13px]"
                style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
              >
                Loading...
              </p>
            </div>
          ) : activeRows.length === 0 ? (
            <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.035] px-4 py-8 text-center">
              <p
                className="text-[13px]"
                style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
              >
                {activeTab === "game" ? "No rewards waiting to redeem." : "No prize history yet."}
              </p>
            </div>
          ) : (
            activeRows.map((r) => <HistoryRow key={r.id} row={r} />)
          )}
        </div>
      </div>

      {activeTotalPages > 1 && (
        <div className="mb-4 flex items-center justify-center gap-3">
          <PageButton
            label="Previous page"
            onClick={() => handlePageChange?.(activeCurrentPage - 1)}
            disabled={activeCurrentPage <= 1}
          >
            {"<"}
          </PageButton>
          <span
            className="min-w-[58px] text-center text-[12px] font-semibold"
            style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
          >
            {activeCurrentPage} / {activeTotalPages}
          </span>
          <PageButton
            label="Next page"
            onClick={() => handlePageChange?.(activeCurrentPage + 1)}
            disabled={activeCurrentPage >= activeTotalPages}
          >
            {">"}
          </PageButton>
        </div>
      )}

      {activeTab === "game" && (
        hasRedeemableRows ? (
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
        )
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
