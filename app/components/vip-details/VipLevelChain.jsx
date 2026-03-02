"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { VIP_DETAILS_ASSETS } from "./vipDetailsAssets";

const DEFAULT_VIP_LEVELS = [
  {
    name: "Bronze",
    badge: VIP_DETAILS_ASSETS.badges.bronze,
    rotation: 16.31,
    top: 10,
    left: 30,
    topSm: 20,
    leftSm: 55,
  },
  {
    name: "Silver",
    badge: VIP_DETAILS_ASSETS.badges.silver,
    rotation: 10.1,
    top: 27,
    left: 120,
    topSm: 34,
    leftSm: 120,
  },
  {
    name: "Gold",
    badge: VIP_DETAILS_ASSETS.badges.gold,
    rotation: 0,
    top: 38,
    left: 210,
    topSm: 44,
    leftSm: 205,
  },
  {
    name: "Platinum",
    badge: VIP_DETAILS_ASSETS.badges.platinum,
    rotation: -5,
    top: 30,
    left: 300,
    topSm: 40,
    leftSm: 285,
  },
  {
    name: "Diamond",
    badge: VIP_DETAILS_ASSETS.badges.diamond,
    rotation: -15,
    top: 8,
    left: 390,
    topSm: 22,
    leftSm: 350,
  },
];

// Map API tier names to badge assets
function getBadgeForTier(tierName) {
  const lowerName = tierName.toLowerCase();
  
  if (lowerName.includes('bronze')) return VIP_DETAILS_ASSETS.badges.bronze;
  if (lowerName.includes('silver')) return VIP_DETAILS_ASSETS.badges.silver;
  if (lowerName.includes('gold')) return VIP_DETAILS_ASSETS.badges.gold;
  if (lowerName.includes('platinum')) return VIP_DETAILS_ASSETS.badges.platinum;
  if (lowerName.includes('diamond')) return VIP_DETAILS_ASSETS.badges.diamond;
  
  // Default to bronze if no match
  return VIP_DETAILS_ASSETS.badges.bronze;
}

export default function VipLevelChain({ selectedLevel, onLevelSelect, vipTiers = [] }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsSmallScreen(window.innerWidth <= 400);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Use API tiers if available, otherwise fall back to default
  const displayLevels = vipTiers.length > 0 
    ? vipTiers.map((tier, index) => ({
        name: tier.name,
        badge: getBadgeForTier(tier.name),
        rotation: DEFAULT_VIP_LEVELS[index]?.rotation || 0,
        top: DEFAULT_VIP_LEVELS[index]?.top || 10,
        left: DEFAULT_VIP_LEVELS[index]?.left || 30 + (index * 90),
        topSm: DEFAULT_VIP_LEVELS[index]?.topSm || 20,
        leftSm: DEFAULT_VIP_LEVELS[index]?.leftSm || 55 + (index * 65),
      }))
    : DEFAULT_VIP_LEVELS;

  return (
    <div className="relative w-full h-[120px] flex justify-center items-center">
      <motion.div
        className="relative w-[418px] h-[120px] shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Chain Background */}
        <div className="absolute w-[468px] h-[120px] left-[-27px]">
          <Image
            alt="VIP Chain"
            src={VIP_DETAILS_ASSETS.vipChain}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* VIP Level Badges */}
        {displayLevels.map((level, index) => {
          const isSelected = selectedLevel === level.name;
          const size = isSelected ? (isSmallScreen ? 51 : 60) : (isSmallScreen ? 36 : 48);
          const baseTop = isSmallScreen ? level.topSm : level.top;
          const baseLeft = isSmallScreen ? level.leftSm : level.left;
          const topPos = isSelected ? baseTop - 9 : baseTop;

          return (
            <motion.div
              key={level.name}
              className="absolute cursor-pointer flex flex-col items-center -translate-x-1/2"
              style={{
                left: `${baseLeft}px`,
                top: `${topPos}px`,
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={() => onLevelSelect(level.name)}
              initial={{ opacity: 0, scale: 0, rotate: level.rotation }}
              animate={{
                opacity: 1,
                scale: isSelected ? 1.2 : 1,
                rotate: level.rotation,
              }}
              whileHover={{ scale: isSelected ? 1.25 : 1.1 }}
              transition={{
                duration: 0.5,
                delay: 0.5 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
            >
              <div
                className="relative transition-all duration-300"
                style={{ width: `${size}px`, height: `${size}px` }}
              >
                <Image
                  alt={level.name}
                  src={level.badge}
                  fill
                  className={`object-contain transition-all duration-300 ${!isSelected ? "grayscale-[0.7] opacity-90" : ""}`}
                />
              </div>
              <p
                className={`text-center text-[#e9af41] text-[12px] font-bold font-['Times_New_Roman'] mt-2 transition-all ${isSelected ? "scale-110" : ""}`}
              >
                {level.name}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
