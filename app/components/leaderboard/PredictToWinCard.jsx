"use client";

import { LB_COLORS } from "./constants";
import { GlowCard, HeroButton } from "./primitives";

export default function PredictToWinCard({ onJoinNow, eligibility }) {
  const hasEligibility = !!eligibility;
  const requiredPoints = Number(eligibility?.required_points ?? 3000);
  const totalPoints = Number(eligibility?.total_points ?? 0);
  const additionalPoints = Math.max(0, requiredPoints - totalPoints);
  const isEligible = hasEligibility && (eligibility?.eligible === true || additionalPoints === 0);

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
        <div
          className="w-full rounded-[8px] px-3 py-2 text-center"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${LB_COLORS.borderSoft}` }}
        >
          <p className="text-[11px] uppercase" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
            Required Points
          </p>
          <p className="text-[16px]" style={{ color: isEligible ? LB_COLORS.primary : LB_COLORS.gold, fontFamily: "'Anybody','Lexend',sans-serif", fontWeight: 700 }}>
            {requiredPoints.toLocaleString()}
          </p>
          {hasEligibility && !isEligible && (
            <p className="mt-1 text-[11px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
              Need {additionalPoints.toLocaleString()} more points
            </p>
          )}
        </div>
        <div className="w-full pt-2">
          <HeroButton onClick={onJoinNow}>Join Now</HeroButton>
        </div>
      </div>
    </GlowCard>
  );
}
