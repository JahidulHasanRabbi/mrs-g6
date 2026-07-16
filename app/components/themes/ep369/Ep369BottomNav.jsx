"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { tokenStorage } from '@/app/api/tokenStorage';
import { EP369_ASSETS } from './assets';

const fluid = (px) => `min(${px}px, ${((px / 475) * 100).toFixed(2)}vw)`;

// EP369 medallions carry their labels baked into the art (Figma hides the
// separate text nodes), so each nav item is just the ornate medallion image.
const NAV_ITEMS = [
  { id: 'leaderboard', icon: EP369_ASSETS.nav.leaderboard, label: 'Leaderboard', link: '/leaderboard', width: 56, height: 54 },
  { id: 'hot', icon: EP369_ASSETS.nav.hot, label: 'Hot', action: 'hot', width: 48, height: 54 },
  { id: 'home', icon: EP369_ASSETS.nav.home, label: 'Home', link: '/', width: 70, height: 68, isCenter: true },
  { id: 'profile', icon: EP369_ASSETS.nav.profile, label: 'Profile', link: '/profile', width: 56, height: 54 },
  { id: 'livechat', icon: EP369_ASSETS.nav.livechat, label: 'Livechat', action: 'livechat', width: 56, height: 54 },
];

function NavItem({ item, isActive, onAction }) {
  const content = (
    <motion.div
      className="flex items-end justify-center"
      whileTap={{ scale: 0.95 }}
      animate={{ scale: isActive ? 1.06 : 1 }}
      style={{
        width: fluid(item.width),
        height: fluid(item.height),
        filter: isActive ? 'drop-shadow(0 0 8px rgba(242,195,107,0.8))' : 'none',
      }}
    >
      <Image
        src={item.icon}
        alt={item.label}
        width={item.width}
        height={item.height}
        sizes={`${item.width}px`}
        className="h-full w-full object-contain"
        priority={item.isCenter}
      />
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
 * EP369 bottom navigation — dark-green ornate bar with a raised center crest
 * (Leaderboard / Hot / Home / Profile / Livechat). Medallions include labels.
 */
function Ep369BottomNav() {
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
      const origin = tokenStorage.getRedirectO();
      if (origin) {
        window.location.href = `${origin.replace(/\/$/, '')}/promotion`;
      }
    }
  };

  return (
    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-[100px] z-40 pointer-events-none">
      <img
        src={EP369_ASSETS.nav.bar}
        alt=""
        className="absolute left-[-1%] right-[-1%] top-[-8%] bottom-0 w-[102%] h-[108%] max-w-none"
      />
      <nav
        className="relative flex items-end justify-between px-[14px] h-full pb-[8px] pointer-events-auto"
        role="navigation"
        aria-label="EP369 navigation"
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

export default memo(Ep369BottomNav);
