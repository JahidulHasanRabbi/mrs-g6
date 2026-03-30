"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { memo, useState, useEffect } from "react";
import { SPIN_ASSETS } from "./spinAssets";
import { getWinningList } from "@/app/api/memberApi";

const maskUsername = (name) => {
  if (!name) return "";
  if (name.includes("*")) return name; // Already masked by backend
  if (name.length <= 2) return name[0] + "*";
  if (name.length <= 4) return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  
  const prefixLen = 2;
  const suffixLen = 2;
  const maskedLen = name.length - prefixLen - suffixLen;
  
  return name.substring(0, prefixLen) + "*".repeat(maskedLen) + name.substring(name.length - suffixLen);
};

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
  const [winnings, setWinnings] = useState([]);

  useEffect(() => {
    const fetchWinnings = async () => {
      try {
        const data = await getWinningList();
        if (Array.isArray(data)) {
          const formattedData = data.map(item => {
            const dt = new Date(item.datetime_obtained || Date.now());
            const dateStr = dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return {
              date: dateStr,
              phone: maskUsername(item.display_name),
              amount: item.prize_name
            };
          });
          setWinnings(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch winning list:", error);
      }
    };
    
    fetchWinnings();
    
    // Auto-update list every 30 seconds
    const interval = setInterval(fetchWinnings, 30000);
    return () => clearInterval(interval);
  }, []);

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
