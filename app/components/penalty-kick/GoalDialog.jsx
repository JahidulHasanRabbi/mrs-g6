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
          {/* Dark inner panel (same as InfoDialog): keeps the heading clear of
              the crown, gives the reward text a clean readable surface, and
              contains long reward names gracefully — the frame-mid rail art no
              longer shows through as streaks behind long messages. */}
          <div className="relative w-full pt-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-8px] bottom-[-4px] top-1 rounded-[14px]"
              style={{ backgroundColor: "rgba(8,20,44,0.55)" }}
            />
            <div className="relative flex flex-col items-center gap-1.5 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <img src={assets.ui.iconParty} alt="" className="h-6 w-6 shrink-0" />
                <p
                  className="text-[19px] uppercase tracking-[2px]"
                  style={{
                    fontFamily: "var(--font-acme), sans-serif",
                    color: COLORS.primary,
                    textShadow: `0 0 12px ${soft(0.7)}`,
                  }}
                >
                  Congratulations
                </p>
              </div>
              <p className="text-[13px]" style={{ color: "#fff", fontFamily: "var(--font-rubik), sans-serif" }}>
                You won
              </p>
              <p
                className="max-h-[112px] max-w-[248px] overflow-y-auto text-center leading-[1.15] [scrollbar-width:thin]"
                style={{
                  fontSize: "clamp(17px, 4.8vw, 23px)",
                  fontFamily: "var(--font-acme), sans-serif",
                  color: palette.accent,
                  textShadow: "0 0 14px rgba(255,225,109,0.6)",
                }}
              >
                {rewardText}
              </p>
            </div>
          </div>
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
