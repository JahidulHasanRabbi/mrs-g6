"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GreenCta from "./GreenCta";
import HeroDisc from "./HeroDisc";
import { DURATIONS } from "./constants";
import { usePkColors } from "./usePkColors";
import { KrPkHeroDisc, KrPkProgress } from "../themes/kingrewards/KrPkParts";

export default function LoadingPhase({ onComplete }) {
  const { colors: COLORS, theme, isKingRewards } = usePkColors();
  const Button = theme?.Button;
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

  // Figma 707:5914: disc + progress only (no status line, no disabled Start).
  if (isKingRewards) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-[clamp(32px,8vh,70px)] px-9 pb-4 pt-[64px]">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <KrPkHeroDisc spin />
        </motion.div>
        <KrPkProgress progress={progress} />
      </div>
    );
  }

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
            textShadow: `0 0 8px ${COLORS.glow40}`,
          }}
        >
          Initializing Arena
        </span>
        <span
          className="text-[24px] font-bold"
          style={{
            color: COLORS.primary,
            fontFamily: "'Anybody', 'Lexend', sans-serif",
            textShadow: `0 0 8px ${COLORS.glow40}`,
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

      {/* Themed skins use their ornate button image; default keeps the CTA. */}
      {Button ? (
        <Button disabled>Start</Button>
      ) : (
        <GreenCta disabled>Start</GreenCta>
      )}
    </div>
  );
}
