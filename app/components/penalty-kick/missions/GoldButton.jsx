"use client";

import { MISSION_COLORS } from "./data";

// The ornate gold pill used for "Claim" / "Locked" / "Mission Progress
// History" (Figma node "envato-labs-image-edit (3) 1"). The raster art is a
// wide bar with decorative end caps; the design stretches it to the button
// box (img is w-full / h-101% inside an overflow-clip frame), so we mirror
// that with objectFit: "fill". Content (icon + label) sits on top.
const GOLD_BTN = "/assets/penalty-kick/missions/gold-button.webp";

export default function GoldButton({
  children,
  onClick,
  disabled = false,
  height = 62,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`relative grid w-full place-items-center overflow-hidden rounded-[6px] transition-transform active:scale-[0.98] ${className}`}
      style={{
        height,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <img
        src={GOLD_BTN}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{ objectFit: "fill" }}
      />
      <span
        className="relative z-10 flex items-center justify-center gap-2 font-bold whitespace-nowrap"
        style={{
          fontFamily: '"Times New Roman", serif',
          color: MISSION_COLORS.goldText,
          fontSize: 14,
          lineHeight: "24px",
        }}
      >
        {children}
      </span>
    </button>
  );
}
