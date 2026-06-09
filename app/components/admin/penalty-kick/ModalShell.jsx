"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

const GOLD_BG =
  "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export default function ModalShell({
  title,
  open,
  onClose,
  onSave,
  saving = false,
  closeLabel = "Close",
  saveLabel = "Save",
  closeIcon = "close",
  width = "max-w-[640px]",
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        className={`relative w-full ${width} rounded-[16px] border border-[#f2cb7a]/50 bg-[#041502] p-6 shadow-[0_-4px_24px_-2px_rgba(222,162,32,0.45)]`}
      >
        <h2
          className="mb-5 bg-clip-text text-[22px] font-bold leading-[1.2] text-transparent"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            backgroundImage: "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)",
          }}
        >
          {title}
        </h2>

        {children}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            {closeIcon === "back" ? <BackIcon /> : <CloseIcon />}
            {closeLabel}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundImage: GOLD_BG }}
          >
            <CheckIcon />
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
