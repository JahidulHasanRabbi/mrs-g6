"use client";

import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";
const POPUP_CLOSE_IMG = "/assets/home/popup-close.webp";

export default function RedeemModal({ isOpen, onClose, item, isRedeeming, redeemResult }) {
  if (!isOpen) return null;

  // Determine message to display
  let message = "";
  let isSuccess = false;
  
  if (redeemResult) {
    message = redeemResult.message;
    isSuccess = redeemResult.success;
  } else if (isRedeeming) {
    message = "Processing your redemption...";
  } else {
    message = `Are you sure you want to redeem ${item?.title}?`;
  }

  // Determine title color based on state
  const titleColor = isSuccess ? "#60803c" : redeemResult && !isSuccess ? "#e94141" : "#60803c";

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
        <img
          alt="Redeem Popup"
          src={MART_ASSETS.redeemPopup}
          className="w-full h-full object-contain"
        />

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute right-[20px] top-[40px] w-[50px] h-[30px]"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close"
        >
          <img
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
            className="text-[16px] font-bold font-['Times_New_Roman'] w-[250px]"
            style={{ color: titleColor }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isSuccess ? "🎁   Redemption Successful!" : redeemResult && !isSuccess ? "❌   Redemption Failed" : "🎁   Redeem Your Reward"}
          </motion.p>

          {/* Message */}
          <motion.p 
            className="text-[16px] font-bold font-['Times_New_Roman'] text-center w-[236px] leading-normal"
            style={{ color: titleColor }}
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
