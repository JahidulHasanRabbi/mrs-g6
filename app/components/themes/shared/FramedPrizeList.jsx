"use client";

import Image from "next/image";
import FramedPanel from "./FramedPanel";
import FramedHeading from "./FramedHeading";
import { SMASH_EGG_ASSETS } from "../../smash-egg/smashEggAssets";

const RANK_BADGES = { 1: SMASH_EGG_ASSETS.rankBadge1, 2: SMASH_EGG_ASSETS.rankBadge2, 3: SMASH_EGG_ASSETS.rankBadge3 };

/** Shared Smash-Egg prize list on the theme's ornate frame, heading outside. */
export default function FramedPrizeList({ skin, prizes = [], creditRanges = [] }) {
  const ra = skin.rankAccents;
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <FramedHeading gradient={skin.headingGradient}>Prize List</FramedHeading>
      <FramedPanel skin={skin} height={380}>
        <div className="flex flex-col gap-2">
          {prizes.map((p) => {
            const accent = ra[p.rank] || ra[3];
            const showImg = p.itemType === "Prize" && p.image;
            const badge = RANK_BADGES[p.rank];
            return (
              <div key={p.rank} className="flex items-center gap-2.5 rounded-lg border-l-[3px] bg-[rgba(255,255,255,0.06)] px-2.5 py-1.5" style={{ borderColor: accent }}>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[rgba(0,0,0,0.5)] ring-1 ring-[rgba(255,215,120,0.25)]">
                  {showImg ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover p-px" />
                  ) : (
                    <img src={SMASH_EGG_ASSETS.coinsIcon} alt="" className="h-full w-full object-contain p-2" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] leading-[13px]" style={{ fontFamily: "var(--font-acme), sans-serif", color: accent }}>
                    RANK {String(p.rank).padStart(2, "0")}
                  </p>
                  <p className="truncate text-[13px] leading-[18px]" style={{ fontFamily: "var(--font-rubik), sans-serif", color: skin.c.rowText }}>{p.name}</p>
                </div>
                {badge && (
                  <div className="relative h-7 w-5 shrink-0">
                    <Image src={badge} alt="" fill sizes="20px" className="object-contain" />
                  </div>
                )}
              </div>
            );
          })}

          {creditRanges.length > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {creditRanges.map((label, i) => (
                <div key={`${label}-${i}`} className="flex items-center gap-1.5 rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1.5 ring-1 ring-inset ring-[rgba(255,215,120,0.22)]">
                  <img src={SMASH_EGG_ASSETS.coinsIcon} alt="" className="h-5 w-5 shrink-0 object-contain" />
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase leading-[11px]" style={{ fontFamily: "var(--font-acme), sans-serif", color: skin.c.freeCreditLabel }}>Free Credit</p>
                    <p className="truncate text-[9px] leading-[12px]" style={{ fontFamily: "var(--font-rubik), sans-serif", color: skin.c.freeCreditValue }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FramedPanel>
    </div>
  );
}
