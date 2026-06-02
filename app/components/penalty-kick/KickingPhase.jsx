"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import GoalFrame from "./GoalFrame";
import Keeper from "./Keeper";
import Ball from "./Ball";
import { COLORS, DURATIONS } from "./constants";
import { buildTrajectory } from "./physics";
import { useResponsiveScale } from "./useResponsiveScale";

// Ball is 100 px at the 475-px design width; scale it down on narrow phones
// so it keeps the same on-screen proportion (and matches the resting ball in
// ReadyPhase so the phase swap doesn't pop).
const BALL_DESIGN_SIZE = 100;
// Keeper full-aim dive travel as a fraction of surface width (170 / 475).
const DIVE_TRAVEL_RATIO = 0.358;

// Ease-out: the ball leaves the foot with energy, decelerates as it
// approaches the goal. Visually heavier than a linear t.
const easeOut = (t) => 1 - Math.pow(1 - t, 2.2);

// How many degrees the ball spins over the full flight (≈1.5 revolutions).
const BALL_SPIN_DEG = 540;

// Plays the ball trajectory + keeper dive then calls onLanded.
//
//   swipe   — { aim, power, curl }
//   outcome — { outcome: 'goal'|'save', saveDelayMs, keeperAim }
//   onLanded — fired once the ball reaches the goal line
export default function KickingPhase({ swipe, outcome, onLanded }) {
  const [t, setT] = useState(0);
  const surfaceRef = useRef(null);
  // dims gets overwritten in useLayoutEffect (before first paint) with
  // the actual surface size. The default values here exist only to keep
  // buildTrajectory safe on the synthetic render before the effect
  // runs — the user never paints a frame with these. Using useEffect
  // (which fires after paint) caused a visible "ball animates twice"
  // glitch: one frame at the default trajectory, then a snap to the
  // real trajectory once dims updated.
  const [dims, setDims] = useState({ w: 475, h: 720, vh: 844 });
  const finishedRef = useRef(false);
  const sizeScale = useResponsiveScale();
  const ballSize = Math.round(BALL_DESIGN_SIZE * sizeScale);

  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setDims({ w: rect.width, h: rect.height, vh: window.innerHeight });
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const tt = Math.min(1, (now - start) / DURATIONS.kickMs);
      setT(tt);
      if (tt < 1) raf = requestAnimationFrame(tick);
      else if (!finishedRef.current) {
        finishedRef.current = true;
        onLanded?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onLanded]);

  const trajectory = buildTrajectory({
    width: dims.w,
    height: dims.h,
    viewportHeight: dims.vh,
    aim: swipe.aim,
    power: swipe.power,
    curl: swipe.curl,
    // Off-target shots push the ball past the post — keeper sees it's
    // not going in and doesn't bother diving.
    offTarget: outcome.offTarget === true,
  });

  // Apply easing to the time parameter so the ball decelerates into the
  // goal — sells the weight of the strike.
  const easedT = easeOut(t);
  const x = trajectory.x(easedT);
  const y = trajectory.y(easedT);
  const scale = trajectory.scale(easedT);
  const rotation = easedT * BALL_SPIN_DEG * (swipe.aim >= 0 ? 1 : -1);
  // Server tells us where the keeper dives. Save = keeper guessed the
  // player's zone; goal = guessed wrong. Either way the ball still flies
  // along the player's actual swipe, so the visual reads honestly.
  const diveDir = outcome.keeperDive ?? 0;

  return (
    <div
      ref={surfaceRef}
      className="relative flex w-full flex-1 select-none flex-col items-center justify-end"
      style={{ minHeight: 540 }}
    >
      {/* Rendered FIRST so it stacks behind GoalFrame and Keeper —
          the verdict reads as a stadium banner peeking through the net. */}
      <h2
        className="pointer-events-none absolute left-0 right-0 text-center font-bold tracking-wider uppercase"
        style={{
          // Sits ABOVE the goal, matching ReadyPhase's "Swipe To Kick"
          // banner (crossbar at 48vh + goalWidth×0.494, +16px clears it).
          bottom: "calc(48vh + min(400px, 84vw) * 0.494 + 16px)",
          zIndex: 0,
          // 40px at the 475 design width; the low floor lets "Off-target!"
          // shrink to fit the smaller goal mouth on a 320-wide device.
          fontSize: "clamp(18px, 8.4vw, 40px)",
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          opacity: t > 0.6 ? 1 : 0,
          transition: "opacity 0.2s ease-out",
          WebkitTextStroke: "2px rgba(0,0,0,0.9)",
          paintOrder: "stroke fill",
          textShadow:
            "0 2px 4px rgba(0,0,0,0.85), 0 0 14px rgba(84,233,138,0.55), 0 0 28px rgba(84,233,138,0.35)",
        }}
      >
        {outcome.outcome === "goal"
          ? "Goal!"
          : outcome.outcome === "miss"
            ? "Off-target!"
            : "Saved!"}
      </h2>

      <GoalFrame />
      <Keeper
        // On an off-target shot, force diveTo=0 so the keeper doesn't
        // dive at all — he stays put and watches the ball sail wide.
        diveTo={outcome.offTarget ? 0 : diveDir}
        // diveAim sets the keeper's exact horizontal landing point.
        // - save:    match swipe.aim so the keeper meets the ball
        // - goal:    wrong-foot, reduced magnitude opposite of aim
        // - miss:    stay planted
        diveAim={
          outcome.offTarget
            ? 0
            : outcome.outcome === "save"
              ? swipe.aim
              : -Math.sign(swipe.aim || 0) * 0.6
        }
        outcome={outcome.offTarget ? "miss" : outcome.outcome}
        delayMs={outcome.saveDelayMs ?? 200}
        // Dive reach scales with the measured surface width so the keeper
        // meets the ball at the post on every device (the ball's max endX
        // offset is GOAL_HALF_WIDTH_PCT × width; this matches it).
        diveTravelPx={dims.w * DIVE_TRAVEL_RATIO}
        kicking
      />

      <Ball
        // size 100 matches the ReadyPhase ball so the phase swap doesn't
        // pop. The trajectory's scale(t) shrinks it as the ball flies
        // away (100 → ~45 at the goal), selling perspective.
        //
        // transition.duration=0 disables framer-motion's automatic
        // tweening of transform/style changes. We drive position by
        // setT every RAF tick, so any tweening on top of that produces
        // a visible "ball overshoots then settles" wobble at the start
        // of the kick — which is exactly what the user described as
        // "ball animates twice".
        size={ballSize}
        transition={{ duration: 0 }}
        style={{
          left: x,
          top: y,
          transform: `scale(${scale}) rotate(${rotation}deg)`,
        }}
      />

    </div>
  );
}
