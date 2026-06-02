"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GRAD_GOLD } from "./constants";

// Set Target Deposit modal (Figma 175:7319).  Portal-rendered so it escapes
// any parent stacking context, matching the same pattern as DateRangePicker.

function getPicUuid(pic) {
  return pic?.uuid || "";
}

function getPicLabel(pic) {
  return pic?.label || pic?.full_name || pic?.name || pic?.username || pic?.uuid || "Unknown PIC";
}

export default function SetTargetModal({ isOpen, onClose, onSave, pics }) {
  const picOptions = useMemo(() => (pics ?? []).filter((pic) => getPicUuid(pic)), [pics]);
  const [picUuid, setPicUuid] = useState(getPicUuid(picOptions[0]));
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Reset form whenever the modal re-opens so stale values don't leak between
  // sessions.
  useEffect(() => {
    if (isOpen) {
      setPicUuid(getPicUuid(picOptions[0]));
      setTarget("");
      setSaveError("");
      setSaving(false);
    }
  }, [isOpen, picOptions]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await onSave?.({ picUuid, target });
      onClose?.();
    } catch {
      setSaveError("Failed to set target. Please check the values and try again.");
    } finally {
      setSaving(false);
    }
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
            <PicDropdown
              value={picUuid}
              onChange={setPicUuid}
              options={picOptions.map((p) => ({ value: getPicUuid(p), label: getPicLabel(p) }))}
            />
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

        {saveError && (
          <p className="mt-4 rounded-[8px] border border-[#fb3748] bg-[#d00416]/20 px-4 py-2 text-[12px] text-[#fb3748]">
            {saveError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-medium text-white transition hover:bg-white/5 disabled:opacity-60"
          >
            <CloseGlyph />
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-[8px] border border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#152044] transition hover:brightness-110 disabled:opacity-60"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            <CheckGlyph />
            {saving ? "Saving..." : "Save"}
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

function PicDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        className="flex h-10 w-full items-center justify-between gap-3 rounded-[8px] border border-[#f2cb7a] bg-transparent px-3 text-left text-[14px] text-white focus:outline-none"
      >
        <span className={selected ? "min-w-0 break-words" : "text-white/45"}>
          {selected?.label || "Choose PIC"}
        </span>
        <ChevronGlyph open={open} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-[1001]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-[1002] mt-1 max-h-56 w-full overflow-y-auto rounded-[8px] border border-[#f2cb7a] bg-[#050805] py-1 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-[13px] text-white/40">No PIC available</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-[13px] leading-[18px] ${
                    option.value === value ? "bg-[#eaad2c] text-black" : "text-white hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ChevronGlyph({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 transition-transform"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M4 6l4 4 4-4" stroke="#eaad2c" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
