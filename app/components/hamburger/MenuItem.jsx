"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { motion } from "framer-motion";
import { tokenStorage } from "../../api/tokenStorage";

/**
 * MenuItem Component
 * Memoized for performance - prevents unnecessary re-renders
 * Updated with new Figma design - dark green theme
 * @param {Object} props
 * @param {string} props.icon - Icon path
 * @param {string} props.label - Menu item label
 * @param {string} [props.link] - Navigation link
 * @param {string} [props.action] - Action type (e.g. 'logout')
 * @param {() => void} [props.onClose] - Close callback
 * @param {boolean} [props.isNested] - Whether this is a nested item
 * @param {boolean} [props.disabled] - Whether item is disabled
 */
function MenuItem({
  icon,
  label,
  link,
  action,
  onClose,
  isNested = false,
  disabled = false,
  variants,
}) {
  const iconSize = isNested ? 20 : 28;
  const textSize = "text-[10px]";
  const padding = isNested ? "px-2 py-1" : "px-2 py-1";

  const handleAction = () => {
    if (action === "logout") {
      tokenStorage.clearMemberTokens();

      const savedO = tokenStorage.getRedirectO();
      let redirectUrl = "/";
      if (savedO) {
        redirectUrl = savedO.startsWith("http") ? savedO : `https://${savedO}`;
      }

      window.location.href = redirectUrl;
      return;
    }
  };

  const content = (
    <motion.div
      className={`w-full flex items-center gap-3 ${padding} ${
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
      }`}
      role="menuitem"
      variants={variants}
      whileHover={
        !disabled
          ? {
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              x: 4,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{ willChange: disabled ? "auto" : "transform, background-color" }}
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

  // Action items (like logout) use a button instead of a link
  if (action) {
    return (
      <button
        onClick={() => { handleAction(); if (onClose) onClose(); }}
        className="block w-full text-left"
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={link} onClick={onClose} className="block" aria-label={label}>
      {content}
    </Link>
  );
}

export default memo(MenuItem);

