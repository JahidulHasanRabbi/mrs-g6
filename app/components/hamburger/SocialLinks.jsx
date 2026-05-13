"use client";

import Image from "next/image";
import { memo } from "react";
import { motion } from "framer-motion";

const socialItemAnimation = {
  initial: { opacity: 0, y: 6, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.22, ease: "easeOut" },
};

/**
 * SocialIcon Component
 * Individual social media icon. Either a link (`url`) or an action button
 * (`action`) — actions bubble up via `onAction` so the parent menu can open
 * a modal, etc.
 */
function SocialIcon({ icon, url, action, label, showLabel, disabled, onAction }) {
  const content = (
    <div className="flex items-center gap-2">
      <motion.div
        whileHover={
          !disabled
            ? {
                filter: "brightness(1.2)",
                transition: { duration: 0.2 },
              }
            : {}
        }
        style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : { willChange: "filter" }}
      >
        <Image
          src={icon}
          alt=""
          width={32}
          height={32}
          aria-hidden="true"
          className="object-contain"
        />
      </motion.div>
      {showLabel && label && (
        <span
          className="rounded-full border border-[#e9af41]/70 bg-[#0a1a0a]/80 px-3 py-[3px] text-[11px] font-bold leading-none text-[#fde685] whitespace-nowrap shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
          style={{ fontFamily: '"Times New Roman", serif' }}
        >
          {label}
        </span>
      )}
    </div>
  );

  // The previous hover applied scale 1.2 + rotate 10° to the whole button.
  // That looked fine on a stand-alone round icon but with the new icon +
  // pill-tag row it tilts the pill and pops it 20 % bigger, which reads
  // as weird. Drop the rotation and use a small uniform scale instead;
  // the inner icon already brightens on hover via its own motion.div.
  const sharedMotionProps = {
    initial: socialItemAnimation.initial,
    animate: socialItemAnimation.animate,
    transition: socialItemAnimation.transition,
    whileHover: {
      scale: 1.04,
      transition: { type: "spring", stiffness: 300, damping: 22 },
    },
    whileTap: { scale: 0.97 },
    style: { willChange: "transform" },
  };

  if (disabled) {
    return (
      <motion.div
        className="flex items-center justify-center"
        aria-label={`${label} (disabled)`}
        initial={socialItemAnimation.initial}
        animate={socialItemAnimation.animate}
        transition={socialItemAnimation.transition}
        style={{ cursor: "not-allowed" }}
      >
        {content}
      </motion.div>
    );
  }

  if (action) {
    return (
      <motion.button
        type="button"
        onClick={() => onAction && onAction(action)}
        className="flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
        aria-label={label || "Action"}
        {...sharedMotionProps}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center cursor-pointer"
      aria-label={label || "Social media link"}
      {...sharedMotionProps}
    >
      {content}
    </motion.a>
  );
}

/**
 * SocialLinks Component
 * Container for social media icons. `onAction` is forwarded to icons that
 * declare an `action` instead of a `url`.
 */
function SocialLinks({ links, onAction }) {
  return (
    <motion.div
      className="flex gap-2 pt-2 justify-start items-start"
      role="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {links.map((link, index) => (
        <motion.div
          key={index}
          role="listitem"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03, ease: "easeOut" }}
        >
          <SocialIcon {...link} onAction={onAction} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default memo(SocialLinks);
