"use client";

import { motion } from "framer-motion";
import { FORM_COLORS } from "./constants";

export default function ProgressBar({ progress = 0 }) {
  const progressPercentage = Math.min(100, Math.max(0, progress));

  return (
    <div className="relative w-full mb-6">
      {/* Progress Bar Container */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        {/* Animated Progress Fill */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: FORM_COLORS.primary }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      {/* Progress Percentage Display */}
      <div className="flex justify-between items-center mt-2">
        <span 
          className="text-sm font-medium"
          style={{ color: FORM_COLORS.textButton }}
        >
          Progress: {progressPercentage}%
        </span>
        <span 
          className="text-xs opacity-75"
          style={{ color: FORM_COLORS.textButton }}
        >
          {Math.floor(progressPercentage / 20)} / 5 fields completed
        </span>
      </div>
    </div>
  );
}
