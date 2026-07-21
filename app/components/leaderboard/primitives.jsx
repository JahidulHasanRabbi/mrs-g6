"use client";

import { useState } from "react";
import { LB_COLORS } from "./constants";
import ThemedActionButton from "../themes/shared/ThemedActionButton";

export const flagUrl = (iso) =>
  `/assets/leaderboard/flags/${iso.toLowerCase()}.svg`;

function SoundIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
      <path d="m16 9 5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LBHeader({ onInfoClick, onMenuClick, onSoundToggle, soundMuted = false, title = "LEADERBOARDS" }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <button type="button" aria-label="Menu" onClick={onMenuClick} className="grid h-9 w-9 shrink-0 place-items-center">
        <span className="flex flex-col gap-1">
          <span className="block h-[3px] w-5 rounded" style={{ background: "#FFDD74" }} />
          <span className="block h-[3px] w-5 rounded" style={{ background: "#FFDD74" }} />
          <span className="block h-[3px] w-5 rounded" style={{ background: "#FFDD74" }} />
        </span>
      </button>
      <h1
        className="flex-1 text-[28px] font-bold uppercase"
        style={{
          color: LB_COLORS.primary,
          fontFamily: "'Anybody','Lexend',sans-serif",
          letterSpacing: "-1.4px",
          lineHeight: "32px",
          textShadow: "0 2px 1px rgba(0,0,0,0.8)",
        }}
      >
        {title}
      </h1>
      {onSoundToggle && (
        <button
          type="button"
          aria-label={soundMuted ? "Unmute crowd sound" : "Mute crowd sound"}
          aria-pressed={soundMuted}
          onClick={onSoundToggle}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ border: "2px solid #EBBF01", color: "#FFDD74", background: "transparent" }}
        >
          {soundMuted ? <MuteIcon /> : <SoundIcon />}
        </button>
      )}
      <button
        type="button"
        aria-label="Info"
        onClick={onInfoClick}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        style={{
          border: "2px solid #EBBF01",
          color: "#FFDD74",
          background: "transparent",
          fontFamily: "'Lexend',serif",
          fontStyle: "italic",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        i
      </button>
    </div>
  );
}

export function GlowCard({ children, className = "", style }) {
  return (
    <div
      className={`w-full max-w-[358px] rounded-[16px] p-[25px] backdrop-blur-[10px] ${className}`}
      style={{
        background: LB_COLORS.cardOverlay,
        border: `1px solid ${LB_COLORS.borderGreen30}`,
        boxShadow: "0 0 20px 0 rgba(var(--lb-accent-rgb), 0.2)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Panel({ children, className = "", style }) {
  return (
    <div
      className={`w-full max-w-[362px] rounded-[12px] p-[9px] ${className}`}
      style={{
        background: LB_COLORS.panelDark,
        border: `1px solid ${LB_COLORS.borderSoft}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionBadge({ children, align = "center", size = "sm" }) {
  const fontSize = size === "lg" ? "20px" : "14px";
  const lineHeight = size === "lg" ? "24px" : "15px";
  return (
    <div
      className="w-full rounded-[4px] px-4 py-2 uppercase"
      style={{
        background: LB_COLORS.primarySoft,
        color: LB_COLORS.primary,
        textAlign: align,
        fontFamily: "'Lexend',sans-serif",
        fontSize,
        lineHeight,
        letterSpacing: "0.5px",
        fontWeight: size === "lg" ? 600 : 400,
      }}
    >
      {children}
    </div>
  );
}

export function Flag({ code, src, size = 28 }) {
  const [failed, setFailed] = useState(false);
  const imgSrc = src || (code ? flagUrl(code) : null);
  const label = code ? String(code).slice(0, 3).toUpperCase() : "?";
  const fontSize = Math.floor(size * 0.36);
  const fallbackStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize, fontFamily: "'Lexend',sans-serif", flexShrink: 0 };

  if (!imgSrc || failed) return <span style={fallbackStyle}>{label}</span>;

  return (
    <img
      src={imgSrc}
      alt={label}
      draggable={false}
      className="shrink-0 rounded-full"
      style={{ width: size, height: size, objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}

export function DrawBadge({ size = 28 }) {
  const fontSize = Math.max(9, Math.floor(size * 0.4));
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        background: "rgba(233,175,65,0.18)",
        border: `1px solid ${LB_COLORS.gold}`,
        color: LB_COLORS.gold,
        fontFamily: "'Lexend',sans-serif",
        fontSize,
      }}
    >
      D
    </span>
  );
}

export function Tabs({ tabs, activeIndex, onChange }) {
  return (
    <div
      className="flex h-[50px] w-[362px] max-w-full items-start justify-center gap-1 rounded-[12px] p-[5px]"
      style={{
        background: "rgba(26,28,28,0.6)",
        border: `1px solid ${LB_COLORS.borderSoft}`,
        backdropFilter: "blur(6px)",
      }}
    >
      {tabs.map((label, i) => {
        const active = i === activeIndex;
        return (
          <button
            type="button"
            key={label}
            onClick={() => onChange(i)}
            className="flex-1 rounded-[8px] py-2 text-[12px]"
            style={{
              background: active ? LB_COLORS.primary : "transparent",
              color: active ? LB_COLORS.primaryDeep : LB_COLORS.textMuted,
              fontFamily: "'Lexend',sans-serif",
              lineHeight: "24px",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function GreenButton({ children, onClick, variant = "primary", size = "lg" }) {
  const isPrimary = variant === "primary";
  const padding = size === "sm" ? "py-2 text-[12px]" : "py-4 text-[16px]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[8px] uppercase ${padding}`}
      style={{
        background: isPrimary ? LB_COLORS.primary : "transparent",
        border: isPrimary ? "none" : `1px solid ${LB_COLORS.primary}`,
        color: isPrimary ? LB_COLORS.primaryDeep : LB_COLORS.primary,
        fontFamily: "'Lexend',sans-serif",
        boxShadow: isPrimary ? "0 4px 0 rgba(0,0,0,0.3)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export function HeroButton({ children, onClick, disabled }) {
  const defaultButton = (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full rounded-[12px] py-4 uppercase"
      style={{
        background: LB_COLORS.primary,
        color: LB_COLORS.primaryDeep,
        boxShadow: disabled ? "none" : "0 4px 0 rgba(0,0,0,0.3)",
        fontFamily: "'Anybody','Lexend',sans-serif",
        fontWeight: 700,
        fontSize: 22,
        lineHeight: "28.8px",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );

  // Themed portals get the theme's ornate gold plaque; default theme keeps the
  // flat hero button above. Centered so the fixed-width plaque doesn't look
  // stranded in the full-width card.
  return (
    <div className="flex w-full justify-center">
      <ThemedActionButton
        textSize={20}
        disabled={disabled}
        onClick={onClick}
        fallback={defaultButton}
      >
        {children}
      </ThemedActionButton>
    </div>
  );
}
