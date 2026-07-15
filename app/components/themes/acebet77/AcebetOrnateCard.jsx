"use client";

import { ACEBET_ASSETS } from "./assets";

/**
 * Crowned ornate gold frame, built as a 3-slice so it GROWS with its content:
 *   • fixed crown/top-corners image
 *   • a vertically-stretched gold-rail middle that holds the content
 *   • fixed flourish/bottom-corners image
 *
 * Because the middle stretches to fit, the heading always sits below the crown
 * no matter how much content there is — no overlap, no fixed-aspect guessing.
 * Action buttons belong BELOW this card (that's how the Figma result dialogs
 * are composed), so callers render the frame for the heading/reward and place
 * buttons as siblings underneath.
 */
export default function AcebetOrnateCard({ children, className = "" }) {
  return (
    <div className={`relative flex w-full max-w-[360px] flex-col ${className}`}>
      <img
        src={ACEBET_ASSETS.ui.frameTop}
        alt=""
        aria-hidden="true"
        className="pointer-events-none block w-full select-none"
      />
      {/* Middle: gold rails stretched vertically behind the content. Negative
          margins close the hairline seams against the top/bottom slices. */}
      <div
        className="relative -my-px flex flex-col items-center text-center px-[13%] py-1"
        style={{
          backgroundImage: `url(${ACEBET_ASSETS.ui.frameMid})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {children}
      </div>
      <img
        src={ACEBET_ASSETS.ui.frameBottom}
        alt=""
        aria-hidden="true"
        className="pointer-events-none block w-full select-none"
      />
    </div>
  );
}
