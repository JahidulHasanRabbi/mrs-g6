"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { tokenStorage } from '@/app/api/tokenStorage';
import { N1GANG_ASSETS, N1GANG_COLORS } from './assets';

const fluid = (px) => `min(${px}px, ${((px / 475) * 100).toFixed(2)}vw)`;

const NAV_ITEMS = [
  { id: 'leaderboard', icon: N1GANG_ASSETS.nav.leaderboard, label: 'LEADERBOARD', link: '/leaderboard', width: 34, height: 40 },
  { id: 'hot', icon: N1GANG_ASSETS.nav.hot, label: 'HOT', action: 'hot', width: 34, height: 40 },
  { id: 'home', icon: N1GANG_ASSETS.nav.home, label: 'HOME', link: '/', width: 50, height: 58, isCenter: true },
  { id: 'profile', icon: N1GANG_ASSETS.nav.profile, label: 'PROFILE', link: '/profile', width: 34, height: 40 },
  { id: 'livechat', icon: N1GANG_ASSETS.nav.livechat, label: 'LIVECHAT', action: 'livechat', width: 34, height: 40 },
];

function NavItem({ item, isActive, onAction }) {
  const content = (
    <motion.div
      className="flex flex-col items-center justify-end gap-[4px]"
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
          color: isActive ? '#ffffff' : N1GANG_COLORS.gold,
          fontSize: item.isCenter ? 'clamp(8px, 2.1vw, 10px)' : 'clamp(6.5px, 1.69vw, 8px)',
        }}
      >
        {item.label}
      </p>
    </motion.div>
  );

  const wrapperClass = item.isCenter
    ? 'relative flex-1 flex items-end justify-center -translate-y-[10px]'
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

function N1gangBottomNav() {
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
        src={N1GANG_ASSETS.nav.bar}
        alt=""
        className="absolute left-[-1%] right-[-1%] top-[-8%] bottom-0 w-[102%] h-[108%] max-w-none"
      />
      <nav
        className="relative flex items-end justify-between px-[16px] h-full pb-[8px] pointer-events-auto"
        role="navigation"
        aria-label="N1gang navigation"
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

export default memo(N1gangBottomNav);
