"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SPIN_ASSETS } from "./spinAssets";

const RewardItem = ({ icon, title, index }) => (
  <motion.div 
    className="relative w-full h-[62px] rounded-[6px] border border-white overflow-hidden"
    style={{
      background: "linear-gradient(0.57deg, rgba(242, 195, 107, 0) 74.37%, rgb(221, 143, 31) 94%), linear-gradient(90deg, rgba(7, 25, 13, 0.44) 0%, rgba(7, 25, 13, 0.44) 100%)",
      boxShadow: "3px 3px 48px 3px rgba(231, 196, 87, 0.5)"
    }}
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.2,
      ease: "easeOut"
    }}
    whileHover={{ scale: 1.02, y: -2 }}
  >
    <div className="absolute inset-0 flex items-center gap-6 px-4">
      <motion.div 
        className="relative w-[50px] h-[51px] shrink-0"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.2 + 0.1,
          ease: "easeOut"
        }}
      >
        <Image
          alt={title}
          src={icon}
          fill
          className="object-cover"
        />
      </motion.div>
      <p className="text-white text-xl font-bold text-start mx-auto">
        {title}
      </p>
    </div>
  </motion.div>
);

const CreditCard = ({ range, index }) => (
  <motion.div 
    className="relative w-[130px] h-[96px]"
    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ 
      duration: 0.6, 
      delay: index * 0.15,
      ease: "easeOut"
    }}
    whileHover={{ scale: 1.05, rotate: 2 }}
  >
    <Image
      alt="Coin Frame"
      src={SPIN_ASSETS.coinFrame}
      fill
      className="object-cover"
    />
    <motion.div 
      className="absolute left-[-60px] bottom-[6px] w-[130px] h-[50px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.15 + 0.3,
        ease: "easeOut"
      }}
    >
      <Image
        alt="Coin"
        src={SPIN_ASSETS.coin2}
        fill
        className="object-contain"
      />
    </motion.div>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a67520] font-bold text-center gap-0 -mt-2">
      <p className="text-[16px]  leading-tight">FREE</p>
      <p className="text-[16px]  leading-tight">CREDIT</p>
      <p className="text-[12px]  leading-tight mt-1">{range}</p>
    </div>
  </motion.div>
);

export default function RewardsList() {
  const rewards = [
    { icon: SPIN_ASSETS.prize1, title: "I Phone 17 Pro Max" },
    { icon: SPIN_ASSETS.prize2, title: "Sexy Toy" },
    { icon: SPIN_ASSETS.prize3, title: "Birthday" },
  ];

  const creditCards = [
    "RM1.00 ~ RM5.00",
    "RM5.00 ~ RM15.00",
    "RM15.00 ~ RM45.00",
    "RM45.00 ~ RM135.00",
    "RM135.00 ~ RM400.00",
  ];

  return (
    <motion.div 
      className="relative w-[520px] h-[950px] mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Image
        alt="Scroll Background"
        src={SPIN_ASSETS.scrollBackground}
        fill
        className="object-cover"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 py-12">
        <motion.h2 
          className="text-[36px] font-bold text-[#a67520] text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Rewards List
        </motion.h2>
        
        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          {rewards.map((reward, index) => (
            <RewardItem key={index} index={index} {...reward} />
          ))}
        </div>

        <div className="flex justify-center gap-8 mt-2">
          <CreditCard range={creditCards[0]} index={0} />
          <CreditCard range={creditCards[1]} index={1} />
        </div>
        <div className="flex justify-center gap-8">
          <CreditCard range={creditCards[2]} index={2} />
          <CreditCard range={creditCards[3]} index={3} />
        </div>
        <div className="flex justify-center gap-8">
          <CreditCard range={creditCards[4]} index={4} />
        </div>
      </div>
    </motion.div>
  );
}
