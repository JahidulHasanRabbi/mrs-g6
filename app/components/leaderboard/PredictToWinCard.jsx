"use client";

import { LB_COLORS } from "./constants";
import { GlowCard, HeroButton } from "./primitives";

export default function PredictToWinCard({ onJoinNow }) {
  return (
    <GlowCard>
      <div className="flex flex-col items-center gap-4 py-4">
        <h2
          className="text-center uppercase"
          style={{
            color: LB_COLORS.primary,
            fontFamily: "'Anybody','Lexend',sans-serif",
            fontWeight: 700,
            fontSize: 28,
            lineHeight: "34px",
          }}
        >
          PREDICT TO<br />WIN
        </h2>
        <p
          className="text-center"
          style={{
            color: LB_COLORS.textMuted,
            fontFamily: "'Lexend',sans-serif",
            fontSize: 14,
            lineHeight: "22px",
          }}
        >
          Predict the winner in the upcoming FIFA World Cup and win bonus prizes
        </p>
        <div className="w-full pt-2">
          <HeroButton onClick={onJoinNow}>Join Now</HeroButton>
        </div>
      </div>
    </GlowCard>
  );
}
