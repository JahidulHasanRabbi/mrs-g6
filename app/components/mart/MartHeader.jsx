"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";

export default function MartHeader({ balance = "5,450.00", onMenuClick, onProfileClick, showAnimation = false }) {
  return (
    <motion.div 
      className="relative w-full h-[56px] px-[21px] pt-[14px]"
      initial={showAnimation ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={showAnimation ? { duration: 0.6, ease: "easeOut" } : { duration: 0 }}
    >
      {/* Menu Button */}
      <motion.button
        onClick={onMenuClick}
        className="absolute left-[21px] top-[14px] flex flex-col items-center gap-1 cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative w-[62px] h-[52px]">
          <Image
            alt="Menu"
            src={MART_ASSETS.menuIcon}
            fill
            className="object-cover"
          />
        </div>
        <p className="text-[#e9af41] text-[14px] font-bold font-['Times_New_Roman']">
          Menu
        </p>
      </motion.button>

      {/* Balance Display */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 top-[16px] w-[146px] h-[48px]"
        initial={showAnimation ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={showAnimation ? { duration: 0.6, delay: 0.2, ease: "easeOut" } : { duration: 0 }}
      >
        <Image
          alt="Balance Frame"
          src={MART_ASSETS.coinBalance}
          fill
          className="object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <div className="relative w-[30px] h-[34px]">
            <Image
              alt="Coin"
              src={MART_ASSETS.coinIcon}
              fill
              className="object-contain"
            />
          </div>
          <p className="text-[#f9d063] text-[14px] font-bold font-['Times_New_Roman']">
            {balance}
          </p>
        </div>
      </motion.div>

      {/* Profile Button */}
      <motion.button
        onClick={onProfileClick}
        className="absolute right-[21px] top-[14px] w-[52px] h-[52px] cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Image
          alt="Profile"
          src={MART_ASSETS.profileIcon}
          fill
          className="object-cover"
        />
      </motion.button>
    </motion.div>
  );
}
