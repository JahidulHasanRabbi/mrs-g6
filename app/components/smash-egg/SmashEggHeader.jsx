"use client";

import { motion } from "framer-motion";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

function IconButton({ src, onClick, label }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center"
      style={{ background: "transparent", border: "none", padding: 0 }}
      whileTap={{ scale: 0.9 }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="block h-9 w-9 select-none"
        style={{ objectFit: "contain" }}
        draggable={false}
      />
    </motion.button>
  );
}

export default function SmashEggHeader({ onMenuClick, onInfoClick }) {
  return (
    <header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-16 z-40 flex items-center justify-between px-4 pb-px border-b border-[#eab043]"
      style={{
        backgroundColor: "#07190d",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
        filter: "drop-shadow(0px 4px 2px rgba(233,175,65,0.25))",
      }}
    >
      {/* Left: hamburger menu + egg icon + title */}
      <div className="flex items-center gap-3">
        <IconButton
          src={SMASH_EGG_ASSETS.headerMenuIcon}
          onClick={onMenuClick}
          label="Navigation menu"
        />
        <img
          src={SMASH_EGG_ASSETS.headerEggIcon}
          alt=""
          className="w-[17.5px] h-[22.5px] object-contain select-none"
          draggable={false}
        />
        <h1
          className="whitespace-nowrap leading-[28.8px] uppercase"
          style={{
            fontFamily: "var(--font-acme), 'Acme', sans-serif",
            fontSize: 24,
            letterSpacing: "-1.2px",
            color: "#ffd700",
          }}
        >
          SMASH Egg
        </h1>
      </div>

      {/* Right: info icon */}
      <div className="flex items-center gap-4">
        <IconButton
          src={SMASH_EGG_ASSETS.headerInfoIcon}
          onClick={onInfoClick}
          label="Info"
        />
      </div>
    </header>
  );
}
