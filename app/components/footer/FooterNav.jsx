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
const FooterNavItem = memo(({ item, isActive }) => {
  const { icon, label, link, width, height, isCenter } = item;
  
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
        className="relative"
        style={{ width: `${width}px`, height: `${height}px` }}
        whileHover={!isCenter ? {
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.5 }
        } : {}}
      >
        <Image
          src={icon}
          alt={label}
          width={width}
          height={height}
          className="object-contain"
          priority={isCenter}
        />
      </motion.div>
      <motion.p
        className="font-bold text-center whitespace-nowrap"
        style={{
          fontFamily: '"Times New Roman", serif',
          color: isActive ? FOOTER_THEME.textColorActive : FOOTER_THEME.textColor,
          fontSize: isCenter ? '10px' : '8px',
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
        <Link
          href={link}
          className="cursor-pointer"
          aria-label={label}
        >
          {itemContent}
        </Link>
      </div>
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

  // Debug: Log to see if animation prop is working
  console.log('FooterNav showAnimation:', showAnimation);

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
          return <FooterNavItem key={item.id} item={item} isActive={isActive} />;
        })}
      </nav>
    </motion.footer>
  );
}

export default memo(FooterNav);
