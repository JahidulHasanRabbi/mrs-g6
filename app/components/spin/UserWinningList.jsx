"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SPIN_ASSETS } from "./spinAssets";

const WinningRow = memo(function WinningRow({ date, reward, amount, index }) {
  return (
  <motion.div 
    className="flex items-center justify-between px-2 sm:px-6 py-3"
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.15,
      ease: "easeOut"
    }}
    whileHover={{ scale: 1.02, x: 5 }}
  >
    <span className="text-[#3d1a02] text-xs sm:text-sm font-bold w-[80px]">{date}</span>
    <span className="text-[#3d1a02] text-xs sm:text-sm font-bold w-[120px] text-center">{reward}</span>
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.15 + 0.2,
        ease: "easeOut"
      }}
    >
      <div className="relative w-[20px] h-[20px]">
        <Image
          alt="Coin"
          src={SPIN_ASSETS.coinIcon}
          fill
          className="object-contain"
          sizes="20px"
        />
      </div>
      <span className="text-[#3d1a02] text-[16px] font-bold">{amount}</span>
    </motion.div>
  </motion.div>
  );
});

const UserWinningList = memo(function UserWinningList({ winnings = [] }) {
  if (winnings.length === 0) {
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
        
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[#3d1a02] text-lg font-bold">No winnings yet. Start spinning!</p>
        </div>
      </motion.div>
    );
  }

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
      
      <div className="absolute inset-0 flex gap-[2px] py-40 flex-col justify-center px-8">
        {winnings.map((winning, index) => (
          <WinningRow key={index} index={index} {...winning} />
        ))}
      </div>
    </motion.div>
  );
});

export default UserWinningList;
