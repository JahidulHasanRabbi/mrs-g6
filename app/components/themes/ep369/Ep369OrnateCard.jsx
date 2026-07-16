"use client";

import { EP369_ASSETS } from "./assets";

/**
 * Ornate emerald-gold EP369 frame. Stretched to the card via
 * backgroundSize:100% 100% with percentage padding so content sits inside the
 * green interior and the jewel ornaments scale with height (same technique as
 * the ubetclub frame). Action buttons belong BELOW this card.
 */
export default function Ep369OrnateCard({ children, className = "" }) {
  return (
    <div
      className={`relative w-full max-w-[360px] ${className}`}
      style={{
        backgroundImage: `url(${EP369_ASSETS.ui.frame})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex min-h-[240px] flex-col items-center justify-center text-center px-[13%] pt-[24%] pb-[15%]">
        {children}
      </div>
    </div>
  );
}
