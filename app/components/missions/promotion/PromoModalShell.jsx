"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { PROMO } from "./promoColors";

// The Figma frame is 480px wide but the member portal clamps to 475px, so the
// shell is fluid and the type inside clamps with it.
export default function PromoModalShell({ open, onClose, labelledBy, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
      />
      <div
        className="relative flex w-full max-w-[420px] flex-col items-center gap-[clamp(14px,4vw,24px)] rounded-[28px] p-[clamp(18px,5.5vw,32px)] shadow-[0_16px_32px_rgba(0,0,0,0.5)]"
        style={{
          backgroundColor: PROMO.shellBg,
          border: `3px solid ${PROMO.shellBorder}`,
          // The member portal defaults to Times New Roman; these dialogs are Inter.
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full border-2 text-[18px] font-bold leading-none transition-transform active:scale-95"
          style={{
            backgroundColor: PROMO.cardBg,
            borderColor: PROMO.shellBorder,
            color: PROMO.text,
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
