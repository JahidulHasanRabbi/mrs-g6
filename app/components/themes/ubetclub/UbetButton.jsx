"use client";

import { UBET_ASSETS, UBET_COLORS } from './assets';

/**
 * Ornate Ubetclub button. Two variants from Figma:
 *  - "red" (default): deep-red plaque, gold script text
 *  - "gold": solid gold plaque, near-black script text
 * object-cover crops the source glow margin so the plaque fills the box.
 */
export default function UbetButton({
  children,
  onClick,
  variant = 'red',
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
        src={isGold ? UBET_ASSETS.spin.btnPlay : UBET_ASSETS.ui.btnRed}
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />
      <span
        className="relative z-10 leading-none"
        style={{
          fontFamily: 'var(--font-berkshire-swash), cursive',
          color: UBET_COLORS.goldBright,
          fontSize: `${textSize}px`,
        }}
      >
        {children}
      </span>
    </button>
  );
}
