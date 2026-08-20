"use client";

import { useState } from "react";
import GlassCard from "./GlassCard";
import GreenCta, { OutlinePillCta } from "./GreenCta";
import RedeemAllButton, { ThemedRedeemAllButton } from "./RedeemAllButton";
import { usePkColors } from "./usePkColors";

// reason: "save" (keeper saved it), "miss" (ball went wide), or "error".
export default function FailDialog({
  onKickAgain,
  onRedeemAll,
  onReturn,
  reason = "save",
  title,
  message,
  kickAgainLabel = "Kick Again?",
}) {
  const { colors: COLORS, soft, theme } = usePkColors();
  const isMiss = reason === "miss";
  const isError = reason === "error";
  const heading = title || (isMiss ? "Off-target!" : isError ? "Kick failed" : "Game over");
  const body = message || (isMiss ? "Ball went wide - easy on the power next time." : "The keeper read your shot.");
  // See GoalDialog — cumulative Redeem All breakdown, shown once available,
  // never inside the button itself.
  const [redeemedSummary, setRedeemedSummary] = useState("");

  // Themed skins: ornate frame holds the heading + message; buttons render
  // below the frame so they never overflow the fixed art (matches Goal dialog).
  if (theme) {
    const { OrnateCard, Button, palette } = theme;
    return (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-3">
        <OrnateCard>
          <p
            className="text-[22px] uppercase tracking-[1.5px]"
            style={{ fontFamily: "var(--font-acme), sans-serif", color: palette.cream }}
          >
            {heading}
          </p>
          <p
            className="mt-3 px-4 text-[13px] leading-5"
            style={{ color: palette.sand, fontFamily: "var(--font-rubik), sans-serif" }}
          >
            {body}
          </p>
          {redeemedSummary && (
            <p
              className="mt-2 max-h-[72px] max-w-[248px] overflow-y-auto px-4 text-center text-[12px] leading-[1.3] [scrollbar-width:thin]"
              style={{ color: palette.cream, fontFamily: "var(--font-rubik), sans-serif" }}
            >
              Redeemed: {redeemedSummary}
            </p>
          )}
        </OrnateCard>
        <Button onClick={onKickAgain}>{kickAgainLabel}</Button>
        {onRedeemAll && !isError && (
          <ThemedRedeemAllButton onRedeemAll={onRedeemAll} onSummary={setRedeemedSummary} Button={Button} />
        )}
        <button
          onClick={onReturn}
          className="mt-1 text-[12px] underline"
          style={{ color: palette.sand, fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Return to website
        </button>
      </div>
    );
  }

  return (
    <GlassCard>
      <h3
        className="mb-2 text-[32px] font-bold"
        style={{
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          textShadow: `0 0 12px ${soft(0.5)}`,
        }}
      >
        {heading}
      </h3>

      <p
        className="mb-4 text-center text-[14px]"
        style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        {body}
      </p>

      {redeemedSummary && (
        <p
          className="mb-4 max-h-[72px] overflow-y-auto text-center text-[13px] leading-[1.3] [scrollbar-width:thin]"
          style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
        >
          Redeemed: {redeemedSummary}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <GreenCta onClick={onKickAgain}>{kickAgainLabel}</GreenCta>
        {/* Redeem All claims any pending rewards from earlier goals — useful
            even after a save/miss. Hidden on error states (country required /
            maintenance), where the flow is "fix the problem" not "redeem". */}
        {onRedeemAll && !isError && <RedeemAllButton onRedeemAll={onRedeemAll} onSummary={setRedeemedSummary} />}
        <OutlinePillCta onClick={onReturn}>Return to website</OutlinePillCta>
      </div>
    </GlassCard>
  );
}
