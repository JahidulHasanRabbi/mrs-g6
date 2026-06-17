"use client";

import { motion } from "framer-motion";

function TableRow({ entry, config, isCurrentUser }) {
  return (
    <div
      className="grid items-center px-3 sm:px-4 py-3"
      style={{
        gridTemplateColumns: config.showPrizeColumn
          ? "36px 1fr auto auto"
          : "36px 1fr auto",
        gap: "8px",
        backgroundColor: isCurrentUser ? config.color : "transparent",
        borderBottom: `1px solid ${isCurrentUser ? config.color : config.rowBorder}`,
      }}
    >
      {/* Rank */}
      <div className="flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center border p-px"
          style={{
            borderColor: isCurrentUser ? "#d7d7d7" : "#a48c7a",
            backgroundColor: isCurrentUser ? "white" : "transparent",
          }}
        >
          <span
            className="text-sm text-center"
            style={{
              color: isCurrentUser ? config.color : "#e5e2e1",
              fontFamily: "var(--font-jetbrains-mono)",
            }}
          >
            {entry.rank}
          </span>
        </div>
      </div>

      {/* User */}
      <div
        className="min-w-0 truncate text-sm sm:text-base text-[#e5e2e1]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {isCurrentUser ? "You" : entry.user}
      </div>

      {/* Value */}
      {config.showPrizeColumn && (
        <div
          className="text-sm sm:text-base font-semibold text-[#e5e2e1] text-right"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {entry.value}
        </div>
      )}

      {/* Prize / Total amount */}
      <div className="text-right whitespace-nowrap">
        <span
          className="text-sm sm:text-base"
          style={{
            color: isCurrentUser ? "#e5e2e1" : config.color,
            fontFamily: "var(--font-inter)",
          }}
        >
          {config.showPrizeColumn ? entry.prize : entry.value}
        </span>
      </div>
    </div>
  );
}

export default function LeaderboardTable({
  entries = [],
  config,
  currentUserRank,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full rounded-lg overflow-hidden p-px"
      style={{
        backgroundColor: "rgba(14,14,14,0.75)",
        border: `1px solid ${config.tableBorder}`,
        boxShadow:
          "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
      }}
    >
      {/* Table header */}
      <div
        className="grid items-end px-3 sm:px-4 pt-4 pb-4"
        style={{
          gridTemplateColumns: config.showPrizeColumn
            ? "36px 1fr auto auto"
            : "36px 1fr auto",
          gap: "8px",
          backgroundColor: config.headerBg,
          borderBottom: `1px solid ${config.tableBorder}`,
        }}
      >
        <span
          className="text-[10px] sm:text-xs font-semibold tracking-[1.2px] uppercase text-white"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Rank
        </span>
        <span
          className="text-[10px] sm:text-xs font-semibold tracking-[1.2px] uppercase text-white"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          User
        </span>
        {config.showPrizeColumn && (
          <span
            className="text-[10px] sm:text-xs font-semibold tracking-[1.2px] uppercase text-white text-right whitespace-pre-line"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {config.tableValueHeader.replace(" ", "\n")}
          </span>
        )}
        <span
          className="text-[10px] sm:text-xs font-semibold tracking-[1.2px] uppercase text-white text-right"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {config.showPrizeColumn ? "PRIZE" : config.tableValueHeader.replace(" ", "\n")}
        </span>
      </div>

      {/* Table rows */}
      {entries.map((entry, i) => (
        <TableRow
          key={entry.rank || i}
          entry={entry}
          config={config}
          isCurrentUser={entry.rank === currentUserRank || entry.isCurrentUser}
        />
      ))}
    </motion.div>
  );
}
