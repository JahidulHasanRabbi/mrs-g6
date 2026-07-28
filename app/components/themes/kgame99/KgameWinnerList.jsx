"use client";

import KgameListPanel from './KgameListPanel';
import KgameSectionHeading from './KgameSectionHeading';
import { KGAME99_COLORS } from './assets';

/**
 * Kgame99 Winner feed — same data as the shared WinnerList, restyled to sit on
 * the ornate panel (light interior → dark text). Heading rendered outside.
 */
export default function KgameWinnerList({ winners = [] }) {
  const rows = winners.slice(0, 20);
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <KgameSectionHeading>Winner</KgameSectionHeading>
      <KgameListPanel height={300}>
        {rows.length === 0 ? (
          <p className="pt-2 text-[13px]" style={{ color: '#42597a', fontFamily: 'var(--font-rubik), sans-serif' }}>
            No winners yet.
          </p>
        ) : (
          rows.map((w, i) => (
            <div key={`${w.date}-${w.name}-${i}`} className="border-l border-[#c3a813] py-2 pl-[13px]">
              <p className="text-[10px] leading-[15px]" style={{ color: '#5a6f8c', fontFamily: 'var(--font-rubik), sans-serif' }}>{w.date}</p>
              <p className="text-[15px] leading-6" style={{ color: '#1c4fa8', fontFamily: 'var(--font-acme), sans-serif' }}>{w.name}</p>
              <p className="truncate text-[15px] leading-6" style={{ color: KGAME99_COLORS.dark, fontFamily: 'var(--font-acme), sans-serif' }}>{w.prize}</p>
            </div>
          ))
        )}
      </KgameListPanel>
    </div>
  );
}
