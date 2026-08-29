"use client";

import { PROMO } from "./promoColors";

const TONES = {
  gold: { from: PROMO.goldFrom, to: PROMO.goldTo, border: PROMO.goldBorder, text: PROMO.goldText },
  blue: { from: PROMO.blueFrom, to: PROMO.blueTo, border: PROMO.blueBorder, text: PROMO.text },
  neutral: { from: PROMO.neutralFrom, to: PROMO.neutralTo, border: PROMO.neutralBorder, text: PROMO.neutralText },
};

export default function PromoButton({ tone = "gold", onClick, disabled, children }) {
  const t = TONES[tone] ?? TONES.gold;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative flex w-full items-center justify-center rounded-[16px] border px-[clamp(16px,5vw,32px)] py-[clamp(12px,3.6vw,16px)] text-[clamp(16px,4.8vw,22px)] font-extrabold uppercase leading-none drop-shadow-[0_4px_5px_rgba(0,0,0,0.25)] transition-transform active:scale-[0.98] disabled:opacity-60"
      style={{
        backgroundImage: `linear-gradient(180deg, ${t.from} 0%, ${t.to} 100%)`,
        borderColor: t.border,
        color: t.text,
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-px top-px h-[6px] rounded-[3px]"
        style={{ backgroundColor: PROMO.gloss }}
      />
      <span className="relative">{children}</span>
    </button>
  );
}
