"use client";

// Fixed 64px top bar shared by every Avatar screen. Layout matches the other
// MRS games (see penalty-kick TopHud): hamburger menu on the LEFT next to the
// wordmark, info on the RIGHT — so the "way back to the station" is always in
// the same corner across games.

import { RPG_FONTS } from "./constants";
import { useRpgSkin } from "./rpgSkin";

export default function RpgTopBar({ onInfoClick, onMenuClick }) {
  const skin = useRpgSkin();
  const { chrome } = skin;

  return (
    <header
      className="fixed top-0 left-1/2 z-40 flex h-[64px] w-full max-w-[475px] -translate-x-1/2 items-center justify-between border-b px-[24px]"
      style={{
        background: chrome.bar,
        borderColor: chrome.barBorder,
        boxShadow: chrome.barShadow,
      }}
    >
      <div className="flex items-center gap-[12px]">
        <button type="button" onClick={onMenuClick} aria-label="Open menu" className="active:scale-90 transition-transform">
          <img src={chrome.menuIcon} alt="" className="size-[36px] object-cover" />
        </button>
        <div className="flex items-center gap-[10px]">
          {chrome.logoIcon && <img src={chrome.logoIcon} alt="" className="size-[18px]" />}
          <span
            className="text-[24px] uppercase leading-none tracking-[-1.2px]"
            style={{
              color: chrome.logoColor,
              fontFamily: RPG_FONTS.logo,
              textShadow: chrome.logoShadow,
            }}
          >
            AVATAR
          </span>
        </div>
      </div>
      <button type="button" onClick={onInfoClick} aria-label="Game info" className="active:scale-90 transition-transform">
        <img src={chrome.infoIcon} alt="" className="size-[36px] rounded-full object-cover" />
      </button>
    </header>
  );
}
