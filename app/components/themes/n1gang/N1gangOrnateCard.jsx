"use client";

import { N1GANG_ASSETS } from "./assets";

// Single stretched plate rather than a 3-slice.
//
// This used to stack frameTop / frameMid / frameBottom, but those three are
// unrelated pieces of art at different sizes (415x237 vs 362x272) — frame-mid
// and frame-bottom are in fact the same image. Stacking them produced
// mismatched widths and left the crest baked into the top cap bleeding through
// behind the card's first row of content. `frames.panel` is a plain bordered
// plate with a dark interior and no baked header, so content sits cleanly on it
// at any height.
export default function N1gangOrnateCard({ children, className = "" }) {
  return (
    <div
      className={`relative flex w-full max-w-[360px] flex-col items-center text-center ${className}`}
      style={{
        backgroundImage: `url(${N1GANG_ASSETS.frames.panel})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        padding: "13% 12%",
      }}
    >
      {children}
    </div>
  );
}
