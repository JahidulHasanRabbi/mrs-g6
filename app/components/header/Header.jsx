"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PROFILE_ASSETS } from "../profile/profileAssets";
import ProfileFrame from "../profile/ProfileFrame";
import { useUser } from "../../contexts/UserContext";
import HeaderBalances from "./HeaderBalances";

/**
 * Header Component
 * Top navigation bar with hamburger menu and logo
 * Matches Figma design exactly
 */
function Header({
  onMenuClick,
  showAnimation = false,
  balance = null,
  battlePoints = null,
  profilePhoto = null,
}) {
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
              src="/assets/images/hamburger-icon.webp"
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




        {/* Right-side account controls */}
        <div
          className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center"
        >
          {balance !== null && (
            <motion.div
              initial={showAnimation ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={showAnimation ? { duration: 0.6, delay: 0.2, ease: "easeOut" } : { duration: 0 }}
            >
              <HeaderBalances battlePoints={battlePoints} balance={balance} />
            </motion.div>
          )}
          {balance === null && (
            <motion.div
              className="relative h-[60px] w-[60px]"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="absolute -top-[2px] right-0">
                <ProfileFrame
                  src={profilePhoto || PROFILE_ASSETS.profileAvatar}
                  frameId={selectedFrameId}
                  size={64}
                  alt="Profile"
                  onClick={() => router.push('/profile')}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
