"use client";

// Stadium photo backdrop vendored from Figma. The same image serves both
// the wide splash variant (Loading/Launch) and the close gameplay variant
// — only the crop differs (object-position controls where the focus sits).

import { COLORS } from "./constants";
import { IMAGES } from "./assets";
import { usePkColors } from "./usePkColors";

export default function PitchBackground({ variant = "close", children }) {
  const { isAcebet77, isKgame99, isLv918, isThemed, theme } = usePkColors();
  // close variant uses a CSS background to render a zoomed-in crop of the
  // photo (≈ 200 % of container width), bottom-anchored so the grass-heavy
  // lower half of the photo fills the visible area. The native photo only
  // has grass in its bottom 20 % — without this zoom the field looks like
  // a thin strip, and the keeper+ball end up squashed against each other.
  const isClose = variant === "close";

  if (isThemed) {
    const stadium = theme.assets.pk.bgStadium;
    const crowd = theme.assets.pk.bgCrowd;

    // Acebet77 golden arena (Figma 4:704 wide / 4:595 close). The art has a
    // goal painted into it, but gameplay renders its own interactive
    // GoalFrame + Keeper. The close variant therefore lays a SINGLE
    // continuous grass base (art zoomed so only the goal-free grass shows —
    // no seam anywhere in the pitch) and paints the crowd/floodlights as a
    // separate top layer that fades into the grass, so the rendered goal
    // line sits cleanly on unbroken grass.
    if (isAcebet77 || isKgame99 || isLv918) {
      return (
        <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#0b0903" }}>
          {isClose ? (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${stadium})`,
                  backgroundSize: "auto 240%",
                  backgroundPosition: "center bottom",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0"
                style={{
                  height: "56vh",
                  backgroundImage: `url(${stadium})`,
                  backgroundSize: "auto 200%",
                  backgroundPosition: "center top",
                  backgroundRepeat: "no-repeat",
                  WebkitMaskImage: "linear-gradient(180deg, #000 62%, transparent 100%)",
                  maskImage: "linear-gradient(180deg, #000 62%, transparent 100%)",
                }}
              />
            </>
          ) : (
            <img
              src={crowd}
              alt=""
              draggable={false}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full select-none"
              style={{ objectFit: "cover", objectPosition: "center 40%" }}
            />
          )}
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

    // Ubetclub / EP369 arenas (Figma 77:2445 red carpet / 101:4346 forest).
    // Unlike the acebet art these photos have grass as a mid band with an
    // ornate foreground, so a single bottom-anchored crop reads best: the zoom
    // lifts the grass horizon up behind the rendered goal and keeps the
    // decorative foreground as the penalty-spot area.
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#12060a" }}>
        {isClose ? (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${stadium})`,
              backgroundSize: "auto 175%",
              backgroundPosition: "center bottom",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <img
            src={stadium}
            alt=""
            draggable={false}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full select-none"
            style={{ objectFit: "cover", objectPosition: "center 38%" }}
          />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 22%, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.3) 78%, rgba(0,0,0,0.82) 100%)",
          }}
        />
        {children}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
      {isClose ? (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${IMAGES.stadiumBg})`,
            // Sized to 175% of the VIEWPORT HEIGHT (not width) and bottom-
            // anchored. Height-based sizing keeps the grass horizon at a
            // consistent fraction of the screen on every aspect ratio — a
            // width-based zoom (the old "200% auto") under-zoomed on narrow
            // tall phones, leaving a big dark crowd band above the goal and
            // dropping the horizon too low. The goal/keeper anchor to the
            // same height basis (48vh) so they always sit on this horizon.
            // 175% (vs a lower zoom) lifts the photo's crowd→field seam up
            // BEHIND the goal net, so the foreground grass is continuous
            // from the goal line down — no flat horizon band below the goal.
            backgroundSize: "auto 175%",
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
