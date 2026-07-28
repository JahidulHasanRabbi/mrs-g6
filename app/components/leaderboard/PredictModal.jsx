"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { LB_COLORS } from "./constants";
import { DrawBadge, GlowCard, Flag } from "./primitives";
import { submitPrediction } from "./worldcupApi";

// Two-step prediction modal for a single World Cup fixture (Figma 980:5399 →
// 980:5447). Step "choose" lets the user pick the home or away team as their
// predicted winner; "done" confirms the pick. Reuses GlowCard — its glassy
// green-rimmed surface already matches the modal frame in the design.

function ModalTitle({ children }) {
  return (
    <h2
      className="text-center uppercase"
      style={{
        color: LB_COLORS.primary,
        fontFamily: "'Anybody','Lexend',sans-serif",
        fontWeight: 700,
        fontSize: 32,
        lineHeight: "38.4px",
      }}
    >
      {children}
    </h2>
  );
}

function ModalSubtitle({ children }) {
  return (
    <p
      className="text-center"
      style={{
        color: LB_COLORS.textMuted,
        fontFamily: "'Lexend',sans-serif",
        fontSize: 16,
        lineHeight: "24px",
      }}
    >
      {children}
    </p>
  );
}

function GreenCta({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full rounded-[12px] py-4 uppercase transition-opacity"
      style={{
        background: LB_COLORS.primary,
        color: LB_COLORS.primaryDeep,
        boxShadow: "0 4px 0 rgba(0,0,0,0.3)",
        fontFamily: "'Anybody','Lexend',sans-serif",
        fontWeight: 700,
        fontSize: 16,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function TeamOption({ team, selected, onSelect }) {
  const isDraw = Number(team.id) === 0;
  return (
    <button
      type="button"
      onClick={() => onSelect(team)}
      className="flex w-full items-center justify-center gap-2 rounded-[8px] px-2 py-3 transition-colors"
      style={{
        border: `1px solid ${selected ? LB_COLORS.primary : LB_COLORS.borderSoft}`,
        background: selected ? LB_COLORS.primarySoft : "transparent",
      }}
    >
      {isDraw ? <DrawBadge /> : <Flag code={team.code} src={team.flag} />}
      <span
        className="text-[16px]"
        style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}
      >
        {team.name}
      </span>
    </button>
  );
}

export default function PredictModal({ fixture, onClose, onPredicted }) {
  const [step, setStep] = useState("choose");
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const drawOption = { id: 0, name: "Draw", code: null };

  const handlePredict = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await submitPrediction(fixture.uuid, selected.id);
      onPredicted?.(fixture.uuid, selected);
      setStep("done");
    } catch (err) {
      setError(
        err?.data?.detail ||
        err?.data?.details ||
        err?.message ||
        "Unable to submit prediction. Please try again.",
      );
      setSubmitting(false);
      return;
      // Show done step even on error so the user isn't stuck — the prediction
      // may still have been accepted; let them check My Predictions.
    }
    // Mark as predicted regardless of success/failure so the button
    // doesn't stay active and the user can't submit the same match twice.
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="predict-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center px-4"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
        // Backdrop click closes only the choose step — once predicted, the
        // user must acknowledge via CLOSE (mirrors the game-outcome dialogs).
        onClick={(e) => {
          if (e.target === e.currentTarget && step === "choose") onClose?.();
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
            {step === "choose" ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col items-center gap-1 py-2">
                  <ModalTitle>
                    Predict<br />Result
                  </ModalTitle>
                  <ModalSubtitle>
                    Choose the winner or predict a draw
                  </ModalSubtitle>
                </div>
                <TeamOption team={fixture.home} selected={selected?.id === fixture.home.id} onSelect={setSelected} />
                <TeamOption team={drawOption} selected={selected?.id === drawOption.id} onSelect={setSelected} />
                <TeamOption team={fixture.away} selected={selected?.id === fixture.away.id} onSelect={setSelected} />
                {error && (
                  <p className="text-center text-[12px]" style={{ color: LB_COLORS.red, fontFamily: "'Lexend',sans-serif" }}>
                    {error}
                  </p>
                )}
                <div className="pt-2">
                  <GreenCta onClick={handlePredict} disabled={!selected || submitting}>
                    Predict
                  </GreenCta>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-1 py-2">
                  <ModalTitle>Your Predict</ModalTitle>
                  <ModalSubtitle>Stay tuned to see your results</ModalSubtitle>
                </div>
                <div className="flex items-center justify-center gap-3 py-2">
                  <span
                    className="grid place-items-center rounded-full"
                    style={{ boxShadow: "0 0 16px 2px rgba(var(--lb-accent-rgb), 0.6)" }}
                  >
                    {Number(selected.id) === 0 ? (
                      <DrawBadge size={36} />
                    ) : (
                      <Flag code={selected.code} src={selected.flag} size={36} />
                    )}
                  </span>
                  <span
                    className="text-[20px]"
                    style={{ color: LB_COLORS.textWhite, fontFamily: "'Lexend',sans-serif" }}
                  >
                    {selected.name}
                  </span>
                </div>
                <GreenCta onClick={onClose}>Close</GreenCta>
              </div>
            )}
          </GlowCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
