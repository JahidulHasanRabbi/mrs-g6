"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

const PARTICLE_COUNT = 14;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (360 / PARTICLE_COUNT) * i + (i % 2 === 0 ? 10 : -10);
  const rad = (angle * Math.PI) / 180;
  const distance = 120 + (i % 3) * 40;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance - 30,
    rotate: (i % 2 === 0 ? 1 : -1) * (180 + i * 25),
    size: 6 + (i % 4) * 4,
    delay: (i % 3) * 0.03,
    color: ["#ffd700", "#f2cb7a", "#e9af41", "#ff8c00", "#fff5d4"][i % 5],
  };
});

const shakeKeyframes = {
  x: [0, -8, 8, -6, 6, -3, 3, 0],
  y: [0, 4, -4, 3, -3, 1, -1, 0],
};

export default function EggAnimation({ isCracked, onTap }) {
  const [showEffects, setShowEffects] = useState(false);
  const [slamPhase, setSlamPhase] = useState(false);

  const handleTap = useCallback(() => {
    if (slamPhase) return;
    setSlamPhase(true);
    setTimeout(() => {
      setShowEffects(true);
      onTap();
    }, 250);
  }, [onTap, slamPhase]);

  useEffect(() => {
    if (!isCracked) {
      setShowEffects(false);
      setSlamPhase(false);
    }
  }, [isCracked]);

  return (
    <motion.div
      className="relative w-[362px] max-w-full mx-auto"
      style={{ height: 452 }}
      animate={showEffects ? shakeKeyframes : {}}
      transition={
        showEffects
          ? { duration: 0.5, ease: "easeOut", times: [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.8, 1] }
          : {}
      }
    >
      {/* Nest */}
      <div className="absolute bottom-0 left-0 w-[362px] h-[272px] z-0">
        <img
          src={SMASH_EGG_ASSETS.nest}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Shockwave ring */}
      <AnimatePresence>
        {showEffects && (
          <motion.div
            className="absolute left-1/2 top-[186px] -translate-x-1/2 -translate-y-1/2 rounded-full z-5 pointer-events-none"
            style={{
              width: 60,
              height: 60,
              border: "3px solid rgba(255,215,0,0.8)",
              boxShadow: "0 0 20px rgba(255,215,0,0.4)",
            }}
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Golden flash */}
      <AnimatePresence>
        {showEffects && (
          <motion.div
            className="absolute left-1/2 top-[186px] -translate-x-1/2 -translate-y-1/2 rounded-full z-20 pointer-events-none"
            style={{
              width: 300,
              height: 300,
              background: "radial-gradient(circle, rgba(255,215,0,0.7) 0%, rgba(255,180,0,0.3) 40%, transparent 70%)",
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.8, 0.6], opacity: [1, 0.9, 0] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Flying particles / shell fragments */}
      <AnimatePresence>
        {showEffects &&
          PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-[186px] z-30 pointer-events-none"
              style={{
                width: p.size,
                height: p.size * 0.7,
                backgroundColor: p.color,
                borderRadius: "30% 70% 50% 50%",
                boxShadow: `0 0 6px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [1, 1.3, 0],
                opacity: [1, 0.9, 0],
                rotate: p.rotate,
              }}
              transition={{
                duration: 0.7,
                delay: p.delay,
                ease: "easeOut",
              }}
            />
          ))}
      </AnimatePresence>

      {/* Sparkle bursts */}
      <AnimatePresence>
        {showEffects &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (60 * i + 15) * (Math.PI / 180);
            const dist = 80 + (i % 2) * 30;
            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute left-1/2 top-[186px] z-30 pointer-events-none"
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 0 8px 3px rgba(255,255,255,0.8)",
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist - 20,
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + i * 0.04,
                  ease: "easeOut",
                }}
              />
            );
          })}
      </AnimatePresence>

      {/* Egg */}
      <motion.button
        onClick={handleTap}
        className="absolute left-1/2 -translate-x-1/2 top-[5px] w-[272px] h-[362px] cursor-pointer z-10"
        whileHover={!slamPhase ? { scale: 1.05 } : {}}
        whileTap={!slamPhase ? { scale: 0.92 } : {}}
        animate={
          slamPhase && !showEffects
            ? { y: [0, -30, 8], scale: [1, 1.08, 0.93], rotate: [0, -2, 0] }
            : showEffects
              ? { y: 0, scale: 1, rotate: 0 }
              : {}
        }
        transition={
          slamPhase && !showEffects
            ? { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
            : { type: "spring", stiffness: 300, damping: 20 }
        }
        aria-label="Smash the egg"
      >
        <motion.div
          key={isCracked ? "cracked" : "whole"}
          initial={isCracked ? { scale: 1.15, opacity: 0 } : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            isCracked
              ? { type: "spring", stiffness: 400, damping: 15, mass: 0.8 }
              : { type: "spring", stiffness: 300, damping: 20 }
          }
          className="relative w-full h-full"
        >
          <img
            src={isCracked ? SMASH_EGG_ASSETS.eggCracked : SMASH_EGG_ASSETS.eggWhole}
            alt={isCracked ? "Cracked egg" : "Egg"}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
