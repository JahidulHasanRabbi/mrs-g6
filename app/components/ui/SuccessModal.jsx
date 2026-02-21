"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "🎁  100% Done — Reward Unlocked",
  message = "Thanks for completing your profile. 10 Free Coins added.",
  backgroundColor = "rgba(96, 128, 60, 1)",
  popupBg = "/assets/personal-data/success-popup-bg.png"
}) {
  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="relative w-[311px] h-[274px]"
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Popup Background */}
        <Image
          alt="Success Popup"
          src={popupBg}
          fill
          className="object-contain"
        />

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute right-[241px] top-[55px] w-[30px] h-[30px]"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-full h-full relative">
            <div 
              className="absolute inset-0 flex items-center justify-center text-[20px] font-bold"
              style={{ color: backgroundColor }}
            >
              ×
            </div>
          </div>
        </motion.button>

        {/* Content */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-[50px] items-start w-[228px] h-[144px]"
        >
          {/* Title */}
          <motion.p 
            className="font-bold font-['Times_New_Roman'] leading-[1.1] not-relative shrink-0 w-[228px] whitespace-pre-wrap"
            style={{ 
              color: backgroundColor,
              fontSize: "16px"
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {title}
          </motion.p>

          {/* Message */}
          <motion.p 
            className="font-bold font-['Times_New_Roman'] leading-normal not-italic relative shrink-0 text-center w-full whitespace-pre-wrap"
            style={{ 
              color: backgroundColor,
              fontSize: "16px"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {message}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
