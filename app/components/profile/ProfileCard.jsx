"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PROFILE_ASSETS } from "./profileAssets";

export default function ProfileCard({ 
  name = "Jhon Doe", 
  totalTokens = 100, 
  currentLevel = "Gold",
  nextLevel = "Platinum",
  progress = 61.6, // percentage
  tokensNeeded = 20000,
  avatarSrc = PROFILE_ASSETS.profileAvatar,
  onVipDetailsClick
}) {
  const router = useRouter();

  const handleVipDetailsClick = () => {
    // Navigate to personal-data page
    router.push('/vip-details');
    
    // Also call the original handler if provided
    if (onVipDetailsClick) {
      onVipDetailsClick();
    }
  };
  return (
    <motion.div
      className="relative mx-auto w-[336px] h-[224px] min-[465px]:w-[370px] min-[465px]:h-[246px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2,
      }}
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 origin-top w-[366px] h-[224px] scale-[1] min-[465px]:scale-[1.1]">
        {/* Card Background */}
        <Image
          alt="Profile Card"
          src={PROFILE_ASSETS.profileCardBg}
          fill
          className="object-cover"
        />

        {/* Avatar */}
        <motion.div
          className="absolute left-[33px] top-[27px] w-[51px] h-[50px] rounded-full overflow-hidden"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.4,
          }}
        >
          <Image alt={name} src={avatarSrc} fill className="object-cover" />
        </motion.div>

        {/* Name and Tokens */}
        <motion.div
          className="absolute left-[94px] top-[26px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-[#e9af41] text-[18px] font-bold font-['Times_New_Roman'] whitespace-nowrap">
            {name}
          </p>
          <p className="text-[#e9af41] text-[10px] font-bold font-['Times_New_Roman'] whitespace-nowrap mt-1">
            Total Token: {totalTokens}
          </p>
        </motion.div>

        {/* VIP Details Button */}
        <motion.button
          onClick={handleVipDetailsClick}
          className="absolute left-[239px] top-[37px] text-[#e9af41] font-bold font-['Times_New_Roman'] whitespace-nowrap cursor-pointer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-[10px]">VIP Details </span>
          <span className="text-[12px]">&gt;</span>
        </motion.button>

        {/* Progress Section */}
        <motion.div
          className="absolute left-[51px] top-[126px] w-[236px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {/* Progress Text */}
          <p className="text-[#e9af41] text-[12px] font-bold font-['Times_New_Roman'] mb-2">
            Get {tokensNeeded.toLocaleString()} more to go {nextLevel}
          </p>

          {/* Progress Bar Container */}
          <div className="relative w-full h-[8px] bg-[#51340c] border border-[#e9af41] rounded-[20px] shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            {/* Progress Bar Fill */}
            <motion.div
              className="absolute left-0 top-0 h-full bg-[#e9af41] rounded-[20px] shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 1,
                delay: 0.9,
                ease: "easeOut",
              }}
            />
          </div>

          {/* Level Labels */}
          <div className="flex justify-between mt-2">
            <p className="text-[#e9af41] text-[12px] font-bold font-['Times_New_Roman']">
              {currentLevel}
            </p>
            <p className="text-[#e9af41] text-[12px] font-bold font-['Times_New_Roman']">
              {nextLevel}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
