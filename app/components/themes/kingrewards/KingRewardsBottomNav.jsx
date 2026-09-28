"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { tokenStorage } from '@/app/api/tokenStorage';
import { KR_ASSETS, KR_SURFACES } from './assets';
import { GoldText } from './KrUi';
import { NationalDayBottomNavOverlay } from '../../phase4/NationalDayChrome';

const NAV_ITEMS = [
  { id: 'leaderboard', icon: KR_ASSETS.nav.leaderboard, label: 'LEADERBOARDS', link: '/leaderboard' },
  { id: 'hot', icon: KR_ASSETS.nav.hot, label: 'HOT', action: 'hot' },
  { id: 'home', icon: KR_ASSETS.nav.home, label: 'HOME', link: '/' },
  { id: 'profile', icon: KR_ASSETS.nav.profile, label: 'PROFILE', link: '/profile', also: ['/vip', '/personal-data'] },
  { id: 'livechat', icon: KR_ASSETS.nav.livechat, label: 'CHAT', action: 'livechat' },
];

function NavItem({ item, isActive, onAction }) {
  const content = (
    <motion.div
      className="relative flex h-full w-[clamp(52px,16.5vw,64px)] flex-col items-center justify-center gap-1 rounded-[16px]"
      style={isActive ? { background: 'rgba(255,255,255,0.2)', boxShadow: 'inset -2px 8px 8px rgba(165,196,255,0.25)' } : undefined}
      whileTap={{ scale: 0.95 }}
    >
      <img src={item.icon} alt="" className="size-[40px] object-contain" draggable={false} />
      <GoldText className="whitespace-nowrap text-center text-[8px] font-bold">{item.label}</GoldText>
    </motion.div>
  );

  if (item.action) {
    return (
      <button type="button" onClick={() => onAction(item.action)} className="h-full cursor-pointer" aria-label={item.label}>
        {content}
      </button>
    );
  }
  return (
    <Link href={item.link} className="h-full cursor-pointer" aria-label={item.label}>
      {content}
    </Link>
  );
}

function KingRewardsBottomNav() {
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
    <footer className="fixed bottom-0 left-1/2 z-40 w-full max-w-[475px] -translate-x-1/2">
      <NationalDayBottomNavOverlay />
      <nav
        className="relative z-10 flex h-[80px] items-center justify-between overflow-hidden rounded-t-[16px] px-[clamp(6px,3.4vw,16px)] py-2"
        style={{ ...KR_SURFACES.glass, boxShadow: 'inset 0 4px 16px 4px rgba(255,255,255,0.15)' }}
        role="navigation"
        aria-label="King Rewards navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={item.link ? pathname === item.link || !!item.also?.includes(pathname) : false}
            onAction={handleAction}
          />
        ))}
      </nav>
    </footer>
  );
}

export default memo(KingRewardsBottomNav);
