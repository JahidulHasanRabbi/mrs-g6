"use client";

import GlassCard from "./GlassCard";
import GreenCta, { OutlinePillCta } from "./GreenCta";
import { COLORS, ICONS } from "./constants";

export default function GoalDialog({ reward, onKickAgain, onReturn }) {
  const amount = reward?.credit_amount ?? 2;
  return (
    <GlassCard>
      <h3
        className="mb-4 text-[32px] font-bold"
        style={{
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          textShadow: "0 0 12px rgba(84,233,138,0.5)",
        }}
      >
        Goal!
      </h3>

      <div className="mb-3 flex items-center gap-3">
        <div
          className="grid h-8 w-8 place-items-center rounded-[8px]"
          style={{ backgroundColor: COLORS.greenSoft20 }}
        >
          <span
            aria-hidden="true"
            className="block h-5 w-5 bg-current"
            style={{
              color: "#fff",
              WebkitMaskImage: `url(${ICONS.soccer})`,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
              maskImage: `url(${ICONS.soccer})`,
              maskRepeat: "no-repeat",
              maskPosition: "center",
              maskSize: "contain",
            }}
          />
        </div>
        <span
          className="text-[18px] font-medium"
          style={{ color: COLORS.textPrimary, fontFamily: "'Lexend', sans-serif" }}
        >
          Congratulation!
        </span>
      </div>

      <p
        className="mb-5 text-[16px]"
        style={{ color: COLORS.textPrimary, fontFamily: "'Lexend', sans-serif" }}
      >
        You won{" "}
        <span style={{ color: COLORS.primary, fontWeight: 700 }}>
          {amount} Token{amount === 1 ? "" : "s"}
        </span>
      </p>

      <div className="flex flex-col gap-3">
        <GreenCta onClick={onKickAgain}>Kick Again?</GreenCta>
        <OutlinePillCta onClick={onReturn}>Return to website</OutlinePillCta>
      </div>
    </GlassCard>
  );
}
