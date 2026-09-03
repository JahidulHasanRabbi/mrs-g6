"use client";

import PromoModalShell from "./PromoModalShell";
import PromoButton from "./PromoButton";
import CelebrationHeader from "./CelebrationHeader";
import { PROMO, PROMO_ASSETS } from "./promoColors";
import { POPUP_REWARD_UNIT } from "../../../config/missionPopupOptions";

function Title3D({ children, front, shadow, size }) {
  return (
    <div className="relative w-full text-center" style={{ height: size * 1.14 }}>
      {/* Offset shadow face — decorative, so it stays out of the accessible name. */}
      <p
        aria-hidden="true"
        className="absolute inset-x-0 top-[4px] translate-x-[2px] font-black uppercase leading-none"
        style={{ color: shadow, fontSize: size, fontFamily: "var(--font-inter), sans-serif" }}
      >
        {children}
      </p>
      <p
        className="absolute inset-x-0 top-0 font-black uppercase leading-none"
        style={{ color: front, fontSize: size, fontFamily: "var(--font-inter), sans-serif" }}
      >
        {children}
      </p>
    </div>
  );
}

// Figma 2472:3935. Shown when a qualified member returns to /missions
// (client slide 5 / requirement row 8).
export default function MissionCompletedModal({
  open,
  onClose,
  description = "You have successfully completed the deposit mission.",
  rewardAmount = 0,
  rewardCategory = 1,
}) {
  const unit = POPUP_REWARD_UNIT[rewardCategory] ?? "KR Coins";

  return (
    <PromoModalShell open={open} onClose={onClose} labelledBy="mission-completed-title">
      <CelebrationHeader />

      <div id="mission-completed-title" className="flex w-full flex-col items-center gap-[6px]">
        <Title3D front={PROMO.titleFront} shadow={PROMO.titleShadow} size={44}>
          Mission
        </Title3D>
        <Title3D front={PROMO.titleAccentFront} shadow={PROMO.titleAccentShadow} size={42}>
          Completed!
        </Title3D>
      </div>

      <p
        className="w-full text-center text-[clamp(15px,4.4vw,18px)] font-medium leading-[1.4]"
        style={{ color: PROMO.text }}
      >
        {description}
      </p>

      <div
        className="flex w-full items-center gap-[clamp(8px,4vw,20px)] rounded-[20px] p-[clamp(12px,4vw,20px)]"
        style={{ backgroundColor: PROMO.cardBg, border: `2px solid ${PROMO.cardBorder}` }}
      >
        <img
          src={PROMO_ASSETS.chest}
          alt=""
          aria-hidden="true"
          className="h-[clamp(72px,21vw,96px)] w-[clamp(72px,21vw,96px)] shrink-0 select-none object-contain"
        />
        <div className="flex min-w-0 flex-1 items-baseline justify-center gap-2 whitespace-nowrap">
          <span
            className="font-black leading-none"
            style={{ color: PROMO.amount, fontSize: "clamp(28px,8.6vw,42px)" }}
          >
            +{Number(rewardAmount).toLocaleString("en-US")}
          </span>
          <span
            className="font-extrabold leading-none"
            style={{ color: PROMO.text, fontSize: "clamp(15px,4.6vw,22px)" }}
          >
            {unit}
          </span>
        </div>
      </div>

      <p className="w-full text-center text-[14px] font-medium" style={{ color: PROMO.muted }}>
        Your reward has been credited automatically.
      </p>

      <PromoButton tone="gold" onClick={onClose}>
        Got It
      </PromoButton>
    </PromoModalShell>
  );
}
