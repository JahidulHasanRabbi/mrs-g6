"use client";

import { motion } from "framer-motion";

function PodiumCard({ rank, entry, config, isCurrentUser }) {
  const rankColors = {
    1: {
      bg: config.rank1Bg,
      border: config.rank1Border,
      borderWidth: 2,
      shadow: `0 3px 6px 0 ${config.rank1Shadow}`,
      badgeShadow: `drop-shadow(0 0 10px ${config.rank1Shadow})`,
      prizeColor: config.color,
      showCrown: true,
    },
    2: {
      bg: config.rank2Bg,
      border: config.rank2Border,
      borderWidth: 1,
      shadow: "none",
      badgeShadow: "none",
      prizeColor: config.rank2PrizeColor,
      textDark: config.rank2TextDark,
      showCrown: false,
    },
    3: {
      bg: config.rank3Bg,
      border: config.rank3Border,
      borderWidth: 1,
      shadow: "none",
      badgeShadow: "none",
      prizeColor: config.rank3PrizeColor,
      textDark: config.rank3TextDark,
      showCrown: false,
    },
  };

  const rc = rankColors[rank];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className="w-full rounded-lg flex flex-col gap-1 items-center justify-end p-6"
      style={{
        backgroundColor: isCurrentUser ? config.color : "var(--lb-card-overlay)",
        border: `${rc.borderWidth}px solid ${rc.border}`,
        boxShadow: rc.shadow,
      }}
    >
      {/* Rank badge */}
      <div className="mb-4">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: rc.bg,
            filter: rc.badgeShadow,
          }}
        >
          {rc.showCrown ? (
            <img
              src="/assets/leaderboard/crown-icon.svg"
              alt="1st"
              className="w-[30px] h-7"
            />
          ) : (
            <span
              className="text-2xl font-extrabold"
              style={{
                color: rc.textDark,
                fontFamily: "var(--font-jetbrains-mono)",
              }}
            >
              {rank}
            </span>
          )}
        </div>
      </div>

      {/* User */}
      <p
        className="text-sm font-light mb-1"
        style={{ fontFamily: "var(--font-inter)", color: isCurrentUser ? "#ffffff" : "#e5e2e1" }}
      >
        User: {isCurrentUser ? "You" : entry.user}
      </p>

      {/* Value */}
      <p
        className="text-xl font-semibold mb-1"
        style={{ fontFamily: "var(--font-inter)", color: isCurrentUser ? "#ffffff" : "#e5e2e1" }}
      >
        {config.valueLabel}: {entry.value}
      </p>

      {/* Prize */}
      {entry.prize && (
        <p
          className="text-xs font-semibold tracking-[1.2px]"
          style={{
            color: isCurrentUser ? "#ffffff" : rc.prizeColor,
            fontFamily: "var(--font-jetbrains-mono)",
          }}
        >
          PRIZE: {entry.prize}
        </p>
      )}
    </motion.div>
  );
}

export default function PodiumCards({ top3 = [], config, currentUserRank }) {
  if (!top3.length) return null;

  return (
    <div className="w-full flex flex-col gap-1">
      {top3.map((entry, i) => {
        const rank = entry.rank || i + 1;
        return (
          <PodiumCard
            key={rank}
            rank={rank}
            entry={entry}
            config={config}
            isCurrentUser={rank === currentUserRank}
          />
        );
      })}
    </div>
  );
}
