"use client";

// Small shared building blocks for the RPG screens: panels, progress bars,
// stat rows, equipment slot chips and the gradient CTA.

import { motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";
import { nineSlice, RpgSkinProvider, useRpgSkin } from "./rpgSkin";

// Content card. Default look is a violet-bordered translucent box; a station
// skin wears the theme's ornate frame as a 9-slice so the corners keep their
// shape however tall the content grows.
//
// A theme whose frame has a light interior (lv918's pink) supplies `onPanel`
// ink; re-providing the skin's precomputed `panelSkin` means child components
// pick it up without knowing they sit inside a frame. Parents that write inline
// styles read `skin.cOnPanel` instead — those resolve above this provider.
export function Panel({ children, className = "", style, tone = "default" }) {
  const skin = useRpgSkin();
  const body =
    skin.panelSkin === skin ? children : <RpgSkinProvider skin={skin.panelSkin}>{children}</RpgSkinProvider>;

  if (!skin.panel.frame) {
    return (
      <div
        className={`w-full rounded-[16px] border p-[16px] ${className}`}
        style={{
          background: tone === "dark" ? skin.panel.fillDark : skin.panel.fill,
          borderColor: tone === "dark" ? skin.panel.borderDark : skin.panel.border,
          ...style,
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ ...nineSlice(skin.panel), ...style }}>
      {body}
    </div>
  );
}

// Label / value line used inside panels.
export function StatRow({ label, value, valueColor }) {
  const skin = useRpgSkin();
  return (
    <div className="flex w-full items-center justify-between">
      <span
        className="text-[13px] font-semibold"
        style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}
      >
        {label}
      </span>
      <span
        className="text-[13px] font-semibold"
        style={{ color: valueColor || skin.c.text, fontFamily: RPG_FONTS.display }}
      >
        {value}
      </span>
    </div>
  );
}

// Animated horizontal bar (EXP, boss HP, mission progress).
export function ProgressBar({ pct, gradient, height = 8, className = "" }) {
  const skin = useRpgSkin();
  return (
    <div
      className={`w-full overflow-hidden rounded-full ${className}`}
      style={{ height, background: skin.bar.track }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: gradient || skin.bar.fill }}
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
  const skin = useRpgSkin();
  const tileFrame = skin.tile.frame;
  // The tile art shares its panel's interior, so the chip takes panel ink —
  // read off the skin so it is the same whether or not a Panel wraps this chip.
  const tc = skin.cOnPanel;
  const lightTile = tc !== skin.c;
  const equipped = Boolean(item);
  const canDrag = draggable && equipped;
  // The +power tag reads the item's real power_bonus from the API.
  const tag =
    powerTag ?? (Number.isFinite(item?.power) ? `+${Number(item.power).toLocaleString("en-GB")}` : "+1,000");
  const pad = size === "sm" ? "pt-[10px] pb-[8px] px-[4px]" : "pt-[14px] pb-[10px] px-[4px]";

  // 9-slice so the ornament keeps its shape in the portrait chip box, and the
  // border width reserves the frame's opening for the icon/label/tag.
  const frameStyle = tileFrame
    ? {
        ...nineSlice(skin.tile),
        boxShadow: equipped ? `0 0 14px ${skin.hud.badgeBorder}55` : "none",
      }
    : {
        background: equipped ? "rgba(47,230,200,0.06)" : "rgba(255,255,255,0.03)",
        borderColor: equipped ? RPG_COLORS.cyan : RPG_COLORS.violetBorderStrong,
        borderStyle: equipped ? "solid" : "dashed",
        boxShadow: equipped ? "0 0 14px rgba(47,230,200,0.15)" : "none",
      };

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
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-[7px] ${tileFrame ? "" : `rounded-[14px] border ${pad}`} ${canDrag ? "touch-none" : ""} ${onClick ? "" : "cursor-default"}`}
      style={frameStyle}
    >
      <img
        src={equipped ? RPG_IMAGES.equipmentArt[slot] : RPG_IMAGES.equipment[slot]}
        alt=""
        className={equipped ? "size-[34px] object-contain" : "size-[30px]"}
        style={{ opacity: equipped ? 1 : 0.75 }}
      />
      <span
        className="text-[9px] font-semibold uppercase tracking-[1px]"
        style={{ color: tc.slotLabel, fontFamily: RPG_FONTS.display }}
      >
        {slot}
      </span>
      <span
        className="rounded-[5px] px-[6px] py-[2px] text-[9px] font-bold tracking-[1px]"
        style={
          tileFrame
            ? {
                background: lightTile ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
                color: equipped ? tc.value : tc.slotEmpty,
                fontFamily: RPG_FONTS.display,
              }
            : equipped
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
// stretches, sways, and dissipates on its own loop. Dense + tall so the flames
// fill the frame around the body and rise past the head (matches the ref art).
const AURA_FLAMES = [
  { left: 12, w: 17, h: 72, bottom: -2, delay: 0.0, dur: 2.0, sway: 8 },
  { left: 24, w: 13, h: 62, bottom: 0, delay: 0.7, dur: 2.3, sway: -6 },
  { left: 36, w: 12, h: 68, bottom: 2, delay: 1.3, dur: 2.1, sway: 6 },
  { left: 50, w: 17, h: 86, bottom: 2, delay: 0.4, dur: 2.4, sway: 4 },
  { left: 64, w: 12, h: 68, bottom: 1, delay: 1.5, dur: 2.2, sway: -5 },
  { left: 76, w: 13, h: 62, bottom: 0, delay: 0.9, dur: 2.5, sway: 7 },
  { left: 88, w: 17, h: 72, bottom: -2, delay: 1.8, dur: 2.0, sway: -8 },
  { left: 44, w: 10, h: 56, bottom: 4, delay: 2.0, dur: 1.9, sway: 3 },
  { left: 58, w: 10, h: 58, bottom: 3, delay: 1.1, dur: 2.6, sway: -4 },
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
              "radial-gradient(50% 58% at 50% 82%, rgba(245,236,255,0.72) 0%, rgba(224,86,244,0.62) 28%, rgba(168,85,247,0.55) 54%, rgba(124,77,255,0) 80%)",
            borderRadius: "50% 50% 46% 46% / 66% 66% 34% 34%",
            filter: "blur(5px)",
            transformOrigin: "50% 100%",
            mixBlendMode: "screen",
          }}
          initial={{ opacity: 0, y: 8, scaleY: 0.6 }}
          animate={{
            opacity: [0, Math.min(1, 1.05 * intensity), 0.6 * intensity, 0],
            y: [8, -rise * 0.5, -rise],
            scaleY: [0.6, 1.3, 1.6],
            x: [0, f.sway, 0],
          }}
          transition={{ duration: (fullSet ? 0.75 : 1) * f.dur, delay: f.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      {/* Silhouette rim glow — the pose used as a mask and filled bright, sitting
          behind the hero so only the blurred edge bleeds out: a body-SHAPED
          purple outline (the crisp glow the ref has), not a soft oval. Two
          passes: a wide soft violet halo + a tight bright magenta edge. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          ...maskStyle,
          background: `linear-gradient(to top, #7c4dff, #a855f7 55%, #d946ef 100%)`,
          filter: "blur(11px)",
          transform: "scale(1.06)",
          transformOrigin: "50% 100%",
          mixBlendMode: "screen",
        }}
        animate={{ opacity: [0.55 * intensity, 0.85 * intensity, 0.6 * intensity, 0.8 * intensity, 0.55 * intensity] }}
        transition={{ duration: fullSet ? 1.2 : 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          ...maskStyle,
          background: `linear-gradient(to top, #c084fc, #e9d5ff 60%, #f3e8ff 100%)`,
          filter: "blur(3.5px)",
          transform: "scale(1.02)",
          transformOrigin: "50% 100%",
          mixBlendMode: "screen",
        }}
        animate={{ opacity: [0.6, 0.95, 0.7, 0.9, 0.62] }}
        transition={{ duration: fullSet ? 0.9 : 1.4, repeat: Infinity, ease: "easeInOut" }}
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
      {/* Ground glow under the hero's feet — bright violet pool. */}
      <motion.div
        className="pointer-events-none absolute bottom-[-1%] left-1/2 h-[11%] w-[74%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: `radial-gradient(ellipse, rgba(233,213,255,${(0.4 * intensity).toFixed(3)}) 0%, rgba(168,85,247,${(0.5 * intensity).toFixed(3)}) 34%, rgba(124,77,255,0) 74%)`,
          filter: "blur(5px)",
        }}
        animate={{ opacity: [0.85, 1, 0.9, 1, 0.86] }}
        transition={{ duration: fullSet ? 1.1 : 1.7, repeat: Infinity, ease: "easeInOut" }}
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

// Primary CTA (START JOURNEY / CHALLENGE / OPEN BOX / …). Default look is the
// gold gradient pill; a station skin wears the theme's plaque art with the
// script lettering the comps use.
export function GoldCta({ children, onClick, disabled, className = "", glow = true, size = "md" }) {
  const skin = useRpgSkin();
  const plaque = skin.cta.plaque;
  const compact = size === "sm";

  if (!plaque) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full rounded-[14px] text-center font-bold tracking-[3px] transition-transform active:scale-[0.98] disabled:cursor-not-allowed ${compact ? "p-[12px] text-[13px]" : "p-[15px] text-[16px]"} ${className}`}
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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex w-full items-center justify-center transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{ height: compact ? 46 : 58 }}
    >
      <img src={plaque} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full" draggable={false} />
      <span
        className="relative z-10 leading-none"
        style={{ fontSize: compact ? 16 : 20, fontFamily: skin.cta.font, color: skin.cta.color }}
      >
        {children}
      </span>
    </button>
  );
}

// Screen heading in the design's spaced caps ("HERO ITEM", "UNIVERSE", …).
export function ScreenTitle({ children, sub }) {
  const skin = useRpgSkin();
  return (
    <div className="flex w-full flex-col items-center gap-[6px]">
      <h2
        className="text-center text-[26px] font-bold tracking-[4px]"
        style={{ color: skin.c.title, fontFamily: RPG_FONTS.display, textShadow: skin.c.titleShadow }}
      >
        {children}
      </h2>
      {sub ? (
        <p className="text-center text-[13px]" style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}
