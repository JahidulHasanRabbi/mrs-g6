"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GRAD_GOLD } from "./constants";

// Set Target Deposit modal (Figma 175:7319).  Portal-rendered so it escapes
// any parent stacking context, matching the same pattern as DateRangePicker.

export default function SetTargetModal({ isOpen, onClose, onSave, pics }) {
  const [pic, setPic] = useState(pics?.[0] ?? "");
  const [target, setTarget] = useState("");

  // Reset form whenever the modal re-opens so stale values don't leak between
  // sessions.
  useEffect(() => {
    if (isOpen) {
      setPic(pics?.[0] ?? "");
      setTarget("");
    }
  }, [isOpen, pics]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSave = () => {
    onSave?.({ pic, target });
    onClose?.();
  };

  const modal = (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[600px] rounded-[16px] border border-[#f2cb7a]/40 bg-[#0a0e0a] p-8 shadow-[0_0_32px_rgba(222,162,32,0.2)]"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Set Target Deposit"
      >
        <h2
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "22px",
            lineHeight: "33px",
          }}
        >
          Set Target Deposit
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="b-3 font-semibold text-white">Choose PIC</label>
            <select
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              className="h-10 rounded-[8px] border border-[#f2cb7a] bg-transparent px-3 text-[14px] text-white focus:outline-none appearance-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M4 6l4 4 4-4' stroke='%23eaad2c' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                paddingRight: "30px",
              }}
            >
              {(pics ?? []).map((p) => (
                <option key={p} value={p} className="bg-[#0a0e0a]">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="b-3 font-semibold text-white">Set Target</label>
            <div className="flex h-10 items-center rounded-[8px] border border-[#f2cb7a] bg-transparent px-3">
              <span className="b-3 font-semibold text-[#eaad2c]">RM</span>
              <input
                type="text"
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="10,000"
                className="ml-2 flex-1 bg-transparent text-[14px] text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-medium text-white transition hover:bg-white/5"
          >
            <CloseGlyph />
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#152044] transition hover:brightness-110"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            <CheckGlyph />
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}

function CloseGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
