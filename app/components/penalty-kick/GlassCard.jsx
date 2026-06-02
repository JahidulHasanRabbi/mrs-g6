"use client";

import { motion } from "framer-motion";
import { COLORS } from "./constants";

export default function GlassCard({ children, className = "", style }) {
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
