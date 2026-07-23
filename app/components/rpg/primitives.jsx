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

// Hero art with an equip-scaled power aura (client feedback: equipping must
// produce an OBVIOUS visual change). Each equipped piece deepens the violet
// aura + glow around the hero; a full 4-piece set adds a slow breathing pulse.
// The pose image remounts on gear change with a scale pop and an expanding
// ring burst, so an equip lands as an event rather than a quiet image swap.
export function HeroShowcase({ pose, equippedCount = 0, heightClass = "h-[min(345px,42vh)]", className = "" }) {
  const t = Math.max(0, Math.min(4, equippedCount)) / 4;
  const fullSet = equippedCount >= 4;
  return (
    <div className={`relative flex ${heightClass} items-end justify-center ${className}`}>
      {/* Power aura behind the hero — intensity scales with gear count */}
      {equippedCount > 0 && (
        <motion.div
          className="pointer-events-none absolute inset-x-[6%] bottom-[2%] top-[4%] rounded-[50%]"
          style={{
            background: `radial-gradient(ellipse 52% 58% at 50% 60%, rgba(167,139,250,${(0.16 + t * 0.3).toFixed(3)}) 0%, rgba(124,77,255,${(0.1 + t * 0.24).toFixed(3)}) 40%, rgba(124,77,255,0) 72%)`,
            filter: "blur(8px)",
          }}
          animate={fullSet ? { opacity: [0.75, 1, 0.75], scale: [1, 1.07, 1] } : { opacity: 1, scale: 1 }}
          transition={fullSet ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.35 }}
        />
      )}
      {/* Ground glow under the hero's feet */}
      {equippedCount > 0 && (
        <div
          className="pointer-events-none absolute bottom-0 h-[7%] w-[62%] rounded-[50%]"
          style={{
            background: `radial-gradient(ellipse, rgba(124,77,255,${(0.25 + t * 0.35).toFixed(3)}) 0%, rgba(124,77,255,0) 70%)`,
            filter: "blur(3px)",
          }}
        />
      )}
      <motion.img
        key={pose}
        src={pose}
        alt="Your hero"
        className="relative h-full w-auto"
        style={{
          filter:
            equippedCount > 0
              ? `drop-shadow(0 0 ${Math.round(6 + t * 16)}px rgba(167,139,250,${(0.35 + t * 0.4).toFixed(3)}))`
              : "none",
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
        style={{ borderColor: "rgba(199,168,255,0.85)", x: "-50%" }}
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
