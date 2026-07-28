"use client";

import Lv918ListPanel from './Lv918ListPanel';
import Lv918SectionHeading from './Lv918SectionHeading';
import { LV918_COLORS } from './assets';

/**
 * Lv918 Winner feed — same data as the shared WinnerList, restyled to sit on
 * the ornate panel (light interior → dark text). Heading rendered outside.
 */
export default function Lv918WinnerList({ winners = [] }) {
  const rows = winners.slice(0, 20);
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Lv918SectionHeading>Winner</Lv918SectionHeading>
      <Lv918ListPanel height={300}>
        {rows.length === 0 ? (
          <p className="pt-2 text-[13px]" style={{ color: LV918_COLORS.inkSoft, fontFamily: 'var(--font-rubik), sans-serif' }}>
            No winners yet.
          </p>
        ) : (
          rows.map((w, i) => (
            <div key={`${w.date}-${w.name}-${i}`} className="border-l-2 border-[#c9791f] py-2 pl-[13px]">
              <p className="text-[10px] leading-[15px]" style={{ color: LV918_COLORS.inkMuted, fontFamily: 'var(--font-rubik), sans-serif' }}>{w.date}</p>
              <p className="text-[15px] leading-6" style={{ color: LV918_COLORS.ink, fontFamily: 'var(--font-acme), sans-serif' }}>{w.name}</p>
              <p className="truncate text-[15px] leading-6" style={{ color: LV918_COLORS.inkStrong, fontFamily: 'var(--font-acme), sans-serif' }}>{w.prize}</p>
            </div>
          ))
        )}
      </Lv918ListPanel>
    </div>
  );
}
