"use client";

import { AnimatePresence, motion } from "framer-motion";

import { LB_COLORS } from "./constants";
import { GlowCard } from "./primitives";

// Single-message notice modal used for rule gates (e.g. minimum-points to
// join predictions). Mirrors InfoModal's backdrop and animation so the two
// leaderboard dialogs stay visually consistent.
export default function NoticeModal({ title = "Heads up", message, ctaLabel = "Got It", onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        key="lb-notice-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center px-4"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-[358px]"
        >
          <GlowCard>
            <div className="flex flex-col gap-4">
              <h2
                className="text-center uppercase"
                style={{
                  color: LB_COLORS.primary,
                  fontFamily: "'Anybody','Lexend',sans-serif",
                  fontWeight: 700,
                  fontSize: 24,
                  lineHeight: "30px",
                }}
              >
                {title}
              </h2>

              <p
                className="text-center"
                style={{
                  color: LB_COLORS.textMuted,
                  fontFamily: "'Lexend',sans-serif",
                  fontSize: 14,
                  lineHeight: "22px",
                }}
              >
                {message}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-1 w-full rounded-[12px] py-4 uppercase"
                style={{
                  background: LB_COLORS.primary,
                  color: LB_COLORS.primaryDeep,
                  boxShadow: "0 4px 0 rgba(0,0,0,0.3)",
                  fontFamily: "'Anybody','Lexend',sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {ctaLabel}
              </button>
            </div>
          </GlowCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
