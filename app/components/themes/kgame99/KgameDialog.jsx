"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { KGAME99_ASSETS } from './assets';

/**
 * Kgame99 modal: blurred dark backdrop + crowned ornate frame.
 * Children render inside the frame's safe area.
 */
export default function KgameDialog({ open, onClose, children, tall = false, frameless = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.35)] backdrop-blur-[2.5px]"
            onClick={onClose}
          />
          {frameless ? (
            // Shell only — the caller composes its own ornate card (via
            // KgameOrnateCard) plus any buttons that sit below the frame.
            // Used where content is too tall to fit a single stretched frame
            // without the heading riding into the crown.
            <motion.div
              className="relative z-10 flex w-full max-w-[360px] flex-col items-center gap-3"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              {children}
            </motion.div>
          ) : (
            /* Ornate frame wrapping short content directly */
            <motion.div
              className="relative w-[92%] max-w-[374px] px-[30px] pt-[76px] pb-[40px]"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <img
                src={tall ? KGAME99_ASSETS.ui.dialogFrameTall : KGAME99_ASSETS.ui.dialogFrame}
                alt=""
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />
              <div className="relative z-10 flex flex-col items-center gap-4">
                {children}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
