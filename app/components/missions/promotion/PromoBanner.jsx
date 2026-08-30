"use client";

import PromoOfferArt from "./PromoOfferArt";

// The designed pop-out (client slide 4) is what a promotion renders by default,
// built from the backend's own title / deposit / reward fields. An admin-
// uploaded banner (Pop Out Setting -> Content) replaces it when present.
export default function PromoBanner({ image, title, content, promo }) {
  if (image) {
    return (
      <img
        src={image}
        alt={title || "Promotion"}
        className="w-full select-none rounded-[16px] object-contain"
      />
    );
  }

  return (
    <PromoOfferArt
      title={title}
      content={content}
      depositAmount={promo?.deposit_amount}
      rewardAmount={promo?.reward_amount}
      rewardCategory={promo?.reward_category ?? 1}
    />
  );
}
