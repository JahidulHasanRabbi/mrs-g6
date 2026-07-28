"use client";

import KgameListPanel from './KgameListPanel';
import KgameSectionHeading from './KgameSectionHeading';
import { SMASH_EGG_ASSETS } from '../../smash-egg/smashEggAssets';
import { KGAME99_COLORS } from './assets';

/**
 * Kgame99 Terms & Conditions — same content as the shared SmashEggTerms,
 * restyled to sit on the ornate panel. Heading rendered outside.
 */
export default function KgameTerms({ termsText = '' }) {
  const terms = String(termsText || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <KgameSectionHeading>Terms &amp; Conditions</KgameSectionHeading>
      <KgameListPanel height={250}>
        {terms.length === 0 ? (
          <p className="pt-2 text-[13px]" style={{ color: '#42597a', fontFamily: 'var(--font-rubik), sans-serif' }}>
            No terms and conditions available.
          </p>
        ) : (
          terms.map((term, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <img src={SMASH_EGG_ASSETS.termsIcon} alt="" className="mt-[3px] h-4 w-[18px] shrink-0 object-contain" />
              <p className="flex-1 text-[13px] leading-5" style={{ color: KGAME99_COLORS.dark, fontFamily: 'var(--font-acme), sans-serif' }}>{term}</p>
            </div>
          ))
        )}
      </KgameListPanel>
    </div>
  );
}
