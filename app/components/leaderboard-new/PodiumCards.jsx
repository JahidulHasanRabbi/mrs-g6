"use client";

import { motion } from "framer-motion";

function PodiumCard({ rank, entry, config }) {
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
        backgroundColor: "rgba(32,31,31,0.75)",
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
        className="text-sm font-light text-[#e5e2e1] mb-1"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        User: {entry.user}
      </p>

      {/* Value */}
      <p
        className="text-xl font-semibold text-[#e5e2e1] mb-1"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {config.valueLabel}: {entry.value}
      </p>

      {/* Prize */}
      {entry.prize && (
        <p
          className="text-xs font-semibold tracking-[1.2px]"
          style={{
            color: rc.prizeColor,
            fontFamily: "var(--font-jetbrains-mono)",
          }}
        >
          PRIZE: {entry.prize}
        </p>
      )}
    </motion.div>
  );
}

export default function PodiumCards({ top3 = [], config }) {
  if (!top3.length) return null;

  return (
    <div className="w-full flex flex-col gap-1">
      {top3.map((entry, i) => (
        <PodiumCard
          key={entry.rank || i + 1}
          rank={entry.rank || i + 1}
          entry={entry}
          config={config}
        />
      ))}
    </div>
  );
}
