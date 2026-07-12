"use client";

// Fixed 64px top bar shared by every RPG screen (Figma TopNav 2090:2488):
// gem + "RPG" wordmark on the left, info + hamburger on the right. Uses the
// same dark-green/gold chrome as the rest of MRS so players always recognise
// the way back to the station.

import { RPG_COLORS, RPG_FONTS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";

export default function RpgTopBar({ onInfoClick, onMenuClick }) {
  return (
    <header
      className="absolute inset-x-0 top-0 z-30 flex h-[64px] items-center justify-between border-b px-[24px]"
      style={{
        background: RPG_COLORS.chrome,
        borderColor: RPG_COLORS.chromeGold,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 4px 2px rgba(233,175,65,0.25)",
      }}
    >
      <div className="flex items-center gap-[12px]">
        <img src={RPG_IMAGES.ui.logoGem} alt="" className="size-[18px]" />
        <span
          className="text-[24px] uppercase leading-none tracking-[-1.2px]"
          style={{ color: RPG_COLORS.cyan, fontFamily: RPG_FONTS.logo }}
        >
          RPG
        </span>
      </div>
      <div className="flex items-center gap-[16px]">
        <button type="button" onClick={onInfoClick} aria-label="Game info" className="active:scale-90 transition-transform">
          <img src={RPG_IMAGES.ui.info} alt="" className="size-[36px] rounded-full object-cover" />
        </button>
        <button type="button" onClick={onMenuClick} aria-label="Open menu" className="active:scale-90 transition-transform">
          <img src={RPG_IMAGES.ui.menu} alt="" className="size-[36px] object-cover" />
        </button>
      </div>
    </header>
  );
}
