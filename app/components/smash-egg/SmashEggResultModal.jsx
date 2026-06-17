"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

function PrizeCard({ prize }) {
  if (!prize) return null;

  return (
    <div className="flex items-center gap-2 px-[17px] py-[9px] rounded-lg bg-[#2e2a1e] border border-[rgba(77,71,50,0.2)] w-full justify-center">
      <div className="relative w-[26px] h-[26px] shrink-0">
        <Image
          src={SMASH_EGG_ASSETS.coinsIcon}
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col items-center">
        <p
          className="text-[9px] text-[#ffb77d] uppercase leading-[13.5px]"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
        >
          FREE CREDIT
        </p>
        <p
          className="text-[10px] text-[#d0c6ab] leading-[15px]"
          style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
        >
          {prize.label}
        </p>
      </div>
    </div>
  );
}

export default function SmashEggResultModal({ isOpen, onClose, prize }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-[358px] max-w-full rounded-xl border border-[rgba(255,246,223,0.2)] p-[25px] overflow-hidden"
            style={{
              boxShadow: "0 0 20px rgba(233,196,0,0.1), inset 0 0 15px rgba(233,196,0,0.05)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Glass background */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                backgroundColor: "rgba(35,31,20,0.7)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            />

            <div className="relative z-10 flex flex-col gap-6 items-center">
              {/* Title */}
              <h2
                className="text-xl text-[#fff6df] uppercase tracking-[2px] leading-[30px] text-center"
                style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
              >
                You Won
              </h2>

              {/* Prize display */}
              <PrizeCard prize={prize} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl border-b-4 border-[#3a3000] text-[#3a3000] text-base leading-4 cursor-pointer"
                style={{
                  fontFamily: "var(--font-acme), 'Acme', sans-serif",
                  background: "linear-gradient(to bottom, #ffd700, #544600)",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
