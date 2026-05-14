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
  actions = null,
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
          // z-20 so the X sits above the centred text/action content div,
          // which otherwise covers most of the X's hit area and silently
          // swallows the click.
          className="absolute right-[28px] top-[48px] z-20 flex h-[34px] w-[34px] items-center justify-center"
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

        <div
          className={`absolute left-1/2 top-1/2 flex w-[228px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center ${
            actions && actions.length > 0 ? "h-[170px] gap-3" : "h-[144px] gap-6"
          }`}
        >
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
            className={`relative w-full overflow-y-auto whitespace-pre-wrap p-1 text-center text-[16px] font-bold leading-normal ${
              actions && actions.length > 0 ? "max-h-[56px]" : "max-h-[80px]"
            }`}
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

          {actions && actions.length > 0 && (
            <motion.div
              className="flex w-full justify-center gap-2 pt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              {actions.map((action, i) => {
                const isSecondary = action.variant === "secondary";
                return (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={action.onClick}
                    className="flex-1 max-w-[120px] rounded-full px-3 py-2 text-[12px] font-bold text-white whitespace-nowrap shadow-[0_3px_6px_rgba(0,0,0,0.25)] ring-1 ring-black/10"
                    style={{
                      background: isSecondary
                        ? "linear-gradient(180deg, #6b3a14 0%, #3d1a02 100%)"
                        : "linear-gradient(180deg, #7da348 0%, #4d7530 100%)",
                      fontFamily: '"Times New Roman", serif',
                      textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                    }}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {action.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}