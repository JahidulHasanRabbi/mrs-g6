"use client";

import { motion } from "framer-motion";
import GoalFrame from "./GoalFrame";
import Keeper from "./Keeper";
import Ball from "./Ball";
import { useResponsiveScale } from "./useResponsiveScale";
import { usePkColors } from "./usePkColors";

export default function ReadyPhase({ surfaceHandlers, setSurface }) {
  const { colors: COLORS } = usePkColors();
  // 100 px at the 475 design width; scales down on narrow phones and matches
  // the kicking ball so there's no size pop when the swipe fires.
  const ballSize = Math.round(100 * useResponsiveScale());
  return (
    <div
      ref={setSurface}
      {...surfaceHandlers}
      className="relative flex w-full flex-1 cursor-grab touch-none select-none flex-col items-center justify-end active:cursor-grabbing"
      style={{ minHeight: 540 }}
    >
      {/* Rendered FIRST so it stacks behind GoalFrame and Keeper —
          reads as a stadium banner peeking through the goal net/posts. */}
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute left-0 right-0 text-center font-bold tracking-wider uppercase"
        style={{
          // Sits ABOVE the goal: the crossbar is at 48vh + goalWidth×0.494
          // (the goalpost image aspect 643/1302), and +16px lifts the text
          // just clear of it into the dark crowd band above the goal.
          bottom: "calc(48vh + min(400px, 84vw) * 0.494 + 16px)",
          zIndex: 0,
          // 32px at the 475 design width; the low floor lets it shrink to
          // fit the smaller goal mouth on narrow phones (else it overflows
          // the crossbar).
          fontSize: "clamp(16px, 6.7vw, 32px)",
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          // Dark stroke gives the text a hard edge against the net mesh
          // and crowd; paintOrder keeps the stroke behind the fill so
          // the green color stays vivid. Green glow on top for brand.
          WebkitTextStroke: "2px rgba(0,0,0,0.9)",
          paintOrder: "stroke fill",
          textShadow: `0 2px 4px rgba(0,0,0,0.85), 0 0 14px ${COLORS.glow55}, 0 0 28px ${COLORS.glow35}`,
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
        size={ballSize}
        style={{
          left: "50%",
          // 24vh gives an airy gap to the goal on tall phones. The 200px floor
          // stops the ball dropping into the token pills on short devices —
          // the pills top out ~182px from the bottom (fixed px), so below an
          // ~833px viewport 24vh alone landed the ball on top of them. Must
          // stay in sync with BALL_REST_FLOOR_PX in physics.js so the kicking
          // ball starts where the resting ball sat (no pop on swipe).
          bottom: "max(24vh, 200px)",
          marginTop: 0,
          zIndex: 10,
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
