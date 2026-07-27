"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import { SPIN_ASSETS } from "./spinAssets";
import { usePerformanceOptimization } from "../../hooks/usePerformanceOptimization";
import FluidFrame from "../ui/FluidFrame";

const GRID_AREA = [
  "col-start-1 row-start-1",
  "col-start-2 row-start-1",
  "col-start-3 row-start-1",
  "col-start-1 row-start-2",
  "col-start-3 row-start-2",
  "col-start-1 row-start-3",
  "col-start-2 row-start-3",
  "col-start-3 row-start-3",
];

const SPARKLE_POSITIONS = [
  { top: "-8%", left: "50%", delay: 0 },
  { top: "20%", left: "108%", delay: 0.15 },
  { top: "75%", left: "108%", delay: 0.3 },
  { top: "108%", left: "50%", delay: 0.45 },
  { top: "75%", left: "-8%", delay: 0.6 },
  { top: "20%", left: "-8%", delay: 0.75 },
];

const IDLE_ANIMATE = { scale: 1, boxShadow: "none" };

const ACTIVE_ANIMATE_LOW = {
  scale: 1.08,
  boxShadow: "0 0 15px rgba(253, 230, 133, 0.8), 0 0 30px rgba(253, 230, 133, 0.4)",
};
const ACTIVE_ANIMATE_HIGH = {
  scale: 1.12,
  boxShadow: "0 0 20px rgba(253, 230, 133, 1), 0 0 40px rgba(253, 230, 133, 0.6)",
};

const WINNER_BOXSHADOW_LOW = [
  "0 0 25px rgba(253, 230, 133, 1), 0 0 50px rgba(255, 215, 0, 0.7)",
  "0 0 40px rgba(253, 230, 133, 1), 0 0 70px rgba(255, 215, 0, 0.9)",
  "0 0 25px rgba(253, 230, 133, 1), 0 0 50px rgba(255, 215, 0, 0.7)",
];
const WINNER_BOXSHADOW_HIGH = [
  "0 0 30px rgba(253, 230, 133, 1), 0 0 60px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 215, 0, 0.4)",
  "0 0 50px rgba(253, 230, 133, 1), 0 0 90px rgba(255, 215, 0, 1), 0 0 140px rgba(255, 215, 0, 0.6)",
  "0 0 30px rgba(253, 230, 133, 1), 0 0 60px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 215, 0, 0.4)",
];

const TRANS_IDLE_LOW = { duration: 0.4, ease: "easeOut" };
const TRANS_IDLE_HIGH = { duration: 0.3, ease: "easeOut" };
const TRANS_WINNER = {
  scale: { duration: 0.35, ease: "backOut" },
  boxShadow: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
};

const HALO_TRANSITION = {
  opacity: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
};
const HALO_ANIMATE = { opacity: [0.7, 1, 0.7], rotate: 360 };
const HALO_INITIAL = { opacity: 0, rotate: 0 };

const WINNER_BORDER_ANIMATE = {
  opacity: [1, 0.7, 1],
  borderWidth: ["3px", "5px", "3px"],
};
const WINNER_BORDER_TRANSITION = { duration: 0.6, repeat: Infinity, ease: "easeInOut" };

const ACTIVE_BORDER_ANIMATE = {
  opacity: [1, 0.6, 1],
  borderWidth: ["2px", "3px", "2px"],
};
const ACTIVE_BORDER_TRANSITION = { duration: 0.8, repeat: Infinity, ease: "easeInOut" };

const PRIZE_WINNER_ANIMATE = { opacity: 1, scale: [1, 1.12, 1] };
const PRIZE_WINNER_TRANSITION = {
  scale: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
};
const PRIZE_IDLE_ANIMATE = { opacity: 1, scale: 1 };
const PRIZE_INITIAL = { opacity: 0, scale: 0 };

const SPARKLE_ANIMATE = { opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] };

const SpinItem = memo(function SpinItem({
  background,
  prize,
  index,
  isActive,
  isWinner,
  isSpinning,
  isLowEnd,
  isMidEnd,
  // Themed skins place tiles by absolute % over the frame instead of the
  // default 3x3 CSS grid; `pos` (when set) carries {x, y, size, sizeY} where
  // x/size are % of the frame's width and y/sizeY % of its height. size and
  // sizeY differ whenever the frame isn't square, so the tile stays square.
  pos = null,
}) {
  const winnerScale = isLowEnd ? 1.14 : isMidEnd ? 1.18 : 1.2;
  const animate = isWinner
    ? { scale: winnerScale, boxShadow: isLowEnd ? WINNER_BOXSHADOW_LOW : WINNER_BOXSHADOW_HIGH }
    : isActive
      ? (isLowEnd ? ACTIVE_ANIMATE_LOW : ACTIVE_ANIMATE_HIGH)
      : IDLE_ANIMATE;
  const transition = isWinner
    ? TRANS_WINNER
    : (isLowEnd ? TRANS_IDLE_LOW : TRANS_IDLE_HIGH);
  const zClass = isWinner ? "z-20" : isActive ? "z-10" : "";
  const wrapClassName = pos
    ? `absolute ${zClass}`
    : `relative ${GRID_AREA[index]} w-full h-full ${zClass}`;
  // Position by the tile's top-left corner (centre minus half-size) rather than
  // a translate(-50%): framer-motion drives this element's `transform` for the
  // scale/rotate animations and would clobber any translate we set here.
  const posSizeY = pos ? (pos.sizeY ?? pos.size) : 0;
  const wrapStyle = pos
    ? {
        left: `${pos.x - pos.size / 2}%`,
        top: `${pos.y - posSizeY / 2}%`,
        width: `${pos.size}%`,
        height: `${posSizeY}%`,
      }
    : undefined;
  return (
    <motion.div
      className={wrapClassName}
      style={wrapStyle}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={!isSpinning ? { scale: 1.05 } : undefined}
    >
      {isWinner && !isLowEnd && (
        <motion.div
          className="absolute -inset-3 rounded-[20px] pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,215,0,0) 0deg, rgba(255,215,0,0.9) 60deg, rgba(253,230,133,1) 90deg, rgba(255,215,0,0.9) 120deg, rgba(255,215,0,0) 180deg, rgba(255,215,0,0) 240deg, rgba(253,230,133,0.9) 300deg, rgba(255,215,0,0) 360deg)",
            filter: isMidEnd ? "blur(6px)" : "blur(10px)",
          }}
          initial={HALO_INITIAL}
          animate={HALO_ANIMATE}
          transition={HALO_TRANSITION}
        />
      )}
      <motion.div
        className="relative w-full h-full"
        animate={animate}
        transition={transition}
      >
        <Image
          alt=""
          src={background}
          width={114}
          height={112}
          className="w-full h-full object-fill pointer-events-none"
        />
        {isWinner ? (
          <motion.div
            className="absolute inset-[4px] rounded-[14px] border-[3px] border-[#fde685] pointer-events-none"
            animate={WINNER_BORDER_ANIMATE}
            transition={WINNER_BORDER_TRANSITION}
          />
        ) : isActive ? (
          <motion.div
            className="absolute inset-[6px] rounded-[14px] border-2 border-[#fde685] pointer-events-none"
            animate={ACTIVE_BORDER_ANIMATE}
            transition={ACTIVE_BORDER_TRANSITION}
          />
        ) : null}
      </motion.div>
      {prize && (
        <motion.div
          initial={PRIZE_INITIAL}
          animate={isWinner ? PRIZE_WINNER_ANIMATE : PRIZE_IDLE_ANIMATE}
          transition={
            isWinner
              ? PRIZE_WINNER_TRANSITION
              : { duration: 0.4, delay: index * 0.1 + 0.3, ease: "easeOut" }
          }
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${pos ? "w-[52%] h-[52%]" : "w-[60px] h-[57px]"}`}
        >
          <img
            alt=""
            src={prize}
            className="max-w-full max-h-full object-contain pointer-events-none"
          />
        </motion.div>
      )}
      {isWinner && !isLowEnd && SPARKLE_POSITIONS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#fff6c2] pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 8px rgba(255, 215, 0, 1), 0 0 14px rgba(255, 215, 0, 0.7)",
          }}
          animate={SPARKLE_ANIMATE}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
});

const ORDER = [0, 1, 2, 4, 7, 6, 5, 3];

// Rotation (degrees, clockwise) needed to point the center button's upward
// arrow toward each grid position.
// Grid layout:  [0][1][2]
//               [3][ ][4]
//               [5][6][7]
const GRID_WIN_ANGLE = [315, 0, 45, 270, 90, 225, 180, 135];

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Themed skins (acebet77/ubetclub/ep369) reuse this exact engine and only swap
// the artwork. The eight tiles are positioned by absolute % over the frame
// rather than the default's fixed pixel FluidFrame grid. `framePad` is the
// horizontal inset (% of frame width) from edge to the grid area, `framePadY`
// the vertical one (% of frame height, defaults to `framePad`). `tile` and
// `center` are element sizes as % of the frame WIDTH — they're converted to a
// height % via `aspect` so tiles stay square on non-square frames.
//
// `aspect` is the frame art's width/height. Most themes ship a square wheel
// frame and leave it at 1; n1gang's plate is portrait (638x856), and giving it
// its true ratio is what lets the art fill the full 444px column instead of
// being letterboxed inside a square box at ~half scale.
const DEFAULT_THEMED_GEOMETRY = { framePad: 14, tile: 21, center: 24, aspect: 1 };

function themedSlotCenters({ framePad, framePadY }) {
  const padY = framePadY ?? framePad;
  const span = 100 - 2 * framePad;
  const spanY = 100 - 2 * padY;
  const lo = framePad + span / 6;
  const mid = 50;
  const hi = framePad + (span * 5) / 6;
  const loY = padY + spanY / 6;
  const hiY = padY + (spanY * 5) / 6;
  // Grid index layout (matches the default's GRID_AREA / GRID_WIN_ANGLE):
  //   [0][1][2]
  //   [3][ ][4]
  //   [5][6][7]
  return [
    { x: lo, y: loY }, { x: mid, y: loY }, { x: hi, y: loY },
    { x: lo, y: mid }, { x: hi, y: mid },
    { x: lo, y: hiY }, { x: mid, y: hiY }, { x: hi, y: hiY },
  ];
}

export default memo(function LuckySpinGrid({
  onSpinClick,
  isSpinning: externalIsSpinning,
  onSpinComplete,
  spinTriggerRef,
  items = [],
  winningUuid = null,
  // Themeable art. Defaults to the built-in MRS assets so the default portal
  // renders exactly as before; themed skins pass their own image map + geometry.
  assets = SPIN_ASSETS,
  themed = null,
}) {
  const [activeGridIndex, setActiveGridIndex] = useState(null);
  // Separate from `activeGridIndex` so the dramatic winner highlight kicks
  // in *immediately* when the spinner lands — not 700ms later when the
  // parent flips `isSpinning` off. Cleared at the start of each new spin.
  const [winnerGridIndex, setWinnerGridIndex] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const { isLowEnd, isMidEnd } = usePerformanceOptimization();

  // Use external spinning state if provided
  const spinning = externalIsSpinning !== undefined ? externalIsSpinning : isSpinning;

  const centerRotate = useMotionValue(0);
  const centerRotateSpring = useSpring(centerRotate, {
    stiffness: isLowEnd ? 80 : isMidEnd ? 100 : 120,
    damping: isLowEnd ? 15 : isMidEnd ? 18 : 20,
    mass: isLowEnd ? 1 : 0.8,
    restDelta: 0.001,
    restSpeed: 0.001,
  });

  const rafRef = useRef(null);
  const startRef = useRef(0);
  const lastStepAtRef = useRef(0);
  const stepCountRef = useRef(0);
  const totalStepsRef = useRef(0);
  const orderPosRef = useRef(0);
  // Manual stop refs (slide 8 — "Allow users to manually stop the spin
  // after clicking Spin Now"). The animation loop checks `manualStopRef`
  // each frame and short-circuits to `targetGridIndexRef` after a minimum
  // spin time (anti-spam).
  const manualStopRef = useRef(false);
  const targetGridIndexRef = useRef(0);
  // Internal source of truth for "a spin is in flight", independent of the
  // parent-supplied `isSpinning` prop. The prop can lag a render behind the
  // rAF loop's own lifecycle, which previously let a second spin start (and
  // its delayed center-rotation snap/dialog callbacks race) while the first
  // spin's tick loop was still technically running — desyncing the arrow
  // from the tile it had actually landed on. Every spin gets a unique id;
  // a spin's delayed callbacks check they're still the active id before
  // applying anything, so a superseded spin can never clobber a newer one.
  const activeSpinIdRef = useRef(0);
  const spinIdCounterRef = useRef(0);

  // Store items with UUIDs in fixed positions (no random shuffling)
  const itemRewards = useMemo(() => {
    const filtered = items.filter(item => item.image || item.reward_name || item.text || item.content);

    if (filtered.length === 0) return [];

    // Create an array of 8 positions with full item data including UUID
    const positions = Array(8).fill(null);

    // Assign items to positions in order (up to 8 items)
    filtered.slice(0, 8).forEach((item, index) => {
      positions[index] = {
        image: item.image || item.reward_name || item.text || item.content,
        uuid: item.uuid
      };
    });

    return positions;
  }, [items]);

  const gridItems = useMemo(() => [
    { background: assets.itemEmptyGold, prize: itemRewards[0]?.image, uuid: itemRewards[0]?.uuid },
    { background: assets.itemEmptyGreen, prize: itemRewards[1]?.image, uuid: itemRewards[1]?.uuid },
    { background: assets.itemEmptyGold, prize: itemRewards[2]?.image, uuid: itemRewards[2]?.uuid },
    { background: assets.itemEmptyGreen, prize: itemRewards[3]?.image, uuid: itemRewards[3]?.uuid },
    { background: assets.itemEmptyGreen, prize: itemRewards[4]?.image, uuid: itemRewards[4]?.uuid },
    { background: assets.itemEmptyGold, prize: itemRewards[5]?.image, uuid: itemRewards[5]?.uuid },
    { background: assets.itemEmptyGreen, prize: itemRewards[6]?.image, uuid: itemRewards[6]?.uuid },
    { background: assets.itemEmptyGold, prize: itemRewards[7]?.image, uuid: itemRewards[7]?.uuid },
  ], [itemRewards, assets]);

  const stopSpin = useCallback(
    (finalGridIndex, { wasManualStop = false, spinId } = {}) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsSpinning(false);
      setActiveGridIndex(finalGridIndex);
      setWinnerGridIndex(finalGridIndex);

      // Rotate the center button arrow to point at the winning tile.
      // Find the numerically nearest equivalent of the target angle so the
      // spring only travels a short arc rather than unwinding from a large
      // accumulated value. Guarded by spinId: if a newer spin has since
      // started, this stale callback must not touch the rotation.
      setTimeout(() => {
        if (activeSpinIdRef.current !== spinId) return;
        const target = GRID_WIN_ANGLE[finalGridIndex] ?? 0;
        const current = centerRotate.get();
        const turns = Math.round((current - target) / 360);
        centerRotate.set(target + turns * 360);
      }, 300);

      // Brief pause so the player sees the winning-tile highlight ring
      // before the parent reacts. The flag is passed through so the parent
      // can suppress the result dialog on manual stops (the player chose to
      // halt early; surfacing the result is enough — see slide 8 follow-up).
      // Also releases the internal spin lock so a new spin can start.
      setTimeout(() => {
        if (activeSpinIdRef.current === spinId) activeSpinIdRef.current = 0;
        onSpinComplete?.(finalGridIndex, { wasManualStop });
      }, 700);
    },
    [centerRotate, onSpinComplete]
  );

  const startSpinAnimation = useCallback((targetUuid = null) => {
    // Internal lock is the source of truth — the parent's `isSpinning` prop
    // can lag a render behind, which previously let a second spin start
    // while the first spin's rAF loop was still actually running.
    if (spinning || activeSpinIdRef.current !== 0) return;

    // The winning tile is decided solely by the server result's uuid, which
    // always maps to one of the items already rendered on the wheel (the same
    // saved list we fetched to build it). We never guess a position: if there
    // is no match we skip the wheel animation rather than land on — and
    // celebrate — a reward the player did not win. The result dialog still
    // shows the real prize because the parent holds the authoritative result.
    const targetGridIndex = targetUuid
      ? gridItems.findIndex((item) => item.uuid === targetUuid)
      : -1;

    if (targetGridIndex === -1) {
      console.error('[lucky-spin] winning uuid not found on the wheel; skipping spin animation', targetUuid);
      onSpinComplete?.(null);
      return;
    }

    const spinId = ++spinIdCounterRef.current;
    activeSpinIdRef.current = spinId;

    // Reset the centre "SPIN NOW" medallion to a clean baseline (pointing up)
    // at the start of every spin. Without this the rotation accumulated from
    // the previous spin carries over, so on the 2nd+ spin the medallion's
    // spin speed visibly desyncs from the tile-highlight cycling. jump()
    // repositions instantly — no backwards unwind — so both start in sync.
    centerRotate.jump(0);
    centerRotateSpring.jump(0);

    // Find the position in ORDER array that corresponds to this grid index.
    // Fixed at 3 rounds (24 steps + 0..7 target offset = 24-31 total steps)
    // — variance was previously 4-6 rounds, which pushed natural spins to
    // 5.5-8s. With the tightened delay curve below this lands at ~3.5s of
    // cell-cycling + the 700ms post-stop highlight pause = ~4s total wall
    // time, matching the slide 8 "Speed up spin animation to 4 seconds"
    // brief without losing the deceleration feel.
    const targetOrderPos = ORDER.indexOf(targetGridIndex);
    const rounds = 3;
    totalStepsRef.current = rounds * ORDER.length + targetOrderPos;

    stepCountRef.current = 0;
    orderPosRef.current = 0;
    manualStopRef.current = false;
    targetGridIndexRef.current = targetGridIndex;
    setWinnerGridIndex(null);
    setIsSpinning(true);

    const now = performance.now();
    startRef.current = now;
    lastStepAtRef.current = now;

    const tick = (t) => {
      const elapsed = t - startRef.current;
      // Easing reference is 3000ms — that's the window over which the step
      // delay ramps from min to max. With ~27 steps the avg per-step delay
      // under ease-out lands at ~125-130ms, so cell-cycling completes in
      // ~3.3s, then stopSpin's 700ms pre-modal pause brings the player to
      // ~4s total before the result dialog opens.
      const progress = Math.min(1, elapsed / 3000);
      const eased = easeOutCubic(progress);
      const baseDelay = (isLowEnd ? 60 : isMidEnd ? 50 : 40) + eased * (isLowEnd ? 130 : isMidEnd ? 115 : 100);

      // Manual stop = visible fast-forward to the target tile. After the
      // 1-second anti-spam guard, drop step delay to ~40 ms so the spinner
      // visibly accelerates and lands on the winning tile rather than
      // teleporting (which made it look like "click → dialog").
      const stoppingFast = manualStopRef.current && elapsed >= 1000;
      const stepDelayMs = stoppingFast ? 40 : baseDelay;

      if (t - lastStepAtRef.current >= stepDelayMs) {
        lastStepAtRef.current = t;
        stepCountRef.current += 1;
        orderPosRef.current = (orderPosRef.current + 1) % ORDER.length;

        centerRotate.set(centerRotate.get() + 45);

        const gridIndex = ORDER[orderPosRef.current];
        setActiveGridIndex(gridIndex);

        // During fast-forward, halt the moment we land on the predetermined
        // winning tile so the user sees the spinner come to rest on the
        // winning gem rather than overshooting it.
        if (stoppingFast && gridIndex === targetGridIndexRef.current) {
          stopSpin(gridIndex, { wasManualStop: true, spinId });
          return;
        }

        if (stepCountRef.current >= totalStepsRef.current) {
          stopSpin(gridIndex, { wasManualStop: false, spinId });
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [spinning, stopSpin, centerRotate, centerRotateSpring, isLowEnd, isMidEnd, gridItems, onSpinComplete]);

  const startSpin = useCallback(async () => {
    if (spinning) return;

    // Call onSpinClick and wait for API validation
    if (onSpinClick) {
      const result = await onSpinClick();
      // If API call failed, don't start the animation
      if (result === false) {
        return;
      }
      // If result contains UUID, pass it to animation
      if (result && result.uuid) {
        startSpinAnimation(result.uuid);
        return;
      }
    }

    startSpinAnimation();
  }, [spinning, onSpinClick, startSpinAnimation]);

  // Manual stop request handler — the centre button calls this while
  // spinning. The actual halt happens on the next rAF tick (after the
  // 1-second anti-spam guard) so easing and landing logic stay intact.
  const requestManualStop = useCallback(() => {
    if (!spinning) return;
    manualStopRef.current = true;
  }, [spinning]);

  // Expose the animation trigger to parent via ref
  useEffect(() => {
    if (spinTriggerRef) {
      spinTriggerRef.current = startSpinAnimation;
    }
  }, [spinTriggerRef, startSpinAnimation]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Shared centre button — identical rotation/tap/manual-stop behaviour in both
  // the default and themed layouts; only the artwork, size and fit differ.
  const centerButton = ({ sizeClass = "", sizeStyle, imgFit = "object-cover" }) => (
    <motion.div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer ${sizeClass}`}
      style={sizeStyle}
      initial={{ opacity: 0, scale: 0, rotate: 360 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
      whileHover={{ scale: spinning ? 1.05 : 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={spinning ? requestManualStop : startSpin}
      aria-label={spinning ? "Stop spin" : "Spin now"}
    >
      {/* Center button artwork. Swaps to the "SPIN STOP" asset while
          spinning so the player sees the affordance change (client
          wanted the literal stop label baked into the artwork rather
          than a separate overlay). Keeps rotating in both states. */}
      <motion.div
        className="w-full h-full"
        style={{ rotate: centerRotateSpring, willChange: spinning ? "transform" : "auto" }}
      >
        {/* Plain <img> on purpose. next/image was serving the SSR-rendered
            initial src and not honouring the swap to spn-stop.png when
            `spinning` flipped, even with a re-mount key. A regular <img>
            updates immediately when src changes. */}
        <img
          key={spinning ? "stop" : "spin"}
          alt={spinning ? "Stop spin" : "Spin Now Button"}
          src={spinning ? (assets.centerButtonStop || assets.centerButton) : assets.centerButton}
          width={143}
          height={143}
          className={`w-full h-full ${imgFit} select-none`}
          draggable="false"
        />
        {/* Optional directional pointer. Most center-button artwork bakes in a
            visible cue at the top (arrow / crown / star spike) so that rotating
            the button toward GRID_WIN_ANGLE reads as "pointing" at the winner.
            When a theme's art is radially symmetric (e.g. EP369's four-fold
            gem), there's no visible direction — set `assets.pointerAccent` and
            we render a small triangle at the top edge so the rotation reads.
            It lives inside the rotating layer, so it aims with the button. */}
        {assets.pointerAccent && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "9px solid transparent",
              borderRight: "9px solid transparent",
              borderBottom: `15px solid ${assets.pointerAccent}`,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.55))",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );

  // Themed skins: same engine, tiles positioned by absolute % over the frame.
  if (themed) {
    const geo = { ...DEFAULT_THEMED_GEOMETRY, ...themed };
    const centers = themedSlotCenters(geo);
    // Tile sizes are authored against the frame's width; a portrait frame needs
    // a proportionally larger height % to come out square.
    const tileHeight = geo.tile * geo.aspect;
    return (
      <motion.div
        // 444px = the full content column of the 475px member shell minus the
        // themed pages' px-4 gutters, so the wheel renders as large as the
        // ornate frame art allows on every custom theme.
        className="relative mx-auto w-full max-w-[444px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ willChange: "transform, opacity", aspectRatio: geo.aspect }}
      >
        <Image
          alt="Spin Grid Background"
          src={assets.background}
          fill
          priority
          className="object-contain pointer-events-none"
          sizes="444px"
        />
        {gridItems.map((item, index) => (
          <SpinItem
            key={index}
            index={index}
            isActive={activeGridIndex === index}
            isWinner={winnerGridIndex === index}
            isSpinning={spinning}
            isLowEnd={isLowEnd}
            isMidEnd={isMidEnd}
            pos={{ ...centers[index], size: geo.tile, sizeY: tileHeight }}
            {...item}
          />
        ))}
        {centerButton({
          sizeStyle: { width: `${geo.center}%`, aspectRatio: "1 / 1" },
          imgFit: "object-contain",
        })}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      <FluidFrame designWidth={376} designHeight={348}>
      <Image
        alt="Spin Grid Background"
        src={assets.background}
        fill
        className="object-cover pointer-events-none"
      />

      <div className="absolute left-[41px] top-[21px] w-[290px] h-[298px] grid grid-cols-3 grid-rows-3">
        {gridItems.map((item, index) => (
          <SpinItem
            key={index}
            index={index}
            isActive={activeGridIndex === index}
            isWinner={winnerGridIndex === index}
            isSpinning={spinning}
            isLowEnd={isLowEnd}
            isMidEnd={isMidEnd}
            {...item}
          />
        ))}

        {centerButton({ sizeClass: "w-[143px] h-[143px]", imgFit: "object-cover" })}
      </div>
      </FluidFrame>
    </motion.div>
  );
});
