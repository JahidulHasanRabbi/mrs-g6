"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SPIN_ASSETS } from "./spinAssets";

const SpinItem = ({ background, prize, position, size = "w-[114px] h-[112px]", index }) => (
  <motion.div 
    className={`absolute ${position}`}
    initial={{ opacity: 0, scale: 0, rotate: -180 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ 
      duration: 0.6, 
      delay: index * 0.1,
      ease: "easeOut"
    }}
    whileHover={{ scale: 1.05 }}
  >
    <Image
      alt=""
      src={background}
      width={114}
      height={112}
      className={`${size} object-cover pointer-events-none`}
    />
    {prize && (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.1 + 0.3,
          ease: "easeOut"
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          alt=""
          src={prize}
          width={72}
          height={69}
          className="object-cover pointer-events-none"
        />
      </motion.div>
    )}
  </motion.div>
);

export default function LuckySpinGrid() {
  const gridItems = [
    { background: SPIN_ASSETS.itemGold, position: "left-[-8px] top-[-10px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize1, position: "left-[96px] top-[-13px]", size: "w-[99px] h-[112px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[194px] top-[-10px]" },
    { background: SPIN_ASSETS.itemGreen, position: "left-[-7px] top-[88px]", size: "w-[100px] h-[112px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize2, position: "left-[196px] top-[87px]", size: "w-[101px] h-[114px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[-9px] top-[193px]" },
    { background: SPIN_ASSETS.itemGreen, prize: SPIN_ASSETS.prize3, position: "left-[96px] top-[191px]", size: "w-[100px] h-[113px]" },
    { background: SPIN_ASSETS.itemGold, position: "left-[194px] top-[194px]" },
  ];

  return (
    <motion.div 
      className="relative w-[376px] h-[348px] mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Image
        alt="Spin Grid Background"
        src={SPIN_ASSETS.background}
        fill
        className="object-cover pointer-events-none"
      />

      <div className="absolute left-[41px] top-[21px] w-[290px] h-[298px]">
        {gridItems.map((item, index) => (
          <SpinItem key={index} index={index} {...item} />
        ))}

        <motion.div 
          className="absolute left-[77px] top-[73px] w-[143px] h-[143px] cursor-pointer"
          initial={{ opacity: 0, scale: 0, rotate: 360 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 1.0,
            ease: "easeOut"
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            alt="Spin Now Button"
            src={SPIN_ASSETS.centerButton}
            width={143}
            height={143}
            className="object-cover"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
