"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { N1GANG_ASSETS } from './assets';

export default function N1gangDialog({ open, onClose, children, tall = false, frameless = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.35)] backdrop-blur-[2.5px]"
            onClick={onClose}
          />
          {frameless ? (
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
            <motion.div
              className="relative w-[92%] max-w-[374px] px-[30px] pt-[76px] pb-[40px]"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <img
                src={tall ? N1GANG_ASSETS.ui.dialogFrameTall : N1GANG_ASSETS.ui.dialogFrame}
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
