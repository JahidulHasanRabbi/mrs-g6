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

// Radiating lightning bolts for the aura, drawn in a 120×160 viewBox that
// scales to the hero. Split into two sets that flash out of phase so the aura
// crackles like live electricity. Each bolt is a jagged path pointing outward
// from the body's centre.
const AURA_BOLTS_A = [
  "M60,64 L53,46 L62,42 L50,18",
  "M74,72 L98,62 L88,76 L114,64",
  "M50,94 L28,106 L40,100 L16,120",
];
const AURA_BOLTS_B = [
  "M70,62 L90,42 L79,47 L100,22",
  "M46,82 L22,74 L34,83 L8,78",
  "M60,98 L67,124 L56,117 L66,144",
];

// Deterministic energy motes that blink around the body (no Math.random in
// render, so SSR and client agree).
const AURA_MOTES = [
  { left: 26, top: 34, size: 5, delay: 0.0, dur: 1.3 },
  { left: 74, top: 30, size: 4, delay: 0.5, dur: 1.1 },
  { left: 32, top: 62, size: 6, delay: 0.9, dur: 1.5 },
  { left: 70, top: 58, size: 5, delay: 0.3, dur: 1.2 },
  { left: 50, top: 20, size: 4, delay: 1.1, dur: 1.4 },
  { left: 60, top: 74, size: 6, delay: 0.7, dur: 1.0 },
];

function AuraBolts({ paths }) {
  return (
    <svg
      viewBox="0 0 120 160"
      preserveAspectRatio="none"
      className="h-full w-full"
      fill="none"
      style={{ filter: "drop-shadow(0 0 5px rgba(168,85,247,0.9))" }}
    >
      {paths.map((d, i) => (
        <g key={i} strokeLinecap="round" strokeLinejoin="round">
          {/* soft violet body */}
          <path d={d} stroke="#a855f7" strokeWidth="4.5" strokeOpacity="0.55" />
          {/* hot white-violet core */}
          <path d={d} stroke="#f3e8ff" strokeWidth="1.6" />
        </g>
      ))}
    </svg>
  );
}

// Hero art wrapped in a crackling violet energy aura (client request — modelled
// on the "full set" avatar's electric purple lightning). The aura is ALWAYS on
// and flares brighter with equipped gear: a violet body glow + hot core, two
// out-of-phase lightning-bolt layers, blinking energy motes, and a ground glow.
// Equipping still lands as an event: the pose remounts with a scale pop + burst.
export function HeroShowcase({ pose, equippedCount = 0, heightClass = "h-[min(345px,42vh)]", className = "" }) {
  const t = Math.max(0, Math.min(4, equippedCount)) / 4;
  // Strong base aura even with nothing equipped; brighter/bigger with gear.
  const intensity = 0.6 + t * 0.4;
  const fullSet = equippedCount >= 4;
  return (
    <div className={`relative flex ${heightClass} items-end justify-center overflow-visible ${className}`}>
      {/* Outer violet energy field — tall, envelops the body, magenta at the
          fringe. Flickers in opacity + scale. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 bottom-[-6%] h-[124%] w-[88%] -translate-x-1/2"
        style={{
          background: `radial-gradient(48% 60% at 50% 54%, rgba(233,213,255,${(0.30 * intensity).toFixed(3)}) 0%, rgba(168,85,247,${(0.44 * intensity).toFixed(3)}) 30%, rgba(124,77,255,${(0.28 * intensity).toFixed(3)}) 54%, rgba(217,70,239,${(0.16 * intensity).toFixed(3)}) 70%, rgba(124,77,255,0) 88%)`,
          filter: "blur(13px)",
          transformOrigin: "50% 100%",
        }}
        animate={{
          opacity: [0.82, 1, 0.88, 1, 0.84],
          scaleY: [1, 1.07, 0.98, 1.05, 1],
          scaleX: [1, 0.97, 1.02, 0.98, 1],
        }}
        transition={{ duration: fullSet ? 1.4 : 2.0, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Bright inner core — hot white-violet centre, faster flicker. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 bottom-0 h-[96%] w-[50%] -translate-x-1/2"
        style={{
          background: `radial-gradient(42% 54% at 50% 56%, rgba(245,238,255,${(0.55 * intensity).toFixed(3)}) 0%, rgba(192,132,252,${(0.42 * intensity).toFixed(3)}) 40%, rgba(124,77,255,0) 76%)`,
          filter: "blur(10px)",
          transformOrigin: "50% 100%",
        }}
        animate={{ opacity: [0.78, 1, 0.86, 1, 0.8], scaleY: [1, 1.1, 0.98, 1.07, 1] }}
        transition={{ duration: fullSet ? 0.9 : 1.3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Two lightning-bolt layers flashing out of phase → crackling energy. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[2%] h-[100%] w-[104%] -translate-x-1/2"
        animate={{ opacity: [0.15, 0.9, 0.25, 1, 0.3].map((o) => o * (0.5 + t * 0.5)) }}
        transition={{ duration: fullSet ? 0.42 : 0.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <AuraBolts paths={AURA_BOLTS_A} />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[2%] h-[100%] w-[104%] -translate-x-1/2"
        animate={{ opacity: [0.9, 0.2, 1, 0.25, 0.7].map((o) => o * (0.5 + t * 0.5)) }}
        transition={{ duration: fullSet ? 0.5 : 0.72, repeat: Infinity, ease: "easeInOut" }}
      >
        <AuraBolts paths={AURA_BOLTS_B} />
      </motion.div>
      {/* Blinking energy motes drifting around the body. */}
      {AURA_MOTES.map((m, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            background: "radial-gradient(circle, #f3e8ff 0%, #a855f7 60%, rgba(124,77,255,0) 100%)",
            filter: "blur(0.5px)",
          }}
          animate={{ opacity: [0, 0.95, 0], scale: [0.6, 1.15, 0.5], y: [2, -8, -14] }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Ground glow under the hero's feet. */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[8%] w-[66%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: `radial-gradient(ellipse, rgba(168,85,247,${(0.45 * intensity).toFixed(3)}) 0%, rgba(124,77,255,0) 72%)`,
          filter: "blur(4px)",
        }}
      />
      <motion.img
        key={pose}
        src={pose}
        alt="Your hero"
        className="relative h-full w-auto"
        style={{
          filter: `drop-shadow(0 0 ${Math.round(9 + t * 16)}px rgba(168,85,247,${(0.5 + t * 0.35).toFixed(3)})) drop-shadow(0 0 4px rgba(243,232,255,0.5))`,
        }}
        initial={{ opacity: 0.35, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.25 },
          scale: { type: "spring", stiffness: 320, damping: 18 },
          y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
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
