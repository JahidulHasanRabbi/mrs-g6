"use client";

import GlassCard from "./GlassCard";
import GreenCta, { OutlinePillCta } from "./GreenCta";
import RedeemAllButton from "./RedeemAllButton";
import { ICONS } from "./constants";
import { usePkColors } from "./usePkColors";

export default function GoalDialog({ reward, onKickAgain, onRedeemAll, onReturn }) {
  const { colors: COLORS, soft, theme } = usePkColors();
  const itemType = String(reward?.item_type || "").toUpperCase();
  const amount = reward?.credit_amount ?? reward?.amount ?? reward?.token_amount ?? reward?.score_amount;
  const rewardText = reward?.reward_name
    ? amount
      ? `${reward.reward_name} (${amount})`
      : reward.reward_name
    : amount
      ? `${amount} ${itemType === "TOKEN" ? "Token" : "Reward"}${Number(amount) === 1 ? "" : "s"}`
      : "a reward";

  // Themed skins (acebet77 / ubetclub): crowned ornate frame holds only the
  // heading + reward; the action buttons sit BELOW the frame (Figma 4:634 /
  // 77:2511), so nothing overflows the fixed frame art.
  if (theme) {
    const { OrnateCard, Button, palette, assets } = theme;
    return (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-3">
        <OrnateCard>
          <div className="flex items-center gap-2">
            <img src={assets.ui.iconParty} alt="" className="h-6 w-6" />
            <p
              className="text-[20px] uppercase tracking-[2px]"
              style={{ fontFamily: "var(--font-acme), sans-serif", color: palette.cream }}
            >
              Congratulations
            </p>
          </div>
          <p className="mt-3 text-[13px]" style={{ color: "#fff", fontFamily: "var(--font-rubik), sans-serif" }}>
            You won
          </p>
          <p
            className="mt-1 px-2 text-center leading-tight"
            style={{
              fontSize: "clamp(20px, 6vw, 26px)",
              fontFamily: "var(--font-acme), sans-serif",
              color: palette.accent,
              textShadow: "0 0 14px rgba(255,225,109,0.6)",
            }}
          >
            {rewardText}
          </p>
        </OrnateCard>
        <Button onClick={onKickAgain}>Kick Again?</Button>
        {onRedeemAll && (
          <Button variant="gold" onClick={onRedeemAll}>
            Redeem All
          </Button>
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
        className="mb-4 text-[32px] font-bold"
        style={{
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          textShadow: `0 0 12px ${soft(0.5)}`,
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
        You won <span style={{ color: COLORS.primary, fontWeight: 700 }}>{rewardText}</span>
      </p>

      <div className="flex flex-col gap-3">
        <GreenCta onClick={onKickAgain}>Kick Again?</GreenCta>
        {onRedeemAll && <RedeemAllButton onRedeemAll={onRedeemAll} />}
        <OutlinePillCta onClick={onReturn}>Return to website</OutlinePillCta>
      </div>
    </GlassCard>
  );
}
