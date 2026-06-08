"use client";

import { useEffect, useState } from "react";

// The member surface clamps to max-w-[475px] (see LayoutShell), so the
// gameplay scene is designed at 475 px wide and must scale DOWN — never up —
// on narrower phones. CSS handles most of this via `min(Npx, Pvw)`, but a
// few values (the Ball's numeric `size` prop, the keeper's dive travel) need
// a real number in JS. This hook returns that scale factor:
//
//   scale = min(viewportWidth, 475) / 475   →  1 at ≥475, shrinks below.
//
// SSR-safe: starts at 1 (the design size) so the server render and first
// client paint agree, then corrects on mount + resize.
const DESIGN_WIDTH = 475;

export function useResponsiveScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () =>
      setScale(Math.min(window.innerWidth, DESIGN_WIDTH) / DESIGN_WIDTH);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return scale;
}
