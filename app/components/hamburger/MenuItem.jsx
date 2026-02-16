"use client";

import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * MenuItem Component
 * Memoized for performance - prevents unnecessary re-renders
 * Updated with new Figma design - dark green theme
 * @param {Object} props
 * @param {string} props.icon - Icon path
 * @param {string} props.label - Menu item label
 * @param {string} props.link - Navigation link
 * @param {() => void} [props.onClose] - Close callback
 * @param {boolean} [props.isNested] - Whether this is a nested item
 * @param {boolean} [props.disabled] - Whether item is disabled
 */
function MenuItem({ icon, label, link, onClose, isNested = false, disabled = false }) {
  const iconSize = isNested ? 20 : 28;
  const textSize = "text-[10px]";
  const padding = isNested ? "px-2 py-2" : "px-0 py-2";
  
  const content = (
    <motion.div 
      className={`flex items-center gap-3 ${padding} rounded-md ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      role="menuitem"
      whileHover={!disabled ? { 
        backgroundColor: 'rgba(192, 143, 50, 0.2)',
        x: 4,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <motion.div
        whileHover={!disabled ? { scale: 1.1, rotate: 5 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Image 
          src={icon} 
          alt="" 
          width={iconSize} 
          height={iconSize}
          aria-hidden="true"
          className="object-contain"
        />
      </motion.div>
      <span 
        className={`${textSize} font-['Times_New_Roman'] text-white leading-[1.5] tracking-[-0.11px]`}
        style={{ fontFamily: '"Times New Roman", serif' }}
      >
        {label}
      </span>
    </motion.div>
  );

  if (disabled) {
    return <div className="block">{content}</div>;
  }

  return (
    <Link 
      href={link} 
      onClick={onClose}
      className="block"
      aria-label={label}
    >
      {content}
    </Link>
  );
}

export default memo(MenuItem);
