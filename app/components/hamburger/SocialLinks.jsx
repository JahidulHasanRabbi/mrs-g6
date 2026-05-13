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
    <div className="flex flex-col items-center gap-1">
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
          width={30}
          height={30}
          aria-hidden="true"
          className="object-contain"
        />
      </motion.div>
      {showLabel && label && (
        <span className="text-[9px] leading-tight text-center text-white/80 max-w-[52px] break-words">
          {label}
        </span>
      )}
    </div>
  );

  const sharedMotionProps = {
    initial: socialItemAnimation.initial,
    animate: socialItemAnimation.animate,
    transition: socialItemAnimation.transition,
    whileHover: {
      scale: 1.2,
      rotate: 10,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    whileTap: { scale: 0.9 },
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
