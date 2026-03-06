"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import { SPIN_ASSETS } from "./spinAssets";

const SpinItem = memo(function SpinItem({
  background,
  prize,
  position,
  size = "w-[114px] h-[112px]",
  index,
  isActive,
  isSpinning,
}) {
  return (
  <motion.div
    className={`absolute ${position} ${isActive ? "z-10" : ""}`}
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
      className="relative"
      animate={
        isActive
          ? {
              scale: 1.06,
              filter:
                "drop-shadow(0px 0px 10px rgba(253, 230, 133, 0.85)) drop-shadow(0px 0px 18px rgba(253, 230, 133, 0.5))",
            }
          : { scale: 1, filter: "none" }
      }
      transition={
        isActive
          ? { type: "spring", stiffness: 420, damping: 22 }
          : { duration: 0.12, ease: "easeOut" }
      }
    >
      <Image
        alt=""
        src={background}
        width={114}
        height={112}
        className={`${size} object-cover pointer-events-none`}
      />
      {isActive && (
        <div className="absolute inset-[6px] rounded-[14px] border-2 border-[#fde685] pointer-events-none" />
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
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          alt=""
          src={prize}
          width={72}
          height={69}
          className="object-cover pointer-events-none"
        />
      </motion.div>
    )}
  </motion.div>
  );
});

const ORDER = [0, 1, 2, 4, 7, 6, 5, 3];

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export default memo(function LuckySpinGrid({ onSpinClick, isSpinning: externalIsSpinning, onSpinComplete }) {
  const [activeGridIndex, setActiveGridIndex] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Use external spinning state if provided
  const spinning = externalIsSpinning !== undefined ? externalIsSpinning : isSpinning;

  const centerRotate = useMotionValue(0);
  const centerRotateSpring = useSpring(centerRotate, {
    stiffness: 220,
    damping: 26,
    mass: 0.6,
    restDelta: 0.001,
    restSpeed: 0.001,
  });

  const rafRef = useRef(null);
  const startRef = useRef(0);
  const lastStepAtRef = useRef(0);
  const stepCountRef = useRef(0);
  const totalStepsRef = useRef(0);
  const orderPosRef = useRef(0);

  const gridItems = useMemo(() => [
    { background: SPIN_ASSETS.itemGold, position: "left-[-8px] top-[-10px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize1, position: "left-[96px] top-[-13px]", size: "w-[99px] h-[112px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[194px] top-[-10px]" },
    { background: SPIN_ASSETS.itemGreen, position: "left-[-7px] top-[88px]", size: "w-[100px] h-[112px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize2, position: "left-[196px] top-[87px]", size: "w-[101px] h-[114px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[-9px] top-[193px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize3, position: "left-[96px] top-[191px]", size: "w-[100px] h-[113px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[194px] top-[194px]" },
  ], []);

  const stopSpin = useCallback(
    (finalGridIndex) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsSpinning(false);
      setActiveGridIndex(finalGridIndex);
      
      setTimeout(() => {
        centerRotate.set(0);
      }, 300);
      
      if (onSpinComplete) {
        onSpinComplete(finalGridIndex);
      }
    },
    [centerRotate, onSpinComplete]
  );

  const startSpin = useCallback(() => {
    if (spinning) return;

    const targetOrderPos = Math.floor(Math.random() * ORDER.length);
    const rounds = 4 + Math.floor(Math.random() * 3);
    totalStepsRef.current = rounds * ORDER.length + targetOrderPos;

    stepCountRef.current = 0;
    orderPosRef.current = 0;
    setIsSpinning(true);

    if (onSpinClick) {
      onSpinClick();
    }

    const now = performance.now();
    startRef.current = now;
    lastStepAtRef.current = now;

    const tick = (t) => {
      const progress = Math.min(1, (t - startRef.current) / 4200);
      const eased = easeOutCubic(progress);
      const stepDelayMs = 45 + eased * 220;

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
  }, [spinning, onSpinClick, stopSpin, centerRotate]);

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

      <div className="absolute left-[41px] top-[21px] w-[290px] h-[298px]">
        {gridItems.map((item, index) => (
          <SpinItem
            key={index}
            index={index}
            isActive={activeGridIndex === index}
            isSpinning={spinning}
            {...item}
          />
        ))}

        <motion.div 
          className={`absolute left-[77px] top-[73px] w-[143px] h-[143px] z-10 ${spinning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          initial={{ opacity: 0, scale: 0, rotate: 360 }}
          animate={{ opacity: spinning ? 0.8 : 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 1.0,
            ease: "easeOut"
          }}
          whileHover={!spinning ? { scale: 1.1, rotate: 5 } : undefined}
          whileTap={!spinning ? { scale: 0.95 } : undefined}
          style={{ rotate: centerRotateSpring, willChange: spinning ? "transform" : "auto" }}
          onClick={spinning ? undefined : startSpin}
        >
          <Image
            alt="Spin Now Button"
            src={SPIN_ASSETS.centerButton}
            width={143}
            height={143}
            className="object-cover"
          />
        </motion.div>
      </div>
    </motion.div>
  );
});
