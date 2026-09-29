"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GoldText } from './KrUi';
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

// Movement (px) after which a press is a swipe, never a tap on a game.
const DRAG_SLOP = 8;

function RailArrow({ dir, label, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)] transition-opacity active:scale-95 disabled:cursor-default disabled:opacity-35"
    >
      <img
        src={KR_ASSETS.ui.iconArrowCircle}
        alt=""
        draggable={false}
        className="size-6 select-none"
        style={{ transform: dir < 0 ? 'rotate(-90deg) scaleY(-1)' : 'rotate(90deg) scaleY(-1)' }}
      />
    </button>
  );
}

/** Home game rail (Figma 807:2946): three labelled badges per view, arrows either side. */
export default function KingRewardsModuleRail() {
  const railRef = useRef(null);
  const press = useRef(null);
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

  // One tile plus its gap; scrolling in whole steps keeps every tile uncut.
  const tileStep = () => {
    const tile = railRef.current?.firstElementChild;
    return tile ? tile.offsetWidth + parseFloat(getComputedStyle(railRef.current).columnGap || 0) : 0;
  };
  const scrollToTile = (index) => {
    const rail = railRef.current;
    const step = tileStep();
    if (!rail || !step) return;
    const max = rail.scrollWidth - rail.clientWidth;
    rail.scrollTo({ left: Math.max(0, Math.min(max, index * step)), behavior: 'smooth' });
  };
  const currentTile = () => Math.round(railRef.current.scrollLeft / (tileStep() || 1));
  const page = (dir) => railRef.current && scrollToTile(currentTile() + dir * 3);

  // Touch swipes scroll natively; a mouse has no native drag-scroll, so drag it here.
  const onPointerDown = (e) => {
    press.current = { x: e.clientX, left: railRef.current.scrollLeft, moved: false, mouse: e.pointerType === 'mouse' };
  };
  const onPointerMove = (e) => {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    if (!p.moved && Math.abs(dx) > DRAG_SLOP) {
      p.moved = true;
      if (p.mouse) railRef.current.style.scrollSnapType = 'none';
    }
    if (p.moved && p.mouse) railRef.current.scrollLeft = p.left - dx;
  };
  const endPress = () => {
    if (press.current?.mouse && press.current.moved) {
      railRef.current.style.scrollSnapType = '';
      // Re-enabling snap doesn't re-snap, so settle on the nearest tile ourselves.
      scrollToTile(currentTile());
    }
    // Kept until the click that follows pointerup has been checked.
    const p = press.current;
    setTimeout(() => {
      if (press.current === p) press.current = null;
    }, 0);
  };
  const onClickCapture = (e) => {
    if (press.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
    press.current = null;
  };

  return (
    <div className="flex w-full items-center gap-1">
      <RailArrow dir={-1} label="Previous games" disabled={edge.start} onClick={() => page(-1)} />
      <div
        ref={railRef}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onPointerLeave={endPress}
        onClickCapture={onClickCapture}
        className="scrollbar-hide flex min-w-0 flex-1 select-none snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain"
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
            <Link
              href={m.href}
              aria-label={m.label}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="flex select-none flex-col items-center gap-2 rounded-[12px] outline-none focus-visible:ring-2 focus-visible:ring-[#fff066]/70"
            >
              <img
                src={KR_ASSETS.modules[m.key]}
                alt=""
                draggable={false}
                loading={i < 3 ? 'eager' : 'lazy'}
                className="aspect-square w-full select-none object-contain"
              />
              <GoldText className="whitespace-nowrap text-center font-bold" style={{ fontSize: 'clamp(11px, 3.4vw, 16px)' }}>
                {m.label}
              </GoldText>
            </Link>
          </motion.div>
        ))}
      </div>
      <RailArrow dir={1} label="Next games" disabled={edge.end} onClick={() => page(1)} />
    </div>
  );
}
