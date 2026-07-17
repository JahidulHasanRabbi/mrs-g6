"use client";

import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_CONFIG } from "./menuConfig";
import MenuIcon from "./MenuIcon";

/**
 * MenuSection Component
 * Collapsible section with smooth animations
 * Updated with new Figma design - golden theme
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.icon - Section icon path
 * @param {React.ReactNode} props.children - Section content
 * @param {boolean} [props.defaultOpen] - Initial open state
 */
function MenuSection({ title, icon, children, defaultOpen = true, variants, appearance }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleSection = useCallback((e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <motion.div
      className="mb-3"
      role="group"
      aria-labelledby={`section-${title}`}
      variants={variants}
    >
      <motion.button
        type="button"
        onClick={toggleSection}
        className="flex items-center justify-between w-full px-2 py-[6px] rounded-[5px] border shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={`section-content-${title}`}
        id={`section-${title}`}
        whileHover={{
          background: appearance.sectionHover,
          scale: 1.02,
          boxShadow: `0px 6px 14px 0px ${appearance.glow}`,
          transition: { duration: 0.2 },
        }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: appearance.section,
          borderColor: appearance.sectionBorder,
          willChange: "transform, background, box-shadow",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center"
            style={{ color: appearance.sectionIcon }}
          >
            <MenuIcon src={icon} size={26} />
          </div>
          <span
            className="font-bold text-[12px] leading-[1.5] tracking-[-0.132px] whitespace-nowrap"
            style={{ fontFamily: '"Times New Roman", serif', color: appearance.sectionText }}
          >
            {title}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-[15px] h-[15px]"
          aria-hidden="true"
          style={{ color: appearance.sectionText }}
        >
          <svg viewBox="0 0 16 16" className="h-full w-full" fill="none">
            <path d="m3 6 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`section-content-${title}`}
            {...ANIMATION_CONFIG.section}
            className="mt-1 space-y-1 overflow-hidden pl-2"
            role="menu"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(MenuSection);
