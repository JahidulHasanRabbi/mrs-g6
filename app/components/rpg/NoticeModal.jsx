"use client";

// Generic notice / confirm dialog for the RPG (insufficient tokens, paid
// attempt confirm, discard confirm, reward toasts …). Transient state only —
// never part of ?view= navigation.

import { AnimatePresence, motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS } from "./constants";
import { GoldCta } from "./primitives";

export default function NoticeModal({
  open,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel,
  onConfirm,
  onClose,
  busy = false,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={busy ? undefined : onClose}
        >
          <motion.div
            className="w-full max-w-[340px] rounded-[18px] border p-[22px] text-center"
            style={{
              background: "rgba(10,14,24,0.96)",
              borderColor: RPG_COLORS.violetBorder,
              boxShadow: "0 16px 50px rgba(0,0,0,0.5), 0 0 30px rgba(124,77,255,0.25)",
            }}
            initial={{ scale: 0.9, y: 14 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-[17px] font-bold tracking-[1px]"
              style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display }}
            >
              {title}
            </p>
            {message ? (
              <p
                className="mt-[10px] text-[13px] leading-5"
                style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}
              >
                {message}
              </p>
            ) : null}
            <div className="mt-[18px] flex flex-col gap-[10px]">
              <GoldCta onClick={onConfirm || onClose} disabled={busy} glow={false} className="!p-[12px] !text-[13px]">
                {busy ? "..." : confirmLabel}
              </GoldCta>
              {cancelLabel ? (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="w-full rounded-[14px] border p-[11px] text-[13px] font-semibold tracking-[1px] active:scale-[0.98] transition-transform"
                  style={{
                    borderColor: RPG_COLORS.violetBorder,
                    color: RPG_COLORS.textDim,
                    background: "rgba(255,255,255,0.04)",
                    fontFamily: RPG_FONTS.display,
                  }}
                >
                  {cancelLabel}
                </button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
