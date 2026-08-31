"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPublicBanners } from '@/app/api/memberApi';
import { useBannerChrome } from './themeInk';

const EXTRA_REWARDS_BG = '/assets/home/extra-rewards-bg.webp';
const ARCHIVO = 'var(--font-archivo), system-ui, sans-serif';

// Figma 535:61 is a fixed 361x170 card. The member column runs from ~296px to
// 451px wide, so every inner measurement is a clamp of the designed value —
// the copy block still clears the card at the narrow end.
const SIZE = {
  padX: 'clamp(12px, 4.6vw, 24px)',
  padY: 'clamp(12px, 4.6vw, 24px)',
  title: 'clamp(12px, 4.2vw, 16px)',
  subtitle: 'clamp(9.5px, 3.2vw, 12px)',
  textGap: 'clamp(6px, 3.4vw, 12px)',
  blockGap: 'clamp(10px, 6.4vw, 24px)',
  btnW: 'clamp(104px, 37vw, 136px)',
  btnH: 'clamp(26px, 9vw, 36px)',
  btnText: 'clamp(13px, 5vw, 18px)',
};

/**
 * "Special For You" on the homepage: the Extra Rewards card from Figma 535:61,
 * followed by whatever Main Page banners the backend is running.
 *
 * The designed card always leads so the slot is never empty, and the chrome
 * (gold rule, 24px radius, glow) is shared by every skin — only the game badges
 * above it change per theme.
 */
export default function SpecialForYouBanner({ href = '/missions' }) {
  const chrome = useBannerChrome();
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getPublicBanners(1)
      .then((data) => {
        if (cancelled) return;
        const now = new Date();
        const live = Array.isArray(data) ? data : [];
        setBanners(live.filter((banner) => new Date(banner.active_until) > now));
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const slideCount = banners.length + 1;

  useEffect(() => {
    if (slideCount < 2) return undefined;
    const timer = setInterval(() => setCurrent((slide) => (slide + 1) % slideCount), 5000);
    return () => clearInterval(timer);
  }, [slideCount]);

  const openBanner = useCallback((slug) => {
    if (!slug) return;
    const url = slug.startsWith('http://') || slug.startsWith('https://') ? slug : `https://${slug}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <motion.section
      className="w-full"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 22 }}
    >
      <div
        className="relative aspect-[361/170] w-full overflow-hidden rounded-[24px] border-2"
        style={{ borderColor: chrome.border, boxShadow: `0 8px 24px 0 ${chrome.glow}` }}
      >
        <Slide active={current === 0}>
          <ExtraRewardsCard href={href} scrim={chrome.scrim} />
        </Slide>

        {banners.map((banner, index) => (
          <Slide key={banner.id ?? index} active={current === index + 1}>
            <button
              type="button"
              onClick={() => openBanner(banner.slug)}
              className="block h-full w-full cursor-pointer"
            >
              <img
                src={banner.image}
                alt={banner.name || 'Special offer'}
                className="h-full w-full object-cover"
              />
            </button>
          </Slide>
        ))}
      </div>

      {slideCount > 1 && (
        <div className="mt-2 flex items-center justify-center gap-[6px]">
          {Array.from({ length: slideCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-[6px] rounded-full transition-all ${
                index === current ? 'w-[16px] bg-[#f2cb7a]' : 'w-[6px] bg-[#f2cb7a]/35'
              }`}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}

function Slide({ active, children }) {
  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 transition-opacity duration-500 ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {children}
    </div>
  );
}

function ExtraRewardsCard({ href, scrim }) {
  return (
    <Link href={href} className="block h-full w-full">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <img
          src={EXTRA_REWARDS_BG}
          alt=""
          className="absolute left-[16.49%] top-[-4.63%] h-[109.26%] w-full max-w-none object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `linear-gradient(90deg, rgba(${scrim},0.98) 0%, rgba(${scrim},0.9) 45%, rgba(${scrim},0) 80%)`,
          }}
        />
      </div>

      <div
        className="relative flex h-full flex-col justify-center"
        style={{
          gap: SIZE.blockGap,
          paddingLeft: SIZE.padX,
          paddingRight: `calc(${SIZE.padX} * 1.75)`,
          paddingBlock: SIZE.padY,
        }}
      >
        <div className="flex flex-col" style={{ gap: SIZE.textGap }}>
          <p
            className="bg-clip-text font-black leading-[1.1] text-transparent"
            style={{
              fontFamily: ARCHIVO,
              fontSize: SIZE.title,
              backgroundImage: 'linear-gradient(180deg, #fff3a1 0%, #f3ad3c 100%)',
            }}
          >
            EXTRA REWARDS
          </p>
          <p
            className="font-bold leading-[1.3] tracking-[0.24px] text-white opacity-95"
            style={{ fontFamily: ARCHIVO, fontSize: SIZE.subtitle }}
          >
            MORE GAMES, MORE FUN,
            <br />
            MORE REWARDS!
          </p>
        </div>

        <span
          className="flex shrink-0 items-center justify-center rounded-[12px] border-t border-white/40 font-black text-[#1a0900] drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] shadow-[inset_0_2px_0_0_rgba(255,255,255,0.25)]"
          style={{
            fontFamily: ARCHIVO,
            fontSize: SIZE.btnText,
            width: SIZE.btnW,
            height: SIZE.btnH,
            backgroundImage: 'linear-gradient(180deg, #fff066 0%, #f59e0b 50%, #d97706 100%)',
          }}
        >
          PLAY NOW
        </span>
      </div>
    </Link>
  );
}
