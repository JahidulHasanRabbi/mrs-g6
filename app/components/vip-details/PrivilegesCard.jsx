"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { VIP_DETAILS_ASSETS } from "./vipDetailsAssets";

const DEFAULT_BENEFITS = [
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Upgrade Bonus\n500.00", col: 1 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Birthday Bonus\n200.00", col: 2 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Monthly Loyalty\n100.00", col: 1 },
];


export default function PrivilegesCard({ level = "Bronze", tierData = null, tierIndex = 0 }) {
  const bgOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  let currentBg = VIP_DETAILS_ASSETS.privilegesBg[level.toLowerCase()];

  if (!currentBg) {
    // Check if the level name contains any of the known colors
    const lowerName = level.toLowerCase();
    const foundColor = bgOrder.find(color => lowerName.includes(color));

    if (foundColor) {
      currentBg = VIP_DETAILS_ASSETS.privilegesBg[foundColor];
    } else {
      // Rotate based on index if no specific match
      const bgKey = bgOrder[tierIndex % bgOrder.length];
      currentBg = VIP_DETAILS_ASSETS.privilegesBg[bgKey];
    }
  }

  const titleText = `${level}'s privileges`;
  // Using flexbox-based positioning for responsive spacing

  // Build benefits from API data if available
  const benefits = tierData ? [
    { icon: VIP_DETAILS_ASSETS.checkIcon, text: `Upgrade Bonus\n${tierData.upgrade_bonus}`, col: 1 },
    { icon: VIP_DETAILS_ASSETS.checkIcon, text: `Birthday Bonus\n${tierData.birthday_bonus}`, col: 1 },
    { icon: VIP_DETAILS_ASSETS.checkIcon, text: `Monthly Loyalty\n${tierData.monthly_loyalty_bonus}`, col: 2 },
  ] : DEFAULT_BENEFITS;

  // Format deposit requirements for description
  const description = tierData
    ? `Lifetime deposit required: ${tierData.lifetime_deposit_required}. Monthly deposit: ${tierData.monthly_deposit}. Enjoy exclusive benefits and rewards tailored to your VIP status.`
    : "Lorem ipsum dolor sit amet, consectetuer adipiecing alit. Sed do elusmod tempor incididunt ut labore et dolore magne alique aliquram erat volutpat.";

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

      {/* Content Container (Flexbox for natural flow) */}
      <div className="absolute inset-0 pt-[38px] px-[36px] pb-4 max-[375px]:pt-[31px] max-[375px]:px-[32px] flex flex-col items-start w-[344px] max-[375px]:w-[292px]">
        {/* Title */}
        <motion.p
          className={`w-full text-center text-[#fcd064] font-bold font-['Times_New_Roman'] leading-tight mb-3 max-[375px]:mb-2.5 ${titleText.length > 22
            ? "text-[23px] max-[375px]:text-[19px]"
            : "text-[28px] max-[375px]:text-[24px]"
            }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {titleText}
        </motion.p>

        {/* Benefits Worth Section */}
        <div className="flex items-center gap-2 max-[375px]:gap-1 mb-2 max-[375px]:mb-1.5 pl-1 max-[375px]:pl-0">
          <motion.p
            className="text-[#fcd064] text-[20px] font-bold font-['Times_New_Roman'] max-[375px]:text-[17px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            {benefits.length} benefits worth
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
          className="text-[#fcd064] text-[14px] font-bold font-['Times_New_Roman'] leading-tight max-w-[265px] max-[375px]:text-[12px] max-[375px]:max-w-[225px] mb-5 max-[375px]:mb-4 pl-1 max-[375px]:pl-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <p>{description}</p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="flex flex-wrap w-[275px] max-[375px]:w-[230px] pl-[2px] max-[375px]:pl-0">
          {benefits.map((benefit, index) => {
            const isLastOddItem = benefits.length % 2 === 1 && index === benefits.length - 1;
            const isMonthlyLoyalty = benefit.text.includes("Monthly Loyalty");
            const benefitText = isMonthlyLoyalty ? benefit.text.replace("\n", " ") : benefit.text;

            return (
              <motion.div
                key={index}
                className={`inline-flex w-1/2 items-start pb-5 max-[375px]:pb-4 ${isLastOddItem ? "ml-[25%]" : ""
                  }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
              >
                <div className={`relative w-[35px] h-[34px] shrink-0 max-[375px]:w-[30px] max-[375px]:h-[28px] -mt-1 ${isMonthlyLoyalty ? "ml-[-30px]" : ""}`}>
                  <Image
                    alt="Check"
                    src={benefit.icon}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className={`text-[#fcd064] text-[14px] font-bold font-['Times_New_Roman'] leading-tight pl-1.5 max-[375px]:text-[12px] max-[375px]:pl-1 w-[220px] ${isMonthlyLoyalty ? "whitespace-nowrap " : "whitespace-pre-line"}`}>
                  {benefitText}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
