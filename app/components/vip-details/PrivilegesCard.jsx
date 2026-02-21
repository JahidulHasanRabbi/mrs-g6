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
  return (
    <motion.div
      className="relative w-[344px] h-[396px] mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      {/* Background */}
      <div className="absolute left-0 top-0 w-[344px] h-[390px]">
        <Image
          alt="Privileges Background"
          src={VIP_DETAILS_ASSETS.privilegesBg}
          fill
          className="object-cover"
        />
      </div>

      {/* Title */}
      <motion.p
        className="absolute left-1/2 -translate-x-1/2 top-[39px] text-center text-[#e9af41] text-[32px] font-bold font-['Times_New_Roman']"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {level}'s privileges
      </motion.p>

      {/* Benefits Worth Section */}
      <div className="absolute left-[36px] top-[89px]">
        <motion.p
          className="absolute left-1/2 -translate-x-1/2 top-[2px] text-center text-[#e9af41] text-[20px] font-bold font-['Times_New_Roman']"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          6 benefits worth
        </motion.p>
        <motion.div
          className="absolute h-[30px] left-[138px] top-0 w-[32px]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1, type: "spring" }}
        >
          <Image
            alt="Star"
            src={VIP_DETAILS_ASSETS.starIcon}
            fill
            className="object-cover"
          />
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        className="absolute left-[35px] top-[129px] text-[#e9af41] text-[14px] font-bold font-['Times_New_Roman'] leading-normal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <p className="mb-0">Lorem ipsum dolor sit amet, consectetuer</p>
        <p className="mb-0">adipiecing alit. Sed do elusmod tempor</p>
        <p className="mb-0">incididunt ut labore et dolore magne alique</p>
        <p>aliquram erat volutpat.</p>
      </motion.div>

      {/* Benefits Grid */}
      <div className="absolute left-[44px] top-[210px] w-[256px]">
        {BENEFITS.map((benefit, index) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          const topOffset = row * 46;
          const leftOffset = col * 128;

          return (
            <motion.div
              key={index}
              className="absolute flex items-start gap-2"
              style={{
                top: `${topOffset}px`,
                left: `${leftOffset}px`,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
            >
              <div className="relative w-[35px] h-[33px] shrink-0">
                <Image
                  alt="Check"
                  src={benefit.icon}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-[#e9af41] text-[14px] font-bold font-['Times_New_Roman'] leading-normal whitespace-pre-line">
                {benefit.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
