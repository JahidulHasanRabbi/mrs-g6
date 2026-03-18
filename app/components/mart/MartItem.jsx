"use client";

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
      <img
        alt="Item Card"
        src={MART_ASSETS.itemCard}
        className="w-full h-full object-cover"
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
        className="absolute left-1/2 -translate-x-1/2 top-[175px] flex flex-col items-center gap-0 max-w-[190px] px-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1 + 0.9,
        }}
      >
        {/* Original Price with Strikethrough */}
        {originalPrice && originalPrice != (discountPrice || coins) && (
          <p className="text-[#e94141] text-[10px] font-bold font-['Times_New_Roman'] line-through decoration-1 truncate max-w-full leading-[12px]">
            {typeof originalPrice === 'number' ? originalPrice.toLocaleString() : originalPrice} Pagcor Coins
          </p>
        )}
        
        {/* Discount Price */}
        <p className="text-[#e9af41] text-[12px] font-bold font-['Times_New_Roman'] truncate max-w-full leading-[14px]">
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
