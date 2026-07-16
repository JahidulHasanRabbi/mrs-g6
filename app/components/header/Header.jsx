"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PROFILE_ASSETS } from "../profile/profileAssets";
import ProfileFrame from "../profile/ProfileFrame";
import { useUser } from "../../contexts/UserContext";

/**
 * Header Component
 * Top navigation bar with hamburger menu and logo
 * Matches Figma design exactly
 */
function Header({ onMenuClick, showAnimation = false, balance = null, profilePhoto = null }) {
  const router = useRouter();
  const { selectedFrameId } = useUser();
  
  return (
    <motion.header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-[72px] z-40 bg-[#0a1a0a]/95 backdrop-blur-sm border-b-2 border-[#e9af41]/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      initial={showAnimation ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={showAnimation ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }}
    >
      <div className="relative flex items-center justify-between h-full px-4">
        {/* Hamburger Menu Button */}
        <motion.button
          onClick={onMenuClick}
          className="flex flex-col items-start gap-0 cursor-pointer"
          aria-label="Open menu"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex flex-col items-center gap-0">
            <Image
              src="/assets/images/hamburger-icon.png"
              alt="Menu"
              width={36}
              height={36}
              className="object-contain"
              style={{ width: 36, height: 36 }}
              priority
            />
            <p
              className="text-[14px] font-bold -mt-1"
              style={{
                fontFamily: '"Times New Roman", serif',
                color: "#e9af41",
                lineHeight: "normal",
              }}
            >
              Menu
            </p>
          </div>
        </motion.button>




        {/* Logo */}
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 w-[60px] h-[60px]"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {balance !== null && (
            <motion.div
              className="absolute right-[58px] top-[8px] w-[140px] h-[48px]"
              initial={showAnimation ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={showAnimation ? { duration: 0.6, delay: 0.2, ease: "easeOut" } : { duration: 0 }}
            >
              <Image
                alt="Balance Frame"
                src="/assets/mart/coin-balance.png"
                fill
                className="object-contain"
                sizes="146px"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 px-3">
                <div className="relative w-[30px] h-[34px] shrink-0">
                  <Image
                    alt="Coin"
                    src="/assets/mart/coin-icon.png"
                    fill
                    className="object-contain"
                    sizes="30px"
                  />
                </div>
                <p className="truncate text-[#f9d063] text-[14px] font-bold font-['Times_New_Roman']">
                  {balance}
                </p>
              </div>
            </motion.div>
          )}
          {/* Profile Photo Button (with VIP frame) */}
          <div className="relative w-[100px] h-auto right-[5px] top-[5px] ">
            <div className="absolute right-[28%] top-[-4px]">
              <ProfileFrame
                src={profilePhoto || PROFILE_ASSETS.profileAvatar}
                frameId={selectedFrameId}
                size={64}
                alt="Profile"
                onClick={() => router.push('/profile')}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

export default Header;
