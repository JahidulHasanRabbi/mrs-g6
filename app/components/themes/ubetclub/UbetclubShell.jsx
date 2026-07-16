"use client";

import Image from 'next/image';
import { useState } from 'react';
import { HamburgerMenu } from '../../hamburger';
import UbetclubBottomNav from './UbetclubBottomNav';
import { UBET_ASSETS } from './assets';

/**
 * Ubetclub page chrome: full-bleed red-CNY background, top app bar
 * (hamburger left, info right) and the ornate bottom navigation.
 *
 * Pages render their content as children; the shell reserves space for the
 * fixed top bar (64px) and bottom nav (100px) via padding unless disabled.
 */
export default function UbetclubShell({
  bg,
  children,
  onInfoClick,
  showNav = true,
  showHeader = true,
  contentPadding = true,
  bgOverlay = null,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background artwork */}
      {bg && (
        <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] z-0">
          <Image src={bg} alt="" fill priority className="object-cover" sizes="475px" />
          {bgOverlay}
        </div>
      )}

      {/* Top app bar */}
      {showHeader && (
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-[64px] z-40 flex items-center justify-between px-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="relative w-9 h-9 cursor-pointer active:scale-95 transition-transform"
          >
            <Image src={UBET_ASSETS.ui.hamburger} alt="Menu" fill className="object-contain" sizes="36px" />
          </button>
          {onInfoClick ? (
            <button
              onClick={onInfoClick}
              aria-label="Information"
              className="relative w-9 h-9 cursor-pointer active:scale-95 transition-transform rounded-full overflow-hidden"
            >
              <Image src={UBET_ASSETS.ui.info} alt="Info" fill className="object-contain scale-110" sizes="36px" />
            </button>
          ) : (
            <span className="w-9 h-9" />
          )}
        </header>
      )}

      {/* Page content */}
      <main className={`relative z-10 ${contentPadding ? 'pt-[64px] pb-[120px]' : ''} min-h-screen`}>
        {children}
      </main>

      {showNav && <UbetclubBottomNav />}

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
