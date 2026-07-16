"use client";

import GlassCard from "./GlassCard";
import GreenCta, { OutlinePillCta } from "./GreenCta";
import RedeemAllButton from "./RedeemAllButton";
import { usePkColors } from "./usePkColors";
import AcebetOrnateCard from "../themes/acebet77/AcebetOrnateCard";
import AcebetButton from "../themes/acebet77/AcebetButton";
import { ACEBET_COLORS } from "../themes/acebet77/assets";

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
  const { colors: COLORS, soft, isAcebet77 } = usePkColors();
  const isMiss = reason === "miss";
  const isError = reason === "error";
  const heading = title || (isMiss ? "Off-target!" : isError ? "Kick failed" : "Game over");
  const body = message || (isMiss ? "Ball went wide - easy on the power next time." : "The keeper read your shot.");

  // Acebet77: ornate frame holds the heading + message; buttons render below
  // the frame so they never overflow the fixed art (matches Goal dialog).
  if (isAcebet77) {
    return (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-3">
        <AcebetOrnateCard>
          <p
            className="text-[22px] uppercase tracking-[1.5px]"
            style={{ fontFamily: "var(--font-acme), sans-serif", color: ACEBET_COLORS.cream }}
          >
            {heading}
          </p>
          <p
            className="mt-3 px-4 text-[13px] leading-5"
            style={{ color: ACEBET_COLORS.sand, fontFamily: "var(--font-rubik), sans-serif" }}
          >
            {body}
          </p>
        </AcebetOrnateCard>
        <AcebetButton onClick={onKickAgain}>{kickAgainLabel}</AcebetButton>
        {onRedeemAll && !isError && (
          <AcebetButton variant="gold" onClick={onRedeemAll}>
            Redeem All
          </AcebetButton>
        )}
        <button
          onClick={onReturn}
          className="mt-1 text-[12px] underline"
          style={{ color: ACEBET_COLORS.sand, fontFamily: "var(--font-rubik), sans-serif" }}
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
        className="mb-8 text-center text-[14px]"
        style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        {body}
      </p>

      <div className="flex flex-col gap-3">
        <GreenCta onClick={onKickAgain}>{kickAgainLabel}</GreenCta>
        {/* Redeem All claims any pending rewards from earlier goals — useful
            even after a save/miss. Hidden on error states (country required /
            maintenance), where the flow is "fix the problem" not "redeem". */}
        {onRedeemAll && !isError && <RedeemAllButton onRedeemAll={onRedeemAll} />}
        <OutlinePillCta onClick={onReturn}>Return to website</OutlinePillCta>
      </div>
    </GlassCard>
  );
}
