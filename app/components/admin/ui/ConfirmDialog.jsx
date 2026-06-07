"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

/**
 * Confirmation modal for destructive or irreversible actions.
 * Replaces window.confirm — gives the action a visual preview,
 * matches admin styling, and supports a loading state on the confirm button.
 *
 * Why: checklist #6 (confirm destructive) + #13 (error prevention > error handling).
 *
 * Usage:
 *   <ConfirmDialog
 *     open={state.open}
 *     title="Archive banner?"
 *     message="Members will no longer see this banner on the home page."
 *     confirmLabel="Archive"
 *     tone="destructive"
 *     loading={isPending}
 *     onConfirm={handleConfirm}
 *     onCancel={handleCancel}
 *   />
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "destructive", // "destructive" | "primary"
  loading = false,
  preview,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel, onConfirm]);

  if (!open || typeof document === "undefined") return null;

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#10131c] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6">
        <h2 id="confirm-title" className="text-lg font-bold text-white">
          {title}
        </h2>
        {message && (
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{message}</p>
        )}
        {preview && <div className="mt-4">{preview}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "destructive" ? "destructive" : "primary"}
            size="md"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
