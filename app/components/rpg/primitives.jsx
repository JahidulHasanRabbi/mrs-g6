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
