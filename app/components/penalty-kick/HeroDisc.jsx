"use client";

import { motion } from "framer-motion";
import { ICONS } from "./constants";
import { usePkColors } from "./usePkColors";

// Soccer-ball glyph used by the Loading + Launch hero discs. Rendered via
// a CSS mask so the icon tints white over the dark disc — matches the
// Figma "Animated Hero Visual / Soccer Ball Core" treatment (66.67 px).
function HeroBallIcon({ size = 67 }) {
  return (
    <span
      aria-hidden="true"
      className="block bg-current text-white"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${ICONS.soccer})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(${ICONS.soccer})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

// Animated hero disc shared by Loading + Launch. Stacked from outside in:
//   • outer 2-px halo ring (inset -10px)
//   • dark #1e2020 disc with white inner border + drop shadow
//   • inner 4-px green ring (inset 0)
//   • centered soccer-ball icon
//
// `spin` toggles the slow rotate animation (used while Loading); when off
// the icon stays still (used on Launch where it just bobs subtly).
export default function HeroDisc({ spin = true }) {
  const { colors: COLORS } = usePkColors();
  return (
    <div className="relative" style={{ width: 192, height: 192 }}>
      <div
        aria-hidden="true"
        className="absolute rounded-full pointer-events-none"
        style={{ inset: -10, border: `2px solid ${COLORS.greenSoft10}` }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: COLORS.diskDark,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ border: `4px solid ${COLORS.greenSoft20}` }}
      />
      {spin ? (
        // Loading: pivot rotates around the disc centre with the ball
        // pinned to the top of the orbit, so the ball traces a circle
        // around the inner edge — matching the Figma frames where the
        // ball position cycles top → right → bottom → left across
        // progress snapshots.
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
        >
          <div
            className="absolute"
            style={{
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <HeroBallIcon />
          </div>
        </motion.div>
      ) : (
        // Launch: ball stays centred and gently bobs (loading done — the
        // arena is ready, no more orbiting).
        <motion.div
          className="absolute inset-0 grid place-items-center"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        >
          <HeroBallIcon />
        </motion.div>
      )}
    </div>
  );
}
