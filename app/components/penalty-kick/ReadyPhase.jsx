"use client";

import { motion } from "framer-motion";
import { COLORS } from "./constants";
import GoalFrame from "./GoalFrame";
import Keeper from "./Keeper";
import Ball from "./Ball";

export default function ReadyPhase({ surfaceHandlers, setSurface }) {
  return (
    <div
      ref={setSurface}
      {...surfaceHandlers}
      className="relative flex w-full flex-1 touch-none select-none flex-col items-center justify-end"
      style={{ minHeight: 540 }}
    >
      {/* Rendered FIRST so it stacks behind GoalFrame and Keeper —
          reads as a stadium banner peeking through the goal net/posts. */}
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute left-0 right-0 text-center text-[32px] font-bold tracking-wider uppercase"
        style={{
          top: "12%",
          zIndex: 0,
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          // Dark stroke gives the text a hard edge against the net mesh
          // and crowd; paintOrder keeps the stroke behind the fill so
          // the green color stays vivid. Green glow on top for brand.
          WebkitTextStroke: "2px rgba(0,0,0,0.9)",
          paintOrder: "stroke fill",
          textShadow:
            "0 2px 4px rgba(0,0,0,0.85), 0 0 14px rgba(84,233,138,0.55), 0 0 28px rgba(84,233,138,0.35)",
        }}
      >
        Swipe To Kick
      </motion.h2>

      <GoalFrame />
      <Keeper diveTo={0} />

      {/* Foreground ball at bottom: 14 vh. Sized at 100 px so it still reads
          as "at the kicker's foot" without dominating the frame — the
          earlier 150 px ball crowded the keeper. The lower bottom value
          drops it closer to the camera, opening real distance between
          ball and goal. z-10 keeps it visually in front of goal/keeper.
          marginTop: 0 cancels Ball's default top-anchor centering. */}
      <Ball
        size={100}
        style={{
          left: "50%",
          bottom: "14vh",
          marginTop: 0,
          zIndex: 10,
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
