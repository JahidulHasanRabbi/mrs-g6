"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";

export default function MartTitleBanner() {
  return (
    <motion.div 
      className="relative w-[370px] h-[103px] mx-auto mt-8"
      initial={{ opacity: 0, scale: 0.8, y: -50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.3,
      }}
    >
      <Image
        alt="Pagcor Mart"
        src={MART_ASSETS.titleBanner}
        fill
        className="object-contain"
      />
    </motion.div>
  );
}
