"use client";

import { UBET_ASSETS } from "./assets";

/**
 * Ornate red-gold Ubetclub frame. The frame art is stretched to the card via
 * backgroundSize:100% 100% and the content sits inside the red interior via
 * percentage padding, so the crown/jewel ornaments scale with height (the
 * Figma dialogs stretch the same frame ~1.4x). Keep bounded/scrolling content
 * so the frame never grows tall enough for the heading to reach the crown.
 *
 * Action buttons belong BELOW this card (that's how the Figma result dialogs
 * are composed) — callers render the frame for the heading/reward and place
 * buttons as siblings underneath.
 */
export default function UbetOrnateCard({ children, className = "" }) {
  return (
    <div
      className={`relative w-full max-w-[360px] ${className}`}
      style={{
        backgroundImage: `url(${UBET_ASSETS.ui.frame})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* min-height keeps sparse dialogs near the frame's native aspect so the
          crown/flourish don't squish; justify-center centres content in the
          red interior. */}
      <div className="flex min-h-[248px] flex-col items-center justify-center text-center px-[13%] pt-[25%] pb-[15%]">
        {children}
      </div>
    </div>
  );
}
