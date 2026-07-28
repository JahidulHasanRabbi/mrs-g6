"use client";

import { motion } from "framer-motion";

function CrownGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 6.5l4.2 3.1L11 2.5l4.8 7.1L20 6.5l-1.7 10.2a1 1 0 0 1-1 .8H4.7a1 1 0 0 1-1-.8L2 6.5z" />
    </svg>
  );
}

export default function ThemedProfileCard({
  frame,
  pad = { x: "14%", top: "16%", bottom: "13%" },
  colors,
  coinIcon,
  name,
  totalTokens,
  currentLevel,
  nextLevel,
  progress,
  tokensNeeded,
  currentTierIcon,
  nextTierIcon,
  profilePicture,
  onVipDetails,
  avatarSize = 56,
}) {
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  const initial = (name?.[0] ?? "?").toUpperCase();
  const acme = "var(--font-acme), 'Times New Roman', serif";
  const rubik = "var(--font-rubik), sans-serif";

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[360px]"
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
        className="relative flex flex-col"
        style={{
          paddingLeft: pad.x,
          paddingRight: pad.x,
          paddingTop: pad.top,
          paddingBottom: pad.bottom,
        }}
      >
        {/* Identity row: avatar + name/VIP/token */}
        <div className="flex items-start gap-2.5">
          <div
            className="relative shrink-0 overflow-hidden rounded-full"
            style={{
              width: avatarSize,
              height: avatarSize,
              boxShadow: `0 0 0 2.5px ${colors.avatarRing}, 0 0 0 4px rgba(0,0,0,0.25), 0 0 14px ${colors.avatarRing}55`,
            }}
          >
            {profilePicture ? (
              <img src={profilePicture} alt="" className="h-full w-full object-cover" draggable={false} />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[20px]"
                style={{ color: colors.name, fontFamily: acme, background: "rgba(0,0,0,0.22)" }}
              >
                {initial}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* gap-3 matters: the name truncates to fill the row, so without a
                minimum gap it butts straight up against the VIP pill. */}
            <div className="flex items-center justify-between gap-3">
              <p
                className="min-w-0 truncate text-[17px] font-bold leading-tight"
                style={{ color: colors.name, fontFamily: acme, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                title={name}
              >
                {name || "—"}
              </p>
              <button
                type="button"
                onClick={onVipDetails}
                className="shrink-0 inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-[3px] leading-none transition-transform active:scale-95"
                style={{
                  background: `linear-gradient(180deg, ${colors.pillFrom} 0%, ${colors.pillTo} 100%)`,
                  color: colors.pillText,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                <CrownGlyph className="h-[10px] w-[10px]" />
                <span className="text-[9px] font-semibold whitespace-nowrap" style={{ fontFamily: rubik }}>
                  VIP Details
                </span>
                <span className="text-[10px] leading-none">›</span>
              </button>
            </div>

            <p className="mt-1.5 text-[10px] leading-none" style={{ color: colors.label, fontFamily: rubik }}>
              Total Token
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              {coinIcon && <img src={coinIcon} alt="" className="h-[16px] w-[16px] shrink-0" draggable={false} />}
              <span
                className="truncate text-[18px] font-bold leading-none"
                style={{ color: colors.tokenValue, fontFamily: acme, textShadow: `0 0 12px ${colors.tokenValue}55` }}
              >
                {totalTokens}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-3 h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.divider} 18%, ${colors.divider} 82%, transparent 100%)`,
          }}
        />

        {/* Tier + level */}
        <div className="flex items-center gap-2.5">
          {currentTierIcon ? (
            <img src={currentTierIcon} alt="" className="h-[36px] w-[36px] shrink-0 object-contain" draggable={false} />
          ) : (
            <div className="h-[36px] w-[36px] shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p
              className="text-[17px] font-bold leading-none"
              style={{ color: colors.level, fontFamily: acme, textShadow: `0 0 14px ${colors.level}80` }}
            >
              {currentLevel}
            </p>
            <p className="mt-1 text-[10px] leading-tight" style={{ color: colors.getText, fontFamily: rubik }}>
              Get {Number(tokensNeeded).toLocaleString("en-US")} more to go{" "}
              <span className="font-semibold" style={{ color: colors.getEmph }}>
                {nextLevel}
              </span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 flex items-center gap-1.5">
          {currentTierIcon && (
            <img src={currentTierIcon} alt="" className="h-[16px] w-[16px] shrink-0 object-contain" draggable={false} />
          )}
          <div
            className="relative h-2 flex-1 overflow-hidden rounded-full border"
            style={{ borderColor: colors.barBorder, background: colors.barBase }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: colors.barFill, boxShadow: `0 0 8px ${colors.barGlow || colors.barBorder}` }}
            />
          </div>
          {nextTierIcon && (
            <img src={nextTierIcon} alt="" className="h-[16px] w-[16px] shrink-0 object-contain" draggable={false} />
          )}
        </div>

        <div className="mt-1 flex items-center justify-between text-[9px]" style={{ color: colors.label, fontFamily: rubik }}>
          <span>{currentLevel}</span>
          <span>{nextLevel}</span>
        </div>
      </div>
    </motion.div>
  );
}
