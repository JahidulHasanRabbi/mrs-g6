"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getPublicBanners } from '@/app/api/memberApi';
import { useBannerChrome, useThemeInk } from './themeInk';

// How far (px) a drag has to travel before it counts as a swipe rather than a tap.
const SWIPE_THRESHOLD = 50;

const ARCHIVO = 'var(--font-archivo), system-ui, sans-serif';

// Slide enters from the direction it's heading toward and exits the opposite
// way — direction=1 (next) enters from the right, direction=-1 (prev) enters
// from the left. Wrapping from the last slide to the first (or first to last)
// reuses the same +1/-1 so it still reads as a continuous left/right sweep.
const SLIDE_VARIANTS = {
  enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 1 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? '-100%' : '100%', opacity: 1 }),
};

/**
 * "Special For You" on the homepage: a heading over whatever Main Page
 * banners the backend is running (GET /settings/banners/public/?location=1),
 * auto-sliding one at a time when there is more than one. Purely API-driven —
 * matches the pre-rebuild SpecialOffersCarousel (app/components/home): no
 * banners means the section doesn't render, rather than filling the slot with
 * placeholder art. The chrome (rule, 24px radius, glow) is shared by every
 * skin — only the accent colours change per theme.
 */
export default function SpecialForYouBanner() {
  const chrome = useBannerChrome();
  const ink = useThemeInk();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  // +1 = next slide entering from the right, -1 = entering from the left —
  // drives which side the slide animates in/out from (see SLIDE_VARIANTS).
  const [direction, setDirection] = useState(1);
  // Set on drag end when the movement was a real swipe, so the click handler
  // that fires right after (drag ends -> click bubbles) can skip opening the
  // banner link — a swipe shouldn't also count as a tap.
  const didSwipe = useRef(false);

  const goTo = useCallback((index, dir) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((slide) => (slide + 1) % banners.length);
  }, [banners.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((slide) => (slide - 1 + banners.length) % banners.length);
  }, [banners.length]);

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
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [banners.length, goNext]);

  const openBanner = useCallback((slug) => {
    if (!slug) return;
    const url = slug.startsWith('http://') || slug.startsWith('https://') ? slug : `https://${slug}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  if (!loading && banners.length === 0) return null;

  return (
    <motion.section
      className="w-full"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 22 }}
    >
      <p
        className="mb-2 font-black"
        style={{ fontFamily: ARCHIVO, fontSize: 'clamp(16px, 5.5vw, 22px)', color: ink.heading }}
      >
        Special For You
      </p>

      {/* Outer viewport clips the slide as it travels; the border/radius/glow
          live on the card itself (not this wrapper) so the whole framed card
          moves as one piece, not just the art inside a fixed window. No
          dragConstraints here — pinning the card to {left:0,right:0} would
          rubber-band it right back to center on every drag frame, which is
          what made a swipe look like a squish instead of a slide. */}
      <div className="relative aspect-[361/170] w-full overflow-hidden">
        {loading ? (
          <div
            className="flex h-full w-full items-center justify-center rounded-[24px] border-2 text-[13px]"
            style={{ borderColor: chrome.border, boxShadow: `0 8px 24px 0 ${chrome.glow}`, color: ink.meta }}
          >
            Loading banners...
          </div>
        ) : (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
              drag={banners.length > 1 ? 'x' : false}
              dragDirectionLock
              dragElastic={0.2}
              dragMomentum={false}
              onDragEnd={(e, info) => {
                const delta = info.offset.x;
                didSwipe.current = Math.abs(delta) >= 8;
                if (delta <= -SWIPE_THRESHOLD) goNext();
                else if (delta >= SWIPE_THRESHOLD) goPrev();
              }}
              className="absolute inset-0 overflow-hidden rounded-[24px] border-2"
              style={{ borderColor: chrome.border, boxShadow: `0 8px 24px 0 ${chrome.glow}` }}
            >
              <button
                type="button"
                onClick={() => {
                  if (didSwipe.current) {
                    didSwipe.current = false;
                    return;
                  }
                  openBanner(banners[current]?.slug);
                }}
                className="block h-full w-full cursor-pointer"
              >
                <img
                  src={banners[current]?.image}
                  alt={banners[current]?.name || 'Special offer'}
                  className="pointer-events-none h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {banners.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-[6px]">
          {banners.map((banner, index) => (
            <button
              key={banner.id ?? index}
              type="button"
              onClick={() => goTo(index, index > current ? 1 : -1)}
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
