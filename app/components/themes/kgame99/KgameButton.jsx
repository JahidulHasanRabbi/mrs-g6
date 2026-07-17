"use client";

import { KGAME99_ASSETS, KGAME99_COLORS } from './assets';

/**
 * Ornate Kgame99 button. Two variants from Figma:
 *  - "dark": blue plaque with gold filigree border, gold/cream script text
 *  - "gold": solid gold plaque, dark script text
 */
export default function KgameButton({
  children,
  onClick,
  variant = 'dark',
  disabled = false,
  className = '',
  textSize = 20,
}) {
  const isGold = variant === 'gold';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-center h-[65px] w-full max-w-[308px] cursor-pointer select-none transition-transform active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <img
        src={isGold ? KGAME99_ASSETS.ui.btnGold : KGAME99_ASSETS.egg.btnWide}
        alt=""
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
      />
      <span
        className="relative z-10 leading-none"
        style={{
          fontFamily: 'var(--font-berkshire-swash), cursive',
          color: isGold ? KGAME99_COLORS.dark : KGAME99_COLORS.goldBright,
          fontSize: `${textSize}px`,
        }}
      >
        {children}
      </span>
    </button>
  );
}
