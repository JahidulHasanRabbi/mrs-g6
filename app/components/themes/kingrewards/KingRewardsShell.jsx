"use client";

import Image from 'next/image';
import { useState } from 'react';
import { HamburgerMenu } from '../../hamburger';
import KingRewardsBottomNav from './KingRewardsBottomNav';
import ThemeHeader from '../shared/ThemeHeader';
import { useUser } from '../../../contexts/UserContext';
import { KR_ASSETS } from './assets';

export default function KingRewardsShell({
  bg = KR_ASSETS.ui.bg,
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
  const { userData } = useUser();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#021a3f]">
      {bg && (
        <div className="fixed inset-0 left-1/2 z-0 w-full max-w-[475px] -translate-x-1/2">
          <Image src={bg} alt="" fill priority className="object-cover" sizes="475px" />
          {bgOverlay}
        </div>
      )}

      {showHeader && (
        <ThemeHeader
          hamburgerIcon={KR_ASSETS.ui.hamburger}
          infoIcon={KR_ASSETS.ui.info}
          coinIcon={KR_ASSETS.ui.iconCoins}
          onMenuClick={() => setIsMenuOpen(true)}
          onInfoClick={onInfoClick}
          // Pages that pass no balance would otherwise get ThemeHeader's brown BP
          // pill; pages that hide the chips (Smash Egg) keep a bare bar.
          balance={balance ?? (showBattlePoints === false ? null : userData?.balance ?? 0)}
          balanceAlign="right"
          title={title}
          titleIcon={titleIcon}
          profileMode={profileMode}
          showBattlePoints={showBattlePoints}
        />
      )}

      <main className={`relative z-10 ${contentPadding ? 'pt-[64px] pb-[104px]' : ''} min-h-screen`}>
        {children}
      </main>

      {showNav && <KingRewardsBottomNav />}

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
