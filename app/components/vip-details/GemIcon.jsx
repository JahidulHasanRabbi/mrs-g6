"use client";

// GemIcon — applies the premium "ChainGem" effect to a single gem icon, sized
// to fill its parent box (the chain positions/sizes the box; this only styles
// the icon). Layers: a pulsing colour aura, a bob float, a sway + 3D tilt
// (rotateY/rotateX), a gloss light sweep masked to the gem silhouette, and two
// twinkling sparkles. Timings scale with --spd; sparkles/shine gate on
// --spark-display / --shine-op. No label, no positioning — those stay in the chain.
const STAR_CLIP =
  "polygon(50% 0,58% 42%,100% 50%,58% 58%,50% 100%,42% 58%,0 50%,42% 42%)";

export default function GemIcon({
  src,
  name,
  glow = "255,205,70",
  aura = 2.8,
  bob = 3.2,
  sway = 4.3,
  tilt = 4.9,
  sweep = 3.0,
  twk = 1.9,
  selected = false,
}) {
  const maskUrl = `url("${src}")`;
  // CSS mask-image enforces CORS — the silhouette gloss sweep only works for
  // same-origin images. Cross-origin API icons display fine but skip the sweep.
  const isRemote = /^https?:\/\//i.test(src || "");

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* pulsing colour aura */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "152%",
          height: "152%",
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${glow},${selected ? 0.8 : 0.5}) 0%, rgba(${glow},.18) 38%, rgba(${glow},0) 66%)`,
          animation: `mrsAura calc(${aura}s / var(--spd,1)) ease-in-out infinite`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* bob → sway → 3D tilt → gem image + masked gloss sweep */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: "520px",
          animation: `mrsBob calc(${bob}s / var(--spd,1)) ease-in-out infinite`,
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            animation: `mrsSway calc(${sway}s / var(--spd,1)) ease-in-out infinite`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              animation: `mrsTilt calc(${tilt}s / var(--spd,1)) ease-in-out infinite`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,.5))",
              }}
            />
            {!isRemote && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(115deg,transparent 39%,rgba(255,255,255,.95) 50%,transparent 61%)",
                  backgroundSize: "250% 250%",
                  backgroundRepeat: "no-repeat",
                  WebkitMaskImage: maskUrl,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskImage: maskUrl,
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  maskSize: "contain",
                  mixBlendMode: "screen",
                  opacity: "var(--shine-op,1)",
                  animation: `mrsSweep calc(${sweep}s / var(--spd,1)) ease-in-out infinite`,
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* twinkling sparkles (proportional to the icon) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "4%",
          left: "8%",
          width: "26%",
          height: "26%",
          clipPath: STAR_CLIP,
          background: "#fff",
          boxShadow: `0 0 6px 1px rgba(${glow},.85)`,
          display: "var(--spark-display,block)",
          animation: `mrsTwinkle calc(${twk}s / var(--spd,1)) ease-in-out infinite`,
          zIndex: 2,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "12%",
          right: "6%",
          width: "17%",
          height: "17%",
          clipPath: STAR_CLIP,
          background: "#fff",
          boxShadow: `0 0 5px 1px rgba(${glow},.7)`,
          display: "var(--spark-display,block)",
          animation: `mrsTwinkle calc(${twk}s / var(--spd,1)) ease-in-out infinite`,
          animationDelay: "1.05s",
          zIndex: 2,
        }}
      />
    </div>
  );
}
