"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";

export default function MartSortButton({ onSort, label = "Sort by Default" }) {
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
        className="object-fill"
      />
      <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-[#60803c] text-[12px] leading-[1.05] font-bold font-['Times_New_Roman'] whitespace-normal">
        {label}
      </p>
    </motion.button>
  );
}
