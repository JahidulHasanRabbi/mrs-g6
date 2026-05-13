"use client";

import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";

export const MART_CATEGORIES = [
  { key: "starter", label: "Starter", fullLabel: "Starter Rewards", tierOrder: 1 },
  { key: "premium", label: "Premium", fullLabel: "Premium Rewards", tierOrder: 2 },
  { key: "exclusive", label: "Exclusive", fullLabel: "Exclusive Rewards", tierOrder: 3 },
  { key: "vip", label: "VIP", fullLabel: "VIP Privileges", tierOrder: 4 },
];

export default function MartCategoryPills({
  selected = "",
  onSelect,
  unlockedTierOrder = 1,
  categories = [],
}) {
  // Fallback to hardcoded categories if none provided
  const displayCategories = categories.length > 0 ? categories : MART_CATEGORIES;

  return (
    <motion.div
      className="grid grid-cols-2 gap-x-3 gap-y-3 mt-4 justify-items-center w-fit mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      {displayCategories.map((cat, index) => {
        const isLocked = cat.tierOrder > unlockedTierOrder;
        const isSelected = selected === cat.key;

        return (
          <motion.button
            key={cat.key}
            type="button"
            onClick={() => onSelect?.(cat.key)}
            aria-label={cat.fullLabel}
            aria-pressed={isSelected}
            className="relative w-[186px] h-[51px] block"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: isLocked && !isSelected ? 0.85 : 1,
              scale: isSelected ? 1.04 : 1,
            }}
            transition={{ duration: 0.35, delay: 0.25 + index * 0.06, ease: "easeOut" }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            <img
              alt=""
              src={MART_ASSETS.sortButton}
              className="w-full h-full object-fill"
              style={{
                filter: isSelected
                  ? "drop-shadow(0 0 6px rgba(233, 175, 65, 0.85))"
                  : "none",
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 px-3">
              {isLocked && (
                <img
                  alt=""
                  src={MART_ASSETS.lockIcon}
                  className="w-[14px] h-[14px] flex-shrink-0"
                />
              )}
              <span className="text-[#60803c] text-[14px] font-bold font-['Times_New_Roman'] leading-none whitespace-nowrap">
                {cat.label}
              </span>
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
