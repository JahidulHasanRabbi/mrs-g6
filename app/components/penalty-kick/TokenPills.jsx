"use client";

import { COLORS } from "./constants";
import { usePkColors } from "./usePkColors";
import { PHASE4_ASSETS } from "../../config/phase4";

function formatTokenAmount(value) {
  const amount = typeof value === "number" ? value : Number(String(value ?? "").replace(/,/g, ""));
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

// Two glass-pill HUD chips that float above the arcade footer. Figma node
// 569:2158 — gap-between layout, Tokens chip keeps the icon on the LEFT,
// Token/Shot chip mirrors it (icon on the RIGHT). 142-px fixed Tokens
// width matches the design; Token/Shot is content-sized.
function PillBody({ label, value, valueColor, glowColor, labelColor, align = "left" }) {
  return (
    <div
      className={`flex flex-col leading-tight ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
    >
      <span
        className="text-[10px] uppercase tracking-wide"
        style={{ color: labelColor || COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        {label}
      </span>
      <span
        className="max-w-full text-[17px] font-bold leading-none"
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
      <img aria-hidden="true" src={iconSrc} alt="" className="h-6 w-6 object-contain" />
    </div>
  );
}

export default function TokenPills({ tokens = 0, perShot = 0 }) {
  // Token/Shot is the "signature accent" pill — green on the default skin, but
  // it must follow each theme's accent (blue on kgame99, magenta on lv918, gold
  // on acebet/ubet/ep369) instead of staying green. The Tokens pill stays gold,
  // which reads well on every backdrop.
  const { colors, soft } = usePkColors();
  return (
    <div className="flex w-full items-center justify-between px-5">
      {/* Tokens — icon left, label/value right */}
      <div
        className="flex items-center gap-2 rounded-[12px] px-[17px] py-[9px] backdrop-blur-[10px]"
        style={{
          // 142px at the 475 design width; shrinks on narrow phones so the
          // two pills don't collide, with a floor that keeps "24.00" legible.
          width: "min(178px, 46vw)",
          backgroundColor: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <PillIcon iconSrc={PHASE4_ASSETS.token} iconBg={COLORS.goldIcon} />
        <PillBody
          label="Tokens"
          value={formatTokenAmount(tokens)}
          valueColor={COLORS.goldText}
          glowColor="rgba(255,221,116,0.4)"
          labelColor={colors.textMuted}
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
          value={formatTokenAmount(perShot)}
          valueColor={colors.primary}
          glowColor={soft(0.4)}
          labelColor={colors.textMuted}
          align="right"
        />
        <PillIcon iconSrc={PHASE4_ASSETS.token} iconBg={colors.primary} />
      </div>
    </div>
  );
}
