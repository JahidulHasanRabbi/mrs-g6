"use client";

import { motion } from "framer-motion";
import GreenCta from "./GreenCta";
import HeroDisc from "./HeroDisc";
import { usePkColors } from "./usePkColors";

export default function LaunchPhase({ onStart }) {
  const { colors: COLORS } = usePkColors();
  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <HeroDisc spin={false} />
      </motion.div>

      <motion.h2
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
        className="mb-10 font-bold tracking-wider uppercase"
        style={{
          fontSize: "clamp(28px, 8.4vw, 40px)",
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          textShadow: `0 0 14px ${COLORS.glow55}, 0 0 28px ${COLORS.glow35}`,
        }}
      >
        Kick Off!!
      </motion.h2>

      <GreenCta onClick={onStart}>Start</GreenCta>
    </div>
  );
}
