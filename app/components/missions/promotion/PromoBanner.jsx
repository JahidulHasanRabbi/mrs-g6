"use client";

import { PROMO } from "./promoColors";

// The promotion artwork is admin-uploaded (Pop Out Setting → Content), so the
// headline/offer copy lives inside the image. The text block is the fallback
// for a promotion saved without one.
export default function PromoBanner({ image, title, content }) {
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
    <div
      className="flex w-full flex-col items-center gap-2 rounded-[16px] px-4 py-6 text-center"
      style={{ backgroundColor: PROMO.cardBg, border: `2px solid ${PROMO.cardBorder}` }}
    >
      {title && (
        <p
          className="font-black uppercase leading-tight"
          style={{ color: PROMO.titleFront, fontSize: "clamp(22px,7vw,32px)" }}
        >
          {title}
        </p>
      )}
      {content && (
        <p className="text-[clamp(14px,4.2vw,17px)] leading-[1.4]" style={{ color: PROMO.text }}>
          {content}
        </p>
      )}
    </div>
  );
}
