"use client";

import { motion } from "framer-motion";
import { COLORS } from "./constants";
import { usePkColors } from "./usePkColors";
import { ACEBET_ASSETS } from "../themes/acebet77/assets";

export default function GlassCard({ children, className = "", style }) {
  const { isAcebet77 } = usePkColors();

  // Acebet77 dialogs (Figma 61:1002 info / 61:1128 terms / 61:1300 history /
  // 4:634 goal): same content, wrapped in the crowned ornate gold frame
  // instead of the glass panel.
  if (isAcebet77) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative w-full max-w-[374px] px-[30px] pt-[72px] pb-[36px] ${className}`}
        style={style}
      >
        <img
          src={ACEBET_ASSETS.ui.dialogFrameTall}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-fill"
        />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
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
