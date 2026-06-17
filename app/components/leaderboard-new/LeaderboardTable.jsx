"use client";

import { motion } from "framer-motion";

function TableRow({ entry, config, isCurrentUser }) {
  return (
    <div
      className="flex gap-4 items-center px-4 py-3"
      style={{
        backgroundColor: isCurrentUser ? config.color : "transparent",
        borderBottom: `1px solid ${isCurrentUser ? config.color : config.rowBorder}`,
      }}
    >
      {/* Rank */}
      <div className="flex items-center h-8 shrink-0">
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
        className="flex-1 min-w-0 text-base text-[#e5e2e1]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {isCurrentUser ? "You" : entry.user}
      </div>

      {/* Value */}
      {config.showPrizeColumn && (
        <div
          className="flex-1 min-w-0 text-base font-semibold text-[#e5e2e1] text-center"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {entry.value}
        </div>
      )}

      {/* Prize / Total amount */}
      <div className="shrink-0 text-right">
        <span
          className="text-base"
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
        className="flex gap-4 items-start px-4 pt-4 pb-4"
        style={{
          backgroundColor: config.headerBg,
          borderBottom: `1px solid ${config.tableBorder}`,
        }}
      >
        <span
          className="text-xs font-semibold tracking-[1.2px] uppercase text-white shrink-0"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Rank
        </span>
        <span
          className="text-xs font-semibold tracking-[1.2px] uppercase text-white flex-1 min-w-0"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          User
        </span>
        {config.showPrizeColumn && (
          <span
            className="text-xs font-semibold tracking-[1.2px] uppercase text-white flex-1 min-w-0 text-center whitespace-pre-line"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {config.tableValueHeader.replace(" ", "\n")}
          </span>
        )}
        <span
          className="text-xs font-semibold tracking-[1.2px] uppercase text-white text-right shrink-0"
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            width: config.showPrizeColumn ? "59px" : "auto",
          }}
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
