"use client";

import { motion } from "framer-motion";
import Image from "next/image";

function AssetBlock({ src, alt, className }) {
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

export default function AnimatedSection({
  title,
  imageSrc,
  imageAlt,
  imageHeight = 120,
  titleSize = 44,
  letterSpacing = "0.06em",
  children,
  className = "",
}) {
  return (
    <motion.section
      className={`relative w-full ${className}`}
      initial={{ opacity: 0, y: 28, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.6 }}
    >
      <div className="relative w-full px-4 pt-3">
        <h1
          className="text-center font-bold"
          style={{
            fontFamily: '"Times New Roman", serif',
            color: "#e9af41",
            fontSize: titleSize,
            letterSpacing,
            textShadow: "0px 3px 0px rgba(0,0,0,0.35)",
          }}
        >
          {title}
        </h1>

        {imageSrc && (
          <div className="relative w-full mt-2" style={{ height: imageHeight }}>
            <AssetBlock
              src={imageSrc}
              alt={imageAlt}
              className="object-contain"
            />
          </div>
        )}

        {children}
      </div>
    </motion.section>
  );
}
