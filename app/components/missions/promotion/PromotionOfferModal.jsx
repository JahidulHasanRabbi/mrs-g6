"use client";

import PromoModalShell from "./PromoModalShell";
import PromoButton from "./PromoButton";
import PromoBanner from "./PromoBanner";

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.05em] w-[1.05em] shrink-0" aria-hidden="true">
      <rect x="2.5" y="10" width="19" height="11.5" rx="1.6" fill="#e0403f" stroke="#7a1210" strokeWidth="1.2" />
      <rect x="1.5" y="6.5" width="21" height="4.5" rx="1.2" fill="#ff5a52" stroke="#7a1210" strokeWidth="1.2" />
      <rect x="10.2" y="6.5" width="3.6" height="15" fill="#ffd043" stroke="#a86b00" strokeWidth="1" />
      <path d="M12 6.5C10 2.8 5.6 3.4 6.6 6c.5 1.2 3.2 1.3 5.4.5Z" fill="#ffd043" stroke="#a86b00" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M12 6.5c2-3.7 6.4-3.1 5.4-.5-.5 1.2-3.2 1.3-5.4.5Z" fill="#ffd043" stroke="#a86b00" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

// Scenario 1 (client slide 4, requirement row 4): NS wallet is RM0, so the
// member can take the promotion.
export default function PromotionOfferModal({ open, onClose, onUnlock, promo }) {
  return (
    <PromoModalShell open={open} onClose={onClose} labelledBy="promo-offer-title">
      <div id="promo-offer-title" className="w-full">
        <PromoBanner
          image={promo?.banner_image}
          title={promo?.title}
          content={promo?.content}
          promo={promo}
        />
      </div>

      <div className="flex w-full items-stretch gap-3">
        <div className="flex-[1.7]">
          <PromoButton tone="gold" icon={<GiftIcon />} onClick={onUnlock}>
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
