"use client";

import { COLORS, ICONS } from "./constants";

export default function GreenCta({
  children,
  onClick,
  disabled = false,
  showPlayIcon = true,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex w-full items-center justify-center gap-2 rounded-[8px] px-5 py-3 text-[16px] font-bold tracking-wide uppercase transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        backgroundColor: COLORS.primary,
        color: COLORS.primaryDeep,
        boxShadow: `0 4px 0 ${COLORS.primaryShadow}, 0 0 24px rgba(84,233,138,0.3)`,
        fontFamily: "'Lexend', sans-serif",
      }}
    >
      {showPlayIcon && (
        <span
          aria-hidden="true"
          className="block h-5 w-5 shrink-0 bg-current"
          style={{
            WebkitMaskImage: `url(${ICONS.play})`,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
            maskImage: `url(${ICONS.play})`,
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "contain",
          }}
        />
      )}
      {children}
    </button>
  );
}

export function OutlinePillCta({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center rounded-[8px] px-5 py-3 text-[14px] font-medium transition-colors hover:bg-white/5 ${className}`}
      style={{
        backgroundColor: "rgba(40,42,43,0.4)",
        border: `1px solid ${COLORS.greenSoft50}`,
        color: COLORS.textMuted,
        fontFamily: "'Lexend', sans-serif",
      }}
    >
      {children}
    </button>
  );
}
