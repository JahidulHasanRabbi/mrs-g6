"use client";

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ProfileFrame from '../../profile/ProfileFrame';
import { PROFILE_ASSETS } from '../../profile/profileAssets';
import { useUser } from '../../../contexts/UserContext';
import { PHASE4_ASSETS } from '../../../config/phase4';

/**
 * Shared themed top app bar for the member game pages (acebet77 / ubetclub /
 * ep369 / kgame99 / lv918). One implementation for every skin — each theme
 * only passes its own icon art and (optionally) a game title or balance:
 *
 *  - hamburger (left) — always shown, opens the nav menu
 *  - titleIcon + title (left, after the hamburger)
 *  - balance pill (right-aligned by default)
 *  - profile button (right, when profileMode) or info icon (right, otherwise)
 */
function formatBalance(value) {
  const amount = Number(String(value ?? 0).replace(/,/g, ''));
  if (!Number.isFinite(amount)) return '0.00';
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatBattlePoints(value) {
  const amount = Number(String(value ?? 0).replace(/,/g, ''));
  if (!Number.isFinite(amount)) return '0';
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function ThemeHeader({
  hamburgerIcon,
  infoIcon,
  coinIcon = PHASE4_ASSETS.token,
  onMenuClick,
  onInfoClick,
  balance = null,
  balanceAlign = 'center',
  title = null,
  titleIcon = null,
  hamburgerFit = 'object-contain',
  infoFit = 'object-contain',
  profileMode = false,
}) {
  const pathname = usePathname();
  const { userData, profilePicture, selectedFrameId } = useUser();
  const battlePoints = userData?.battlePoints;
  const showBattlePoints = pathname !== '/';

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[475px] h-[64px] z-40 flex items-center justify-between px-4">
      {title && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 100%)' }}
        />
      )}

      {/* Left: hamburger + optional game title */}
      <div className="relative flex items-center gap-2">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="relative w-9 h-9 cursor-pointer active:scale-95 transition-transform"
        >
          <Image src={hamburgerIcon} alt="Menu" fill className={hamburgerFit} sizes="36px" />
        </button>
        {titleIcon && (
          <img src={titleIcon} alt="" className="h-[22px] w-auto object-contain select-none" draggable={false} />
        )}
        {title && (
          <span
            className="whitespace-nowrap uppercase leading-none"
            style={{
              fontFamily: "var(--font-acme), 'Acme', sans-serif",
              fontSize: 22,
              letterSpacing: '-1px',
              color: '#ffd700',
              textShadow: '0 2px 6px rgba(0,0,0,0.75)',
            }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Centre: optional balance pill (default alignment) */}
      {balance !== null && balanceAlign === 'center' && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 h-[38px] px-4 rounded-full border border-[rgba(255,225,109,0.3)] bg-[rgba(57,53,40,0.85)] backdrop-blur-[6px]">
          <img src={coinIcon} alt="" className="w-[18px] h-[18px] object-contain" />
          <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: '#ffe16d' }}>
            {formatBalance(balance)}
          </span>
        </div>
      )}

      {/* Right: optional balance pill (right alignment) + profile/info button */}
      <div className="relative flex items-center gap-2">
        {showBattlePoints && (
          <div
            className="flex h-[36px] min-w-[70px] max-w-[92px] items-center justify-center gap-1 rounded-full border border-[rgba(255,225,109,0.3)] bg-[rgba(57,53,40,0.85)] px-2 backdrop-blur-[6px]"
            aria-label={`${formatBattlePoints(battlePoints)} Battle Points`}
          >
            <img
              src={PHASE4_ASSETS.battlePoint}
              alt=""
              className="h-[18px] w-[18px] shrink-0 object-contain"
            />
            <span
              className="min-w-0 truncate text-[13px] font-semibold"
              style={{ fontFamily: 'var(--font-rubik), sans-serif', color: '#ffe16d' }}
            >
              {formatBattlePoints(battlePoints)}
            </span>
          </div>
        )}
        {balance !== null && balanceAlign === 'right' && (
          <div className="flex items-center gap-2 h-[36px] px-3 rounded-full border border-[rgba(255,225,109,0.3)] bg-[rgba(57,53,40,0.85)] backdrop-blur-[6px]">
            <img src={coinIcon} alt="" className="w-[18px] h-[18px] object-contain" />
            <span className="text-[14px] font-semibold" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: '#ffe16d' }}>
              {formatBalance(balance)}
            </span>
          </div>
        )}
        {onInfoClick ? (
          profileMode ? (
            <ProfileFrame
              src={profilePicture || PROFILE_ASSETS.profileAvatar}
              frameId={selectedFrameId}
              size={48}
              alt="Profile"
              onClick={onInfoClick}
            />
          ) : (
            <button
              onClick={onInfoClick}
              aria-label="Information"
              className="relative w-9 h-9 cursor-pointer active:scale-95 transition-transform rounded-full overflow-hidden"
            >
              <Image src={infoIcon} alt="Info" fill className={`${infoFit} scale-110`} sizes="36px" />
            </button>
          )
        ) : (
          <span className="w-9 h-9" />
        )}
      </div>
    </header>
  );
}
