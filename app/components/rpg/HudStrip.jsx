"use client";

// HUD strip under the top bar (Figma 2026:3042): level badge + EXP bar +
// token / BP counters. Pure presentation — all values arrive via `profile`.

import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";
import { ProgressBar } from "./primitives";

// 1,234,567 → "1.2M", 12,340 → "12.3K" (matches the design's compact HUD).
export function compactNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("en-GB");
}

export default function HudStrip({ profile }) {
  if (!profile) return null;
  return (
    <div
      className="flex w-full items-center gap-[12px] border-b px-[16px] pb-[13px] pt-[16px]"
      style={{ borderColor: "rgba(139,92,246,0.25)" }}
    >
      {/* Level badge */}
      <div
        className="flex size-[49px] shrink-0 flex-col items-center justify-center rounded-full border"
        style={{ background: "rgba(47,230,200,0.08)", borderColor: RPG_COLORS.cyan }}
      >
        <span className="text-[9px] leading-[9px]" style={{ color: RPG_COLORS.cyanSoft, fontFamily: RPG_FONTS.display }}>
          Lv.
        </span>
        <span className="text-[16px] font-bold leading-[18px]" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.number }}>
          {profile.level}
        </span>
      </div>

      {/* EXP bar */}
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span
          className="text-[9px] tracking-[1.5px]"
          style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}
        >
          EXP
        </span>
        <ProgressBar pct={profile.expPct} />
      </div>

      {/* Tokens */}
      <div className="flex shrink-0 items-center gap-[6px]">
        <div
          className="flex size-[26px] items-center justify-center rounded-full border"
          style={{ background: RPG_GRADIENTS.coin, borderColor: RPG_COLORS.coinBorder }}
        >
          <span className="text-[11px] font-bold" style={{ color: RPG_COLORS.coinText, fontFamily: RPG_FONTS.display }}>
            T
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] tracking-[1px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
            TOKEN
          </span>
          <span className="text-[13px] font-bold leading-[13px]" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.number }}>
            {compactNumber(profile.tokens)}
          </span>
        </div>
      </div>

      {/* Battle Points */}
      <div className="flex shrink-0 items-center gap-[6px]">
        <img src={RPG_IMAGES.icons.bpGem} alt="" className="size-[24px]" />
        <div className="flex flex-col">
          <span className="text-[8px] tracking-[1px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
            BP
          </span>
          <span className="text-[13px] font-bold leading-[13px]" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.number }}>
            {compactNumber(profile.bp)}
          </span>
        </div>
      </div>
    </div>
  );
}
