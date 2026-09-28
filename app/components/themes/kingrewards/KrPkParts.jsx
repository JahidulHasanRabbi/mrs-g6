"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { KR_ASSETS, KR_FONT, KR_GRADIENTS } from "./assets";
import { PageTitle, formatKrAmount } from "./KrUi";

// bg-stadium with its painted goal and ball removed (keeps the stands, the
// pitch lines, and none of the watermark / black band), so the only goal,
// keeper and ball on screen are the game's own.
const PITCH_CLEAN = "/assets/themes/kingrewards/pk/pitch-clean.webp";
const HISTORY_ICON = "/assets/penalty-kick/icons/material-symbols-flag.svg";

// The plate's goal line sits 0.7351 × its width above its bottom edge. Widen it
// past the column when needed so the grass always reaches the 48vh goal anchor.
const PLATE_W = "max(min(100vw, 475px), 65.3vh)";

export const KR_PK_INK = {
  glow: "#f2ba33",
  heading: "#e2e2e2",
  muted: "#bbcbbb",
  hudValue: "#ffdd74",
  title: "#ebbf01",
  negative: "#ff3b30",
};

export const KR_GLOW_GOLD = {
  fontFamily: KR_FONT,
  color: KR_PK_INK.glow,
  letterSpacing: "1.4px",
  textTransform: "uppercase",
  textShadow: "0 0 20px rgba(242,186,51,0.35), 0 0 10px rgba(242,186,51,0.8)",
};

// Pitch banner ("SWIPE TO KICK" / "GOAL!") over the shared above-the-crossbar
// anchor; on short screens it is held down so it never rides up into the coin HUD.
export const KR_PK_BANNER = {
  ...KR_GLOW_GOLD,
  fontSize: "clamp(20px, min(9.7vw, 5vh), 40px)",
  WebkitTextStroke: 0,
  bottom: "min(calc(48vh + min(400px, 84vw) * 0.494 + 16px), calc(100% - 116px - 1.2em))",
};

export function KrPkGlowText({ as: Tag = "p", size = 40, className = "", style, children }) {
  return (
    <Tag className={`font-bold ${className}`} style={{ ...KR_GLOW_GOLD, fontSize: size, lineHeight: 1.2, ...style }}>
      {children}
    </Tag>
  );
}

export function KrPkPitch({ variant = "close", children }) {
  useEffect(() => {
    const img = new Image();
    img.src = PITCH_CLEAN;
  }, []);

  if (variant !== "close") {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#001a3d" }}>
        <img
          src={KR_ASSETS.pk.bgCrowd}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
        {children}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#040706" }}>
      <img
        src={PITCH_CLEAN}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute left-1/2 block select-none"
        style={{
          width: PLATE_W,
          height: "auto",
          maxWidth: "none",
          transform: "translateX(-50%)",
          bottom: `calc(48vh - ${PLATE_W} * 0.7351)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.45) 100%)" }}
      />
      {children}
    </div>
  );
}

function CrestButton({ src, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 cursor-pointer place-items-center transition-transform active:scale-95"
    >
      <img src={src} alt="" aria-hidden="true" draggable={false} className="block h-10 w-10 select-none object-contain" />
    </button>
  );
}

// KR ships no history art, so the flag glyph sits in a CSS copy of the crest ring.
function HistoryButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="History"
      className="h-10 w-10 cursor-pointer rounded-full p-[3px] transition-transform active:scale-95"
      style={{ background: KR_GRADIENTS.gold, boxShadow: "0 2px 4px rgba(0,0,0,0.4)" }}
    >
      <span
        className="grid h-full w-full place-items-center rounded-full"
        style={{ background: "radial-gradient(circle at 50% 35%, #1d5bb5 0%, #0a3170 60%, #062355 100%)" }}
      >
        <span
          aria-hidden="true"
          className="block h-[20px] w-[20px]"
          style={{
            background: KR_GRADIENTS.gold,
            WebkitMaskImage: `url(${HISTORY_ICON})`,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
            maskImage: `url(${HISTORY_ICON})`,
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "contain",
          }}
        />
      </span>
    </button>
  );
}

export function KrPkCoin({ size = 19.2, className = "" }) {
  return (
    <img
      src={KR_ASSETS.pk.iconTokenHud}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`block shrink-0 select-none object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function HudChip({ label, value, mirrored = false }) {
  const disc = (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
      style={{
        background: KR_GRADIENTS.gold,
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
      }}
    >
      <KrPkCoin />
    </span>
  );
  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-[8px] p-[9px]"
      style={{ minWidth: mirrored ? undefined : 124, border: "1px solid #fff066", background: "rgba(255,255,255,0.3)" }}
    >
      {!mirrored && disc}
      <div className={`flex min-w-0 flex-col ${mirrored ? "items-end text-right" : "items-start text-left"}`}>
        <span className="whitespace-nowrap text-[10px] uppercase leading-[10px]" style={{ fontFamily: KR_FONT, color: KR_PK_INK.muted }}>
          {label}
        </span>
        <span
          className="max-w-full truncate text-[18px] font-bold leading-[22.5px]"
          style={{
            fontFamily: KR_FONT,
            color: KR_PK_INK.hudValue,
            textShadow: "0 0 20px rgba(255,221,116,0.4), 0 0 10px rgba(255,221,116,0.8)",
          }}
        >
          {value}
        </span>
      </div>
      {mirrored && disc}
    </div>
  );
}

/**
 * Header crest buttons, then the title and (in gameplay) the coin HUD as a
 * non-interactive overlay, so only the 56px row takes layout height from the pitch.
 */
export function KrPkTopHud({ onNavMenuClick, onInfoClick, onMenuClick, hud }) {
  return (
    <div className="relative w-full">
      <div className="flex w-full items-center justify-between px-4 py-2">
        <CrestButton src={KR_ASSETS.ui.hamburger} onClick={onNavMenuClick} label="Navigation menu" />
        <div className="flex items-center gap-3">
          <HistoryButton onClick={onMenuClick} />
          <CrestButton src={KR_ASSETS.ui.info} onClick={onInfoClick} label="Info" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-full flex flex-col gap-2 px-4">
        <PageTitle>Penalty Kick</PageTitle>
        {hud && (
          <div className="flex w-full items-center justify-between gap-2">
            <HudChip label="KR Coins" value={formatKrAmount(hud.tokens)} />
            <HudChip label="KR Coins/Shot" value={formatKrAmount(hud.perShot)} mirrored />
          </div>
        )}
      </div>
    </div>
  );
}

/** Frame 707:5914 hero: gold rings round a dark core holding the gold ball glyph. */
export function KrPkHeroDisc({ spin = false }) {
  return (
    <div className="relative" style={{ width: 192, height: 192 }}>
      <div aria-hidden="true" className="pointer-events-none absolute rounded-full" style={{ inset: -10, border: "2px solid #fff066" }} />
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          backgroundColor: "#1e2020",
          border: "1px solid #fff066",
          backdropFilter: "blur(10px)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full" style={{ border: "4px solid rgba(242,186,51,0.2)" }} />
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={spin ? { rotate: 360 } : { y: [0, -3, 0] }}
        transition={spin ? { duration: 3.2, ease: "linear", repeat: Infinity } : { duration: 2.4, ease: "easeInOut", repeat: Infinity }}
      >
        <img src={KR_ASSETS.pk.iconBall} alt="" aria-hidden="true" draggable={false} className="block select-none" style={{ width: 66.667, height: 66.667 }} />
      </motion.div>
    </div>
  );
}

export function KrPkProgress({ progress }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-bold leading-[14px]" style={KR_GLOW_GOLD}>
          Initializing Arena
        </span>
        <span className="text-[24px] font-bold leading-[28.8px]" style={{ fontFamily: KR_FONT, color: KR_PK_INK.glow }}>
          {progress}%
        </span>
      </div>
      <div
        className="relative h-4 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "#333535", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="absolute left-0 rounded-full transition-[width] duration-100 ease-out"
          style={{
            top: 2.2,
            bottom: 1.8,
            width: `max(6px, ${progress}%)`,
            background: "linear-gradient(90deg, #e4a825, #fde66b)",
            boxShadow: "0 0 15px #f9d063",
          }}
        />
      </div>
    </div>
  );
}

/** The navy dialog card (Figma "glass panel"): solid #003d89, inner highlight, no border. */
export function KrPkCard({ children, className = "px-2 py-4" }) {
  return (
    <div
      className={`relative flex w-full max-w-[380px] flex-col items-center gap-6 overflow-hidden rounded-[16px] text-center ${className}`}
      style={{
        background: "#003d89",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        boxShadow: "inset 0 4px 16px 4px rgba(255,255,255,0.15)",
      }}
    >
      {children}
    </div>
  );
}

export function KrPkDialogTitle({ children }) {
  return (
    <p
      className="px-4 py-2 text-center text-[14px] font-bold uppercase leading-[15px] tracking-[0.5px]"
      style={{ fontFamily: KR_FONT, color: KR_PK_INK.title }}
    >
      {children}
    </p>
  );
}
