"use client";

import { motion } from "framer-motion";
import GreenCta from "./GreenCta";
import HeroDisc from "./HeroDisc";
import { usePkColors } from "./usePkColors";
import { KrPkGlowText, KrPkHeroDisc } from "../themes/kingrewards/KrPkParts";

export default function LaunchPhase({ onStart }) {
  const { colors: COLORS, theme, isKingRewards } = usePkColors();
  const Button = theme?.Button;

  // Not drawn in the KR Figma; built from the loading frame's disc + glow-gold type.
  if (isKingRewards) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-[clamp(24px,5vh,40px)] px-6 pb-4 pt-[64px]">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <KrPkHeroDisc />
        </motion.div>
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
        >
          <KrPkGlowText as="h2" size="clamp(28px, 9.7vw, 40px)">Kick Off!!</KrPkGlowText>
        </motion.div>
        <Button variant="gold" onClick={onStart}>Start</Button>
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

      {/* Themed skins use their ornate button image; default keeps the CTA. */}
      {Button ? (
        <Button onClick={onStart}>Start</Button>
      ) : (
        <GreenCta onClick={onStart}>Start</GreenCta>
      )}
    </div>
  );
}
