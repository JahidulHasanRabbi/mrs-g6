"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";
const POPUP_CLOSE_IMG = "/assets/home/popup-close.png";

export default function RedeemModal({ isOpen, onClose, item }) {
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
          alt="Redeem Popup"
          src={MART_ASSETS.redeemPopup}
          fill
          className="object-contain"
        />

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute right-[20px] top-[40px] w-[50px] h-[30px]"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close"
        >
          <Image
            src={POPUP_CLOSE_IMG}
            alt=""
            width={30}
            height={30}
            className="h-full w-full object-contain"
          />
        </motion.button>

        {/* Content */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-center w-[228px]">
          {/* Title */}
          <motion.p 
            className="text-[#60803c] text-[16px] font-bold font-['Times_New_Roman'] w-[250px]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            🎁   Redeem Your Reward
          </motion.p>

          {/* Message */}
          <motion.p 
            className="text-[#60803c] text-[16px] font-bold font-['Times_New_Roman'] text-center w-[236px] leading-normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Congratulations! You've checked in for
            <br />
            today and earned +1 Coin & +1 bonus points!
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
