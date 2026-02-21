"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { VIP_DETAILS_ASSETS } from "./vipDetailsAssets";

const VIP_LEVELS = [
  { name: "Bronze", badge: VIP_DETAILS_ASSETS.badges.bronze, rotation: 16.31, top: -10, left: 11.38 },
  { name: "Silver", badge: VIP_DETAILS_ASSETS.badges.silver, rotation: 9.07, top: 23.56, left: 103.56 },
  { name: "Gold", badge: VIP_DETAILS_ASSETS.badges.gold, rotation: 0, top: 40, left: 190 },
  { name: "Platinum", badge: VIP_DETAILS_ASSETS.badges.platinum, rotation: -9.07, top: 23.56, left: 276.44 },
  { name: "Diamond", badge: VIP_DETAILS_ASSETS.badges.diamond, rotation: -16.31, top: -10, left: 368.62 },
];

export default function VipLevelChain() {
  return (
    <motion.div
      className="relative w-full h-[100px] -ml-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Chain Background */}
      <div className="absolute left-0 top-2 w-full h-[89px]">
        <Image
          alt="VIP Chain"
          src={VIP_DETAILS_ASSETS.vipChain}
          fill
          className="object-cover"
        />
      </div>

      {/* VIP Level Badges */}
      {VIP_LEVELS.map((level, index) => (
        <motion.div
          key={level.name}
          className="absolute"
          style={{
            left: `${level.left}px`,
            top: `${level.top}px`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: level.rotation }}
          animate={{ opacity: 1, scale: 1, rotate: level.rotation }}
          transition={{
            duration: 0.5,
            delay: 0.5 + index * 0.1,
            type: "spring",
            stiffness: 200,
          }}
        >
          <div className="relative w-[63px] h-[63px]">
            <Image
              alt={level.name}
              src={level.badge}
              fill
              className="object-cover"
            />
          </div>
          <p
            className="absolute left-1/2 -translate-x-1/2 top-[85px] text-center text-[#e9af41] text-[12px] font-bold font-['Times_New_Roman'] w-[41px] whitespace-nowrap"
          >
            {level.name}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
