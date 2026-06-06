"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GreenCta from "./GreenCta";
import HeroDisc from "./HeroDisc";
import { COLORS, DURATIONS } from "./constants";

export default function LoadingPhase({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATIONS.loadingMs);
      setProgress(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else onCompleteRef.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []); // run once — onCompleteRef always holds the latest callback

  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <HeroDisc spin />
      </motion.div>

      <div className="mb-3 flex w-full items-center justify-between">
        <span
          className="text-[14px] font-bold tracking-wider uppercase"
          style={{
            color: COLORS.primary,
            fontFamily: "'Lexend', sans-serif",
            textShadow: "0 0 8px rgba(84,233,138,0.4)",
          }}
        >
          Initializing Arena
        </span>
        <span
          className="text-[24px] font-bold"
          style={{
            color: COLORS.primary,
            fontFamily: "'Anybody', 'Lexend', sans-serif",
            textShadow: "0 0 8px rgba(84,233,138,0.4)",
          }}
        >
          {progress}%
        </span>
      </div>

      <div
        className="mb-3 h-4 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: COLORS.trackDark }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-100 ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${COLORS.primaryGradStart}, ${COLORS.primary})`,
            boxShadow: `0 0 12px ${COLORS.greenSoft50}`,
          }}
        />
      </div>

      <p
        className="mb-8 text-center text-[14px]"
        style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        Connecting to Global Leaderboards...
      </p>

      <GreenCta disabled>Start</GreenCta>
    </div>
  );
}
