"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { VIP_DETAILS_ASSETS } from "./vipDetailsAssets";

const DEFAULT_BENEFITS = [
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Upgrade Bonus\n500.00", col: 1 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Birthday Bonus\n200.00", col: 2 },
  { icon: VIP_DETAILS_ASSETS.checkIcon, text: "Monthly Loyalty\n100.00", col: 1 },
];


export default function PrivilegesCard({ level = "Bronze", tierData = null }) {
  const currentBg = VIP_DETAILS_ASSETS.privilegesBg[level.toLowerCase()] || VIP_DETAILS_ASSETS.privilegesBg.bronze;
  const titleText = `${level}'s privileges`;
  const isLongTitle = titleText.length > 20;
  const isVeryLongTitle = titleText.length > 24;

  const titleTop = isVeryLongTitle
    ? "top-[30px] max-[375px]:top-[26px]"
    : isLongTitle
      ? "top-[34px] max-[375px]:top-[29px]"
      : "top-[39px] max-[375px]:top-[33px]";
  const titleSize = isVeryLongTitle
    ? "text-[24px] max-[375px]:text-[18px] leading-tight"
    : isLongTitle
      ? "text-[27px] max-[375px]:text-[21px] leading-tight"
      : "text-3xl max-[375px]:text-2xl";
  const benefitsTop = isLongTitle ? "top-[95px] max-[375px]:top-[84px]" : "top-[81px] max-[375px]:top-[69px]";
  const descriptionTop = isLongTitle ? "top-[136px] max-[375px]:top-[118px]" : "top-[122px] max-[375px]:top-[104px]";
  const gridTop = isLongTitle ? "top-[212px] max-[375px]:top-[184px]" : "top-[200px] max-[375px]:top-[170px]";

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

      {/* Title */}
      <motion.p
        className={`absolute left-1/2 -translate-x-1/2 w-[262px] max-[375px]:w-[225px] text-start text-[#fcd064] font-bold font-['Times_New_Roman'] ${titleTop} ${titleSize}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {titleText}
      </motion.p>

      {/* Benefits Worth Section */}
      <div className={`absolute left-[38px] flex items-center gap-2 max-[375px]:left-[32px] max-[375px]:gap-1 ${benefitsTop}`}>
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
        className={`absolute left-[38px] text-[#fcd064] text-[14px] font-bold font-['Times_New_Roman'] leading-[1.2] max-w-[270px] max-[375px]:left-[32px] max-[375px]:text-[12px] max-[375px]:max-w-[230px] ${descriptionTop}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <p>{description}</p>
      </motion.div>

      {/* Benefits Grid */}
      <div className={`absolute left-[40px] w-[275px] max-[375px]:left-[34px] max-[375px]:w-[235px] ${gridTop}`}>
        {benefits.map((benefit, index) => {
          const isLastOddItem = benefits.length % 2 === 1 && index === benefits.length - 1;
          const isMonthlyLoyalty = benefit.text.includes("Monthly Loyalty");
          const benefitText = isMonthlyLoyalty ? benefit.text.replace("\n", " ") : benefit.text;

          return (
            <motion.div
              key={index}
              className={`inline-flex w-1/2 items-center pb-6 ${
                isLastOddItem ? "ml-[11%] max-[375px]:ml-[22%]" : ""
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
            >
              <div className="relative w-[35px] h-[34px] shrink-0 max-[375px]:w-[30px] max-[375px]:h-[28px] ">
                <Image
                  alt="Check"
                  src={benefit.icon}
                  fill
                  className="object-contain "
                />
              </div>
              <p className={`text-[#fcd064] text-[14px] font-bold font-['Times_New_Roman'] leading-tight pl-1 max-[375px]:text-[12px] ${isMonthlyLoyalty ? "whitespace-nowrap" : "whitespace-pre-line"}`}>
                {benefitText}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
