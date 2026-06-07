"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

export default function ConfirmArchive({ open, title, message, onConfirm, onCancel, busy = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !busy) onCancel?.(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onCancel]);

  if (!open || typeof document === "undefined") return null;

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={busy ? undefined : onCancel}
        className="absolute inset-0 bg-black/70"
      />
      <div className="relative w-full max-w-[460px] rounded-[16px] border border-[#f2cb7a]/40 bg-[#041502] p-6 shadow-[0_-4px_24px_-2px_rgba(222,162,32,0.45)]">
        <h2
          className="mb-3 bg-clip-text text-[20px] font-bold leading-[1.2] text-transparent"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            backgroundImage: "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)",
          }}
        >
          {title}
        </h2>
        {message && <p className="mb-6 text-[13px] leading-[1.6] text-white/80">{message}</p>}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-5 py-2 text-[13px] font-semibold text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-5 py-2 text-[13px] font-semibold text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundImage: GOLD_BG }}
          >
            {busy ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
