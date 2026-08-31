"use client";

// HUD strip under the top bar (Figma 2026:3042): level badge + EXP bar +
// token / BP counters. Pure presentation — all values arrive via `profile`.
// On a station skin the two counters become the theme's framed value chips
// (the same art the portal header uses).

import { RPG_COLORS, RPG_FONTS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";
import { ProgressBar } from "./primitives";
import { useRpgSkin } from "./rpgSkin";

// 1,234,567 → "1.2M", 12,340 → "12.3K" (matches the design's compact HUD).
export function compactNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("en-GB");
}

function FramedChip({ chips, icon, iconKind, label, value }) {
  return (
    <div className="relative h-[30px] w-[82px] shrink-0 min-[400px]:h-[34px] min-[400px]:w-[92px]" aria-label={`${value} ${label}`}>
      <img src={chips.frame} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full select-none" draggable={false} />
      <div className="absolute inset-0 flex items-center justify-center gap-[4px] px-[8px]">
        {/* The bp art needs the same nudge HeaderBalances applies to it. */}
        <div className="relative size-[17px] shrink-0 overflow-hidden min-[400px]:size-[19px]">
          <img
            src={icon}
            alt=""
            aria-hidden
            className={
              iconKind === "battlePoint"
                ? "pointer-events-none absolute left-[-6.45%] top-[-3.02%] h-[111.95%] w-[112.9%] max-w-none"
                : "pointer-events-none absolute inset-0 size-full object-contain"
            }
          />
        </div>
        <span
          className="shrink-0 whitespace-nowrap font-bold leading-none"
          style={{ fontFamily: '"Times New Roman", serif', color: chips.textColor, fontSize: value.length > 5 ? 9 : 10.5 }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export default function HudStrip({ profile }) {
  const skin = useRpgSkin();
  if (!profile) return null;
  const chips = skin.hud.chipFrame;

  return (
    <div
      className="flex w-full items-center gap-[12px] border-b px-[16px] pb-[13px] pt-[16px]"
      style={{ borderColor: skin.hud.border }}
    >
      {/* Level badge */}
      <div
        className="flex size-[49px] shrink-0 flex-col items-center justify-center rounded-full border"
        style={{ background: skin.hud.badgeBg, borderColor: skin.hud.badgeBorder }}
      >
        <span className="text-[9px] leading-[9px]" style={{ color: skin.hud.badgeLabel, fontFamily: RPG_FONTS.display }}>
          Lv.
        </span>
        <span className="text-[16px] font-bold leading-[18px]" style={{ color: skin.c.text, fontFamily: RPG_FONTS.number }}>
          {profile.level}
        </span>
      </div>

      {/* EXP bar */}
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-[9px] tracking-[1.5px]" style={{ color: skin.hud.expLabel, fontFamily: RPG_FONTS.display }}>
          EXP
        </span>
        <ProgressBar pct={profile.expPct} gradient={skin.hud.expGradient} />
      </div>

      {chips ? (
        <div className="flex shrink-0 items-center gap-[4px]">
          <FramedChip chips={chips} icon={chips.token} label="Tokens" value={compactNumber(profile.tokens)} />
          <FramedChip chips={chips} icon={chips.battlePoint} iconKind="battlePoint" label="Battle Points" value={compactNumber(profile.bp)} />
        </div>
      ) : (
        <>
          {/* Tokens */}
          <div className="flex shrink-0 items-center gap-[6px]">
            <img src={RPG_IMAGES.icons.token} alt="" className="size-[26px] object-contain" />
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
        </>
      )}
    </div>
  );
}
