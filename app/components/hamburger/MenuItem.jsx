"use client";

import Link from "next/link";
import { memo } from "react";
import { motion } from "framer-motion";
import { tokenStorage } from "../../api/tokenStorage";
import MenuIcon from "./MenuIcon";

/**
 * MenuItem Component
 * Memoized for performance - prevents unnecessary re-renders
 * Updated with new Figma design - dark green theme
 * @param {Object} props
 * @param {string} props.icon - Icon path
 * @param {string} props.label - Menu item label
 * @param {string} [props.link] - Navigation link
 * @param {string} [props.action] - Action type (e.g. 'logout')
 * @param {string} [props.badge] - Optional compact status badge
 * @param {string} [props.subtitle] - Optional secondary line
 * @param {() => void} [props.onClose] - Close callback
 * @param {boolean} [props.disabled] - Whether item is disabled
 */
function MenuItem({
  icon,
  label,
  link,
  action,
  badge,
  subtitle,
  onClose,
  onAction,
  disabled = false,
  appearance,
}) {
  const iconSize = 24;
  const textSize = "text-[11px]";
  const padding = "px-2 py-[6px]";

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

    if (action === "station") {
      const savedO = tokenStorage.getRedirectO();
      let redirectUrl = "/";
      if (savedO) {
        redirectUrl = savedO.startsWith("http") ? savedO : `https://${savedO}`;
      }

      window.location.href = redirectUrl;
      return;
    }

    // Other named actions (e.g. "feedback") bubble up so the parent menu
    // can decide what to do — typically opening a modal.
    if (onAction) {
      onAction(action);
    }
  };

  const content = (
    <motion.div
      className={`w-full flex items-center gap-3 ${padding} ${
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
      }`}
      role="menuitem"
      whileHover={
        !disabled
          ? {
              backgroundColor: appearance.itemHover,
              x: 4,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{ willChange: disabled ? "auto" : "transform, background-color" }}
    >
      <motion.div
        className="relative shrink-0"
        whileHover={!disabled ? { scale: 1.1, rotate: 5 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        style={{ width: iconSize, height: iconSize, color: appearance.itemIcon }}
      >
        <MenuIcon src={icon} size={iconSize} />
      </motion.div>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className={`${textSize} truncate font-['Times_New_Roman'] leading-[1.5] tracking-[-0.11px]`}
            style={{ fontFamily: '"Times New Roman", serif', color: appearance.itemText }}
          >
            {label}
          </span>
          {badge && (
            <span className="rounded-full bg-[#e9af41] px-1.5 py-0.5 text-[7px] font-bold leading-none tracking-[0.5px] text-[#07190d]">
              {badge}
            </span>
          )}
        </span>
        {subtitle && (
          <span className="block text-[9px] leading-3 text-white/60">{subtitle}</span>
        )}
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

