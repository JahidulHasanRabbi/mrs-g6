"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { submitFeedback as submitFeedbackApi } from "@/app/api/memberApi";
import { tokenStorage } from "@/app/api/tokenStorage";
import { useTheme } from "../../contexts/ThemeContext";
import { UBET_ASSETS } from "../themes/ubetclub/assets";
import { EP369_ASSETS } from "../themes/ep369/assets";

/**
 * FeedbackModal — collects a star rating + free-text message from the player.
 */
export default function FeedbackModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const { isAcebet77, isUbetclub, isEp369 } = useTheme();

  let skin;
  if (isAcebet77) {
    skin = {
      modalBg: "linear-gradient(180deg, #17130c 0%, #050505 100%)",
      borderColor: "#e9af41",
      starOff: "#3a2f1a",
      starOn: "#f2ba33",
      submitBg: "linear-gradient(180deg, #f2cb7a 0%, #b57718 100%)",
      submitText: "#171006",
    };
  } else if (isUbetclub) {
    skin = {
      modalBg: "linear-gradient(180deg, #4a0e11 0%, #180708 100%)",
      borderColor: "#f2c36b",
      starOff: "#5a2d20",
      starOn: "#f2c36b",
      submitImage: UBET_ASSETS.spin.btnPlay,
      submitText: "#f2c36b",
    };
  } else if (isEp369) {
    skin = {
      modalBg: "linear-gradient(180deg, #0d3d1c 0%, #001002 100%)",
      borderColor: "#e9af41",
      starOff: "#1a3a22",
      starOn: "#f2c36b",
      submitImage: EP369_ASSETS.spin.btnPlay,
      submitText: "#f2c36b",
    };
  } else {
    skin = {
      modalBg: "linear-gradient(180deg, #1a3a22 0%, #07190d 100%)",
      borderColor: "#c08f32",
      starOff: "#3d4a3a",
      starOn: "#fde685",
      submitBg: "linear-gradient(180deg, #7da348 0%, #4d7530 100%)",
      submitText: "#ffffff",
    };
  }

  const reset = useCallback(() => {
    setRating(0);
    setHoverRating(0);
    setMessage("");
    setIsSubmitting(false);
    setSubmitted(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Reset after exit animation completes.
    setTimeout(reset, 350);
  }, [onClose, reset]);

  const submitFeedback = useCallback(async ({ rating, message }) => {
    const memberUuid = tokenStorage.getMemberUuid();
    if (!memberUuid) {
      throw new Error('Member not logged in');
    }

    const feedbackData = {
      member_uuid: memberUuid,
      feedback: `Rating: ${rating}/5\n\n${message}`
    };

    try {
      const result = await submitFeedbackApi(feedbackData);
      return result;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating === 0) {
      setError("Please pick a rating before submitting.");
      return;
    }
    if (!message.trim()) {
      setError("Please add a short message before submitting.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await submitFeedback({ rating, message: message.trim() });
      setSubmitted(true);
    } catch (err) {
      console.error('handleSubmit: Error caught:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      setError("Could not send your feedback right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <motion.div
            className="relative w-full max-w-[340px] overflow-hidden rounded-2xl"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
            style={{
              background: skin.modalBg,
              border: `2px solid ${skin.borderColor}`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2
                id="feedback-modal-title"
                className="text-[#fde685] text-[18px] font-bold"
                style={{ fontFamily: '"Times New Roman", serif' }}
              >
                Send Us Feedback
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close feedback"
                className="text-white/60 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5">
                <div>
                  <p
                    className="mb-2 text-[12px] text-white/80"
                    style={{ fontFamily: '"Times New Roman", serif' }}
                  >
                    How would you rate your experience?
                  </p>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-3xl leading-none transition-transform hover:scale-110"
                        aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                      >
                        <span style={{ color: (hoverRating || rating) >= n ? skin.starOn : skin.starOff }}>★</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="feedback-message"
                    className="mb-1 block text-[12px] text-white/80"
                    style={{ fontFamily: '"Times New Roman", serif' }}
                  >
                    Your message
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Tell us what's on your mind..."
                    className="w-full resize-none rounded-lg bg-black/30 px-3 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none"
                    style={{
                      fontFamily: '"Times New Roman", serif',
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: `${skin.borderColor}66`,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = skin.starOn)}
                    onBlur={(e) => (e.target.style.borderColor = `${skin.borderColor}66`)}
                  />
                  <div className="mt-1 text-right text-[10px] text-white/40">{message.length}/500</div>
                </div>

                {error && (
                  <div className="text-center text-[12px] text-red-400" role="alert">
                    {error}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 rounded-full px-3 py-2 text-[12px] font-bold hover:bg-white/5 disabled:opacity-40"
                    style={{
                      fontFamily: '"Times New Roman", serif',
                      color: skin.starOn,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: `${skin.borderColor}99`,
                    }}
                  >
                    Cancel
                  </button>
                  {skin.submitImage ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative flex-1 h-[38px] overflow-hidden text-[12px] font-bold disabled:opacity-50"
                      style={{ fontFamily: '"Times New Roman", serif' }}
                    >
                      <img
                        src={skin.submitImage}
                        alt=""
                        draggable={false}
                        className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
                      />
                      <span className="relative z-10" style={{ color: skin.submitText }}>
                        {isSubmitting ? "Sending…" : "Submit"}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-full px-3 py-2 text-[12px] font-bold shadow-md disabled:opacity-50"
                      style={{
                        background: skin.submitBg,
                        color: skin.submitText,
                        fontFamily: '"Times New Roman", serif',
                        textShadow: (isAcebet77 || isEp369) ? "none" : "0 1px 2px rgba(0,0,0,0.35)",
                      }}
                    >
                      {isSubmitting ? "Sending…" : "Submit"}
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-3 px-5 pb-6 pt-2 text-center">
                <div className="text-5xl">🎉</div>
                <p
                  className="text-[16px] font-bold text-[#fde685]"
                  style={{ fontFamily: '"Times New Roman", serif' }}
                >
                  Thank you for your feedback!
                </p>
                <p
                  className="text-[12px] text-white/70"
                  style={{ fontFamily: '"Times New Roman", serif' }}
                >
                  We appreciate your input and will use it to improve the experience.
                </p>
                {skin.submitImage ? (
                  <button
                    onClick={handleClose}
                    className="relative mt-2 h-[38px] w-[140px] overflow-hidden text-[12px] font-bold"
                    style={{ fontFamily: '"Times New Roman", serif' }}
                  >
                    <img
                      src={skin.submitImage}
                      alt=""
                      draggable={false}
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
                    />
                    <span className="relative z-10" style={{ color: skin.submitText }}>
                      Close
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="mt-2 rounded-full px-6 py-2 text-[12px] font-bold shadow-md"
                    style={{
                      background: skin.submitBg,
                      color: skin.submitText,
                      fontFamily: '"Times New Roman", serif',
                      textShadow: isAcebet77 ? "none" : "0 1px 2px rgba(0,0,0,0.35)",
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
