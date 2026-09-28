"use client";

import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * King Rewards modal (Figma 843:7526): a 50% black cover and a navy glass card.
 * `frameless` drops the card so the caller can draw its own.
 */
export default function KingRewardsDialog({ open, onClose, children, frameless = false }) {
  if (typeof document === 'undefined') return null;
  // Portalled: rendered inside <main> the cover sat under the z-40 header and nav.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose} />
          <motion.div
            className={
              frameless
                ? 'relative z-10 flex w-full max-w-[380px] flex-col items-center gap-3'
                : 'relative z-10 flex w-full max-w-[380px] flex-col items-center gap-6 overflow-hidden rounded-[16px] bg-[#003d89] px-2 py-4 backdrop-blur-[4px]'
            }
            style={frameless ? undefined : { boxShadow: 'inset 0 4px 16px 4px rgba(255,255,255,0.15)' }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
