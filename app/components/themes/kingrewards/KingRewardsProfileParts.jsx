"use client";

import { useState } from "react";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_GRADIENTS, KR_SURFACES } from "./assets";
import { GoldText } from "./KrUi";

/** Member photo inside the gold/blue avatar ring (Figma 664:802). */
export function KrAvatar({ src, name, size = 79 }) {
  const initial = (name?.[0] ?? "?").toUpperCase();
  const [failedSrc, setFailedSrc] = useState(null);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* The photo fills the ring's hole: 54/79 of the box in Figma. */}
      <div
        className="absolute flex items-center justify-center overflow-hidden rounded-full"
        style={{ inset: "16%", background: KR_COLORS.navyDeep }}
      >
        {src && src !== failedSrc ? (
          <img src={src} alt="" draggable={false} onError={() => setFailedSrc(src)} className="h-full w-full object-cover" />
        ) : (
          <span className="font-bold" style={{ fontFamily: KR_FONT, color: KR_COLORS.goldText, fontSize: size * 0.3 }}>
            {initial}
          </span>
        )}
      </div>
      <img
        src={KR_ASSETS.profile.avatarRing}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
    </div>
  );
}

/** Outline pill (Edit Profile / Back / Profile Image). Padding is a prop so buttons shrink at 320px. */
export function KrOutlineButton({ children, onClick, className = "", style, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex cursor-pointer items-center justify-center gap-[10px] whitespace-nowrap rounded-[48px] text-[12px] font-semibold leading-[1.2] transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{
        fontFamily: KR_FONT,
        color: KR_COLORS.gold,
        border: `1.5px solid ${KR_COLORS.goldBright}`,
        padding: "8px 16px",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Gold plaque button (VIP Profile / Save) on the btn-gold art. */
export function KrPlaqueButton({ children, onClick, className = "", style, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex cursor-pointer items-center justify-center whitespace-nowrap text-[12px] font-semibold leading-[1.2] transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{
        fontFamily: KR_FONT,
        color: KR_COLORS.onGold,
        backgroundImage: `url(${KR_ASSETS.ui.btnGold})`,
        backgroundSize: "100% 100%",
        padding: "12px 16px",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** VIP tier card with the deposit progress bar (Figma 664:813). */
export function KrTierCard({ currentLevel, nextLevel, progress, tokensNeeded }) {
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  const isTop = !nextLevel || nextLevel === currentLevel;

  return (
    <div
      className="flex w-full flex-col gap-2 rounded-[8px] p-2"
      style={{ ...KR_SURFACES.inner, border: `1px solid ${KR_COLORS.goldBright}` }}
    >
      <GoldText className="block truncate text-[14px] font-bold uppercase">{currentLevel || "—"}</GoldText>

      <div className="flex flex-col gap-1">
        <div
          className="h-[14px] w-full overflow-hidden rounded-[7px]"
          style={{ background: KR_COLORS.progressTrack, border: "1px solid #f59f0c" }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div className="h-full rounded-r-[9px]" style={{ width: `${pct}%`, background: KR_GRADIENTS.goldBar }} />
        </div>

        <div className="flex items-baseline justify-between gap-2 text-[11px] leading-[1.3]" style={{ fontFamily: KR_FONT }}>
          <span className="min-w-0 text-white">
            {isTop ? (
              "Top tier reached"
            ) : (
              <>
                Get <span style={{ color: KR_COLORS.gold }}>{Number(tokensNeeded || 0).toLocaleString("en-US")}</span> more to go{" "}
                <span className="uppercase" style={{ color: KR_COLORS.gold }}>{nextLevel}</span>
              </>
            )}
          </span>
          <span className="shrink-0 font-light">
            <span style={{ color: KR_COLORS.gold }}>{Math.round(pct)}%</span>
            <span style={{ color: "#fff2d4" }}>/ 100%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
