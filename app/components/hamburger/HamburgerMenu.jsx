"use client";

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';
import { useHamburgerMenu } from './useHamburgerMenu';
import { MENU_CONFIG, ANIMATION_CONFIG, THEME_CONFIG } from './menuConfig';
import MenuSection from './MenuSection';
import MenuItem from './MenuItem';
import SocialLinks from './SocialLinks';

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

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            {...ANIMATION_CONFIG.overlay}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <motion.aside
            {...ANIMATION_CONFIG.sidebar}
            className="absolute top-0 left-0 z-50 h-full w-[200px] overflow-y-auto"
            style={{ 
              scrollbarGutter: 'stable',
              backgroundColor: THEME_CONFIG.background
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <MenuHeader onClose={onClose} />

            {/* Banner */}
            <MenuBanner />

            {/* Menu Items */}
            <nav className="px-3 pb-20" role="navigation">
              {/* Mini Games Section */}
              <MenuSection 
                title={MENU_CONFIG.miniGames.title} 
                icon={MENU_CONFIG.miniGames.icon}
              >
                {MENU_CONFIG.miniGames.items.map((item, index) => (
                  <MenuItem 
                    key={index} 
                    {...item} 
                    onClose={onClose}
                    isNested={true}
                  />
                ))}
              </MenuSection>

              {/* Main Menu Items */}
              <div className="space-y-2 mb-3">
                {MENU_CONFIG.mainItems.map((item, index) => (
                  <MenuItem 
                    key={index} 
                    {...item} 
                    onClose={onClose}
                  />
                ))}
              </div>

              {/* Social Section */}
              <MenuSection 
                title={MENU_CONFIG.social.title} 
                icon={MENU_CONFIG.social.icon}
              >
                <SocialLinks links={MENU_CONFIG.social.links} />
              </MenuSection>

              {/* Bottom Items */}
              <div className="space-y-2 mt-3">
                {MENU_CONFIG.bottomItems.map((item, index) => (
                  <MenuItem 
                    key={index} 
                    {...item} 
                    onClose={onClose}
                  />
                ))}
              </div>
            </nav>
          </motion.aside>
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
        transition: { duration: 0.2 }
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

MenuHeader.displayName = 'MenuHeader';

/**
 * MenuBanner - Placeholder banner section
 * Updated with new Figma design
 */
const MenuBanner = memo(() => (
  <div className="flex justify-center py-4 px-4">
    <div className="flex h-[79px] w-[130px] items-center justify-center rounded-[12px] bg-gray-200 shadow-[0px_5px_20px_0px_rgba(0,0,0,0.25)]">
      <Image
        src="/assets/images/funding-banner.jpg"
        alt="banner"
        width={130}
        height={79}
        className="rounded-[12px] object-cover"
      />
    </div>
  </div>
));

MenuBanner.displayName = 'MenuBanner';

export default memo(HamburgerMenu);
