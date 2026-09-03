"use client";

import { useState } from "react";
import GlassCard from "./GlassCard";
import GreenCta, { OutlinePillCta } from "./GreenCta";
import RedeemAllButton, { ThemedRedeemAllButton } from "./RedeemAllButton";
import { ICONS } from "./constants";
import { usePkColors } from "./usePkColors";

export default function GoalDialog({ reward, onKickAgain, onRedeemAll, onReturn }) {
  const { colors: COLORS, soft, theme } = usePkColors();
  // Once Redeem All succeeds, swap the single-kick reward text for the
  // cumulative RM/Tokens/BP/Score/prize breakdown — shown inside the card's
  // existing scrollable text area, never inside the button itself.
  const [redeemedSummary, setRedeemedSummary] = useState("");
  const itemType = String(reward?.item_type || "").toUpperCase();
  const amount = reward?.battle_point_amount ?? reward?.credit_amount ?? reward?.amount ?? reward?.token_amount ?? reward?.score_amount;
  const rewardName =
    itemType === "BATTLE POINT" &&
    reward?.reward_name &&
    !/\bBP\b|battle point/i.test(reward.reward_name)
      ? `${reward.reward_name} (BP)`
      : reward?.reward_name;
  const rewardText = reward?.reward_name
    ? amount
      ? `${rewardName} (${amount})`
      : rewardName
    : amount
      ? itemType === "BATTLE POINT"
        ? `${Number(amount).toLocaleString("en-US")} BP`
        : `${amount} ${itemType === "TOKEN" ? "KR Coin" : "Reward"}${Number(amount) === 1 ? "" : "s"}`
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
              {redeemedSummary && (
                <p
                  className="max-h-[72px] max-w-[248px] overflow-y-auto text-center leading-[1.3] [scrollbar-width:thin]"
                  style={{
                    fontSize: "13px",
                    fontFamily: "var(--font-rubik), sans-serif",
                    color: "#fff",
                  }}
                >
                  Redeemed: {redeemedSummary}
                </p>
              )}
            </div>
          </div>
        </OrnateCard>
        <Button onClick={onKickAgain}>Kick Again?</Button>
        {onRedeemAll && (
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
        className="mb-2 text-[16px]"
        style={{ color: COLORS.textPrimary, fontFamily: "'Lexend', sans-serif" }}
      >
        You won <span style={{ color: COLORS.primary, fontWeight: 700 }}>{rewardText}</span>
      </p>

      {redeemedSummary && (
        <p
          className="mb-3 max-h-[72px] overflow-y-auto text-[13px] leading-[1.3] [scrollbar-width:thin]"
          style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
        >
          Redeemed: {redeemedSummary}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <GreenCta onClick={onKickAgain}>Kick Again?</GreenCta>
        {onRedeemAll && <RedeemAllButton onRedeemAll={onRedeemAll} onSummary={setRedeemedSummary} />}
        <OutlinePillCta onClick={onReturn}>Return to website</OutlinePillCta>
      </div>
    </GlassCard>
  );
}
