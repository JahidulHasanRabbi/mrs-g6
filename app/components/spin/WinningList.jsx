"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SPIN_ASSETS } from "./spinAssets";

const WinningRow = ({ date, phone, amount, index }) => (
  <motion.div 
    className="flex items-center justify-between px-6 py-3"
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.15,
      ease: "easeOut"
    }}
    whileHover={{ scale: 1.02, x: 5 }}
  >
    <span className="text-[#3d1a02] text-[14px] font-bold w-[80px]">{date}</span>
    <span className="text-[#3d1a02] text-[14px] font-bold w-[90px] text-center">{phone}</span>
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
        />
      </div>
      <span className="text-[#3d1a02] text-[16px] font-bold">{amount}</span>
    </motion.div>
  </motion.div>
);

export default function WinningList() {
  const winnings = [
    { date: "31-12-2025", phone: "60******869", amount: "RM31.1" },
    { date: "31-12-2025", phone: "60******869", amount: "RM1.27" },
    { date: "31-12-2025", phone: "60******69", amount: "RM3.19" },
    { date: "31-12-2025", phone: "60******869", amount: "RM0.97" },
  ];

  return (
    <motion.div 
      className="relative w-full max-w-[450px] h-[280px] mx-auto"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Image
        alt="Winning List Background"
        src={SPIN_ASSETS.winningListBackground}
        fill
        className="object-cover"
      />
      
      <div className="absolute inset-0 flex gap-[2px] py-40 flex-col justify-center px-8">
        {winnings.map((winning, index) => (
          <WinningRow key={index} index={index} {...winning} />
        ))}
      </div>
    </motion.div>
  );
}
