"use client";

import Image from 'next/image';
import { useState } from 'react';
import { HamburgerMenu } from '../../hamburger';
import Ep369BottomNav from './Ep369BottomNav';
import { EP369_ASSETS } from './assets';

/**
 * EP369 page chrome: full-bleed emerald-forest background, top app bar
 * (hamburger left, info right) and the ornate green bottom navigation.
 */
function formatBalance(value) {
  const amount = Number(String(value ?? 0).replace(/,/g, ''));
  if (!Number.isFinite(amount)) return '0.00';
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Ep369Shell({
  bg,
  children,
  onInfoClick,
  showNav = true,
  showHeader = true,
  contentPadding = true,
  bgOverlay = null,
  balance = null,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {bg && (
        <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] z-0">
          <Image src={bg} alt="" fill priority className="object-cover" sizes="475px" />
          {bgOverlay}
        </div>
      )}

      {showHeader && (
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-[64px] z-40 flex items-center justify-between px-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="relative w-9 h-9 cursor-pointer active:scale-95 transition-transform"
          >
            <Image src={EP369_ASSETS.ui.hamburger} alt="Menu" fill className="object-contain" sizes="36px" />
          </button>
          {balance !== null && (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 h-[38px] px-4 rounded-full border border-[rgba(255,225,109,0.3)] bg-[rgba(57,53,40,0.85)] backdrop-blur-[6px]">
              <img src={EP369_ASSETS.ui.iconCoin} alt="" className="w-[16px] h-[16px]" />
              <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: '#ffe16d' }}>
                {formatBalance(balance)}
              </span>
            </div>
          )}
          {onInfoClick ? (
            <button
              onClick={onInfoClick}
              aria-label="Information"
              className="relative w-9 h-9 cursor-pointer active:scale-95 transition-transform rounded-full overflow-hidden"
            >
              <Image src={EP369_ASSETS.ui.info} alt="Info" fill className="object-contain scale-110" sizes="36px" />
            </button>
          ) : (
            <span className="w-9 h-9" />
          )}
        </header>
      )}

      <main className={`relative z-10 ${contentPadding ? 'pt-[64px] pb-[120px]' : ''} min-h-screen`}>
        {children}
      </main>

      {showNav && <Ep369BottomNav />}

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
