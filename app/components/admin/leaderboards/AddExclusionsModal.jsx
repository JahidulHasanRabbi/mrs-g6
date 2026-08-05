"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../ui/Button";

export default function AddExclusionsModal({ open, value, onChange, onSubmit, onClose, busy = false, error = "" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="add-exclusions-title">
      <button type="button" aria-label="Close" onClick={busy ? undefined : onClose} className="absolute inset-0 bg-black/70" />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
        className="relative w-full max-w-[500px] rounded-[16px] border border-[#f2cb7a]/40 bg-[#041502] p-6 shadow-[0_-4px_24px_-2px_rgba(222,162,32,0.45)]"
      >
        <h2
          id="add-exclusions-title"
          className="mb-2 bg-clip-text text-[20px] font-bold text-transparent"
          style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)" }}
        >
          Add Excluded Members
        </h2>
        <p className="mb-4 text-[13px] leading-5 text-white/65">
          Enter one or more MRS member IDs, separated by commas, spaces, or new lines.
        </p>
        <label htmlFor="leaderboard-member-ids" className="mb-2 block text-[13px] font-semibold text-white">
          Member IDs
        </label>
        <textarea
          id="leaderboard-member-ids"
          autoFocus
          rows={5}
          value={value}
          disabled={busy}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="73914, 3023, 82918"
          className="w-full resize-y rounded-[8px] border border-white/20 bg-[#101810] px-4 py-3 text-[13px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#f2cb7a] disabled:opacity-50"
        />
        {error && <p className="mt-2 text-[12px] text-[#fb6b6b]">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" loading={busy}>Add Members</Button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
