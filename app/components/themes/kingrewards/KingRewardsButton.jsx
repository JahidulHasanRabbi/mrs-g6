"use client";

import { KR_ASSETS, KR_COLORS, KR_FONT } from './assets';

/**
 * Shared-signature theme button. `gold` is the btn-gold plaque with navy ink;
 * `dark` is the outline pill (Figma "Back").
 */
export default function KingRewardsButton({
  children,
  onClick,
  variant = 'dark',
  disabled = false,
  className = '',
  textSize = 16,
}) {
  const isGold = variant === 'gold';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex h-[51px] w-full max-w-[364px] cursor-pointer select-none items-center justify-center rounded-[48px] font-semibold transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{
        fontFamily: KR_FONT,
        fontSize: textSize,
        color: isGold ? KR_COLORS.onGold : KR_COLORS.gold,
        ...(isGold
          ? { backgroundImage: `url(${KR_ASSETS.ui.btnGold})`, backgroundSize: '100% 100%' }
          : { border: `1.5px solid ${KR_COLORS.goldBright}`, background: 'rgba(255,255,255,0.05)' }),
      }}
    >
      <span className="relative z-10 leading-none">{children}</span>
    </button>
  );
}
