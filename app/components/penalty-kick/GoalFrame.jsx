"use client";

import { IMAGES } from "./assets";

// Goalpost PNG (trimmed of its bottom transparent padding so the image
// bottom == the goal base). Anchored to the photo's distant-grass strip
// (the band between crowd and foreground grass), where a real far-end
// goal would be. PitchBackground scales the stadium photo as 200% of
// container WIDTH, so the horizon position from container bottom scales
// linearly with width — meaning the goal anchor must also be width-based
// or it drifts off the grass on narrow viewports (e.g., on 320 wide the
// photo is short, horizon falls at ~432 px from bottom, and a height-
// based 58vh anchor would float the goal in the sky above it).
export default function GoalFrame() {
  return (
    <img
      src={IMAGES.goalpost}
      alt=""
      draggable={false}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none"
      style={{
        // Width scales with the surface: 400px is the design width at the
        // 475 container clamp (400/475 ≈ 84%), so min(400px, 84vw) caps at
        // 400 on wide screens and shrinks proportionally on narrow phones —
        // keeps the goal mouth inside the posts instead of clipping the
        // edges on a 320-wide device. Keeper + ball + physics scale on the
        // same 475 basis so everything stays aligned.
        width: "min(400px, 84vw)",
        // Height-based anchor: the goal base sits at 48vh on every device,
        // matching PitchBackground's height-based grass horizon (auto 135%).
        // A width-based anchor collapsed too low on narrow-tall phones
        // (110vw ≈ 37vh on a 288-wide screen) and left a dark void up top.
        bottom: "48vh",
        filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.6))",
      }}
    />
  );
}
