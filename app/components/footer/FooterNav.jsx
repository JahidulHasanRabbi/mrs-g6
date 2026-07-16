"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { FOOTER_CONFIG, FOOTER_THEME } from './footerConfig';

/**
 * FooterNavItem Component
 * Individual footer navigation item with icon and label
 */
// Footer items are sized in px for the 475-px design width. On narrower
// phones those fixed sizes crowd the 5 items + labels (see the cramped
// "LEADERBOARD"/"LIVECHAT" labels on a 320-wide device). `fluid` expresses
// each px size as `min(Npx, (N/475)vw)`: identical at ≥475, shrinks below.
const fluid = (px) => `min(${px}px, ${((px / 475) * 100).toFixed(2)}vw)`;

const FooterNavItem = memo(({ item, isActive, onAction }) => {
  const { icon, label, link, width, height, isCenter, action } = item;

  const handleClick = async (e) => {
    if (action && onAction) {
      e.preventDefault();
      await onAction(action);
    }
  };
  
  const itemContent = (
    <motion.div
      className={`flex flex-col items-center justify-center ${
        isCenter ? 'absolute -top-[35px] left-1/2 -translate-x-1/2' : 'gap-1'
      }`}
      whileHover={{
        scale: 1.1,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: fluid(width), height: fluid(height) }}
        whileHover={!isCenter ? {
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.5 }
        } : {}}
      >
        <Image
          src={icon}
          alt={label}
          fill
          sizes={fluid(width)}
          className="object-contain"
          priority={isCenter}
        />
      </motion.div>
      <motion.p
        className="font-bold text-center whitespace-nowrap"
        style={{
          fontFamily: '"Times New Roman", serif',
          color: isActive ? FOOTER_THEME.textColorActive : FOOTER_THEME.textColor,
          // Fluid on the 475 basis so long labels ("LEADERBOARD") don't
          // crowd their neighbours on narrow phones.
          fontSize: isCenter ? 'clamp(8px, 2.1vw, 10px)' : 'clamp(6.5px, 1.69vw, 8px)',
        }}
        whileHover={{
          scale: 1.05,
          color: FOOTER_THEME.textColorActive,
        }}
      >
        {label}
      </motion.p>
    </motion.div>
  );

  if (isCenter) {
    return (
      <div className="relative flex-1 flex items-center justify-center">
        {item.disabled ? (
          <div className="cursor-not-allowed opacity-50" aria-label={label}>
            {itemContent}
          </div>
        ) : action ? (
          <button
            onClick={handleClick}
            className="cursor-pointer"
            aria-label={label}
          >
            {itemContent}
          </button>
        ) : (
          <Link
            href={link}
            className="cursor-pointer"
            aria-label={label}
          >
            {itemContent}
          </Link>
        )}
      </div>
    );
  }

  if (item.disabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pt-4 cursor-not-allowed opacity-50" aria-label={label}>
        {itemContent}
      </div>
    );
  }

  if (action) {
    return (
      <button
        onClick={handleClick}
        className="flex-1 flex flex-col items-center justify-center pt-4 cursor-pointer hover:opacity-80 transition-opacity"
        aria-label={label}
      >
        {itemContent}
      </button>
    );
  }

  return (
    <Link
      href={link}
      className="flex-1 flex flex-col items-center justify-center pt-4 cursor-pointer hover:opacity-80 transition-opacity"
      aria-label={label}
    >
      {itemContent}
    </Link>
  );
});

FooterNavItem.displayName = 'FooterNavItem';

/**
 * FooterNav Component
 * Bottom navigation bar with curved design
 */
function FooterNav({ showAnimation = false }) {
  const pathname = usePathname();

  const handleAction = async (actionType) => {
    if (actionType === "livechat") {
      try {
        const { tokenStorage } = await import("@/app/api/tokenStorage");
        
        const memberUuid = tokenStorage.getMemberUuid();
        if (!memberUuid) {
          alert("Please log in to access live chat");
          return;
        }

        // Get the station URL from the login response (e.g., "n1gang.net")
        const stationUrl = tokenStorage.getStationUrl();
        
        if (!stationUrl) {
          alert("Station information not available");
          return;
        }

        // Construct chatroom URL with https:// protocol
        // stationUrl is just the domain (e.g., "n1gang.net")
        const chatUrl = `https://${stationUrl}/chatroom`;
        
        // Open in new tab
        window.open(chatUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error("Error opening live chat:", error);
        alert("Failed to open live chat. Please try again.");
      }
    }
  };

  return (
    <motion.footer
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-[100px] z-40"
      initial={showAnimation ? { y: 100, opacity: 0 } : { y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={showAnimation ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }}
    >
      {/* Background with curved top and center bump */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 475 100"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0,40 Q 0,25 20,25 L 170,25 Q 185,25 195,15 Q 210,0 237.5,0 Q 265,0 280,15 Q 290,25 305,25 L 455,25 Q 475,25 475,40 L 475,100 L 0,100 Z"
          fill={FOOTER_THEME.background}
          stroke={FOOTER_THEME.borderColor}
          strokeWidth="3"
        />
      </svg>

      {/* Navigation Items */}
      <nav
        className="relative flex items-center justify-between px-4 h-full"
        role="navigation"
        aria-label="Footer navigation"
      >
        {FOOTER_CONFIG.navItems.map((item) => {
          const isActive = pathname === item.link;
          return <FooterNavItem key={item.id} item={item} isActive={isActive} onAction={handleAction} />;
        })}
      </nav>
    </motion.footer>
  );
}

export default memo(FooterNav);
