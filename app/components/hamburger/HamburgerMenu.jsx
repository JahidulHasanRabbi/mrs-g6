"use client";

import { motion, AnimatePresence } from "framer-motion";
import { lazy, memo, Suspense, useMemo, useState, useEffect, useCallback } from "react";
import { useHamburgerMenu } from "./useHamburgerMenu";
import { MENU_CONFIG, ANIMATION_CONFIG } from "./menuConfig";
import MenuSection from "./MenuSection";
import MenuItem from "./MenuItem";
import { getPublicBanners } from "@/app/api/memberApi";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getMemberThemeStyles } from "@/app/config/memberThemeStyles";
import { NationalDayMenuOverlay } from "../phase4/NationalDayChrome";

// The feedback modal carries every skin's asset map, and nothing shows it until
// the member taps Feedback — so keep all of it out of the initial bundle.
const FeedbackModal = lazy(() => import("../ui/FeedbackModal"));

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
function HamburgerMenu({ isOpen, onClose, side = "left" }) {
  useHamburgerMenu(isOpen, onClose);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // Latched on first open so the lazy modal stays mounted afterwards and its
  // exit animation still plays on close.
  const [feedbackMounted, setFeedbackMounted] = useState(false);
  const { themeId } = useTheme();
  const menuStyle = getMemberThemeStyles(themeId).menu;

  const handleMenuAction = useCallback(async (actionType) => {
    if (actionType === "feedback") {
      // Open the feedback modal AND close the menu drawer; the modal lives
      // outside the drawer so it stays mounted after the drawer animates out.
      setFeedbackMounted(true);
      setFeedbackOpen(true);
      onClose();
    } else if (actionType === "livechat") {
      // Get station URL from login response and redirect to chatroom
      try {
        const { tokenStorage } = await import("@/app/api/tokenStorage");
        
        const memberUuid = tokenStorage.getMemberUuid();
        if (!memberUuid) {
          alert("Please log in to access live chat");
          return;
        }

        // Get the station URL from the login response (e.g., "n1gang.net")
        const stationUrl = tokenStorage.getStationUrl();
        
        if (!stationUrl) {
          alert("Station information not available");
          return;
        }

        // Construct chatroom URL with https:// protocol
        // stationUrl is just the domain (e.g., "n1gang.net")
        const chatUrl = `https://${stationUrl}/chatroom`;
        
        // Open in new tab
        window.open(chatUrl, '_blank', 'noopener,noreferrer');
        onClose();
      } catch (error) {
        console.error("Error opening live chat:", error);
        alert("Failed to open live chat. Please try again.");
      }
    }
  }, [onClose]);

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
    <>
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
              initial={{ x: side === "right" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: side === "right" ? "100%" : "-100%" }}
              transition={ANIMATION_CONFIG.sidebar.transition}
              className={`pointer-events-auto absolute top-0 ${side === "right" ? "right-0" : "left-0"} h-dvh w-[220px] overflow-y-auto overscroll-contain`}
              style={{
                scrollbarGutter: "stable",
                background: menuStyle.drawer,
                scrollbarColor: `${menuStyle.scrollbar} transparent`,
                boxShadow: `12px 0 38px ${menuStyle.glow}`,
                willChange: "transform, opacity",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <NationalDayMenuOverlay />
              {/* Header */}
              <motion.div className="relative z-10" variants={rowVariants} initial="hidden" animate="show">
                <MenuHeader onClose={onClose} appearance={menuStyle} />
              </motion.div>

              {/* Banner */}
              <motion.div className="relative z-10" variants={rowVariants} initial="hidden" animate="show">
                <MenuBanner appearance={menuStyle} />
              </motion.div>

              {/* Menu Items */}
              <nav className="relative z-10 px-3 pb-20" role="navigation">
                <motion.div
                  className="rounded-[10px] border px-2 py-2"
                  variants={panelVariants}
                  initial="hidden"
                  animate="show"
                  style={{
                    background: menuStyle.panel,
                    borderColor: menuStyle.panelBorder,
                    boxShadow: `0 12px 30px ${menuStyle.glow}`,
                    willChange: "opacity",
                  }}
                >
                  {/* Mini Games Section */}
                  <MenuSection
                    title={MENU_CONFIG.miniGames.title}
                    icon={MENU_CONFIG.miniGames.icon}
                    appearance={menuStyle}
                  >
                    {MENU_CONFIG.miniGames.items.map((item, index) => (
                      <MenuItem
                        key={index}
                        {...item}
                        onClose={onClose}
                        appearance={menuStyle}
                      />
                    ))}
                  </MenuSection>

                  {/* Standalone items between Mini Game and Stay Connected */}
                  <div className="space-y-1 mb-3 pl-2">
                    {MENU_CONFIG.mainItems.map((item, index) => (
                      item.children ? (
                        <MenuSection
                          key={index}
                          title={item.label}
                          icon={item.icon}
                          defaultOpen={false}
                          appearance={menuStyle}
                        >
                          {item.children.map((child, childIndex) => (
                            <MenuItem
                              key={childIndex}
                              {...child}
                              onClose={onClose}
                              onAction={handleMenuAction}
                              appearance={menuStyle}
                            />
                          ))}
                        </MenuSection>
                      ) : (
                        <MenuItem
                          key={index}
                          {...item}
                          onClose={onClose}
                          onAction={handleMenuAction}
                          appearance={menuStyle}
                        />
                      )
                    ))}
                  </div>

                  {/* Stay Connected Section — only Feedback / Complain lives inside,
                      so collapsing this section never hides anything else. */}
                  <MenuSection
                    title={MENU_CONFIG.stayConnected.title}
                    icon={MENU_CONFIG.stayConnected.icon}
                    appearance={menuStyle}
                  >
                    {MENU_CONFIG.stayConnected.items.map((item, index) => (
                      <MenuItem
                        key={index}
                        {...item}
                        onClose={onClose}
                        onAction={handleMenuAction}
                        appearance={menuStyle}
                      />
                    ))}
                  </MenuSection>

                  {/* Standalone items after Stay Connected — kept outside the section
                      so collapsing Stay Connected doesn't hide them. */}
                  <div className="space-y-1 pl-2">
                    {MENU_CONFIG.extraItems.map((item, index) => (
                      <MenuItem
                        key={index}
                        {...item}
                        onClose={onClose}
                        onAction={handleMenuAction}
                        appearance={menuStyle}
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

    {/* Lives outside AnimatePresence so it survives the drawer closing. */}
    {feedbackMounted && (
      <Suspense fallback={null}>
        <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </Suspense>
    )}
    </>
  );
}

/**
 * MenuHeader - Logo and close button
 * Updated with new Figma design
 */
const MenuHeader = memo(({ onClose, appearance }) => (
  <div
    className="relative flex items-center justify-center h-[50px] rounded-[10px] backdrop-blur-[10px]"
    style={{
      background: appearance.header,
      borderBottom: `1px solid ${appearance.panelBorder}`,
      boxShadow: `0 8px 22px ${appearance.glow}`,
    }}
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
      <svg viewBox="0 0 16 16" className="h-full w-full" fill="none" style={{ color: appearance.scrollbar }}>
        <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </motion.button>
  </div>
));

MenuHeader.displayName = "MenuHeader";

/**
 * MenuBanner - Dynamic banner section from API
 * Fetches and displays Side Panel banners (location = 2)
 * Cached to avoid reloading on every menu open
 */
const MenuBanner = memo(({ appearance }) => {
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
          backgroundColor: loading || !banner ? appearance.bannerPlaceholder : 'transparent',
          border: `1px solid ${appearance.panelBorder}`,
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
