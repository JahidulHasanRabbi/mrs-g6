"use client";

import { motion } from "framer-motion";
import { LEADERBOARD_TYPES, LEADERBOARD_CONFIG } from "./constants";

const TABS = [
  { key: LEADERBOARD_TYPES.DEPOSIT, label: "Deposit" },
  { key: LEADERBOARD_TYPES.REFERRER, label: "Referrer" },
  { key: LEADERBOARD_TYPES.WITHDRAWAL, label: "Withdrawal" },
];

export default function LeaderboardTabs({ activeTab, onTabChange }) {
  const activeConfig = LEADERBOARD_CONFIG[activeTab];

  return (
    <div className="flex w-full rounded-full overflow-hidden border border-[#333] bg-[rgba(20,20,20,0.8)]">
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const config = LEADERBOARD_CONFIG[tab.key];

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className="flex-1 relative py-2.5 px-3 text-sm font-semibold transition-colors duration-200"
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
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
