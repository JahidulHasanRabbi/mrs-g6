"use client";

import Image from 'next/image';
import Lv918ListPanel from './Lv918ListPanel';
import Lv918SectionHeading from './Lv918SectionHeading';
import { SMASH_EGG_ASSETS } from '../../smash-egg/smashEggAssets';
import { LV918_COLORS } from './assets';

// Rank accents as jewel tones that fit the crystal-kingdom theme.
const RANK = {
  1: { accent: '#1f9e57', badge: SMASH_EGG_ASSETS.rankBadge1 },
  2: { accent: '#d4941a', badge: SMASH_EGG_ASSETS.rankBadge2 },
  3: { accent: '#c06a1a', badge: SMASH_EGG_ASSETS.rankBadge3 },
};

/**
 * Lv918 Prize List — same data as the shared PrizeList, restyled to sit on
 * the ornate panel (light interior → dark text). Heading rendered outside.
 */
export default function Lv918PrizeList({ prizes = [], creditRanges = [] }) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Lv918SectionHeading>Prize List</Lv918SectionHeading>
      <Lv918ListPanel height={380}>
        <div className="flex flex-col gap-2">
          {prizes.map((prize) => {
            const r = RANK[prize.rank] || RANK[3];
            const showImg = prize.itemType === 'Prize' && prize.image;
            return (
              <div
                key={prize.rank}
                className="flex items-center gap-2.5 rounded-lg border-l-[3px] bg-[rgba(255,255,255,0.42)] px-2.5 py-1.5"
                style={{ borderColor: r.accent }}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[rgba(3,10,26,0.7)] ring-1 ring-[rgba(242,203,122,0.25)]">
                  {showImg ? (
                    <img src={prize.image} alt={prize.name} className="h-full w-full object-cover p-px" />
                  ) : (
                    <img src={SMASH_EGG_ASSETS.coinsIcon} alt="" className="h-full w-full object-contain p-2" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] leading-[13px]" style={{ fontFamily: 'var(--font-acme), sans-serif', color: r.accent }}>
                    RANK {String(prize.rank).padStart(2, '0')}
                  </p>
                  <p className="truncate text-[13px] leading-[18px]" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: LV918_COLORS.inkStrong }}>
                    {prize.name}
                  </p>
                </div>
                {r.badge && (
                  <div className="relative h-7 w-5 shrink-0">
                    <Image src={r.badge} alt="" fill sizes="20px" className="object-contain" />
                  </div>
                )}
              </div>
            );
          })}

          {creditRanges.length > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {creditRanges.map((label, i) => (
                <div key={`${label}-${i}`} className="flex items-center gap-1.5 rounded-md bg-[rgba(255,255,255,0.42)] px-2 py-1.5 ring-1 ring-inset ring-[rgba(197,140,60,0.35)]">
                  <img src={SMASH_EGG_ASSETS.coinsIcon} alt="" className="h-5 w-5 shrink-0 object-contain" />
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase leading-[11px]" style={{ fontFamily: 'var(--font-acme), sans-serif', color: LV918_COLORS.inkGold }}>Free Credit</p>
                    <p className="truncate text-[9px] leading-[12px]" style={{ fontFamily: 'var(--font-rubik), sans-serif', color: LV918_COLORS.inkStrong }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Lv918ListPanel>
    </div>
  );
}
