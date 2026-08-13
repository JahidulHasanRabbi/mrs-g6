"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { tokenStorage } from '@/app/api/tokenStorage';
import { LV918_ASSETS, LV918_COLORS } from './assets';
import { NationalDayBottomNavOverlay } from '../../phase4/NationalDayChrome';

// Sized for the 475px member column (Figma frame is 402 wide); min() keeps
// items from crowding on narrower phones — same trick as the default FooterNav.
const fluid = (px) => `min(${px}px, ${((px / 475) * 100).toFixed(2)}vw)`;

// Boxes match the medallion art aspect (~0.85 w/h) so the ornate frames
// aren't letterboxed. Sized to sit fully inside the bar's side height —
// only the raised center notch is tall enough for the larger HOME medallion.
const NAV_ITEMS = [
  { id: 'leaderboard', icon: LV918_ASSETS.nav.leaderboard, label: 'LEADERBOARD', link: '/leaderboard', width: 34, height: 40 },
  { id: 'hot', icon: LV918_ASSETS.nav.hot, label: 'HOT', action: 'hot', width: 34, height: 40 },
  { id: 'home', icon: LV918_ASSETS.nav.home, label: 'HOME', link: '/', width: 50, height: 58, isCenter: true },
  { id: 'profile', icon: LV918_ASSETS.nav.profile, label: 'PROFILE', link: '/profile', width: 34, height: 40 },
  { id: 'livechat', icon: LV918_ASSETS.nav.livechat, label: 'LIVECHAT', action: 'livechat', width: 34, height: 40 },
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
        {/* Plain <img>, not next/image: at these small render widths (~48px)
            Next's optimizer flattens the transparent PNG alpha to an opaque
            white box — visible as a white square behind HOT/PROFILE. Bypassing
            the optimizer keeps the cutouts clean, matching the same fix already
            applied everywhere else in the lv918 theme. */}
        <img
          src={item.icon}
          alt={item.label}
          draggable={false}
          className="h-full w-full select-none object-contain"
        />
      </div>
      <p
        className="font-bold text-center whitespace-nowrap"
        style={{
          fontFamily: '"Times New Roman", serif',
          color: isActive ? '#ffffff' : LV918_COLORS.gold,
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

/**
 * Lv918 bottom navigation — ornate blue bar with raised center crest
 * (LEADERBOARD / HOT / HOME / PROFILE / LIVECHAT).
 */
function Lv918BottomNav() {
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
        src={LV918_ASSETS.nav.bar}
        alt=""
        className="absolute left-[-1%] right-[-1%] top-[-8%] bottom-0 w-[102%] h-[108%] max-w-none"
      />
      <NationalDayBottomNavOverlay />
      <nav
        className="relative z-10 flex items-end justify-between px-[16px] h-full pb-[8px] pointer-events-auto"
        role="navigation"
        aria-label="Lv918 navigation"
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

export default memo(Lv918BottomNav);
