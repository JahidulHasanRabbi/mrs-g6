"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { memo } from "react";
import { SPIN_ASSETS } from "./spinAssets";

const SpinButton = memo(function SpinButton({ spins, tokens, onClick, image, className = "w-[160px] h-[70px]", disabled = false }) {
  return (
    <motion.div 
      className={`relative ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      onClick={disabled ? undefined : onClick}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: disabled ? 0.5 : 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={disabled ? undefined : { scale: 1.05, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      style={{ willChange: disabled ? "auto" : "transform, opacity" }}
    >
      <Image
        alt="Button Background"
        src={image || SPIN_ASSETS.buttonBackground}
        fill
        className="object-contain"
      />
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center text-[#3d1a02] font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {tokens && <div className="text-[20px] leading-tight">{tokens} token</div>}
        <div className="text-[18px] leading-tight">{spins}</div>
      </motion.div>
    </motion.div>
  );
});

export default SpinButton;
