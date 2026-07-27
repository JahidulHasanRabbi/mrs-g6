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

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { bossArtFor, bossFramesFor } from "./rpgAssets";

const FRAME_MS = 90;
const LOOPING = new Set(["idle"]);
const FLASH_STATES = new Set(["hit", "hurt"]);

// Where a channelled beam is aimed, in the boss sprite's own box units
// (x/y fractions of the sprite, y > 1 = below its feet). The hero stands
// centred under the boss, so x is the sprite's centre line; y clears the
// sprite's feet by the height of the hero row below it (Battle lays the two
// out at a fixed flex-5 / flex-2.4 ratio, so this holds at every screen size).
const BEAM_TARGET = { x: 0.5, y: 1.1 };
const BEAM_WIDTH_FRAC = 0.048; // beam thickness as a fraction of sprite height

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

// Resolve the beam's geometry inside the sprite's layout box: where it starts
// (the weapon), how long it is and which way it points. Returns null for a
// boss with no `beamOrigin` — those keep the body-centre blast Battle draws.
function beamGeometry(boss, box) {
  const origin = boss.beamOrigin;
  if (!origin || !box || !box.width) return null;
  const x = box.left + box.width * origin.x;
  const y = box.top + box.height * origin.y;
  const dx = box.left + box.width * BEAM_TARGET.x - x;
  const dy = box.top + box.height * BEAM_TARGET.y - y;
  return {
    x,
    y,
    length: Math.hypot(dx, dy),
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    thickness: Math.max(6, box.height * BEAM_WIDTH_FRAC),
    color: boss.beamColor || { core: "#ffffff", mid: "#c9a3ff", edge: "rgba(124,77,255,0)" },
  };
}

export default function BossSprite({ boss, state = "idle", seq = 0 }) {
  const frames = bossFramesFor(boss.id, state);
  const useFrames = frames.length > 0;
  const [idx, setIdx] = useState(0);
  const imgRef = useRef(null);
  const [spriteBox, setSpriteBox] = useState(null);

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

  // Track the sprite's LAYOUT box (transform-free, so a lunge mid-strike can't
  // skew it) — the beam is anchored to a point on the art, and the art is
  // `h-full w-auto`, so its box has to be measured rather than assumed. Only
  // bosses that channel through a weapon need it.
  // Re-runs on every state/seq change because the sprite's `key` changes with
  // them: React swaps in a NEW <img>, and an observer left on the old one would
  // report the detached node's zero size. Zero-size reads are ignored anyway, so
  // a measurement is only ever replaced by a real one.
  const wantsBeam = Boolean(boss.beamOrigin);
  useEffect(() => {
    const el = imgRef.current;
    if (!wantsBeam || !el) return undefined;
    const measure = () => {
      const next = { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
      if (!next.width || !next.height) return;
      setSpriteBox((prev) =>
        prev && prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height
          ? prev
          : next,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wantsBeam, src, state, seq]);

  const proc = PROC[state] || PROC.idle;
  // Idle loops (stable key); one-shots remount per `seq`/state so they replay.
  const animKey = LOOPING.has(state) ? "idle" : `${state}-${seq}`;
  const beam = beamGeometry(boss, spriteBox);

  return (
    <div className="relative flex h-full w-full items-end justify-center">
      <motion.img
        ref={imgRef}
        key={useFrames ? "frames" : animKey}
        src={src}
        alt={boss.name}
        className="relative h-full max-h-full w-auto object-contain"
        style={{ filter }}
        animate={useFrames ? undefined : proc.animate}
        transition={useFrames ? undefined : proc.transition}
      />

      {/* Weapon-channelled attack. The layer rides the sprite's lunge TRANSLATION
          only (its scale is about the sprite's centre, which would drag the
          muzzle off the weapon), and everything inside is positioned off the
          measured sprite box. */}
      {beam && (state === "windup" || state === "strike") && (
        <motion.div
          key={`beam-${state}-${seq}`}
          className="pointer-events-none absolute inset-0 z-10"
          animate={{ x: proc.animate.x ?? 0, y: proc.animate.y ?? 0 }}
          transition={proc.transition}
        >
          {/* Sigil charging up as the boss winds back, blowing out as it fires. */}
          <motion.div
            className="absolute rounded-full"
            style={{
              left: beam.x - beam.thickness * 1.7,
              top: beam.y - beam.thickness * 1.7,
              width: beam.thickness * 3.4,
              height: beam.thickness * 3.4,
              background: `radial-gradient(circle, ${beam.color.core} 0%, ${beam.color.mid} 34%, ${beam.color.edge} 72%)`,
            }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={state === "windup" ? { opacity: 0.95, scale: 1 } : { opacity: [1, 0.5, 0], scale: [1, 1.7, 1.2] }}
            transition={{ duration: state === "windup" ? 0.22 : 0.24, ease: "easeOut" }}
          />

          {/* The beam itself — a tapered ray swept out from the sigil toward the
              hero. The outer box carries the aim; the inner bar grows along it,
              pinned at its near end so the beam always leaves the weapon. */}
          {state === "strike" && (
            <div
              className="absolute"
              style={{
                left: beam.x,
                top: beam.y - beam.thickness / 2,
                width: beam.length,
                height: beam.thickness,
                transformOrigin: "0% 50%",
                transform: `rotate(${beam.angle}deg)`,
              }}
            >
              <motion.div
                className="h-full w-full"
                style={{
                  transformOrigin: "0% 50%",
                  // Cross-section falloff makes it read as a glowing tube rather
                  // than a solid bar; the mask tapers it out toward the far end.
                  background: `linear-gradient(180deg, ${beam.color.edge} 0%, ${beam.color.mid} 26%, ${beam.color.core} 50%, ${beam.color.mid} 74%, ${beam.color.edge} 100%)`,
                  maskImage: "linear-gradient(90deg, #000 0%, #000 52%, rgba(0,0,0,0.35) 84%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 52%, rgba(0,0,0,0.35) 84%, transparent 100%)",
                  filter: `drop-shadow(0 0 ${Math.round(beam.thickness * 1.6)}px ${beam.color.mid})`,
                }}
                initial={{ scaleX: 0, scaleY: 0.35, opacity: 0 }}
                animate={{ scaleX: [0, 1, 1], scaleY: [0.35, 1, 0.5], opacity: [0, 1, 0] }}
                transition={{ duration: 0.24, ease: "easeOut", times: [0, 0.4, 1] }}
              />
            </div>
          )}
        </motion.div>
      )}

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
