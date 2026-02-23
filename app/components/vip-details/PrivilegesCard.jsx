"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { VIP_DETAILS_ASSETS } from "./vipDetailsAssets";

const BENEFITS = [
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Weekly Bonus", col: 1 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Faster\nWithdrawals", col: 2 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Exclusive\naccess", col: 1 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Birthday Gifts", col: 2 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Higher Limits", col: 1 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Priority\nSupport", col: 2 },
];


export default function PrivilegesCard({ level = "Bronze" }) {
  const currentBg = VIP_DETAILS_ASSETS.privilegesBg[level.toLowerCase()] || VIP_DETAILS_ASSETS.privilegesBg.bronze;

  return (
    <motion.div
      key={level} // Re-animate on level change
      className="relative w-[344px] h-[396px] mx-auto max-w-[344px] max-[375px]:scale-[0.85] max-[375px]:origin-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background */}
      <div className="absolute left-0 top-0 w-[344px] h-[390px] max-[375px]:w-[292px] max-[375px]:h-[332px]">
        <Image
          alt={`${level} Privileges Background`}
          src={currentBg}
          fill
          className="object-cover"
        />
      </div>

      {/* Title */}
      <motion.p
        className="absolute left-[38px] top-[39px] text-center text-[#fcd064] text-3xl font-bold font-['Times_New_Roman'] max-[375px]:text-2xl max-[375px]:left-[32px] max-[375px]:top-[33px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {level}'s privileges
      </motion.p>

      {/* Benefits Worth Section */}
      <div className="absolute left-[38px] top-[81px] flex items-center gap-2 max-[375px]:left-[32px] max-[375px]:top-[69px] max-[375px]:gap-1">
        <motion.p
          className="text-[#fcd064] text-[20px] font-bold font-['Times_New_Roman'] max-[375px]:text-[17px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          6 benefits worth
        </motion.p>
        <motion.div
          className="relative h-[30px] w-[32px] max-[375px]:h-[25px] max-[375px]:w-[27px]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1, type: "spring" }}
        >
          <Image
            alt="Star"
            src={VIP_DETAILS_ASSETS.starIcon}
            fill
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        className="absolute left-[38px] top-[122px] text-[#fcd064] text-[14px] font-bold font-['Times_New_Roman'] leading-[1.2] max-w-[270px] max-[375px]:left-[32px] max-[375px]:top-[104px] max-[375px]:text-[12px] max-[375px]:max-w-[230px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <p>Lorem ipsum dolor sit amet, consectetuer adipiecing alit. Sed do elusmod tempor incididunt ut labore et dolore magne alique aliquram erat volutpat.</p>
      </motion.div>

      {/* Benefits Grid */}
      <div className="absolute left-[40px] top-[200px] w-[370px] max-[375px]:left-[34px] max-[375px]:top-[170px] max-[375px]:w-[315px]">
        {BENEFITS.map((benefit, index) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 375;
          const topOffset = row * (isSmallScreen ? 47 : 55);
          const leftOffset = col * (isSmallScreen ? 115 : 135);

          return (
            <motion.div
              key={index}
              className="absolute flex items-center "
              style={{
                top: `${topOffset}px`,
                left: `${leftOffset}px`,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
            >
              <div className="relative w-[35px] h-[33px] shrink-0 max-[375px]:w-[30px] max-[375px]:h-[28px]">
                <Image
                  alt="Check"
                  src={benefit.icon}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-[#fcd064] text-[14px] font-bold font-['Times_New_Roman'] leading-tight whitespace-pre-line max-[375px]:text-[12px]">
                {benefit.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
