"use client";

import { motion } from "framer-motion";

function TableRow({ entry, config, isCurrentUser }) {
  const columns = config.showPrizeColumn
    ? "38px minmax(0, 1fr) minmax(82px, 104px) minmax(72px, 88px)"
    : "38px minmax(0, 1fr) minmax(84px, 112px)";

  return (
    <div
      className="grid items-center px-3 py-3 sm:px-4"
      style={{
        gridTemplateColumns: columns,
        columnGap: "12px",
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
        className="min-w-0 overflow-hidden truncate text-sm text-[#e5e2e1] sm:text-base"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {isCurrentUser ? "You" : entry.user}
      </div>

      {/* Value */}
      {config.showPrizeColumn && (
        <div
          className="min-w-0 overflow-hidden truncate text-right text-sm font-semibold tabular-nums text-[#e5e2e1] sm:text-base"
          style={{ fontFamily: "var(--font-inter)" }}
          title={entry.value}
        >
          {entry.value}
        </div>
      )}

      {/* Prize / Total amount */}
      <div className="min-w-0 overflow-hidden text-right">
        <span
          className="block truncate whitespace-nowrap text-sm tabular-nums sm:text-base"
          style={{
            color: isCurrentUser ? "#e5e2e1" : config.color,
            fontFamily: "var(--font-inter)",
          }}
          title={config.showPrizeColumn ? entry.prize || "-" : entry.value}
        >
          {config.showPrizeColumn ? entry.prize || "-" : entry.value}
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
  const columns = config.showPrizeColumn
    ? "38px minmax(0, 1fr) minmax(82px, 104px) minmax(72px, 88px)"
    : "38px minmax(0, 1fr) minmax(84px, 112px)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full rounded-lg overflow-hidden p-px"
      style={{
        backgroundColor: "var(--lb-card-overlay)",
        border: `1px solid ${config.tableBorder}`,
        boxShadow:
          "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
      }}
    >
      {/* Table header */}
      <div
        className="grid items-end px-3 pb-4 pt-4 sm:px-4"
        style={{
          gridTemplateColumns: columns,
          columnGap: "12px",
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
