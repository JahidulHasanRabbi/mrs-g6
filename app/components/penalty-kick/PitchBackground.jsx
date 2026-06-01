"use client";

// Stadium photo backdrop vendored from Figma. The same image serves both
// the wide splash variant (Loading/Launch) and the close gameplay variant
// — only the crop differs (object-position controls where the focus sits).

import { COLORS } from "./constants";
import { IMAGES } from "./assets";

export default function PitchBackground({ variant = "close", children }) {
  // close variant uses a CSS background to render a zoomed-in crop of the
  // photo (≈ 200 % of container width), bottom-anchored so the grass-heavy
  // lower half of the photo fills the visible area. The native photo only
  // has grass in its bottom 20 % — without this zoom the field looks like
  // a thin strip, and the keeper+ball end up squashed against each other.
  const isClose = variant === "close";

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
      {isClose ? (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${IMAGES.stadiumBg})`,
            backgroundSize: "200% auto",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : (
        <img
          src={IMAGES.stadiumBg}
          alt=""
          draggable={false}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full select-none"
          style={{
            objectFit: "cover",
            // wide variant focuses on the upper stadium (sky + floodlights)
            objectPosition: "center 40%",
          }}
        />
      )}
      {/* Top vignette so the gold HUD chrome reads cleanly against the photo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 22%, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.35) 78%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      {children}
    </div>
  );
}
