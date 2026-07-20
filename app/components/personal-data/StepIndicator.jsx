"use client";

import { motion } from "framer-motion";
import { FORM_COLORS } from "./constants";
import { useTheme } from "../../contexts/ThemeContext";
import { ACEBET_COLORS } from "../themes/acebet77/assets";

export default function ProgressBar({ progress = 0 }) {
  const progressPercentage = Math.min(100, Math.max(0, progress));
  const { isAcebet77 } = useTheme();

  // Asset-level colour swaps only — bar / text colours match the surrounding
  // theme. On acebet77 the default black text is unreadable against the dark
  // themed background; use theme gold instead. Fill and animation logic are
  // unchanged.
  const trackClass = isAcebet77
    ? "relative h-3 rounded-full overflow-hidden border border-[#5c3f0f] bg-[#1a1105]"
    : "relative h-3 bg-gray-200 rounded-full overflow-hidden";
  const textColor = isAcebet77 ? ACEBET_COLORS.gold : FORM_COLORS.textButton;

  return (
    <div className="relative w-full mb-6">
      <div className={trackClass}>
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: FORM_COLORS.primary }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-medium" style={{ color: textColor }}>
          Progress: {progressPercentage}%
        </span>
        <span className="text-xs opacity-75" style={{ color: textColor }}>
          {Math.floor(progressPercentage / 20)} / 5 fields completed
        </span>
      </div>
    </div>
  );
}
