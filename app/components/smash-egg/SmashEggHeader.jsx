"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

export default function SmashEggHeader({ onMenuClick }) {
  const router = useRouter();

  return (
    <header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-16 z-40 flex items-center justify-between px-6 pb-px border-b border-[#eab043]"
      style={{
        backgroundColor: "#07190d",
        boxShadow: "0 4px 2px rgba(233,175,65,0.25)",
      }}
    >
      <div className="flex items-center gap-3 relative z-10">
        <motion.button
          onClick={() => router.back()}
          className="relative w-[17.5px] h-[22.5px] shrink-0"
          whileTap={{ scale: 0.9 }}
          aria-label="Go back"
        >
          <Image
            src={SMASH_EGG_ASSETS.backArrow}
            alt="Back"
            fill
            className="object-contain"
          />
        </motion.button>
        <h1
          className="text-[#ffd700] text-2xl uppercase tracking-[-1.2px]"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
        >
          SMASH Egg
        </h1>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <motion.div
          className="relative w-9 h-9 rounded-full overflow-hidden"
          whileTap={{ scale: 0.9 }}
        >
          <Image
            src={SMASH_EGG_ASSETS.soundIcon}
            alt="Sound"
            fill
            className="object-cover"
          />
        </motion.div>
        <motion.button
          onClick={onMenuClick}
          className="relative w-9 h-9 rounded-full overflow-hidden"
          whileTap={{ scale: 0.9 }}
          aria-label="Menu"
        >
          <Image
            src={SMASH_EGG_ASSETS.menuIcon}
            alt="Menu"
            fill
            className="object-cover"
          />
        </motion.button>
      </div>
    </header>
  );
}
