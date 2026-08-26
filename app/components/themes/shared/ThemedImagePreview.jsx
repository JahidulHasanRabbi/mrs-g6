"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemedActionButton from "./ThemedActionButton";

/**
 * Full-bleed lightbox for a single reward/prize shot.
 *
 * Deliberately NOT a <ThemedDialog>: those dim to 0.35–0.55 behind an ornate
 * frame in a 360px column, and a product shot needs the opposite — no frame,
 * near-opaque backdrop, and the whole viewport to fill.
 */
export default function ThemedImagePreview({ open, src, title, subtitle, skin, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Reward preview"}
        >
          <motion.img
            src={src}
            alt={title || ""}
            decoding="async"
            className="max-h-[54vh] max-w-[86vw] object-contain"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
          />
          <div
            className="flex flex-col items-center gap-1 text-center"
            style={{ fontFamily: skin.font }}
          >
            <p className="text-[20px]" style={{ color: skin.c.name }}>
              {title}
            </p>
            {subtitle && (
              <p className="text-[15px]" style={{ color: skin.c.coins }}>
                {subtitle}
              </p>
            )}
          </div>
          <ThemedActionButton textSize={16} onClick={onClose}>
            Close
          </ThemedActionButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
