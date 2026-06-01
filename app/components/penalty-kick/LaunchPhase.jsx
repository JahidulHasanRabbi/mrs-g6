"use client";

import { motion } from "framer-motion";
import GreenCta from "./GreenCta";
import HeroDisc from "./HeroDisc";
import { COLORS } from "./constants";

export default function LaunchPhase({ onStart }) {
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
        className="mb-10 text-[40px] font-bold tracking-wider uppercase"
        style={{
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          textShadow:
            "0 0 14px rgba(84,233,138,0.55), 0 0 28px rgba(84,233,138,0.35)",
        }}
      >
        Kick Off!!
      </motion.h2>

      <GreenCta onClick={onStart}>Start</GreenCta>
    </div>
  );
}
