"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { memo } from "react";
import { useThemeInk } from "../themes/shared/themeInk";

const AssetBlock = memo(function AssetBlock({ src, alt, className, fill }) {
  if (!src) {
    return (
      <div
        className={className}
        style={{
          background: "rgba(0,0,0,0.15)",
          border: "1px solid rgba(233,175,65,0.35)",
        }}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes="(max-width: 475px) 100vw, 475px"
        priority
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`block w-full h-auto ${className || ""}`}
      loading="eager"
    />
  );
});

const AnimatedSection = memo(function AnimatedSection({
  title,
  imageSrc,
  imageAlt,
  imageHeight = null,
  titleSize = 44,
  letterSpacing = "0.06em",
  children,
  className = "",
}) {
  const ink = useThemeInk();

  return (
    <motion.section
      className={`relative w-full ${className}`}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.6 }}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="relative w-full px-4 pt-3 text-4xl ">
        <h1
          className="text-center font-bold  "
          style={{
            fontFamily: '"Times New Roman", serif',
            color: ink.heading,
            letterSpacing,
            textShadow: ink.halo,
          }}
        >
          {title}
        </h1>

        {imageSrc && (
          imageHeight ? (
            <div className="relative w-full mt-2" style={{ height: imageHeight }}>
              <AssetBlock
                src={imageSrc}
                alt={imageAlt}
                className="object-contain"
                fill
              />
            </div>
          ) : (
            <div className="relative w-full mt-2">
              <AssetBlock
                src={imageSrc}
                alt={imageAlt}
              />
            </div>
          )
        )}

        {children}
      </div>
    </motion.section>
  );
});

export default AnimatedSection;
