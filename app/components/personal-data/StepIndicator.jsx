"use client";

import { motion } from "framer-motion";
import { FORM_COLORS } from "./constants";
import { useTheme } from "../../contexts/ThemeContext";
import { ACEBET_COLORS } from "../themes/acebet77/assets";
import { UBET_COLORS } from "../themes/ubetclub/assets";
import { EP369_COLORS } from "../themes/ep369/assets";

export default function ProgressBar({ progress = 0 }) {
  const progressPercentage = Math.min(100, Math.max(0, progress));
  const { isAcebet77, isUbetclub, isEp369 } = useTheme();

  let trackClass = "relative h-3 bg-gray-200 rounded-full overflow-hidden";
  let textColor = FORM_COLORS.textButton;
  if (isAcebet77) {
    trackClass = "relative h-3 rounded-full overflow-hidden border border-[#5c3f0f] bg-[#1a1105]";
    textColor = ACEBET_COLORS.gold;
  } else if (isUbetclub) {
    trackClass = "relative h-3 rounded-full overflow-hidden border border-[#8a5514] bg-[#3d0d10]";
    textColor = UBET_COLORS.goldBright;
  } else if (isEp369) {
    trackClass = "relative h-3 rounded-full overflow-hidden border border-[#2a7e41] bg-[#0d3d1c]";
    textColor = EP369_COLORS.gold;
  }

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
