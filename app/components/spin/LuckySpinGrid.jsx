"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import { SPIN_ASSETS } from "./spinAssets";
import { usePerformanceOptimization } from "../../hooks/usePerformanceOptimization";

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

const SpinItem = memo(function SpinItem({
  background,
  prize,
  index,
  isActive,
  isSpinning,
  isLowEnd,
  isMidEnd,
}) {
  return (
  <motion.div
    className={`relative ${GRID_AREA[index]} w-full h-full ${isActive ? "z-10" : ""}`}
    initial={{ opacity: 0, scale: 0, rotate: -180 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{
      duration: 0.6,
      delay: index * 0.1,
      ease: "easeOut"
    }}
    whileHover={!isSpinning ? { scale: 1.05 } : undefined}
  >
    <motion.div
      className="relative w-full h-full"
      animate={
        isActive
          ? {
              scale: isLowEnd ? 1.08 : 1.12,
              boxShadow: isLowEnd
                ? "0 0 15px rgba(253, 230, 133, 0.8), 0 0 30px rgba(253, 230, 133, 0.4)"
                : "0 0 20px rgba(253, 230, 133, 1), 0 0 40px rgba(253, 230, 133, 0.6)"
            }
          : { scale: 1, boxShadow: "none" }
      }
      transition={{
        duration: isLowEnd ? 0.4 : 0.3,
        ease: "easeOut"
      }}
    >
      <Image
        alt=""
        src={background}
        width={114}
        height={112}
        className="w-full h-full object-fill pointer-events-none"
      />
      {isActive && (
        <motion.div
          className="absolute inset-[6px] rounded-[14px] border-2 border-[#fde685] pointer-events-none"
          animate={{
            opacity: [1, 0.6, 1],
            borderWidth: ["2px", "3px", "2px"]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
    {prize && (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1 + 0.3,
          ease: "easeOut"
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60px] h-[57px] flex items-center justify-center"
      >
        <img
          alt=""
          src={prize}
          className="max-w-full max-h-full object-contain pointer-events-none"
        />
      </motion.div>
    )}
  </motion.div>
  );
});

const ORDER = [0, 1, 2, 4, 7, 6, 5, 3];

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export default memo(function LuckySpinGrid({ onSpinClick, isSpinning: externalIsSpinning, onSpinComplete, spinTriggerRef, items = [], winningUuid = null }) {
  const [activeGridIndex, setActiveGridIndex] = useState(null);
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
    { background: SPIN_ASSETS.itemEmptyGold, prize: itemRewards[0]?.image, uuid: itemRewards[0]?.uuid },
    { background: SPIN_ASSETS.itemEmptyGreen, prize: itemRewards[1]?.image, uuid: itemRewards[1]?.uuid },
    { background: SPIN_ASSETS.itemEmptyGold, prize: itemRewards[2]?.image, uuid: itemRewards[2]?.uuid },
    { background: SPIN_ASSETS.itemEmptyGreen, prize: itemRewards[3]?.image, uuid: itemRewards[3]?.uuid },
    { background: SPIN_ASSETS.itemEmptyGreen, prize: itemRewards[4]?.image, uuid: itemRewards[4]?.uuid },
    { background: SPIN_ASSETS.itemEmptyGold, prize: itemRewards[5]?.image, uuid: itemRewards[5]?.uuid },
    { background: SPIN_ASSETS.itemEmptyGreen, prize: itemRewards[6]?.image, uuid: itemRewards[6]?.uuid },
    { background: SPIN_ASSETS.itemEmptyGold, prize: itemRewards[7]?.image, uuid: itemRewards[7]?.uuid },
  ], [itemRewards]);

  const stopSpin = useCallback(
    (finalGridIndex) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsSpinning(false);
      setActiveGridIndex(finalGridIndex);

      // Keep the center button rotation reset
      setTimeout(() => {
        centerRotate.set(0);
      }, 300);

      // Fire onSpinComplete immediately so the result dialog opens at the
      // exact moment the spinner stops (per client request — slide 8).
      if (onSpinComplete) {
        onSpinComplete(finalGridIndex);
      }
    },
    [centerRotate, onSpinComplete]
  );

  const startSpinAnimation = useCallback((targetUuid = null) => {
    if (spinning) return;

    // Find the grid index that matches the winning UUID
    let targetGridIndex = 0;
    if (targetUuid) {
      const foundIndex = gridItems.findIndex(item => item.uuid === targetUuid);
      if (foundIndex !== -1) {
        targetGridIndex = foundIndex;
      } else {
        console.warn('Winning UUID not found in grid items, using random position');
        targetGridIndex = Math.floor(Math.random() * 8);
      }
    } else {
      // Fallback to random if no UUID provided
      targetGridIndex = Math.floor(Math.random() * 8);
    }

    // Find the position in ORDER array that corresponds to this grid index
    const targetOrderPos = ORDER.indexOf(targetGridIndex);
    const rounds = 4 + Math.floor(Math.random() * 3);
    totalStepsRef.current = rounds * ORDER.length + targetOrderPos;

    stepCountRef.current = 0;
    orderPosRef.current = 0;
    manualStopRef.current = false;
    targetGridIndexRef.current = targetGridIndex;
    setIsSpinning(true);

    const now = performance.now();
    startRef.current = now;
    lastStepAtRef.current = now;

    const tick = (t) => {
      const elapsed = t - startRef.current;
      // 4 seconds total spin time per slide 8 ("Speed up spin animation
      // to 4 seconds"). Step easing still scales by device tier.
      const progress = Math.min(1, elapsed / 4000);
      const eased = easeOutCubic(progress);
      const stepDelayMs = (isLowEnd ? 80 : isMidEnd ? 70 : 60) + eased * (isLowEnd ? 120 : isMidEnd ? 150 : 180);

      // Manual stop short-circuit — once at least 1 second of spin has
      // elapsed, an honoured Stop click ends the animation on the next
      // frame, snapping to the pre-determined landing tile so the
      // result dialog opens at the same instant the spinner stops.
      if (manualStopRef.current && elapsed >= 1000) {
        stopSpin(targetGridIndexRef.current);
        return;
      }

      if (t - lastStepAtRef.current >= stepDelayMs) {
        lastStepAtRef.current = t;
        stepCountRef.current += 1;
        orderPosRef.current = (orderPosRef.current + 1) % ORDER.length;

        centerRotate.set(centerRotate.get() + 45);

        const gridIndex = ORDER[orderPosRef.current];
        setActiveGridIndex(gridIndex);

        if (stepCountRef.current >= totalStepsRef.current) {
          stopSpin(gridIndex);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [spinning, stopSpin, centerRotate, isLowEnd, isMidEnd, gridItems]);

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

  return (
    <motion.div 
      className="relative w-[376px] h-[348px] mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      <Image
        alt="Spin Grid Background"
        src={SPIN_ASSETS.background}
        fill
        className="object-cover pointer-events-none"
      />

      <div className="absolute left-[41px] top-[21px] w-[290px] h-[298px] grid grid-cols-3 grid-rows-3">
        {gridItems.map((item, index) => (
          <SpinItem
            key={index}
            index={index}
            isActive={activeGridIndex === index}
            isSpinning={spinning}
            isLowEnd={isLowEnd}
            isMidEnd={isMidEnd}
            {...item}
          />
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[143px] h-[143px] z-10 cursor-pointer"
          initial={{ opacity: 0, scale: 0, rotate: 360 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.8,
            delay: 1.0,
            ease: "easeOut"
          }}
          whileHover={{ scale: spinning ? 1.05 : 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={spinning ? requestManualStop : startSpin}
          aria-label={spinning ? "Stop spin" : "Spin now"}
        >
          {/* Rotating spin artwork — same image for both states. While
              spinning, clicking it again triggers a manual stop (slide 8
              — "Allow users to manually stop the spin after clicking Spin
              Now"). No visible STOP label is rendered, per UX preference. */}
          <motion.div
            className="w-full h-full"
            style={{ rotate: centerRotateSpring, willChange: spinning ? "transform" : "auto" }}
          >
            <Image
              alt={spinning ? "Stop spin" : "Spin Now Button"}
              src={SPIN_ASSETS.centerButton}
              width={143}
              height={143}
              className="object-cover"
              loading="eager"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
});
