"use client";

import Image from 'next/image';
import { useState } from 'react';
import { HamburgerMenu } from '../../hamburger';
import UbetclubBottomNav from './UbetclubBottomNav';
import ThemeHeader from '../shared/ThemeHeader';
import { UBET_ASSETS } from './assets';

/**
 * Ubetclub page chrome: full-bleed red-CNY background, the shared themed top
 * app bar (ThemeHeader) and the ornate bottom navigation.
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
  balance = null,
  title = null,
  titleIcon = null,
  profileMode = false,
  showBattlePoints = null,
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

      {showHeader && (
        <ThemeHeader
          hamburgerIcon={UBET_ASSETS.ui.hamburger}
          infoIcon={UBET_ASSETS.ui.info}
          coinIcon={UBET_ASSETS.ui.iconCoin}
          onMenuClick={() => setIsMenuOpen(true)}
          onInfoClick={onInfoClick}
          balance={balance}
          balanceAlign="right"
          title={title}
          titleIcon={titleIcon}
          profileMode={profileMode}
          showBattlePoints={showBattlePoints}
        />
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
