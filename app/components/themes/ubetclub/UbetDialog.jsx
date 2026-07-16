"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Ubetclub modal: dimmed backdrop + a centered column. The caller supplies the
 * UbetOrnateCard (heading/reward) and any UbetButtons beneath it, matching the
 * Figma dialogs where action buttons sit below the ornate frame.
 */
export default function UbetDialog({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            className="flex w-full max-w-[360px] flex-col items-center gap-3"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
