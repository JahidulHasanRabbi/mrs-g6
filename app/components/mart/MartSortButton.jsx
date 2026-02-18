"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";

export default function MartSortButton({ onSort }) {
  return (
    <motion.button
      onClick={onSort}
      className="relative w-[186px] h-[51px] ml-auto block"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Image
        alt="Sort Button"
        src={MART_ASSETS.sortButton}
        fill
        className="object-cover"
      />
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#60803c] text-[14px] font-bold font-['Times_New_Roman']">
        Sort by Default
      </p>
    </motion.button>
  );
}
