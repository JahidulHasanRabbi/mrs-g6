"use client";

import { useState } from "react";
import { LB_COLORS } from "./constants";

export const flagUrl = (iso) =>
  `/assets/leaderboard/flags/${iso.toLowerCase()}.svg`;

export function LBHeader({ onInfoClick, onMenuClick, title = "LEADERBOARDS" }) {
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
        boxShadow: "0 0 20px 0 rgba(84,233,138,0.2)",
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
              background: active ? "#2ECC71" : "transparent",
              color: active ? "#005027" : LB_COLORS.textMuted,
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
        background: isPrimary ? "#54E98A" : "transparent",
        border: isPrimary ? "none" : "1px solid #54E98A",
        color: isPrimary ? "#003919" : "#54E98A",
        fontFamily: "'Lexend',sans-serif",
        boxShadow: isPrimary ? "0 4px 0 rgba(0,0,0,0.3)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export function HeroButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full rounded-[12px] py-4 uppercase"
      style={{
        background: "#54E98A",
        color: "#003919",
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
}
