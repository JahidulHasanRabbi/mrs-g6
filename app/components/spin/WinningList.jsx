"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { memo } from "react";
import { SPIN_ASSETS } from "./spinAssets";

const WinningRow = memo(function WinningRow({ date, phone, amount, index }) {
  return (
  <motion.div 
    className="flex items-center justify-between px-4 sm:px-6 py-2.5 min-h-[45px]"
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: Math.min(index * 0.1, 0.5),
      ease: "easeOut"
    }}
    whileHover={{ scale: 1.02, x: 5 }}
  >
    <span className="text-[#3d1a02] text-xs sm:text-sm font-bold w-[85px] flex-shrink-0">{date}</span>
    <span className="text-[#3d1a02] text-xs sm:text-sm font-bold flex-1 text-center px-2 truncate">{phone}</span>
    <motion.div 
      className="flex items-center gap-1.5 flex-shrink-0"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: Math.min(index * 0.1 + 0.2, 0.7),
        ease: "easeOut"
      }}
    >
      <div className="relative w-[18px] h-[18px] flex-shrink-0">
        <Image
          alt="Coin"
          src={SPIN_ASSETS.coinIcon}
          fill
          className="object-contain"
          sizes="18px"
        />
      </div>
      <span className="text-[#3d1a02] text-sm sm:text-base font-bold whitespace-nowrap">{amount}</span>
    </motion.div>
  </motion.div>
  );
});

const WinningList = memo(function WinningList() {
  const winnings = [
    { date: "31-12-2025", phone: "60******869", amount: "RM31.1" },
    { date: "31-12-2025", phone: "60******869", amount: "RM1.27" },
    { date: "31-12-2025", phone: "60******69", amount: "RM3.19" },
    { date: "31-12-2025", phone: "60******869", amount: "RM0.97" },
  ];

  return (
    <motion.div 
      className="relative w-full max-w-[450px] h-[280px] mx-4"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      <Image
        alt="Winning List Background"
        src={SPIN_ASSETS.winningListBackground}
        fill
        className="object-fill"
      />
      
      <div className="absolute inset-0 flex items-start justify-center px-6 sm:px-8 pt-16 pb-8">
        <div className="w-full h-full flex items-start justify-center">
          <div className="w-full max-h-full overflow-y-auto scrollbar-hide pr-2">
            <div className="flex flex-col gap-0.5">
              {winnings.map((winning, index) => (
                <WinningRow key={index} index={index} {...winning} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default WinningList;
