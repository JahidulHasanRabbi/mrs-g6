"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import KingRewardsButton from "../themes/kingrewards/KingRewardsButton";
import { GoldText } from "../themes/kingrewards/KrUi";
import { KR_COLORS, KR_FONT, KR_GRADIENTS } from "../themes/kingrewards/assets";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
const STAR_PATH = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

function Star({ on }) {
  return (
    <svg viewBox="0 0 24 24" className="size-9" aria-hidden="true">
      <defs>
        <linearGradient id="kr-star-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff066" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d={STAR_PATH}
        fill={on ? "url(#kr-star-fill)" : "rgba(255,255,255,0.06)"}
        stroke={on ? "#fff066" : "rgba(165,196,255,0.8)"}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Close feedback"
      className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ border: `1.5px solid ${KR_COLORS.goldBright}`, background: "rgba(255,255,255,0.06)" }}
    >
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
        <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke={KR_COLORS.goldText} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/**
 * King Rewards "Send Us Feedback" popup. State and submit logic stay in
 * FeedbackModal; background taps are swallowed so typed text is never lost
 * to a stray tap — close with X, Cancel or Esc.
 */
export default function KingRewardsFeedbackView({
  isOpen,
  onClose,
  rating,
  hoverRating,
  onRate,
  onHover,
  message,
  onMessage,
  maxLength,
  isSubmitting,
  submitted,
  error,
  onSubmit,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (typeof document === "undefined") return null;

  const shown = hoverRating || rating;
  const nearLimit = message.length >= maxLength * 0.9;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto px-4 py-6"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", fontFamily: KR_FONT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <motion.div
            className="relative my-auto w-full max-w-[360px] rounded-[16px] p-[2px]"
            style={{ background: KR_GRADIENTS.gold, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <div
              className="flex flex-col gap-4 rounded-[14px] px-4 pb-5 pt-4"
              style={{ background: KR_COLORS.navy, boxShadow: "inset 0 4px 16px 4px rgba(255,255,255,0.15)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <GoldText as="h2" className="block pt-1 text-[22px] font-bold">
                  <span id="feedback-modal-title">Send Us Feedback</span>
                </GoldText>
                <CloseButton onClick={onClose} disabled={isSubmitting} />
              </div>

              {!submitted ? (
                <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-[14px] font-medium leading-[1.3] text-white">
                      How would you rate your experience?
                    </legend>
                    <div className="flex justify-center gap-1" role="radiogroup" aria-label="Rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={rating === n}
                          aria-label={`${n} star${n > 1 ? "s" : ""} – ${RATING_LABELS[n]}`}
                          onClick={() => onRate(n)}
                          onMouseEnter={() => onHover(n)}
                          onMouseLeave={() => onHover(0)}
                          disabled={isSubmitting}
                          className="cursor-pointer rounded-full p-[2px] transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star on={shown >= n} />
                        </button>
                      ))}
                    </div>
                    <p className="min-h-[18px] text-center text-[13px] font-semibold leading-[1.3]" style={{ color: rating ? KR_COLORS.goldText : KR_COLORS.sand }}>
                      {rating ? `${rating} / 5 · ${RATING_LABELS[rating]}` : "Tap a star to rate"}
                    </p>
                  </fieldset>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="feedback-message" className="text-[14px] font-medium leading-[1.3] text-white">
                      Your message
                    </label>
                    <textarea
                      id="feedback-message"
                      value={message}
                      onChange={(e) => onMessage(e.target.value)}
                      rows={4}
                      maxLength={maxLength}
                      disabled={isSubmitting}
                      placeholder="Tell us what's on your mind..."
                      className="w-full resize-none rounded-[8px] bg-[#091f46] px-3 py-2 text-[16px] leading-[1.35] text-white outline-none placeholder:text-white/40 focus:shadow-[0_0_0_2px_rgba(255,240,102,0.35)] disabled:opacity-70"
                      style={{ border: `1.5px solid ${KR_COLORS.goldBright}` }}
                    />
                    <span
                      className="self-end text-[11px] tabular-nums"
                      style={{ color: nearLimit ? KR_COLORS.amber : KR_COLORS.sand }}
                      aria-live="polite"
                    >
                      {message.length}/{maxLength}
                    </span>
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-[8px] px-3 py-2 text-center text-[12px] leading-[1.3] text-white"
                      style={{ background: "rgba(217,6,20,0.25)", border: "1px solid rgba(255,120,120,0.6)" }}
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <KingRewardsButton variant="dark" className="h-[44px] flex-1" textSize={16} onClick={onClose} disabled={isSubmitting}>
                      Cancel
                    </KingRewardsButton>
                    <KingRewardsButton variant="gold" className="h-[44px] flex-1" textSize={16} onClick={onSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Sending…" : "Submit"}
                    </KingRewardsButton>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-3 pt-1 text-center" role="status">
                  <span
                    className="flex size-14 items-center justify-center rounded-full"
                    style={{ background: KR_GRADIENTS.gold, boxShadow: "0 0 16px rgba(245,158,11,0.45)" }}
                  >
                    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={KR_COLORS.onGold} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <GoldText as="p" className="block text-[18px] font-bold">
                    Thank you for your feedback!
                  </GoldText>
                  <p className="text-[14px] leading-[1.4] text-white/85">
                    We appreciate your input and will use it to improve the experience.
                  </p>
                  <KingRewardsButton variant="gold" className="mt-1 h-[44px]" textSize={16} onClick={onClose}>
                    Close
                  </KingRewardsButton>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
