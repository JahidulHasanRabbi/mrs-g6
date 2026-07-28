"use client";

import Image from 'next/image';
import { useState } from 'react';
import { HamburgerMenu } from '../../hamburger';
import N1gangBottomNav from './N1gangBottomNav';
import ThemeHeader from '../shared/ThemeHeader';
import { N1GANG_ASSETS } from './assets';

export default function N1gangShell({
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
  profileMode = false,
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
          hamburgerIcon={N1GANG_ASSETS.ui.hamburger}
          hamburgerFit="object-cover"
          infoIcon={N1GANG_ASSETS.ui.info}
          infoFit="object-cover"
          coinIcon={N1GANG_ASSETS.ui.iconCoins}
          onMenuClick={() => setIsMenuOpen(true)}
          onInfoClick={onInfoClick}
          balance={balance}
          balanceAlign="right"
          title={title}
          titleIcon={titleIcon}
          profileMode={profileMode}
        />
      )}

      <main className={`relative z-10 ${contentPadding ? 'pt-[64px] pb-[120px]' : ''} min-h-screen`}>
        {children}
      </main>

      {showNav && <N1gangBottomNav />}

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
