"use client";

import { COLORS, ICONS } from "./constants";

// Two glass-pill HUD chips that float above the arcade footer. Figma node
// 569:2158 — gap-between layout, Tokens chip keeps the icon on the LEFT,
// Token/Shot chip mirrors it (icon on the RIGHT). 142-px fixed Tokens
// width matches the design; Token/Shot is content-sized.
function PillBody({ label, value, valueColor, glowColor, align = "left" }) {
  return (
    <div
      className={`flex flex-col leading-tight ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
    >
      <span
        className="text-[10px] uppercase tracking-wide"
        style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        {label}
      </span>
      <span
        className="text-[18px] font-bold"
        style={{
          color: valueColor,
          textShadow: glowColor
            ? `0 0 20px ${glowColor}, 0 0 10px ${glowColor.replace("0.4", "0.8")}`
            : undefined,
          fontFamily: "'Anybody', 'Lexend', sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PillIcon({ iconSrc, iconBg }) {
  return (
    <div
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
      style={{
        backgroundColor: iconBg,
        boxShadow:
          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
      }}
    >
      <span
        aria-hidden="true"
        className="block h-[14px] w-[14px] bg-current"
        style={{
          color: "#fff",
          WebkitMaskImage: `url(${iconSrc})`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",
          maskImage: `url(${iconSrc})`,
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
        }}
      />
    </div>
  );
}

export default function TokenPills({ tokens = 0, perShot = 0 }) {
  return (
    <div className="flex w-full items-center justify-between px-5">
      {/* Tokens — icon left, label/value right */}
      <div
        className="flex items-center gap-2 rounded-[12px] px-[17px] py-[9px] backdrop-blur-[10px]"
        style={{
          width: 142,
          backgroundColor: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <PillIcon iconSrc={ICONS.coin} iconBg={COLORS.goldIcon} />
        <PillBody
          label="Tokens"
          value={tokens.toFixed(2)}
          valueColor={COLORS.goldText}
          glowColor="rgba(255,221,116,0.4)"
        />
      </div>

      {/* Token/Shot — label/value left (text-right), icon right */}
      <div
        className="flex items-center gap-2 rounded-[12px] px-[17px] py-[9px] backdrop-blur-[10px]"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <PillBody
          label="Token/shot"
          value={perShot.toFixed(2)}
          valueColor={COLORS.primary}
          glowColor="rgba(84,233,138,0.4)"
          align="right"
        />
        <PillIcon iconSrc={ICONS.flag} iconBg={COLORS.primaryGradStart} />
      </div>
    </div>
  );
}
