"use client";

import GlassCard from "./GlassCard";
import GreenCta, { OutlinePillCta } from "./GreenCta";
import RedeemAllButton from "./RedeemAllButton";
import { COLORS, ICONS } from "./constants";

export default function GoalDialog({ reward, onKickAgain, onRedeemAll, onReturn }) {
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
        : `${amount} ${itemType === "TOKEN" ? "Token" : "Reward"}${Number(amount) === 1 ? "" : "s"}`
      : "a reward";
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
