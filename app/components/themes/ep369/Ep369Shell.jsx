"use client";

import Image from 'next/image';
import { useState } from 'react';
import { HamburgerMenu } from '../../hamburger';
import Ep369BottomNav from './Ep369BottomNav';
import ThemeHeader from '../shared/ThemeHeader';
import { EP369_ASSETS } from './assets';

/**
 * EP369 page chrome: full-bleed emerald-forest background, the shared themed
 * top app bar (ThemeHeader) and the ornate green bottom navigation.
 */
export default function Ep369Shell({
  bg,
  children,
  onInfoClick,
  showNav = true,
  showHeader = true,
  contentPadding = true,
  bgOverlay = null,
  balance = null,
  title = null,
  titleIcon = null,
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
        <ThemeHeader
          hamburgerIcon={EP369_ASSETS.ui.hamburger}
          infoIcon={EP369_ASSETS.ui.info}
          coinIcon={EP369_ASSETS.ui.iconCoin}
          onMenuClick={() => setIsMenuOpen(true)}
          onInfoClick={onInfoClick}
          balance={balance}
          title={title}
          titleIcon={titleIcon}
        />
      )}

      <main className={`relative z-10 ${contentPadding ? 'pt-[64px] pb-[120px]' : ''} min-h-screen`}>
        {children}
      </main>

      {showNav && <Ep369BottomNav />}

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
