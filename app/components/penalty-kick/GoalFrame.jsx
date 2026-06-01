"use client";

import { IMAGES } from "./assets";

// Goalpost PNG (trimmed of its bottom transparent padding so the image
// bottom == the goal base). Anchored at bottom: 42 vh — the new grass
// horizon after PitchBackground's 200 %-zoom on the stadium photo. With
// the zoom, the photo's grass band moves from 20 vh up to ~42 vh from the
// page bottom, opening up a wide foreground grass strip between the
// keeper and the ball (perspective: keeper at the goal line in the back,
// ball at the penalty spot in the foreground).
export default function GoalFrame() {
  return (
    <img
      src={IMAGES.goalpost}
      alt=""
      draggable={false}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 w-[400px] -translate-x-1/2 select-none"
      style={{
        // bottom 58vh sits the goal on the photo's distant-grass strip
        // (the band between the crowd and the foreground grass), where
        // a real far-end goal would be. width 400 spans most of the
        // viewport so the goal reads as a proper penalty-spot target
        // (earlier 300 still felt too far away). Keeper scales in
        // lockstep so it stays anchored inside the goalmouth.
        bottom: "58vh",
        filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.6))",
      }}
    />
  );
}
