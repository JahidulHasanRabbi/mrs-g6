"use client";

import GlassCard from "./GlassCard";
import GreenCta, { OutlinePillCta } from "./GreenCta";
import { COLORS } from "./constants";

// reason: "save" (keeper saved it), "miss" (ball went wide). Defaults to
// save. Determines the subline so the player understands what happened —
// "Saved by the keeper!" vs "Ball went wide!" — without needing a
// separate dialog component.
export default function FailDialog({ onKickAgain, onReturn, reason = "save" }) {
  const isMiss = reason === "miss";
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
        {isMiss ? "Off-target!" : "Game over"}
      </h3>

      <p
        className="mb-8 text-center text-[14px]"
        style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        {isMiss
          ? "Ball went wide — easy on the power next time."
          : "The keeper read your shot."}
      </p>

      <div className="flex flex-col gap-3">
        <GreenCta onClick={onKickAgain}>Kick Again?</GreenCta>
        <OutlinePillCta onClick={onReturn}>Return to website</OutlinePillCta>
      </div>
    </GlassCard>
  );
}
