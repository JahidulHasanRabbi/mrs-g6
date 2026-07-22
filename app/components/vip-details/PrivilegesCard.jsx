"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { VIP_DETAILS_ASSETS } from "./vipDetailsAssets";
import { useTheme } from "../../contexts/ThemeContext";
import { ACEBET_ASSETS } from "../themes/acebet77/assets";
import { UBET_ASSETS } from "../themes/ubetclub/assets";
import { EP369_ASSETS } from "../themes/ep369/assets";
import { KGAME99_ASSETS } from "../themes/kgame99/assets";

export default function PrivilegesCard({ level = "Bronze", tierData = null, tierIndex = 0, isActive = true }) {
  const { isAcebet77, isUbetclub, isEp369, isKgame99 } = useTheme();
  const bgOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  let currentBg;
  if (isAcebet77) currentBg = ACEBET_ASSETS.vip.cardFrame;
  else if (isUbetclub) currentBg = UBET_ASSETS.vip.cardFrame;
  else if (isEp369) currentBg = EP369_ASSETS.vip.cardFrame;
  else if (isKgame99) currentBg = KGAME99_ASSETS.vip.cardFrame;
  else currentBg = VIP_DETAILS_ASSETS.privilegesBg[level.toLowerCase()];

  if (!currentBg) {
    const lowerName = level.toLowerCase();
    const foundColor = bgOrder.find(color => lowerName.includes(color));

    if (foundColor) {
      currentBg = VIP_DETAILS_ASSETS.privilegesBg[foundColor];
    } else if (lowerName.includes("master")) {
      currentBg = VIP_DETAILS_ASSETS.privilegesBg.silver;
    } else {
      const bgKey = bgOrder[tierIndex % bgOrder.length];
      currentBg = VIP_DETAILS_ASSETS.privilegesBg[bgKey];
    }
  }

  const rankIconKey = (tierIndex % 9) + 1;
  const rankIcon = tierData?.level_icon || VIP_DETAILS_ASSETS.rankIcons[rankIconKey];

  const stats = [
    { label: "Lifetime Deposit", value: tierData?.lifetime_deposit_required != null ? `RM ${tierData.lifetime_deposit_required}` : "—" },
    { label: "Monthly Deposit", value: tierData?.monthly_deposit != null ? `RM ${tierData.monthly_deposit}` : "—" },
    { label: "Check-in Token", value: tierData?.check_in_token != null ? `${tierData.check_in_token}` : "—" },
    { label: "Upgrade (Free Token)", value: tierData?.upgrade_free_token != null ? `${tierData.upgrade_free_token}` : "—" },
  ];

  return (
    <div className="relative w-[344px] h-[396px] mx-auto max-w-[344px] max-[400px]:w-[292px] max-[400px]:h-[332px] max-[400px]:scale-[0.95] origin-center">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          alt={`${level} Privileges Background`}
          src={currentBg}
          fill
          // Themed shared frames stretch to fill the card exactly (like their
          // other frame usages). Default themes keep object-cover so their
          // per-tier photographic backgrounds don't distort.
          className={isAcebet77 || isUbetclub || isEp369 || isKgame99 ? "object-fill" : "object-cover"}
          priority={isActive}
          sizes="344px"
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center pt-[10px] px-[40px] pb-4 max-[400px]:pt-[6px] max-[400px]:px-[32px]">
        {/* Centered Rank Badge — overlaps the card's top frame */}
        <motion.div
          className="relative w-[150px] h-[150px] max-[400px]:w-[126px] max-[400px]:h-[126px] -mt-[18px] mb-1 max-[400px]:-mt-[14px]"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {typeof rankIcon === 'string' && rankIcon.startsWith('http') ? (
            <img
              alt={`${level} Rank Icon`}
              src={rankIcon}
              className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_14px_rgba(252,208,100,0.5)]"
            />
          ) : (
            <Image
              alt={`${level} Rank Icon`}
              src={rankIcon}
              fill
              className="object-contain drop-shadow-[0_0_14px_rgba(252,208,100,0.5)]"
              priority={isActive}
              sizes="150px"
            />
          )}
        </motion.div>

        {/* Stats list */}
        <div className="w-full flex flex-col gap-2 max-[400px]:gap-1.5 pl-2 max-[400px]:pl-0">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-start gap-2">
              <div className="relative w-[26px] h-[26px] max-[400px]:w-[22px] max-[400px]:h-[22px] shrink-0 -mt-0.5">
                <Image
                  alt=""
                  src={VIP_DETAILS_ASSETS.checkIcon}
                  fill
                  className="object-contain"
                />
              </div>
              <div
                className="text-[#fcd064] font-bold font-['Times_New_Roman'] leading-tight text-[15px] max-[400px]:text-[13px]"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.4)" }}
              >
                <p>{stat.label}:</p>
                <p>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
