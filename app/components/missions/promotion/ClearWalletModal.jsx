"use client";

import PromoModalShell from "./PromoModalShell";
import PromoButton from "./PromoButton";
import PromoBanner from "./PromoBanner";
import { PROMO } from "./promoColors";

function WarningIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M12 3.5 22 20H2L12 3.5Z"
        fill={PROMO.warning}
        stroke={PROMO.warning}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 9.5v4.5" stroke="#3b2600" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.2" fill="#3b2600" />
    </svg>
  );
}

// Scenario 2 (client slide 4, requirement row 5): the member holds an NS wallet
// balance and must clear it first.
//
// The slide mocks this primary button as "GOT IT", but requirement row 5 and
// slide 3 both specify "Clear Now → redirect to NS Wallet Profile" — a member
// who cannot participate needs the route to go fix it, so the written spec wins.
export default function ClearWalletModal({ open, onClose, onClearNow, promo }) {
  return (
    <PromoModalShell open={open} onClose={onClose} labelledBy="promo-clear-title">
      <div className="w-full">
        <PromoBanner
          image={promo?.banner_image}
          title={promo?.title}
          content={promo?.content}
          promo={promo}
        />
      </div>

      <div
        id="promo-clear-title"
        className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3"
        style={{ backgroundColor: PROMO.cardBg, border: `2px solid ${PROMO.cardBorder}` }}
      >
        <WarningIcon />
        <p className="text-[clamp(14px,4.2vw,17px)] font-semibold leading-[1.35]" style={{ color: PROMO.text }}>
          Clear your wallet balance to{" "}
          <span style={{ color: PROMO.amount }}>unlock</span> this reward.
        </p>
      </div>

      <div className="flex w-full items-stretch gap-3">
        <div className="flex-[1.7]">
          <PromoButton tone="blue" onClick={onClearNow}>
            Clear Now
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
