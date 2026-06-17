"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

export default function EggAnimation({ isCracked, onTap }) {
  return (
    <div className="relative w-[362px] max-w-full mx-auto" style={{ height: 452 }}>
      {/* Nest - positioned at bottom */}
      <div className="absolute bottom-0 left-0 w-[362px] h-[272px] z-0">
        <img
          src={SMASH_EGG_ASSETS.nest}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Egg - positioned above nest */}
      <motion.button
        onClick={onTap}
        className="absolute left-1/2 -translate-x-1/2 top-[5px] w-[272px] h-[362px] cursor-pointer z-10"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Smash the egg"
      >
        <motion.div
          key={isCracked ? "cracked" : "whole"}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative w-full h-full"
        >
          <img
            src={isCracked ? SMASH_EGG_ASSETS.eggCracked : SMASH_EGG_ASSETS.eggWhole}
            alt={isCracked ? "Cracked egg" : "Egg"}
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
