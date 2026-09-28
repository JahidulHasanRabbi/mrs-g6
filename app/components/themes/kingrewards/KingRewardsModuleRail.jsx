"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GoldText, KrArrowPill } from './KrUi';
import { KR_ASSETS } from './assets';

// Figma 807:2946 order, which differs from the other skins' HOME_MODULES.
const KR_MODULES = [
  { id: 'lucky-spin', key: 'luckySpin', label: 'LUCKY SPIN', href: '/spin' },
  { id: 'smash-egg', key: 'smashEgg', label: 'SMASH EGG', href: '/smash-egg' },
  { id: 'penalty-kick', key: 'penaltyKick', label: 'PENALTY KICK', href: '/penalty-kick' },
  { id: 'leaderboard', key: 'leaderboard', label: 'LEADERBOARD', href: '/leaderboard' },
  { id: 'vip', key: 'vip', label: 'MEMBERSHIP', href: '/vip' },
  { id: 'avatar', key: 'avatar', label: 'AVATAR', href: '/avatar' },
  { id: 'missions', key: 'missions', label: 'MISSIONS', href: '/missions' },
  { id: 'daily-checkin', key: 'dailyCheckin', label: 'DAILY CHECK-IN', href: '/daily-checkin' },
  { id: 'mart', key: 'mart', label: 'MART', href: '/mart' },
];


/** Home game rail (Figma 807:2946): three labelled badges per view, arrow pills either side. */
export default function KingRewardsModuleRail() {
  const railRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const start = rail.scrollLeft <= 1;
    const end = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1;
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    measure();
    const rail = railRef.current;
    if (!rail) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [measure]);

  const page = (dir) => railRef.current?.scrollBy({ left: dir * railRef.current.clientWidth, behavior: 'smooth' });

  return (
    <div className="flex w-full items-center gap-1">
      <KrArrowPill dir={-1} label="Previous games" disabled={edge.start} onClick={() => page(-1)} />
      <div
        ref={railRef}
        onScroll={measure}
        className="scrollbar-hide flex min-w-0 flex-1 snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain"
      >
        {KR_MODULES.map((m, i) => (
          <motion.div
            key={m.id}
            className="w-[calc((100%-8px)/3)] shrink-0 snap-start"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={m.href} aria-label={m.label} draggable={false} className="flex select-none flex-col items-center gap-2">
              <img
                src={KR_ASSETS.modules[m.key]}
                alt=""
                draggable={false}
                loading={i < 3 ? 'eager' : 'lazy'}
                className="aspect-square w-full select-none object-contain"
              />
              <GoldText className="whitespace-nowrap text-center font-bold" style={{ fontSize: 'clamp(12px, 3.9vw, 16px)' }}>
                {m.label}
              </GoldText>
            </Link>
          </motion.div>
        ))}
      </div>
      <KrArrowPill dir={1} label="Next games" disabled={edge.end} onClick={() => page(1)} />
    </div>
  );
}
