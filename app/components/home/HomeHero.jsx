"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { HOME_ASSETS } from "./homeAssets";

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

export default function HomeHero() {
  return (
    <motion.section
      className="relative w-full"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative w-full px-4 pt-3">
        <h1
          className="text-center font-bold"
          style={{
            fontFamily: '"Times New Roman", serif',
            color: "#e9af41",
            fontSize: 44,
            letterSpacing: "0.06em",
            textShadow: "0px 3px 0px rgba(0,0,0,0.35)",
          }}
        >
          HOMEPAGE
        </h1>

        <div className="relative w-full mt-2" style={{ height: 120 }}>
          <AssetBlock
            src={HOME_ASSETS.heroTitleCheckin}
            alt="Check in"
            className="object-contain"
          />
        </div>
      </div>
    </motion.section>
  );
}
