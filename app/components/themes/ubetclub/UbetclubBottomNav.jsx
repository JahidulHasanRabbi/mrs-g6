"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { tokenStorage } from '@/app/api/tokenStorage';
import { UBET_ASSETS, UBET_COLORS } from './assets';
import { NationalDayBottomNavOverlay } from '../../phase4/NationalDayChrome';

// Sized for the 475px member column (Figma frame is 402 wide); min() keeps
// items from crowding on narrower phones — same trick as the default FooterNav.
const fluid = (px) => `min(${px}px, ${((px / 475) * 100).toFixed(2)}vw)`;

// The medallions are self-contained ornate art (icon + red-gold base) on a
// transparent field, so they drop straight onto the bar. Only the raised
// center notch is tall enough for the larger HOME crest.
const NAV_ITEMS = [
  { id: 'leaderboard', icon: UBET_ASSETS.nav.leaderboard, label: 'LEADERBOARD', link: '/leaderboard', width: 40, height: 44 },
  { id: 'hot', icon: UBET_ASSETS.nav.hot, label: 'HOT', action: 'hot', width: 40, height: 44 },
  { id: 'home', icon: UBET_ASSETS.nav.home, label: 'HOME', link: '/', width: 58, height: 62, isCenter: true },
  { id: 'profile', icon: UBET_ASSETS.nav.profile, label: 'PROFILE', link: '/profile', width: 40, height: 44 },
  { id: 'livechat', icon: UBET_ASSETS.nav.livechat, label: 'LIVECHAT', action: 'livechat', width: 40, height: 44 },
];

function NavItem({ item, isActive, onAction }) {
  const content = (
    <motion.div
      className="flex flex-col items-center justify-end gap-[3px]"
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="relative"
        style={{ width: fluid(item.width), height: fluid(item.height) }}
      >
        <Image
          src={item.icon}
          alt={item.label}
          fill
          sizes={`${item.width}px`}
          className="object-contain"
          priority={item.isCenter}
        />
      </div>
      <p
        className="font-bold text-center whitespace-nowrap"
        style={{
          fontFamily: '"Times New Roman", serif',
          color: isActive ? UBET_COLORS.cream : UBET_COLORS.gold,
          fontSize: item.isCenter ? 'clamp(8px, 2.1vw, 10px)' : 'clamp(6.5px, 1.69vw, 8px)',
        }}
      >
        {item.label}
      </p>
    </motion.div>
  );

  const wrapperClass = item.isCenter
    ? 'relative flex-1 flex items-end justify-center -translate-y-[12px]'
    : 'flex-1 flex items-end justify-center pb-[6px]';

  if (item.action) {
    return (
      <button onClick={() => onAction(item.action)} className={`${wrapperClass} cursor-pointer`} aria-label={item.label}>
        {content}
      </button>
    );
  }
  return (
    <Link href={item.link} className={`${wrapperClass} cursor-pointer`} aria-label={item.label}>
      {content}
    </Link>
  );
}

/**
 * Ubetclub bottom navigation — ornate red-gold bar with a raised center crest
 * (LEADERBOARD / HOT / HOME / PROFILE / LIVECHAT).
 */
function UbetclubBottomNav() {
  const pathname = usePathname();

  const handleAction = (actionType) => {
    if (actionType === 'livechat') {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        alert('Please log in to access live chat');
        return;
      }
      const stationUrl = tokenStorage.getStationUrl();
      if (!stationUrl) {
        alert('Station information not available');
        return;
      }
      window.open(`https://${stationUrl}/chatroom`, '_blank', 'noopener,noreferrer');
    } else if (actionType === 'hot') {
      // Hot promos live on the wallet site the member came from.
      const origin = tokenStorage.getRedirectO();
      if (origin) {
        window.location.href = `${origin.replace(/\/$/, '')}/promotion`;
      }
    }
  };

  return (
    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-[100px] z-40 pointer-events-none">
      {/* Curved bar artwork (extends slightly above for the center bump) */}
      <img
        src={UBET_ASSETS.nav.bar}
        alt=""
        className="absolute left-[-1%] right-[-1%] top-[-8%] bottom-0 w-[102%] h-[108%] max-w-none"
      />
      <NationalDayBottomNavOverlay />
      <nav
        className="relative z-10 flex items-end justify-between px-[14px] h-full pb-[8px] pointer-events-auto"
        role="navigation"
        aria-label="Ubetclub navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={item.link ? pathname === item.link : false}
            onAction={handleAction}
          />
        ))}
      </nav>
    </footer>
  );
}

export default memo(UbetclubBottomNav);
