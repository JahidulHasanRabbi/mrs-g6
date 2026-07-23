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

// Deterministic rising energy sparks (fixed so SSR + client render match —
// no Math.random in render). Positions/timings hand-tuned to read as flames
// licking upward around the hero.
const AURA_SPARKS = [
  { left: 30, size: 7, delay: 0.0, dur: 1.9 },
  { left: 44, size: 5, delay: 0.6, dur: 2.3 },
  { left: 56, size: 8, delay: 0.3, dur: 2.0 },
  { left: 67, size: 5, delay: 1.1, dur: 2.5 },
  { left: 37, size: 6, delay: 1.4, dur: 2.2 },
  { left: 62, size: 6, delay: 0.9, dur: 2.6 },
  { left: 50, size: 9, delay: 1.7, dur: 2.1 },
];

// Hero art wrapped in a "Super Saiyan" energy aura (client request). The aura
// is ALWAYS on — a golden flame that flickers and sheds rising sparks around
// the body — and flares brighter/taller as gear is equipped. Equipping still
// lands as an event: the pose remounts with a scale pop + a ring burst.
export function HeroShowcase({ pose, equippedCount = 0, heightClass = "h-[min(345px,42vh)]", className = "" }) {
  const t = Math.max(0, Math.min(4, equippedCount)) / 4;
  // Strong base aura even with nothing equipped; brighter/taller with gear.
  const intensity = 0.6 + t * 0.4;
  const fullSet = equippedCount >= 4;
  return (
    <div className={`relative flex ${heightClass} items-end justify-center overflow-visible ${className}`}>
      {/* Outer energy flame — tall teardrop, gold core fading through amber to
          the game's violet at the fringe. Flickers in opacity + scale. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 bottom-[-6%] h-[124%] w-[84%] -translate-x-1/2"
        style={{
          background: `radial-gradient(46% 60% at 50% 56%, rgba(255,247,214,${(0.34 * intensity).toFixed(3)}) 0%, rgba(255,201,77,${(0.44 * intensity).toFixed(3)}) 28%, rgba(255,138,80,${(0.26 * intensity).toFixed(3)}) 50%, rgba(160,110,255,${(0.16 * intensity).toFixed(3)}) 70%, rgba(124,77,255,0) 87%)`,
          filter: "blur(12px)",
          transformOrigin: "50% 100%",
        }}
        animate={{
          opacity: [0.8, 1, 0.86, 1, 0.82],
          scaleY: [1, 1.08, 0.97, 1.06, 1],
          scaleX: [1, 0.96, 1.03, 0.97, 1],
        }}
        transition={{ duration: fullSet ? 1.4 : 2.0, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Flame crown — a narrow plume rising above the head that stretches and
          flickers, giving the aura its upward Super-Saiyan point. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[-14%] h-[52%] w-[30%] -translate-x-1/2"
        style={{
          background: `radial-gradient(40% 60% at 50% 78%, rgba(255,247,214,${(0.42 * intensity).toFixed(3)}) 0%, rgba(255,201,77,${(0.34 * intensity).toFixed(3)}) 42%, rgba(255,138,80,0) 82%)`,
          filter: "blur(9px)",
          transformOrigin: "50% 100%",
        }}
        animate={{ opacity: [0.55, 1, 0.7, 0.95, 0.6], scaleY: [0.9, 1.35, 1.05, 1.28, 0.95], scaleX: [1, 0.85, 1.05, 0.9, 1] }}
        transition={{ duration: fullSet ? 1.1 : 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Bright inner core — narrower, whiter, faster flicker for the hot centre. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 bottom-0 h-[92%] w-[46%] -translate-x-1/2"
        style={{
          background: `radial-gradient(42% 54% at 50% 60%, rgba(255,255,240,${(0.5 * intensity).toFixed(3)}) 0%, rgba(255,214,110,${(0.4 * intensity).toFixed(3)}) 38%, rgba(255,170,60,0) 74%)`,
          filter: "blur(9px)",
          transformOrigin: "50% 100%",
        }}
        animate={{ opacity: [0.75, 1, 0.85, 1, 0.78], scaleY: [1, 1.12, 0.98, 1.09, 1] }}
        transition={{ duration: fullSet ? 0.9 : 1.3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Rising flame sparks / embers licking upward around the body. */}
      {AURA_SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${s.left}%`,
            bottom: "10%",
            width: s.size,
            height: s.size * 2.3,
            background: "linear-gradient(to top, rgba(255,201,77,0.95) 0%, rgba(255,247,214,0.25) 100%)",
            filter: "blur(2px)",
          }}
          initial={{ y: 0, opacity: 0, scaleY: 0.6 }}
          animate={{ y: [-4, -(70 + t * 40)], opacity: [0, 0.95, 0], scaleY: [0.6, 1.25, 0.5] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      {/* Ground glow under the hero's feet. */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[8%] w-[64%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: `radial-gradient(ellipse, rgba(255,201,77,${(0.4 * intensity).toFixed(3)}) 0%, rgba(124,77,255,0) 72%)`,
          filter: "blur(4px)",
        }}
      />
      <motion.img
        key={pose}
        src={pose}
        alt="Your hero"
        className="relative h-full w-auto"
        style={{
          filter: `drop-shadow(0 0 ${Math.round(10 + t * 18)}px rgba(255,201,77,${(0.5 + t * 0.35).toFixed(3)}))`,
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
        style={{ borderColor: "rgba(255,214,120,0.9)", x: "-50%" }}
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
