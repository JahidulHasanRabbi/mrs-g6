"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useMemo, useState, useEffect } from "react";
import { useHamburgerMenu } from "./useHamburgerMenu";
import { MENU_CONFIG, ANIMATION_CONFIG, THEME_CONFIG } from "./menuConfig";
import MenuSection from "./MenuSection";
import MenuItem from "./MenuItem";
import SocialLinks from "./SocialLinks";
import { getPublicBanners } from "@/app/api/memberApi";

/**
 * HamburgerMenu Component
 *
 * Engineered following Facebook's best practices:
 * - Separation of concerns (data, logic, presentation)
 * - Performance optimization (memoization, lazy rendering)
 * - Accessibility (ARIA labels, keyboard navigation, focus management)
 * - Maintainability (modular components, configuration-driven)
 * - User experience (smooth animations, scroll lock, escape key)
 *
 * Updated with new Figma design - dark green theme
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Menu open state
 * @param {() => void} props.onClose - Close handler
 */
function HamburgerMenu({ isOpen, onClose }) {
  useHamburgerMenu(isOpen, onClose);

  const panelVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.045, delayChildren: 0.08 },
    },
  }), []);

  const rowVariants = useMemo(() => ({
    hidden: { opacity: 0, x: -14, y: 10, rotate: -0.6 },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      transition: { type: "spring", stiffness: 260, damping: 22, mass: 0.7 },
    },
  }), []);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            {...ANIMATION_CONFIG.overlay}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", willChange: "opacity" }}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div className="fixed inset-0 z-50 left-1/2 w-full max-w-[475px] -translate-x-1/2 pointer-events-none">
            <motion.aside
              {...ANIMATION_CONFIG.sidebar}
              className="pointer-events-auto absolute top-0 left-0 h-dvh w-[220px] overflow-y-auto overscroll-contain"
              style={{
                scrollbarGutter: "stable",
                backgroundColor: THEME_CONFIG.background,
                willChange: "transform, opacity",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Header */}
              <motion.div variants={rowVariants} initial="hidden" animate="show">
                <MenuHeader onClose={onClose} />
              </motion.div>

              {/* Banner */}
              <motion.div variants={rowVariants} initial="hidden" animate="show">
                <MenuBanner />
              </motion.div>

              {/* Menu Items */}
              <nav className="px-3 pb-20" role="navigation">
                <motion.div
                  className="rounded-[10px] bg-[#265134] px-2 py-2"
                  variants={panelVariants}
                  initial="hidden"
                  animate="show"
                  style={{ willChange: "opacity" }}
                >
                  {/* Mini Games Section */}
                  <MenuSection
                    title={MENU_CONFIG.miniGames.title}
                    icon={MENU_CONFIG.miniGames.icon}
                    variants={rowVariants}
                  >
                    {MENU_CONFIG.miniGames.items.map((item, index) => (
                      <MenuItem
                        key={index}
                        {...item}
                        onClose={onClose}
                        isNested={true}
                        variants={rowVariants}
                      />
                    ))}
                  </MenuSection>

                  {/* Main Menu Items */}
                  <div className="space-y-1 mb-3">
                    {MENU_CONFIG.mainItems.map((item, index) => (
                      <MenuItem
                        key={index}
                        {...item}
                        onClose={onClose}
                        variants={rowVariants}
                      />
                    ))}
                  </div>

                  {/* Social Section */}
                  <MenuSection
                    title={MENU_CONFIG.social.title}
                    icon={MENU_CONFIG.social.icon}
                    variants={rowVariants}
                  >
                    <SocialLinks
                      links={MENU_CONFIG.social.links}
                      variants={rowVariants}
                    />
                  </MenuSection>

                  {/* Bottom Items */}
                  <div className="space-y-1 mt-3">
                    {MENU_CONFIG.bottomItems.map((item, index) => (
                      <MenuItem
                        key={index}
                        {...item}
                        onClose={onClose}
                        variants={rowVariants}
                      />
                    ))}
                  </div>
                </motion.div>
              </nav>
            </motion.aside>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * MenuHeader - Logo and close button
 * Updated with new Figma design
 */
const MenuHeader = memo(({ onClose }) => (
  <div
    className="relative flex items-center justify-center h-[50px] rounded-[10px] backdrop-blur-[10px]"
    style={{ backgroundColor: THEME_CONFIG.headerBg }}
  >
    <motion.button
      onClick={onClose}
      className="absolute right-2 top-1/2 -translate-y-1/2 w-[11px] h-[11px] cursor-pointer"
      aria-label="Close menu"
      whileHover={{
        scale: 1.3,
        rotate: 90,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.9 }}
    >
      <img
        src="/assets/images/close-icon.svg"
        alt="Close"
        className="w-full h-full object-contain"
      />
    </motion.button>
  </div>
));

MenuHeader.displayName = "MenuHeader";

/**
 * MenuBanner - Dynamic banner section from API
 * Fetches and displays Side Panel banners (location = 2)
 * Cached to avoid reloading on every menu open
 */
const MenuBanner = memo(() => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Only fetch once, not every time menu opens
    if (hasFetched) return;

    const fetchSidePanelBanners = async () => {
      try {
        setLoading(true);
        // Fetch only Side Panel banners (location = 2)
        const data = await getPublicBanners(2);
        
        // Filter active banners (active_until is in the future)
        const now = new Date();
        const activeBanners = data.filter(banner => {
          const activeUntil = new Date(banner.active_until);
          return activeUntil > now;
        });
        
        // Use the first active banner
        if (activeBanners.length > 0) {
          setBanner(activeBanners[0]);
        }
      } catch (error) {
        console.error("Error fetching side panel banners:", error);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    };

    fetchSidePanelBanners();
  }, [hasFetched]);

  const handleBannerClick = () => {
    if (banner?.slug) {
      const url = banner.slug.startsWith('http://') || banner.slug.startsWith('https://') 
        ? banner.slug 
        : `https://${banner.slug}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex justify-center py-4 px-4">
      <div 
        className={`flex h-[79px] w-[130px] items-center justify-center rounded-[12px] overflow-hidden shadow-[0px_5px_20px_0px_rgba(0,0,0,0.25)] ${banner ? 'cursor-pointer' : ''}`}
        onClick={handleBannerClick}
        style={{
          backgroundColor: loading || !banner ? 'rgba(38, 81, 52, 0.3)' : 'transparent'
        }}
      >
        {loading ? (
          <div className="text-gray-400 text-xs">Loading...</div>
        ) : banner ? (
          <img
            src={banner.image}
            alt={banner.name || "Banner"}
            className="rounded-[12px] object-cover w-full h-full"
          />
        ) : (
          <div className="text-gray-500 text-xs text-center px-2">No banner</div>
        )}
      </div>
    </div>
  );
});

MenuBanner.displayName = "MenuBanner";

export default memo(HamburgerMenu);
