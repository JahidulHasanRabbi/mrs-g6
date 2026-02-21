"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { VIP_DETAILS_ASSETS } from "./vipDetailsAssets";

const VIP_LEVELS = [
  { name: "Bronze", badge: VIP_DETAILS_ASSETS.badges.bronze, rotation: 16.31, top: 4, left: 36 },
  { name: "Silver", badge: VIP_DETAILS_ASSETS.badges.silver, rotation: 10.1, top: 22, left: 114 },
  { name: "Gold", badge: VIP_DETAILS_ASSETS.badges.gold, rotation: 0, top: 38, left: 204 },
  { name: "Platinum", badge: VIP_DETAILS_ASSETS.badges.platinum, rotation: -10, top: 22, left: 294 },
  { name: "Diamond", badge: VIP_DETAILS_ASSETS.badges.diamond, rotation: -20, top: 4, left: 372 },
];

export default function VipLevelChain({ selectedLevel, onLevelSelect }) {
  return (
    <div className="relative w-full h-[140px] flex justify-center items-center overflow-hidden">
      <motion.div
        className="relative w-[418px] h-[120px] shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Chain Background */}
        <div className="absolute inset-0">
          <Image
            alt="VIP Chain"
            src={VIP_DETAILS_ASSETS.vipChain}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* VIP Level Badges */}
        {VIP_LEVELS.map((level, index) => {
          const isSelected = selectedLevel === level.name;
          const size = isSelected ? 72 : 52;
          const topPos = isSelected ? level.top - 10 : level.top;

          return (
            <motion.div
              key={level.name}
              className="absolute cursor-pointer flex flex-col items-center -translate-x-1/2"
              style={{
                left: `${level.left}px`,
                top: `${topPos}px`,
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={() => onLevelSelect(level.name)}
              initial={{ opacity: 0, scale: 0, rotate: level.rotation }}
              animate={{ 
                opacity: 1, 
                scale: isSelected ? 1.2 : 1, 
                rotate: level.rotation 
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
                  className={`object-contain transition-all duration-300 ${!isSelected ? 'grayscale-[0.4] opacity-80' : ''}`}
                />
              </div>
              <p
                className={`text-center text-[#e9af41] text-[12px] font-bold font-['Times_New_Roman'] mt-2 transition-all ${isSelected ? 'scale-110' : ''}`}
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
