"use client";

import { EP369_ASSETS, EP369_COLORS } from './assets';

/**
 * Ornate EP369 button. Two variants from Figma:
 *  - "green" (default): emerald plaque, gold script text
 *  - "gold": solid gold plaque, near-black script text
 */
export default function Ep369Button({
  children,
  onClick,
  variant = 'green',
  disabled = false,
  className = '',
  textSize = 20,
}) {
  const isGold = variant === 'gold';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-center h-[60px] w-full max-w-[308px] overflow-hidden cursor-pointer select-none transition-transform active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <img
        src={isGold ? EP369_ASSETS.ui.btnGold : EP369_ASSETS.ui.btnGreen}
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />
      <span
        className="relative z-10 leading-none"
        style={{
          fontFamily: 'var(--font-berkshire-swash), cursive',
          color: isGold ? EP369_COLORS.dark : EP369_COLORS.goldBright,
          fontSize: `${textSize}px`,
        }}
      >
        {children}
      </span>
    </button>
  );
}
