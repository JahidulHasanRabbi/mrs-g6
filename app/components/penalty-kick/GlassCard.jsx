"use client";

import { motion } from "framer-motion";
import { COLORS } from "./constants";
import { usePkColors } from "./usePkColors";
import { ACEBET_ASSETS } from "../themes/acebet77/assets";

export default function GlassCard({ children, className = "", style }) {
  const { isAcebet77 } = usePkColors();

  // Acebet77 dialogs (Figma 61:1002 info / 61:1128 terms / 61:1300 history /
  // 4:634 goal): same content, wrapped in the crowned ornate gold frame.
  // Built as a 3-slice (fixed crown top + stretchable rail middle + fixed
  // flourish bottom) so the frame GROWS with its content — the heading always
  // sits below the crown and the last line stays above the flourish, no matter
  // how much content there is (fixes headings/links spilling out of the box).
  if (isAcebet77) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative flex w-full max-w-[360px] flex-col ${className}`}
        style={style}
      >
        <img
          src={ACEBET_ASSETS.ui.frameTop}
          alt=""
          aria-hidden="true"
          className="pointer-events-none block w-full select-none"
        />
        <div
          className="relative -my-px flex flex-col items-center px-[12%] py-1"
          style={{
            backgroundImage: `url(${ACEBET_ASSETS.ui.frameMid})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          {children}
        </div>
        <img
          src={ACEBET_ASSETS.ui.frameBottom}
          alt=""
          aria-hidden="true"
          className="pointer-events-none block w-full select-none"
        />
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
