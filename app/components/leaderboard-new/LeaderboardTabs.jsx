"use client";

import { motion } from "framer-motion";
import { LEADERBOARD_CONFIG, ENABLED_LEADERBOARD_TYPES } from "./constants";

export default function LeaderboardTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex w-full rounded-full overflow-hidden border border-[#333] bg-[rgba(20,20,20,0.8)]">
      {ENABLED_LEADERBOARD_TYPES.map((type) => {
        const isActive = type === activeTab;
        const config = LEADERBOARD_CONFIG[type];

        return (
          <button
            key={type}
            onClick={() => onTabChange(type)}
            className="relative min-w-0 flex-1 px-1 py-2.5 text-[11px] font-semibold transition-colors duration-200 min-[390px]:px-3 min-[390px]:text-sm"
            style={{
              fontFamily: "var(--font-inter)",
              color: isActive ? "#fff" : "#999",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: config.color }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
