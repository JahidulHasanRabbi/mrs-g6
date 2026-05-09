"use client";

import { motion } from "framer-motion";
import { getFrameById, DEFAULT_FRAME_ID } from "./profileFrames";
import { PROFILE_ASSETS } from "./profileAssets";
import styles from "./ProfileFrame.module.css";

// Per-tier sparkle positions (% of frame bounding box).
// Mirrors the layout in the design's Animated Frames.html spec.
const SPARKLES_BY_TIER = {
  1: [
    { top: "18%", left: "22%", delay: 0.0 },
    { top: "32%", left: "80%", delay: 0.7 },
    { top: "62%", left: "14%", delay: 1.3 },
    { top: "74%", left: "78%", delay: 0.4 },
    { top: "48%", left: "50%", delay: 1.9, size: 4 },
    { top: "88%", left: "42%", delay: 1.1 },
  ],
  2: [
    { top: "24%", left: "74%", delay: 0.3 },
    { top: "68%", left: "26%", delay: 1.4 },
    { top: "84%", left: "64%", delay: 0.9 },
  ],
  3: [],
  4: [
    { top: "22%", left: "30%", delay: 0.2 },
    { top: "34%", left: "78%", delay: 1.6 },
    { top: "74%", left: "24%", delay: 0.8 },
    { top: "80%", left: "70%", delay: 2.2 },
  ],
  5: [
    { top: "20%", left: "24%", delay: 0.3 },
    { top: "30%", left: "80%", delay: 1.1 },
    { top: "78%", left: "18%", delay: 1.8 },
    { top: "82%", left: "74%", delay: 0.6, spark: "#fbbf24" },
  ],
  6: [
    { top: "16%", left: "48%", delay: 0.4 },
    { top: "50%", left: "88%", delay: 1.5 },
    { top: "84%", left: "46%", delay: 2.1 },
    { top: "50%", left: "10%", delay: 0.9 },
  ],
  7: [],
  8: [
    { top: "24%", left: "18%", delay: 0.3, spark: "#fbbf24" },
    { top: "32%", left: "84%", delay: 1.4, spark: "#fbbf24" },
    { top: "74%", left: "18%", delay: 2.0, spark: "#c084fc" },
    { top: "78%", left: "82%", delay: 0.8, spark: "#c084fc" },
  ],
  9: [
    { top: "18%", left: "50%", delay: 0.2, spark: "#ffeaa3" },
    { top: "30%", left: "20%", delay: 1.1, spark: "#ffeaa3" },
    { top: "30%", left: "80%", delay: 1.9, spark: "#ffeaa3" },
    { top: "74%", left: "32%", delay: 0.6, spark: "#ffeaa3" },
    { top: "74%", left: "68%", delay: 2.4, spark: "#ffeaa3" },
  ],
};

const METEOR_EMBERS = [
  { left: "32%", ex: "-12px", delay: 0.0 },
  { left: "46%", ex: "8px",   delay: 0.6 },
  { left: "58%", ex: "-6px",  delay: 1.3 },
  { left: "38%", ex: "14px",  delay: 2.0 },
  { left: "64%", ex: "-10px", delay: 2.6 },
  { left: "50%", ex: "4px",   delay: 1.7 },
  { left: "28%", ex: "6px",   delay: 0.9 },
];

const SUPERNOVA_EMBERS = [
  { left: "30%", ex: "-10px", delay: 0.2 },
  { left: "50%", ex: "12px",  delay: 1.0 },
  { left: "66%", ex: "-8px",  delay: 1.8 },
  { left: "42%", ex: "6px",   delay: 2.5 },
];

const EMPEROR_DUST = [
  { left: "14%", delay: 0.0 },
  { left: "28%", delay: 1.2 },
  { left: "44%", delay: 2.6 },
  { left: "60%", delay: 0.7 },
  { left: "74%", delay: 3.4 },
  { left: "88%", delay: 1.9 },
  { left: "34%", delay: 4.2 },
  { left: "68%", delay: 5.0 },
];

const KING_DUST = [
  { left: "10%", delay: 0.0 },
  { left: "24%", delay: 0.9 },
  { left: "38%", delay: 2.3 },
  { left: "52%", delay: 1.4 },
  { left: "66%", delay: 3.6 },
  { left: "80%", delay: 0.5 },
  { left: "92%", delay: 2.8 },
  { left: "46%", delay: 4.4 },
  { left: "18%", delay: 5.2 },
];

// Per-tier decorative layers. Returned as an array of {key, content} so
// callers can place them at the correct depth in the stack.
function tierDecorations(tier) {
  switch (tier) {
    case 2:
      return { foreground: <div className={styles.orbitComet} /> };
    case 3:
      return {
        foreground: (
          <div className={styles.embers}>
            {METEOR_EMBERS.map((e, i) => (
              <span
                key={i}
                className={styles.ember}
                style={{ left: e.left, "--ex": e.ex, animationDelay: `${e.delay}s` }}
              />
            ))}
          </div>
        ),
      };
    case 4:
      return { backgroundExtra: <div className={styles.nebulaSwirl} /> };
    case 5:
      return { backgroundExtra: <div className={styles.spiral} /> };
    case 6:
      return {
        foreground: (
          <>
            <div className={styles.orbit}><span className={`${styles.planet} ${styles.planetP1}`} /></div>
            <div className={`${styles.orbit} ${styles.orbit2}`}><span className={`${styles.planet} ${styles.planetP2}`} /></div>
            <div className={`${styles.orbit} ${styles.orbit3}`}><span className={`${styles.planet} ${styles.planetP3}`} /></div>
          </>
        ),
      };
    case 7:
      return {
        backgroundExtra: <div className={styles.rays} />,
        foreground: (
          <div className={`${styles.embers} ${styles.embersRed}`}>
            {SUPERNOVA_EMBERS.map((e, i) => (
              <span
                key={i}
                className={styles.ember}
                style={{ left: e.left, "--ex": e.ex, animationDelay: `${e.delay}s` }}
              />
            ))}
          </div>
        ),
      };
    case 8:
      return {
        foreground: (
          <div className={styles.goldDust}>
            {EMPEROR_DUST.map((d, i) => (
              <span key={i} className={styles.dust} style={{ left: d.left, animationDelay: `${d.delay}s` }} />
            ))}
          </div>
        ),
      };
    case 9:
      return {
        backgroundExtra: <div className={styles.crownRays} />,
        foreground: (
          <div className={styles.goldDust}>
            {KING_DUST.map((d, i) => (
              <span key={i} className={styles.dust} style={{ left: d.left, animationDelay: `${d.delay}s` }} />
            ))}
          </div>
        ),
      };
    default:
      return {};
  }
}

// Renders a member's profile photo inside the chosen tier frame, with a
// stack of CSS-driven ambient effects — pulsing aura, twinkling
// sparkles, plus per-tier extras (comet, embers, nebula, spiral, planet
// orbits, supernova rays, gold dust, crown rays).
export default function ProfileFrame({
  src,
  frameId,
  size = 200,
  alt = "Profile",
  animate = true,
  onClick,
  className = "",
}) {
  const frame = getFrameById(frameId || DEFAULT_FRAME_ID);
  const photoSrc = src || PROFILE_ASSETS.profileAvatar;

  const photoSizePx = (size * frame.picRect.size) / 100;
  const photoLeftPx = (size * frame.picRect.left) / 100 - photoSizePx / 2;
  const photoTopPx = (size * frame.picRect.top) / 100 - photoSizePx / 2;

  const sparkles = SPARKLES_BY_TIER[frame.tierIndex] || [];
  const decorations = tierDecorations(frame.tierIndex);

  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={onClick ? `Change profile frame (${frame.name})` : undefined}
      className={`relative inline-block shrink-0 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size }}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.96 } : undefined}
    >
      <div
        className={`${styles.stage} ${styles[frame.tierKey] || ""} ${animate ? "" : styles.static}`}
      >
        {/* Aura behind everything */}
        <div className={styles.aura} />

        {/* Per-tier background effects (nebula, spiral, supernova rays, crown rays) */}
        {decorations.backgroundExtra}

        {/* Inner-ring conic sweep */}
        <div className={styles.ring} />

        {/* Frame artwork (z=3) */}
        <img
          alt=""
          aria-hidden="true"
          src={frame.src}
          className={styles.frameArt}
          draggable="false"
        />

        {/* Member photo (z=4) — sits on top of the frame's dark inner circle */}
        <div
          className={styles.photoSlot}
          style={{
            width: photoSizePx,
            height: photoSizePx,
            left: photoLeftPx,
            top: photoTopPx,
          }}
        >
          <img alt={alt} src={photoSrc} />
        </div>

        {/* Per-tier foreground effects (comet, embers, planet orbits, gold dust) */}
        {decorations.foreground}

        {/* Twinkling sparkles, positioned per tier */}
        {sparkles.map((s, i) => (
          <span
            key={i}
            className={styles.sparkle}
            style={{
              top: s.top,
              left: s.left,
              width: s.size ? `${s.size}px` : undefined,
              height: s.size ? `${s.size}px` : undefined,
              animationDelay: `${s.delay}s`,
              ...(s.spark ? { "--spark": s.spark } : null),
            }}
          />
        ))}
      </div>
    </Wrapper>
  );
}
