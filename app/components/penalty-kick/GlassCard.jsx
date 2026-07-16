"use client";

import { motion } from "framer-motion";
import { COLORS } from "./constants";
import { usePkColors } from "./usePkColors";

export default function GlassCard({ children, className = "", style }) {
  const { theme } = usePkColors();

  // Themed dialogs (info / terms / history / goal) wrap the same content in the
  // active skin's crowned ornate frame. Each theme's OrnateCard keeps the
  // heading clear of the crown as content grows (acebet77 via a 3-slice, ubet
  // via a padded stretch frame), fixing headings/links spilling out of the box.
  if (theme) {
    const { OrnateCard } = theme;
    return <OrnateCard className={className}>{children}</OrnateCard>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`w-full max-w-[350px] rounded-[12px] p-[17px] backdrop-blur-[10px] ${className}`}
      style={{
        backgroundColor: COLORS.glassFill,
        border: `1px solid ${COLORS.glassBorder}`,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
