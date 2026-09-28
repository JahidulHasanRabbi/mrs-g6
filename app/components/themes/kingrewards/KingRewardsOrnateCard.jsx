"use client";

import { KR_SURFACES } from "./assets";

/** The ornate-card slot, drawn as King Rewards' navy glass card. */
export default function KingRewardsOrnateCard({ children, className = "" }) {
  return (
    <div
      className={`relative flex w-full max-w-[380px] flex-col items-center rounded-[16px] px-2 py-4 text-center ${className}`}
      style={KR_SURFACES.solid}
    >
      {children}
    </div>
  );
}
