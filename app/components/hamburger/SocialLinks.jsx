"use client";

import Image from "next/image";
import { memo } from "react";
import { motion } from "framer-motion";

/**
 * SocialIcon Component
 * Individual social media link with hover effects
 * Updated with new Figma design styling
 */
function SocialIcon({ icon, url, label, disabled, variants }) {
  const content = (
    <motion.div
      whileHover={
        !disabled
          ? {
              filter: "brightness(1.2)",
              transition: { duration: 0.2 },
            }
          : {}
      }
      style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : {}}
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
  );

  if (disabled) {
    return (
      <motion.div
        className="flex items-center justify-center"
        aria-label={`${label} (disabled)`}
        variants={variants}
        style={{ cursor: "not-allowed" }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center cursor-pointer"
      aria-label={label || "Social media link"}
      variants={variants}
      whileHover={{
        scale: 1.2,
        rotate: 10,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      }}
      whileTap={{ scale: 0.9 }}
    >
      {content}
    </motion.a>
  );
}

/**
 * SocialLinks Component
 * Container for social media icons
 * Updated with new Figma design layout
 */
function SocialLinks({ links, variants }) {
  return (
    <motion.div
      className="flex gap-2 pt-2 justify-start items-center"
      role="list"
      variants={variants}
    >
      {links.map((link, index) => (
        <motion.div key={index} role="listitem" variants={variants}>
          <SocialIcon {...link} variants={variants} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default memo(SocialLinks);
