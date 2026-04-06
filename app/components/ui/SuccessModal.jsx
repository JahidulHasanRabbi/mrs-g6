"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const POPUP_CLOSE_IMG = "/assets/home/popup-close.png";

export default function SuccessModal({
  isOpen,
  onClose,
  title = "100% Done — Reward Unlocked",
  message = "Thanks for completing your profile. 10 Free Coins added.",
  backgroundColor = "rgba(96, 128, 60, 1)",
  popupBg = "/assets/personal-data/success-popup-bg.png",
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        className="relative h-[274px] w-[311px] max-w-full"
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          alt="Success Popup"
          src={popupBg}
          fill
          className="object-contain"
          sizes="311px"
        />

        <motion.button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-[28px] top-[48px] flex h-[30px] w-[30px] items-center justify-center"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
        >
          <Image
            src={POPUP_CLOSE_IMG}
            alt=""
            width={30}
            height={30}
            className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
          />
        </motion.button>

        <div className="absolute left-1/2 top-1/2 flex h-[144px] w-[228px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-6">
          <motion.p
            id="success-modal-title"
            className="w-full whitespace-pre-wrap text-center text-[16px] font-bold leading-[1.1]"
            style={{
              color: backgroundColor,
              fontFamily: '"Times New Roman", serif',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {title}
          </motion.p>

          <motion.div
            className="relative max-h-[80px] w-full overflow-y-auto whitespace-pre-wrap p-1 text-center text-[16px] font-bold leading-normal"
            style={{
              color: backgroundColor,
              fontFamily: '"Times New Roman", serif',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {message}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}