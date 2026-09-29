"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { formatKrCoins } from "../../../api/apiOptions";
import { KR_ASSETS, KR_COLORS, KR_FONT } from "./assets";
import { GoldText, PageTitle, formatKrAmount } from "./KrUi";

// bg-stadium with its painted goal and ball removed (keeps the stands, the
// pitch lines, and none of the watermark / black band), so the only goal,
// keeper and ball on screen are the game's own.
const PITCH_CLEAN = "/assets/themes/kingrewards/pk/pitch-clean.webp";

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

/**
 * "SWIPE TO KICK" rides just above the resting ball (ReadyPhase's
 * `bottom: max(24vh, 200px)` anchor), in the grass gap below the keeper's feet.
 */
export function krPkSwipeCue(ballSize) {
  return {
    ...KR_GLOW_GOLD,
    fontSize: "clamp(14px, min(6.4vw, 3.2vh), 26px)",
    lineHeight: 1,
    WebkitTextStroke: 0,
    bottom: `calc(max(24vh, 200px) + ${ballSize}px + 4px)`,
    zIndex: 5,
  };
}

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

function HeaderIconButton({ src, onClick, label, round = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`relative h-9 w-9 cursor-pointer overflow-hidden transition-transform active:scale-95 ${round ? "rounded-full" : ""}`}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`block h-9 w-9 select-none object-contain ${round ? "scale-110" : ""}`}
      />
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

const HUD_VALUE = {
  fontFamily: KR_FONT,
  color: KR_PK_INK.hudValue,
  textShadow: "0 0 10px rgba(255,221,116,0.45)",
};

/** "N KR Coin(s) / Kick" split so the number can carry the value style. */
function kickCostParts(cost) {
  const label = formatKrCoins(formatKrAmount(cost));
  const cut = label.indexOf(" ");
  return { value: label.slice(0, cut), unit: `${label.slice(cut + 1)} / Kick` };
}

// Balance and cost stay unknown ("–") until the member and game settings load.
function KrPkBalanceRow({ balance, perShot }) {
  const cost = perShot == null ? null : kickCostParts(perShot);
  const short = balance != null && perShot != null && Number(balance) < Number(perShot);
  return (
    <div className="flex justify-center">
      <div
        className="flex h-[44px] w-full max-w-[342px] items-center rounded-[12px] px-3 [@media(max-height:760px)]:h-[36px]"
        style={{ border: `1px solid ${KR_COLORS.goldBright}`, background: "rgba(0,30,74,0.55)", boxShadow: "inset 0 2px 8px rgba(255,255,255,0.12)" }}
      >
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5" aria-label="KR Coin balance">
          <KrPkCoin size={24} />
          <span className="min-w-0 truncate text-[18px] font-bold leading-[1.2]" style={short ? { ...HUD_VALUE, color: "#ff8a8a" } : HUD_VALUE}>
            {balance == null ? "–" : formatKrAmount(balance)}
          </span>
        </div>
        <span aria-hidden="true" className="mx-2 h-6 w-px shrink-0" style={{ background: "rgba(255,240,102,0.45)" }} />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5" aria-label="Cost per kick">
          <KrPkCoin size={24} />
          <span className="flex min-w-0 items-baseline gap-1 whitespace-nowrap">
            <span className="text-[18px] font-bold leading-[1.2]" style={HUD_VALUE}>
              {cost ? cost.value : "–"}
            </span>
            <span className="min-w-0 truncate text-[11px] font-medium leading-[1.2]" style={{ fontFamily: KR_FONT, color: KR_COLORS.cream }}>
              {cost ? cost.unit : "KR Coins / Kick"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Menu left, only the rules "!" right (feedback 23 Sep); the title and, in
 * gameplay, the balance | cost row overlay the pitch so only the 64px bar takes layout height.
 */
export function KrPkTopHud({ onNavMenuClick, onInfoClick, hud }) {
  return (
    <div className="relative w-full">
      <div className="flex h-[64px] w-full items-center justify-between gap-2 px-4">
        <HeaderIconButton src={KR_ASSETS.ui.hamburger} onClick={onNavMenuClick} label="Open menu" />
        {/* Short screens: the goal is anchored from the bottom and rises into the HUD,
            so the title moves into the bar to free the space. */}
        <GoldText as="h1" className="hidden min-w-0 truncate text-[26px] font-bold uppercase [@media(max-height:760px)]:block">
          Penalty Kick
        </GoldText>
        <HeaderIconButton src={KR_ASSETS.ui.alert} onClick={onInfoClick} label="Penalty Kick rules" round />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-full z-30 flex flex-col gap-2 px-4">
        <div className="[@media(max-height:760px)]:hidden">
          <PageTitle>Penalty Kick</PageTitle>
        </div>
        {hud && <KrPkBalanceRow balance={hud.tokens} perShot={hud.perShot} />}
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

/** Dialog heading: the shared KR gold-gradient title. */
export function KrPkDialogTitle({ children, size = 20 }) {
  return (
    <GoldText as="h2" className="block px-4 text-center font-bold uppercase" style={{ fontSize: size, letterSpacing: 1.4 }}>
      {children}
    </GoldText>
  );
}
