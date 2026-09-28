"use client";

import { KR_ASSETS, KR_COLORS, KR_FONT, KR_GRADIENTS, KR_SURFACES } from "./assets";

/** "1,234.5" — the KR display format for coin and deposit amounts. */
export function formatKrAmount(value) {
  const amount = Number(String(value ?? 0).replace(/,/g, ""));
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/** Gold gradient text. Line-height stays ≥ 1.2 so descenders aren't clipped. */
export function GoldText({ as: Tag = "span", className = "", style, children }) {
  return (
    <Tag
      className={className}
      style={{
        fontFamily: KR_FONT,
        backgroundImage: KR_GRADIENTS.gold,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * An API-supplied image that falls back to the KR coin when the URL is missing
 * or fails to load — the backend sends broken prize URLs.
 */
export function KrImage({ src, fallback = KR_ASSETS.ui.iconCoins, alt = "", ...rest }) {
  return (
    <img
      src={src || fallback}
      alt={alt}
      draggable={false}
      onError={(e) => {
        if (!e.currentTarget.src.endsWith(fallback)) e.currentTarget.src = fallback;
      }}
      {...rest}
    />
  );
}

/** A King Rewards surface: `glass` (drawer/nav), `solid` (page card) or `inner`. */
export function GlassCard({ variant = "solid", radius = 16, bordered = false, className = "", style, children, ...rest }) {
  return (
    <div
      className={className}
      style={{
        ...KR_SURFACES[variant],
        borderRadius: radius,
        border: bordered ? `1px solid ${KR_COLORS.goldBright}` : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** The in-card heading: Barlow Bold 20, uppercase, gold gradient. */
export function CardTitle({ children, align = "left", size = 20, className = "" }) {
  return (
    <GoldText
      as="h2"
      className={`block font-bold uppercase ${className}`}
      style={{ fontSize: size, textAlign: align }}
    >
      {children}
    </GoldText>
  );
}

/** The page heading: Barlow Bold 40, uppercase, gold gradient, centred. */
export function PageTitle({ children }) {
  return (
    <GoldText as="h1" className="block w-full text-center font-bold uppercase" style={{ fontSize: "clamp(28px, 9.7vw, 40px)" }}>
      {children}
    </GoldText>
  );
}

/** Transparent pill with a gold hairline — Edit Profile / Back. */
export function OutlinePill({ children, onClick, className = "", type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex cursor-pointer items-center justify-center gap-[10px] rounded-[48px] px-8 py-2 text-[12px] font-semibold transition-transform active:scale-[0.97] disabled:opacity-60 ${className}`}
      style={{ fontFamily: KR_FONT, color: KR_COLORS.gold, border: `1.5px solid ${KR_COLORS.goldBright}` }}
    >
      {children}
    </button>
  );
}

/** The gold plaque button (btn-gold art) — VIP Profile / Save / PLAY. */
export function GoldPlaque({ children, onClick, className = "", textSize = 12, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex cursor-pointer items-center justify-center overflow-hidden px-8 py-2 font-semibold transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{
        fontFamily: KR_FONT,
        color: KR_COLORS.onGold,
        fontSize: textSize,
        backgroundImage: `url(${KR_ASSETS.ui.btnGold})`,
        backgroundSize: "100% 100%",
      }}
    >
      <span className="relative">{children}</span>
    </button>
  );
}

/** Tab strip used by profile history and the leaderboard categories. */
export function KrTabs({ tabs, active, onChange, size = 10, className = "" }) {
  return (
    <div className={`flex w-full gap-1 ${className}`}>
      {tabs.map((tab) => {
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="flex-1 cursor-pointer rounded-[8px] px-1 py-2 text-center font-semibold"
            style={{
              fontFamily: KR_FONT,
              fontSize: size,
              color: KR_COLORS.goldText,
              border: `1px solid ${KR_COLORS.goldBright}`,
              background: on ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/** Round arrow button either side of a KR rail (home games, VIP tiers). */
export function KrArrowPill({ dir, label, disabled, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex shrink-0 cursor-pointer items-center justify-center rounded-[16px] bg-[rgba(255,255,255,0.2)] p-[2px] transition-opacity disabled:cursor-default disabled:opacity-50 ${className}`}
    >
      <img
        src={KR_ASSETS.ui.iconArrowCircle}
        alt=""
        className="size-3"
        style={{ transform: dir < 0 ? "rotate(-90deg) scaleY(-1)" : "rotate(90deg) scaleY(-1)" }}
      />
    </button>
  );
}
