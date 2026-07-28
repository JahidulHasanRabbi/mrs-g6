"use client";

import FramedPanel from "./FramedPanel";
import FramedHeading from "./FramedHeading";

/** Shared Smash-Egg winner feed on the theme's ornate frame, heading outside. */
export default function FramedWinnerList({ skin, winners = [] }) {
  const rows = winners.slice(0, 20);
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <FramedHeading gradient={skin.headingGradient}>Winner</FramedHeading>
      <FramedPanel skin={skin} height={300}>
        {rows.length === 0 ? (
          <p className="pt-2 text-[13px]" style={{ color: skin.c.empty, fontFamily: "var(--font-rubik), sans-serif" }}>
            No winners yet.
          </p>
        ) : (
          rows.map((w, i) => (
            <div key={`${w.date}-${w.name}-${i}`} className="border-l border-[rgba(255,215,120,0.5)] py-2 pl-[13px]">
              <p className="text-[10px] leading-[15px]" style={{ color: skin.c.date, fontFamily: "var(--font-rubik), sans-serif" }}>{w.date}</p>
              <p className="text-[15px] leading-6" style={{ color: skin.c.name, fontFamily: "var(--font-acme), sans-serif" }}>{w.name}</p>
              <p className="truncate text-[15px] leading-6" style={{ color: skin.c.reward, fontFamily: "var(--font-acme), sans-serif" }}>{w.prize}</p>
            </div>
          ))
        )}
      </FramedPanel>
    </div>
  );
}
