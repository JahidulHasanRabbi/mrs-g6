"use client";

import GlassCard from "./GlassCard";
import GreenCta, { OutlinePillCta } from "./GreenCta";
import { COLORS } from "./constants";

// reason: "save" (keeper saved it), "miss" (ball went wide), or "error".
export default function FailDialog({
  onKickAgain,
  onReturn,
  reason = "save",
  title,
  message,
  kickAgainLabel = "Kick Again?",
}) {
  const isMiss = reason === "miss";
  const isError = reason === "error";
  const heading = title || (isMiss ? "Off-target!" : isError ? "Kick failed" : "Game over");
  const body = message || (isMiss ? "Ball went wide - easy on the power next time." : "The keeper read your shot.");

  return (
    <GlassCard>
      <h3
        className="mb-2 text-[32px] font-bold"
        style={{
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          textShadow: "0 0 12px rgba(84,233,138,0.5)",
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
        <OutlinePillCta onClick={onReturn}>Return to website</OutlinePillCta>
      </div>
    </GlassCard>
  );
}
