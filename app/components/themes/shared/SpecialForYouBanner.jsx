"use client";

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPublicBanners } from '@/app/api/memberApi';
import { useBannerChrome, useThemeInk } from './themeInk';

const ARCHIVO = 'var(--font-archivo), system-ui, sans-serif';

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
    const timer = setInterval(() => setCurrent((slide) => (slide + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

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

      <div
        className="relative aspect-[361/170] w-full overflow-hidden rounded-[24px] border-2"
        style={{ borderColor: chrome.border, boxShadow: `0 8px 24px 0 ${chrome.glow}` }}
      >
        {loading ? (
          <div className="flex h-full w-full items-center justify-center text-[13px]" style={{ color: ink.meta }}>
            Loading banners...
          </div>
        ) : (
          banners.map((banner, index) => (
            <Slide key={banner.id ?? index} active={current === index}>
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
          ))
        )}
      </div>

      {banners.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-[6px]">
          {banners.map((banner, index) => (
            <button
              key={banner.id ?? index}
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
