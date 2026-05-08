"use client";

import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";
import { PROFILE_ASSETS } from "../profile/profileAssets";

export default function MartHeader({ balance = "5,450.00", onMenuClick, onProfileClick, showAnimation = false, profilePhoto = null }) {
  return (
    <motion.div
      className="relative w-full h-[80px] px-[21px] pt-[14px] bg-[#0a1a0a]/95 backdrop-blur-sm border-b-2 border-[#e9af41]/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
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
        <div className="relative">
          <img
            alt="Menu"
            src={"/assets/images/hamburger-icon.png"}
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <p className="text-[#e9af41] text-[14px] font-bold font-['Times_New_Roman']">
          Menu
        </p>
      </motion.button>

      {/* Balance Display */}
      <motion.div 
        className="absolute right-0 -translate-x-1/2 top-[16px] w-[146px] h-[48px]"
        initial={showAnimation ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={showAnimation ? { duration: 0.6, delay: 0.2, ease: "easeOut" } : { duration: 0 }}
      >
        <img
          alt="Balance Frame"
          src={MART_ASSETS.coinBalance}
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <div className="relative w-[30px] h-[34px]">
            <img
              alt="Coin"
              src={MART_ASSETS.coinIcon}
              className="w-full h-full object-contain"
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
        className="absolute right-[21px] top-[14px] w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-[#e9af41] cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          alt="Profile"
          src={profilePhoto || PROFILE_ASSETS.profileAvatar}
          className="w-full h-full object-cover"
        />
      </motion.button>
    </motion.div>
  );
}
