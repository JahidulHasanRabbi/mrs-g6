"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// Section-scoped loading veil. Renders as `position: absolute; inset: 0` so
// it covers ONLY its nearest positioned ancestor — the consumer wraps the
// region whose data is in flight in a `relative` container and drops this
// component inside. Sidebar / topbar / unrelated sections stay interactive.
//
// The animation itself is a Lottie JSON served from /public — fetched on
// demand instead of imported so it doesn't get bundled into every chunk
// that touches this component, and cached at the module level so subsequent
// overlays mount instantly.

const LOTTIE_SRC = "/loading-animation.json";

let cachedAnimationData = null;
let cachedAnimationPromise = null;

function loadAnimationData() {
  if (cachedAnimationData) return Promise.resolve(cachedAnimationData);
  if (cachedAnimationPromise) return cachedAnimationPromise;
  cachedAnimationPromise = fetch(LOTTIE_SRC)
    .then((r) => r.json())
    .then((data) => {
      cachedAnimationData = data;
      return data;
    })
    .catch((err) => {
      cachedAnimationPromise = null;
      throw err;
    });
  return cachedAnimationPromise;
}

export default function LoadingOverlay({
  // Optional caption shown beneath the spinner.
  label,
  // Override the spinner box. Sections with tall content can use a larger
  // size; tight cards (e.g. KPI tiles) can shrink it.
  size = 96,
  // Pass-through for the wrapper.
  className = "",
}) {
  const [animationData, setAnimationData] = useState(cachedAnimationData);

  useEffect(() => {
    if (animationData) return;
    let cancelled = false;
    loadAnimationData()
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        // Fallback ring stays visible.
      });
    return () => {
      cancelled = true;
    };
  }, [animationData]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] ${className}`}
      style={{ backgroundColor: "rgba(4, 21, 2, 0.55)" }}
    >
      <div style={{ height: size, width: size }}>
        {animationData ? (
          <Lottie animationData={animationData} loop autoplay />
        ) : (
          <FallbackRing />
        )}
      </div>
      {label ? (
        <p className="sidebar-inter text-[13px] font-medium tracking-[-0.5px] text-[#fbeed2]">
          {label}
        </p>
      ) : null}
    </div>
  );
}

function FallbackRing() {
  return (
    <>
      <style>{`
        @keyframes mrs-overlay-fallback-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div
        className="h-full w-full rounded-full border-4 border-[#f2cb7a]/20 border-t-[#f2cb7a]"
        style={{ animation: "mrs-overlay-fallback-spin 1s linear infinite" }}
      />
    </>
  );
}
