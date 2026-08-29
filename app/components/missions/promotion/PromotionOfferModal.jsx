"use client";

import PromoModalShell from "./PromoModalShell";
import PromoButton from "./PromoButton";
import PromoBanner from "./PromoBanner";

// Scenario 1 (client slide 4, requirement row 4): NS wallet is RM0, so the
// member can take the promotion.
export default function PromotionOfferModal({
  open,
  onClose,
  onUnlock,
  bannerImage,
  title,
  content,
}) {
  return (
    <PromoModalShell open={open} onClose={onClose} labelledBy="promo-offer-title">
      <div id="promo-offer-title" className="w-full">
        <PromoBanner image={bannerImage} title={title} content={content} />
      </div>

      <div className="flex w-full items-stretch gap-3">
        <div className="flex-[2]">
          <PromoButton tone="gold" onClick={onUnlock}>
            Unlock Reward
          </PromoButton>
        </div>
        <div className="flex-1">
          <PromoButton tone="neutral" onClick={onClose}>
            Skip
          </PromoButton>
        </div>
      </div>
    </PromoModalShell>
  );
}
