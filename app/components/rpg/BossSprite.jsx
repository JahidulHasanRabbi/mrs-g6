"use client";

// Boss sprite with a state-driven animation.
//
// If real frames are registered for the boss+state (BOSS_FRAMES in
// rpgAssets), they play as a frame sequence — looping for `idle`, one-shot for
// `hurt` / `attack` / `defeat`. Otherwise the single base sprite is animated
// procedurally (transforms + a white silhouette hit-flash) so the boss still
// reads as moving, taking damage, and attacking without any extra art.
//
// States (the battle's boss "frames"):
//   idle    — breathing bob (loops)
//   hit     — quick shake as a hero blow connects
//   hurt    — knockback recoil (paired with a white hit-flash)
//   windup  — pull back before the boss's own attack
//   strike  — lunge forward to throw the punch
//   recover — settle back to stance
//   defeat  — stagger, fall and fade
// `seq` bumps on each one-shot occurrence so the same state replays.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { bossArtFor, bossFramesFor } from "./rpgAssets";

const FRAME_MS = 90;
const LOOPING = new Set(["idle"]);
const FLASH_STATES = new Set(["hit", "hurt"]);

// Procedural motion per state, applied to the base sprite when no frames exist.
const PROC = {
  idle: { animate: { y: [0, -5, 0], x: 0, scale: 1, rotate: 0, opacity: 1 }, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  hit: { animate: { x: [0, 9, -7, 4, 0], scale: 0.965 }, transition: { duration: 0.2, ease: "easeOut" } },
  hurt: { animate: { x: -11, y: 5, scale: 0.94 }, transition: { duration: 0.2, ease: "easeOut" } },
  windup: { animate: { x: -17, y: 7, scaleX: 1.08, scaleY: 0.94 }, transition: { duration: 0.2, ease: "easeInOut" } },
  strike: { animate: { x: 22, y: -8, scaleX: 1.14, scaleY: 0.98 }, transition: { duration: 0.2, ease: "easeInOut" } },
  recover: { animate: { x: [12, -4, 0], y: [2, 8, 0], scale: [1.04, 0.98, 1] }, transition: { duration: 0.22, ease: "easeOut" } },
  defeat: { animate: { opacity: 0.15, y: 26, scale: 0.94, rotate: 4 }, transition: { duration: 0.7, ease: "easeIn" } },
};

export default function BossSprite({ boss, state = "idle", seq = 0 }) {
  const frames = bossFramesFor(boss.id, state);
  const useFrames = frames.length > 0;
  const [idx, setIdx] = useState(0);

  // Frame-sequence playback (only when real frames are supplied).
  useEffect(() => {
    if (!useFrames) return undefined;
    setIdx(0);
    const loop = LOOPING.has(state);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i >= frames.length) {
        if (loop) i = 0;
        else {
          clearInterval(id);
          i = frames.length - 1;
        }
      }
      setIdx(i);
    }, FRAME_MS);
    return () => clearInterval(id);
    // seq re-arms one-shot sequences (hurt/attack) on each new occurrence.
  }, [useFrames, state, seq, frames.length]);

  const filter = boss.artFilter && boss.artFilter !== "none" ? boss.artFilter : undefined;
  const artSrc = bossArtFor(boss.id);
  const src = useFrames ? frames[idx] : artSrc;
  const proc = PROC[state] || PROC.idle;
  // Idle loops (stable key); one-shots remount per `seq`/state so they replay.
  const animKey = LOOPING.has(state) ? "idle" : `${state}-${seq}`;

  return (
    <div className="relative flex h-full w-full items-end justify-center">
      <motion.img
        key={useFrames ? "frames" : animKey}
        src={src}
        alt={boss.name}
        className="relative h-full max-h-full w-auto object-contain"
        style={{ filter }}
        animate={useFrames ? undefined : proc.animate}
        transition={useFrames ? undefined : proc.transition}
      />

      {/* Procedural hit-flash: a white silhouette of the sprite, faded out.
          Skipped when real hit/hurt frames already convey the impact. */}
      {!useFrames && FLASH_STATES.has(state) && (
        <motion.img
          key={`flash-${state}-${seq}`}
          src={artSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto h-full max-h-full w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
