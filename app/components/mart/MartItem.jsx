"use client";

import { formatKrCoins } from "../../api/apiOptions";
import { motion } from "framer-motion";
import { MART_ASSETS } from "./martAssets";

// Structural reasons the item itself isn't redeemable right now (as opposed
// to "insufficient_balance", which the user can still fix).
const STRUCTURAL_BLOCK_LABELS = {
  out_of_stock: "Out of Stock",
  not_yet_available: "Not Available Yet",
  no_longer_available: "No Longer Available",
};

export default function MartItem({
  image,
  title,
  originalPrice,
  discountPrice,
  coins,
  onRedeem,
  index = 0,
  isLocked = false,
  requiredTierLabel,
  blockReason = null,
}) {
  const isBlocked = !isLocked && !!blockReason;
  const structuralLabel = STRUCTURAL_BLOCK_LABELS[blockReason];
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
        style={
          isLocked
            ? { filter: "grayscale(0.85) brightness(0.55) blur(6px)" }
            : isBlocked
              ? { filter: "grayscale(0.5) brightness(0.75)" }
              : undefined
        }
      >
        <img
          alt={title}
          src={image || null}
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Lock Icon Overlay */}
      {isLocked && (
        <img
          alt="Locked"
          src={MART_ASSETS.lockIcon}
          className="absolute left-1/2 -translate-x-1/2 top-[60px] w-[55px] h-[55px] z-10"
          style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }}
        />
      )}

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

      {/* Pricing / Upgrade message */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-[175px] flex flex-col items-center gap-0 max-w-[190px] px-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1 + 0.9,
        }}
      >
        {isLocked ? (
          <p className="text-[#e94141] text-[11px] font-bold font-['Times_New_Roman'] text-center leading-[13px] px-1 whitespace-nowrap">
            Upgrade to {requiredTierLabel || "next tier"} to unlock
          </p>
        ) : structuralLabel ? (
          <p className="text-[#e94141] text-[11px] font-bold font-['Times_New_Roman'] text-center leading-[13px] px-1 whitespace-nowrap">
            {structuralLabel}
          </p>
        ) : (
          <>
            {originalPrice && originalPrice != (discountPrice || coins) && (
              <p className="text-[#e94141] text-[10px] font-bold font-['Times_New_Roman'] line-through decoration-1 truncate max-w-full leading-[12px]">
                {formatKrCoins(originalPrice)}
              </p>
            )}
            <p
              className={`text-[12px] font-bold font-['Times_New_Roman'] truncate max-w-full leading-[14px] ${
                isBlocked ? "text-[#e9af41]/60" : "text-[#e9af41]"
              }`}
            >
              {formatKrCoins(discountPrice || coins)}
            </p>
            {blockReason === "insufficient_balance" && (
              <p className="text-[#e94141] text-[11px] font-bold font-['Times_New_Roman'] text-center leading-[13px] px-1 whitespace-nowrap">
                Not enough tokens
              </p>
            )}
          </>
        )}
      </motion.div>

      {/* Click target */}
      <motion.button
        onClick={onRedeem}
        disabled={isBlocked}
        className={`absolute inset-0 w-full h-full ${
          isBlocked ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1 + 1.0,
        }}
        whileHover={!isLocked && !isBlocked ? { scale: 1.05, y: -5 } : { scale: 1.02 }}
        whileTap={!isBlocked ? { scale: 0.98 } : undefined}
        style={{ background: "transparent" }}
        aria-label={
          isLocked
            ? `${title} (locked)`
            : structuralLabel
              ? `${title} (${structuralLabel.toLowerCase()})`
              : blockReason === "insufficient_balance"
                ? `${title} (not enough tokens)`
                : `Redeem ${title}`
        }
      />
    </motion.div>
  );
}
