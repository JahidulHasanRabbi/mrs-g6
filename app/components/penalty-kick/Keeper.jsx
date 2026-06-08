"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { KEEPER } from "./assets";

// 4-frame sprite dive animation:
//   idle  → no-move
//   dive  → jump-{side}-1 → 2 → 3 → 4   (after delayMs)
//   land  → save-{side} on a save, jump-{side} (extended mid-air pose) on a miss
//
// `diveTo` is -1 (left), 0 (center), or 1 (right).
// `outcome` is "save" or "goal" — picks the landing sprite.
// `delayMs` waits before the keeper reacts — higher difficulty reads earlier.
// `kicking` triggers the dive; when false the keeper resets to idle.

const FRAME_MS = 130;       // time between dive frames (4 frames × 130 = 520ms total dive)
const TOTAL_DIVE_MS = FRAME_MS * 4;
const IDLE_FRAME_MS = 360;  // time between still-pose cycle frames — quicker = more alert
// Maximum sideways translation for a full-aim dive (|diveAim|=1). Calibrated
// to match the ball's max endX offset from goal center (≈ aim × half_goal_width).
// At GOAL_HALF_WIDTH_PCT=0.36 on a 475-px surface this is 171 px, so the
// keeper's hand reaches the ball even on a far-post save instead of leaving
// a visible gap (which made the "Saved!" verdict look wrong).
const DIVE_TRAVEL_PX = 170;

// Horizontal position of the keeper's extended *catching* glove inside the
// landscape dive sprite, as a signed fraction of the container width measured
// out from its centre (the sprite is 4:3 and exactly fills the 4:3 landscape
// container, so sprite fractions map 1:1 onto the rendered box). Measured from
// the artwork: jump-right-4 glove sits at x-frac 0.915 (+0.415 from centre),
// jump-left glove at x-frac 0.098 (-0.402). On a save we slide the keeper IN
// by this much so the glove — not the torso centre — lands on the ball,
// closing the gap that made "Saved!" look like the ball flew past the hand.
const SAVE_GLOVE_FRAC = { "-1": -0.402, 1: 0.415 };

export default function Keeper({
  diveTo = 0,
  // Signed magnitude (-1..1) the keeper should commit to during the dive.
  // For a save, KickingPhase passes the actual swipe aim so the keeper
  // lands on top of the ball (not just in the same zone). For a goal /
  // wrong-foot dive, it's the opposite sign at a reduced magnitude.
  // Falls back to sign(diveTo) when unspecified.
  diveAim,
  outcome = "save",
  delayMs = 0,
  kicking = false,
  // Max sideways travel for a full-aim dive, in px. Defaults to the 475-px
  // design value; KickingPhase passes a width-scaled value so the keeper's
  // reach shrinks with the (now responsive) goal on narrow phones and still
  // meets the ball at the post.
  diveTravelPx = DIVE_TRAVEL_PX,
}) {
  // 0 = idle, 1-4 = dive frames, 5 = landed save pose
  const [phase, setPhase] = useState(0);
  // Rendered container width in px. The glove correction is a fraction of the
  // sprite (= container) width, so we measure the actual box rather than
  // assume the 220-px design value — it shrinks with the goal on narrow
  // phones (width is min(220px, 46.3vw)).
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(220);
  // Index into the 3-frame idle pose cycle. Advanced on a setInterval
  // while the keeper is waiting; reset to 0 when the kick fires so the
  // dive starts from a consistent base pose.
  const [idleFrame, setIdleFrame] = useState(0);

  useEffect(() => {
    if (!kicking) {
      setPhase(0);
      return;
    }
    setIdleFrame(0);
    const timers = [];
    // Keeper stays planted when "diving" to centre — no dive frames, just
    // a settle into the appropriate landing pose.
    if (diveTo === 0) {
      timers.push(setTimeout(() => setPhase(5), delayMs));
    } else {
      timers.push(setTimeout(() => setPhase(1), delayMs));
      timers.push(setTimeout(() => setPhase(2), delayMs + FRAME_MS));
      timers.push(setTimeout(() => setPhase(3), delayMs + FRAME_MS * 2));
      timers.push(setTimeout(() => setPhase(4), delayMs + FRAME_MS * 3));
      timers.push(setTimeout(() => setPhase(5), delayMs + TOTAL_DIVE_MS));
    }
    return () => timers.forEach(clearTimeout);
  }, [kicking, diveTo, delayMs]);

  // Cycle the still-pose frames while idle. The cycle freezes the moment a
  // kick fires (kicking=true) so the keeper holds whatever pose they were
  // on as their "ready / reading the shot" stance through delayMs — feels
  // like they're tracking the ball instead of casually shifting weight.
  useEffect(() => {
    if (phase !== 0 || kicking) return;
    const id = setInterval(() => {
      setIdleFrame((i) => (i + 1) % KEEPER.idleCycle.length);
    }, IDLE_FRAME_MS);
    return () => clearInterval(id);
  }, [phase, kicking]);

  const src = pickSprite(phase, diveTo, outcome, idleFrame);
  const isLanded = phase === 5;
  const isDiving = phase >= 1 && phase <= 4;

  // Diving sprites + side-save / mid-dive landing poses are landscape; the
  // idle and centre-save sprites are portrait. Container scales to fit,
  // anchored on the keeper's feet at the goal line.
  const isLandscape = isDiving || (isLanded && diveTo !== 0);

  // Measure the rendered container so the glove correction tracks the goal's
  // responsive width. Re-measure when the landscape/portrait box swaps and on
  // viewport resize/rotation.
  useLayoutEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (el) setContainerW(el.getBoundingClientRect().width);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isLandscape]);

  // Horizontal travel during the dive — the keeper's container slides
  // toward the actual ball landing point as the sprite frames cycle.
  // Magnitude comes from diveAim (signed, |aim|=1 is full reach); the
  // sprite direction still comes from diveTo. CSS transition between
  // phase changes smooths the leap. Without this scaling the keeper
  // under-reaches on corner saves and the verdict "Saved!" looks wrong.
  const aimMag = diveAim ?? Math.sign(diveTo);
  const diveProgress =
    phase === 1 ? 0.28 :
    phase === 2 ? 0.62 :
    phase === 3 ? 0.88 :
    phase >= 4  ? 1.0  : 0;
  const diveOffsetPx = aimMag * diveProgress * diveTravelPx;
  // On a side save the dive lands the container CENTRE on the ball, which
  // leaves the extended glove ~0.41×width past it (toward the post). Pull the
  // keeper back in by the glove's sprite offset so the glove itself meets the
  // ball. Scaled by diveProgress so it eases in with the leap; only for saves
  // (a goal/miss keeper isn't trying to make contact, so leave him be).
  const gloveFrac =
    outcome === "save" && diveTo !== 0 ? SAVE_GLOVE_FRAC[diveTo] ?? 0 : 0;
  const gloveCorrectionPx = -gloveFrac * containerW * diveProgress;
  const totalOffsetPx = diveOffsetPx + gloveCorrectionPx;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute"
      style={{
        left: "50%",
        // Feet on the same 48vh grass-line anchor as the goal post (see
        // GoalFrame) so the keeper stands at the goal line on the horizon.
        // Sized 120 / 165 px to fit the larger 400-wide goal mouth —
        // proportions stay aligned with GoalFrame width so the keeper
        // reads as standing INSIDE the goal, not in front of it.
        bottom: "48vh",
        // Fluid on the 475-px design basis (220/120/165 ÷ 475), so the
        // keeper shrinks in lockstep with the goal on narrow phones and
        // keeps its proportions inside the goal mouth.
        width: isLandscape ? "min(220px, 46.3vw)" : "min(120px, 25.3vw)",
        height: "min(165px, 34.7vw)",
        // translateX -50% centers the container; the second term slides
        // it toward the post during a dive. transition smooths the move
        // across the discrete phase changes so the keeper visibly leaps.
        transform: `translateX(calc(-50% + ${totalOffsetPx}px))`,
        transition: kicking
          ? `transform ${FRAME_MS}ms cubic-bezier(0.25, 0.6, 0.35, 1)`
          : "none",
      }}
    >
      {/* Idle: cycles through the 3 still poses to create real weight-shift
          motion. Once kicking, dive frames + landing pose take over. Both
          left and right dive sprites are natively drawn — no CSS mirror. */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="block h-full w-full select-none"
        style={{
          objectFit: "contain",
          objectPosition: "bottom center",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))",
        }}
      />
    </div>
  );
}

function pickSprite(phase, diveTo, outcome, idleFrame) {
  // Idle — cycle through still-pose frames so the keeper visibly moves.
  if (phase === 0) return KEEPER.idleCycle[idleFrame] ?? KEEPER.noMove;

  // Mid-dive frame (phase 1..4)
  if (phase >= 1 && phase <= 4) {
    const idx = phase - 1;
    if (diveTo === -1) return KEEPER.diveLeft[idx];
    if (diveTo === 1) return KEEPER.diveRight[idx];
    return KEEPER.noMove; // centre never reaches dive phases
  }

  // Landed (phase 5) — sprite depends on whether the keeper saved or missed.
  if (diveTo === 0) {
    // No dive: catch standing if saved, otherwise just stay idle (ball
    // went past).
    return outcome === "save" ? KEEPER.saveCenter : KEEPER.noMove;
  }
  // Side saves and side misses both end on the extended mid-air pose —
  // the save-{side} sprites are intentionally unused (the keeper holding a
  // ball in glove read poorly against the dive frames).
  if (diveTo === -1) return KEEPER.jumpLeft;
  return KEEPER.jumpRight;
}
