"use client";

import { motion } from "framer-motion";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";
import ThemedActionButton from "../themes/shared/ThemedActionButton";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatAmount(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function HistoryRow({ row, index }) {
  const amount = formatAmount(row.amount);
  const itemType = row.item_type || "";

  return (
    <motion.div
      className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[rgba(255,246,223,0.12)] bg-white/[0.035] px-3 py-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <div className="grid h-[42px] w-[42px] place-items-center rounded-lg bg-[#2e2a1e] border border-[rgba(77,71,50,0.35)]">
        <img src={SMASH_EGG_ASSETS.headerEggIcon} alt="" className="h-6 w-6 object-contain" draggable={false} />
      </div>

      <div className="min-w-0">
        <p
          className="truncate text-[14px] leading-5 text-[#fff6df]"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
        >
          {row.reward_name || "Reward"}
        </p>
        <p
          className="mt-0.5 truncate text-[10px] uppercase tracking-[0.4px] text-[#999077]"
          style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
        >
          {formatDate(row.created)} {itemType ? `- ${itemType}` : ""}
        </p>
      </div>

      <div className="text-right">
        <p
          className="text-[13px] font-bold text-[#ffe16d]"
          style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
        >
          {amount ? `RM ${amount}` : itemType}
        </p>
      </div>
    </motion.div>
  );
}

function PageButton({ children, disabled, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-full border border-[rgba(255,246,223,0.18)] bg-white/[0.04] text-[15px] text-[#fff6df] transition-colors hover:border-[#ffd700]/60 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export default function SmashEggHistoryDialog({
  rows = [],
  loading = false,
  total = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onClose,
}) {
  return (
    <div
      className="relative w-[390px] max-w-[calc(100vw-32px)] rounded-xl border border-[rgba(255,246,223,0.18)] p-5 overflow-hidden"
      style={{
        backgroundColor: "rgba(35,31,20,0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45), inset 0 0 15px rgba(233,196,0,0.06)",
      }}
    >
      <div className="mb-4 flex items-center justify-between rounded-lg border border-[rgba(255,225,109,0.14)] bg-white/[0.04] px-4 py-3">
        <h3
          className="text-[16px] uppercase tracking-[1px] text-[#ffd700]"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
        >
          Smash History
        </h3>
        <span
          className="rounded-full bg-[#2e2a1e] px-2.5 py-1 text-[10px] text-[#d0c6ab]"
          style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
        >
          {total} total
        </span>
      </div>

      <div className="smash-history-scroll mb-4 flex max-h-[360px] flex-col gap-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="rounded-lg border border-[rgba(255,246,223,0.08)] bg-white/[0.035] px-4 py-8 text-center text-[13px] text-[#d0c6ab]">
            Loading...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-[rgba(255,246,223,0.08)] bg-white/[0.035] px-4 py-8 text-center text-[13px] text-[#d0c6ab]">
            No smash history yet.
          </div>
        ) : (
          rows.map((row, index) => <HistoryRow key={row.uuid || index} row={row} index={index} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="mb-4 flex items-center justify-center gap-3">
          <PageButton label="Previous page" onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1}>
            {"<"}
          </PageButton>
          <span className="min-w-[58px] text-center text-[12px] font-semibold text-[#d0c6ab]">
            {currentPage} / {totalPages}
          </span>
          <PageButton label="Next page" onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages}>
            {">"}
          </PageButton>
        </div>
      )}

      <div className="flex w-full justify-center">
        <ThemedActionButton
          textSize={14}
          onClick={onClose}
          fallback={
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-[#f2cb7a] px-5 py-3 text-[14px] font-semibold text-[#141828]"
              style={{ backgroundImage: "linear-gradient(98deg, #dc9d16 1%, #f2cb7a 98%)" }}
            >
              Close
            </button>
          }
        >
          Close
        </ThemedActionButton>
      </div>

      <style jsx>{`
        .smash-history-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 215, 0, 0.42) transparent;
        }
        .smash-history-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .smash-history-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .smash-history-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.42);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}
