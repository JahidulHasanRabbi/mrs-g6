"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";

export default function MartItem({ image, title, originalPrice, discountPrice, coins, onRedeem, index = 0 }) {
  return (
    <motion.div 
      className="relative w-[223px] h-[270px] mb-4"
      initial={{ opacity: 0, scale: 0.3, y: -100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.1 + 0.5,
      }}
    >
      {/* Card Background */}
      <Image
        alt="Item Card"
        src={MART_ASSETS.itemCard}
        fill
        className="object-cover"
      />

      {/* Product Image */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 top-[45px] w-[85px] h-[85px]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1 + 0.7,
          ease: "easeOut",
        }}
      >
        <img
          alt={title}
          src={image || null}
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Title */}
      <motion.p 
        className="absolute left-1/2 -translate-x-1/2 top-[150px] text-[#e9af41] text-[16px] font-bold font-['Times_New_Roman'] text-center whitespace-nowrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1 + 0.8,
        }}
      >
        {title}
      </motion.p>

      {/* Pricing Section */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-[169px] flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1 + 0.9,
        }}
      >
        {/* Original Price with Strikethrough */}
        {originalPrice && (
          <p className="text-[#e94141] text-[11px] font-bold font-['Times_New_Roman'] line-through decoration-2 whitespace-nowrap">
            {typeof originalPrice === 'number' ? originalPrice.toLocaleString() : originalPrice} Pagcor Coins
          </p>
        )}
        
        {/* Discount Price */}
        <p className="text-[#e9af41] -mt-2 text-[13px] font-bold font-['Times_New_Roman'] whitespace-nowrap">
          {typeof (discountPrice || coins) === 'number' ? (discountPrice || coins).toLocaleString() : (discountPrice || coins)} Pagcor Coins
        </p>
      </motion.div>

      {/* Invisible Redeem Button - covers entire card */}
      <motion.button
        onClick={onRedeem}
        className="absolute inset-0 w-full h-full cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1 + 1.0,
        }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        style={{ background: 'transparent' }}
        aria-label={`Redeem ${title}`}
      />
    </motion.div>
  );
}
