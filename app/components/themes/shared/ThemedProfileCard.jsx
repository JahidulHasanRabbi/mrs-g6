"use client";

import { motion } from "framer-motion";

// Gold treatments most skins share; a theme overrides only where its own frame
// interior needs something different.
const GOLD_DEFAULTS = {
  pillFrom: "#ffe9a8",
  pillMid: "#f0b83c",
  pillTo: "#c98a1b",
  pillText: "#5a3200",
  pillGlow: "rgba(240,184,60,0.45)",
  coinFrom: "#ffe9a8",
  coinMid: "#e9a825",
  coinTo: "#a86a10",
};

function CrownGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 6.5l4.2 3.1L11 2.5l4.8 7.1L20 6.5l-1.7 10.2a1 1 0 0 1-1 .8H4.7a1 1 0 0 1-1-.8L2 6.5z" />
    </svg>
  );
}

export default function ThemedProfileCard({
  frame,
  // Measured off each frame's artwork (variance profile of the plate edges).
  // Sides are a straight fraction of the card width; top/bottom also account
  // for the art stretching to whatever height the content needs.
  pad = { left: "13%", right: "13%", top: "18%", bottom: "15%" },
  colors,
  coinIcon,
  name,
  totalTokens,
  currentLevel,
  nextLevel,
  progress,
  tokensNeeded,
  currentTierIcon,
  profilePicture,
  onVipDetails,
  avatarSize = 48,
}) {
  const c = { ...GOLD_DEFAULTS, ...colors };
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  const initial = (name?.[0] ?? "?").toUpperCase();
  const display = "var(--font-acme), 'Times New Roman', serif";
  const body = "var(--font-rubik), sans-serif";

  return (
    // The card is the page's hero, so it bleeds into the page gutter rather
    // than sitting inside it — the frame art is the point, and it reads small
    // once the ornate border eats a third of the width.
    <div className="mx-auto w-full max-w-[376px]">
    <motion.div
      className="relative -mx-3"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.08 }}
      style={{
        backgroundImage: `url(${frame})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          paddingLeft: pad.left,
          paddingRight: pad.right,
          paddingTop: pad.top,
          paddingBottom: pad.bottom,
        }}
      >
        {/* Identity row: avatar · name + label · VIP pill */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{
              width: avatarSize,
              height: avatarSize,
              background: `radial-gradient(circle at 35% 30%, ${c.avatarFrom}, ${c.avatarTo})`,
              boxShadow: `0 0 0 2.5px ${c.avatarRing}, 0 0 14px ${c.avatarRing}80`,
            }}
          >
            {profilePicture ? (
              <img src={profilePicture} alt="" className="h-full w-full object-cover" draggable={false} />
            ) : (
              <span className="text-[21px]" style={{ color: c.avatarInk, fontFamily: display }}>
                {initial}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[20px] leading-[1.1]"
              style={{ color: c.name, fontFamily: display }}
              title={name}
            >
              {name || "—"}
            </p>
            <p
              className="mt-[3px] whitespace-nowrap text-[9px] font-bold uppercase leading-none tracking-[1.2px]"
              style={{ color: c.label, fontFamily: body }}
            >
              Total Token
            </p>
          </div>

          <button
            type="button"
            onClick={onVipDetails}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 leading-none transition-transform active:scale-95"
            style={{
              background: `linear-gradient(180deg, ${c.pillFrom}, ${c.pillMid} 55%, ${c.pillTo})`,
              color: c.pillText,
              boxShadow: `0 0 12px ${c.pillGlow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
            }}
          >
            <CrownGlyph className="h-[10px] w-[10px]" />
            <span className="whitespace-nowrap text-[10.5px]" style={{ fontFamily: display }}>
              VIP Details
            </span>
            <span className="text-[10px] leading-none">›</span>
          </button>
        </div>

        {/* Token well */}
        <div
          className="mt-3.5 flex items-center gap-2.5 rounded-[13px] px-3.5 py-2.5"
          style={{ background: c.wellBg, border: `1px solid ${c.wellBorder}` }}
        >
          {coinIcon ? (
            <img src={coinIcon} alt="" className="h-6 w-6 shrink-0 object-contain" draggable={false} />
          ) : (
            <span
              className="h-6 w-6 shrink-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${c.coinFrom}, ${c.coinMid} 60%, ${c.coinTo})`,
                boxShadow: "inset 0 0 0 2px rgba(120,70,0,0.35)",
              }}
            />
          )}
          <span
            className="min-w-0 truncate text-[25px] leading-none"
            style={{
              color: c.tokenColor,
              fontFamily: display,
              textShadow: c.tokenGlow ? `0 0 12px ${c.tokenGlow}` : undefined,
            }}
          >
            {totalTokens}
          </span>
        </div>

        {/* Tier progress. The row wraps rather than truncating: on the narrower
            plates the "more to go" line drops beneath the tier name. */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {currentTierIcon ? (
              <img src={currentTierIcon} alt="" className="h-[15px] w-[15px] shrink-0 object-contain" draggable={false} />
            ) : (
              <span
                className="h-[15px] w-[15px] shrink-0 rotate-45 rounded-[3px]"
                style={{
                  background: `linear-gradient(135deg, ${c.coinFrom}, ${c.coinMid} 60%, ${c.coinTo})`,
                  boxShadow: "0 1px 3px rgba(120,70,0,0.4)",
                }}
              />
            )}
            <span
              className="min-w-[3rem] flex-1 truncate text-[14px]"
              style={{ color: c.level, fontFamily: display }}
              title={currentLevel}
            >
              {currentLevel}
            </span>
            <span
              className="ml-auto shrink-0 whitespace-nowrap text-[10.5px] font-semibold"
              style={{ color: c.getText, fontFamily: body }}
            >
              Get <b style={{ color: c.getNum }}>{Number(tokensNeeded).toLocaleString("en-US")}</b> more to go{" "}
              <b style={{ color: c.getEmph }}>{nextLevel?.toUpperCase()}</b>
            </span>
          </div>

          <div
            className="mt-2.5 h-3 overflow-hidden rounded-full"
            style={{ background: c.barBase, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: c.barFill, boxShadow: `0 0 10px ${c.barGlow}` }}
            />
          </div>

          <div
            className="mt-1.5 flex justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.5px]"
            style={{ color: c.label, fontFamily: body }}
          >
            <span className="truncate">{currentLevel}</span>
            <span className="truncate text-right" style={{ color: c.nextLabel }}>
              {nextLevel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
    </div>
  );
}
