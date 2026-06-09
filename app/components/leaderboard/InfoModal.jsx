"use client";

import { AnimatePresence, motion } from "framer-motion";

import { LB_COLORS } from "./constants";
import { GlowCard } from "./primitives";

// "How it works" modal opened from the LEADERBOARDS header (i) button.
// Reuses GlowCard + the same backdrop/animation as PredictModal so the two
// leaderboard dialogs stay visually consistent.

const RULES = [
  "Choose your nation and represent it throughout the tournament.",
  "RM10 = 100 Points. Earn Points and climb the Country & Global Leaderboards.",
  "Predict match winners and play the Penalty Kick Challenge for extra Points and rewards.",
  "The campaign runs from 11 June - 19 July. Players who finish on the Leaderboards when the tournament ends will receive prizes.",
];

export default function InfoModal({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        key="lb-info-backdrop"
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
                  fontSize: 28,
                  lineHeight: "34px",
                }}
              >
                How It Works
              </h2>

              <ul className="flex flex-col gap-3">
                {RULES.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[12px]"
                      style={{
                        background: LB_COLORS.primarySoft,
                        color: LB_COLORS.primary,
                        fontFamily: "'Lexend',sans-serif",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[14px]"
                      style={{
                        color: LB_COLORS.textMuted,
                        fontFamily: "'Lexend',sans-serif",
                        lineHeight: "20px",
                      }}
                    >
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>

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
                Got It
              </button>
            </div>
          </GlowCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
