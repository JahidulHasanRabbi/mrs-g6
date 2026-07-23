"use client";

// Small shared building blocks for the RPG screens: panels, progress bars,
// stat rows, equipment slot chips and the gradient CTA.

import { motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";

// Violet-bordered translucent card (stats card, power breakdown, etc.).
export function Panel({ children, className = "", style }) {
  return (
    <div
      className={`w-full rounded-[16px] border p-[16px] ${className}`}
      style={{
        background: RPG_COLORS.violetSoft,
        borderColor: RPG_COLORS.violetBorder,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Label / value line used inside panels.
export function StatRow({ label, value, valueColor = RPG_COLORS.text }) {
  return (
    <div className="flex w-full items-center justify-between">
      <span
        className="text-[13px] font-semibold"
        style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}
      >
        {label}
      </span>
      <span
        className="text-[13px] font-semibold"
        style={{ color: valueColor, fontFamily: RPG_FONTS.display }}
      >
        {value}
      </span>
    </div>
  );
}

// Animated horizontal bar (EXP, boss HP, mission progress).
export function ProgressBar({ pct, gradient = RPG_GRADIENTS.exp, height = 8, className = "" }) {
  return (
    <div
      className={`w-full overflow-hidden rounded-full ${className}`}
      style={{ height, background: "rgba(255,255,255,0.1)" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: gradient }}
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      />
    </div>
  );
}

// Equipment slot chip (Home + Hero Item). Empty: dashed violet border with an
// EMPTY pill. Equipped: solid cyan border with the +1,000 power tag.
export function SlotChip({
  slot,
  item,
  // Falls back to the spec default only when the item carries no power_bonus.
  powerTag,
  onClick,
  size = "md",
  // When `draggable` and something is equipped, the chip can be dragged (used
  // on Hero Item to drag an equipped piece into the backpack to unequip).
  draggable = false,
  onDrag,
  onDragEnd,
  onDragStart,
}) {
  const equipped = Boolean(item);
  const canDrag = draggable && equipped;
  // The +power tag reads the item's real power_bonus from the API.
  const tag =
    powerTag ?? (Number.isFinite(item?.power) ? `+${Number(item.power).toLocaleString("en-GB")}` : "+1,000");
  const pad = size === "sm" ? "pt-[10px] pb-[8px] px-[4px]" : "pt-[14px] pb-[10px] px-[4px]";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      drag={canDrag}
      dragSnapToOrigin
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 32 }}
      whileDrag={canDrag ? { scale: 1.12, zIndex: 40, opacity: 0.9 } : undefined}
      // Press feedback lives in Framer (not CSS transition-transform) so it
      // never eases — and therefore lags — the per-frame drag transform.
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      className={`flex min-w-0 flex-1 flex-col items-center gap-[7px] rounded-[14px] border ${pad} ${canDrag ? "touch-none" : ""} ${onClick ? "" : "cursor-default"}`}
      style={{
        background: equipped ? "rgba(47,230,200,0.06)" : "rgba(255,255,255,0.03)",
        borderColor: equipped ? RPG_COLORS.cyan : RPG_COLORS.violetBorderStrong,
        borderStyle: equipped ? "solid" : "dashed",
        boxShadow: equipped ? "0 0 14px rgba(47,230,200,0.15)" : "none",
      }}
    >
      <img
        src={equipped ? RPG_IMAGES.equipmentArt[slot] : RPG_IMAGES.equipment[slot]}
        alt=""
        className={equipped ? "size-[34px] object-contain" : "size-[30px]"}
        style={{ opacity: equipped ? 1 : 0.75 }}
      />
      <span
        className="text-[9px] font-semibold uppercase tracking-[1px]"
        style={{ color: RPG_COLORS.slotLabel, fontFamily: RPG_FONTS.display }}
      >
        {slot}
      </span>
      <span
        className="rounded-[5px] px-[6px] py-[2px] text-[9px] font-bold tracking-[1px]"
        style={
          equipped
            ? { background: "rgba(47,230,200,0.18)", color: RPG_COLORS.cyanSoft, fontFamily: RPG_FONTS.display }
            : { background: "rgba(139,92,246,0.2)", color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }
        }
      >
        {equipped ? tag : "EMPTY"}
      </span>
    </motion.button>
  );
}

// Rising violet flame tongues that billow up AROUND the hero (Mob-Psycho /
// cursed-seal aura). Deterministic so SSR + client agree. Each licks upward,
// stretches, sways, and dissipates on its own loop.
const AURA_FLAMES = [
  { left: 16, w: 17, h: 66, bottom: -2, delay: 0.0, dur: 2.0, sway: 7 },
  { left: 30, w: 13, h: 52, bottom: 0, delay: 0.7, dur: 2.4, sway: -6 },
  { left: 42, w: 12, h: 48, bottom: 2, delay: 1.3, dur: 2.2, sway: 5 },
  { left: 58, w: 12, h: 50, bottom: 1, delay: 0.4, dur: 2.3, sway: -5 },
  { left: 70, w: 15, h: 62, bottom: -2, delay: 1.0, dur: 2.1, sway: 6 },
  { left: 84, w: 13, h: 50, bottom: 0, delay: 1.6, dur: 2.5, sway: -7 },
];

// Hero art wrapped in a rising violet flame aura (client request — Mob-Psycho
// style). Dark-purple flames billow up behind/around the silhouette while a
// masked electric current courses over the body itself; a rim + ground glow
// anchor it. Everything intensifies with equipped gear, and an equip still
// lands as an event (pose remount + ring burst).
export function HeroShowcase({ pose, equippedCount = 0, heightClass = "h-[min(345px,42vh)]", className = "" }) {
  const t = Math.max(0, Math.min(4, equippedCount)) / 4;
  const intensity = 0.55 + t * 0.45;
  const rise = 46 + t * 40; // flames climb higher with more gear
  const fullSet = equippedCount >= 4;
  // The pose image, sized/placed to line up exactly with the <img> below
  // (h-full w-auto, bottom-centered) so masked overlays register on the body.
  const maskStyle = {
    WebkitMaskImage: `url(${pose})`,
    maskImage: `url(${pose})`,
    WebkitMaskSize: "auto 100%",
    maskSize: "auto 100%",
    WebkitMaskPosition: "center bottom",
    maskPosition: "center bottom",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
  return (
    <div className={`relative flex ${heightClass} items-end justify-center overflow-visible ${className}`}>
      {/* Big billowing back-plume behind the hero — the dark-violet aura mass
          that peaks above the head and pulses. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 bottom-[-4%] h-[128%] w-[70%] -translate-x-1/2"
        style={{
          background: `radial-gradient(44% 62% at 50% 60%, rgba(233,213,255,${(0.24 * intensity).toFixed(3)}) 0%, rgba(217,70,239,${(0.34 * intensity).toFixed(3)}) 28%, rgba(168,85,247,${(0.4 * intensity).toFixed(3)}) 46%, rgba(88,28,135,${(0.34 * intensity).toFixed(3)}) 66%, rgba(76,29,149,0) 84%)`,
          filter: "blur(14px)",
          transformOrigin: "50% 100%",
          mixBlendMode: "screen",
        }}
        animate={{ opacity: [0.78, 1, 0.85, 1, 0.8], scaleY: [1, 1.09, 0.97, 1.06, 1], scaleX: [1, 0.96, 1.03, 0.97, 1] }}
        transition={{ duration: fullSet ? 1.5 : 2.1, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Rising flame tongues around the body. */}
      {AURA_FLAMES.map((f, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{
            left: `${f.left}%`,
            bottom: `${f.bottom}%`,
            width: `${f.w}%`,
            height: `${f.h}%`,
            marginLeft: `${-f.w / 2}%`,
            background:
              "radial-gradient(50% 58% at 50% 82%, rgba(243,232,255,0.55) 0%, rgba(217,70,239,0.5) 30%, rgba(168,85,247,0.48) 56%, rgba(124,77,255,0) 80%)",
            borderRadius: "50% 50% 46% 46% / 66% 66% 34% 34%",
            filter: "blur(6px)",
            transformOrigin: "50% 100%",
            mixBlendMode: "screen",
          }}
          initial={{ opacity: 0, y: 8, scaleY: 0.6 }}
          animate={{
            opacity: [0, 0.85 * intensity, 0.5 * intensity, 0],
            y: [8, -rise * 0.5, -rise],
            scaleY: [0.6, 1.25, 1.5],
            x: [0, f.sway, 0],
          }}
          transition={{ duration: (fullSet ? 0.75 : 1) * f.dur, delay: f.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      {/* Contained rim glow hugging the silhouette. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 bottom-[-2%] h-[108%] w-[58%] -translate-x-1/2"
        style={{
          background: `radial-gradient(46% 56% at 50% 52%, rgba(168,85,247,${(0.3 * intensity).toFixed(3)}) 0%, rgba(124,77,255,${(0.18 * intensity).toFixed(3)}) 48%, rgba(124,77,255,0) 74%)`,
          filter: "blur(10px)",
        }}
        animate={{ opacity: [0.8, 1, 0.86, 1, 0.82] }}
        transition={{ duration: fullSet ? 1.2 : 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img
        key={pose}
        src={pose}
        alt="Your hero"
        className="relative h-full w-auto"
        style={{
          filter: `drop-shadow(0 0 ${Math.round(8 + t * 12)}px rgba(168,85,247,${(0.45 + t * 0.35).toFixed(3)}))`,
        }}
        initial={{ opacity: 0.35, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.25 },
          scale: { type: "spring", stiffness: 320, damping: 18 },
          y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      {/* Body energy tint — violet wash masked to the silhouette, breathing so
          the whole body reads as charged (screen-blend lightens, not covers). */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          ...maskStyle,
          background: `linear-gradient(to top, rgba(124,77,255,${(0.5 * intensity).toFixed(3)}) 0%, rgba(168,85,247,${(0.34 * intensity).toFixed(3)}) 55%, rgba(233,213,255,${(0.22 * intensity).toFixed(3)}) 100%)`,
          mixBlendMode: "screen",
        }}
        animate={{ opacity: [0.5, 0.82, 0.6, 0.78, 0.55] }}
        transition={{ duration: fullSet ? 1.1 : 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Electric current flowing UP through the body — thin bright violet
          lines masked to the silhouette, travelling upward with a flicker. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          ...maskStyle,
          backgroundImage:
            "repeating-linear-gradient(114deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 18px, rgba(168,85,247,0.8) 20px, rgba(243,232,255,0.95) 22px, rgba(168,85,247,0.8) 24px, rgba(0,0,0,0) 27px, rgba(0,0,0,0) 48px)",
          backgroundSize: "160% 160%",
          mixBlendMode: "screen",
          opacity: 0.4 + t * 0.4,
        }}
        animate={{ backgroundPosition: ["0px 0px", "0px -120px"], opacity: [0.3 + t * 0.35, 0.6 + t * 0.3, 0.35 + t * 0.35] }}
        transition={{
          backgroundPosition: { duration: fullSet ? 0.9 : 1.3, repeat: Infinity, ease: "linear" },
          opacity: { duration: 0.26, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        }}
      />
      {/* Ground glow under the hero's feet. */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[7%] w-[60%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: `radial-gradient(ellipse, rgba(168,85,247,${(0.42 * intensity).toFixed(3)}) 0%, rgba(124,77,255,0) 72%)`,
          filter: "blur(4px)",
        }}
      />
      {/* One-shot ring burst on each pose change (keyed remount replays it) */}
      <motion.div
        key={`burst-${pose}`}
        className="pointer-events-none absolute bottom-[30%] left-1/2 size-[120px] rounded-full border-2"
        style={{ borderColor: "rgba(199,168,255,0.9)", x: "-50%" }}
        initial={{ opacity: 0.9, scale: 0.4 }}
        animate={{ opacity: 0, scale: 2.1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
    </div>
  );
}

// Gold gradient CTA (START JOURNEY / CHALLENGE / OPEN BOX / …).
export function GoldCta({ children, onClick, disabled, className = "", glow = true }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-[14px] p-[15px] text-center text-[16px] font-bold tracking-[3px] transition-transform active:scale-[0.98] disabled:cursor-not-allowed ${className}`}
      style={{
        background: disabled ? "rgba(255,255,255,0.08)" : RPG_GRADIENTS.cta,
        color: disabled ? RPG_COLORS.slotEmpty : RPG_COLORS.darkText,
        fontFamily: RPG_FONTS.display,
        filter: glow && !disabled ? "drop-shadow(0 0 14px rgba(47,230,200,0.35))" : "none",
      }}
    >
      {children}
    </button>
  );
}

// Screen heading in the design's spaced Chakra Petch style ("HERO ITEM",
// "UNIVERSE", "MISSIONS", …).
export function ScreenTitle({ children, sub }) {
  return (
    <div className="flex w-full flex-col items-center gap-[6px]">
      <h2
        className="text-center text-[26px] font-bold tracking-[4px]"
        style={{
          color: RPG_COLORS.text,
          fontFamily: RPG_FONTS.display,
          textShadow: "0 0 24px rgba(124,77,255,0.8)",
        }}
      >
        {children}
      </h2>
      {sub ? (
        <p
          className="text-center text-[13px]"
          style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}
