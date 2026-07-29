"use client";

// Fixed 64px top bar shared by every Avatar screen. Layout matches the other
// MRS games (see penalty-kick TopHud): hamburger menu on the LEFT next to the
// wordmark, info on the RIGHT — so the "way back to the station" is always in
// the same corner across games. Dark-green/gold chrome as elsewhere.

import { RPG_COLORS, RPG_FONTS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";

export default function RpgTopBar({ onInfoClick, onMenuClick }) {
  return (
    <header
      className="fixed top-0 left-1/2 z-40 flex h-[64px] w-full max-w-[475px] -translate-x-1/2 items-center justify-between border-b px-[24px]"
      style={{
        background: RPG_COLORS.chrome,
        borderColor: RPG_COLORS.chromeGold,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 4px 2px rgba(233,175,65,0.25)",
      }}
    >
      <div className="flex items-center gap-[12px]">
        <button type="button" onClick={onMenuClick} aria-label="Open menu" className="active:scale-90 transition-transform">
          <img src={RPG_IMAGES.ui.menu} alt="" className="size-[36px] object-cover" />
        </button>
        <div className="flex items-center gap-[10px]">
          <img src={RPG_IMAGES.ui.logoGem} alt="" className="size-[18px]" />
          <span
            className="text-[24px] uppercase leading-none tracking-[-1.2px]"
            style={{ color: RPG_COLORS.cyan, fontFamily: RPG_FONTS.logo }}
          >
            AVATAR
          </span>
        </div>
      </div>
      <button type="button" onClick={onInfoClick} aria-label="Game info" className="active:scale-90 transition-transform">
        <img src={RPG_IMAGES.ui.info} alt="" className="size-[36px] rounded-full object-cover" />
      </button>
    </header>
  );
}
