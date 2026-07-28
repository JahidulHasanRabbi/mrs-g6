"use client";

import { N1GANG_ASSETS, N1GANG_COLORS } from './assets';

export default function N1gangButton({
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
        src={isGold ? N1GANG_ASSETS.spin.btnPlay : N1GANG_ASSETS.egg.btnWide}
        alt=""
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
      />
      <span
        className="relative z-10 leading-none"
        style={{
          fontFamily: 'var(--font-berkshire-swash), cursive',
          color: N1GANG_COLORS.goldBright,
          fontSize: `${textSize}px`,
        }}
      >
        {children}
      </span>
    </button>
  );
}
