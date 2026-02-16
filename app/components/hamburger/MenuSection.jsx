"use client";

import Image from 'next/image';
import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_CONFIG } from './menuConfig';

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
function MenuSection({ title, icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleSection = useCallback((e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div className="mb-3" role="group" aria-labelledby={`section-${title}`}>
      <motion.button
        type="button"
        onClick={toggleSection}
        className="flex items-center justify-between w-full px-2 py-2 rounded-[5px] bg-[#c08f32] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={`section-content-${title}`}
        id={`section-${title}`}
        whileHover={{ 
          backgroundColor: '#d4a03d',
          scale: 1.02,
          boxShadow: '0px 6px 8px 0px rgba(0,0,0,0.2)',
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <Image 
            src={icon} 
            alt="" 
            width={30} 
            height={30}
            aria-hidden="true"
            className="object-contain"
          />
          <span 
            className="font-bold text-[12px] text-white leading-[1.5] tracking-[-0.132px]"
            style={{ fontFamily: '"Times New Roman", serif' }}
          >
            {title}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-[15px] h-[15px]"
          aria-hidden="true"
        >
          <img 
            src="/assets/images/expand-arrow.png" 
            alt="" 
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`section-content-${title}`}
            {...ANIMATION_CONFIG.section}
            className="mt-2 space-y-1 overflow-hidden pl-3"
            role="menu"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(MenuSection);
