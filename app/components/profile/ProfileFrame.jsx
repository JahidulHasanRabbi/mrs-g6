"use client";

import { motion } from "framer-motion";
import { getFrameById, DEFAULT_FRAME_ID } from "./profileFrames";
import { PROFILE_ASSETS } from "./profileAssets";

// Renders a member's profile photo inside the chosen frame asset.
// The frame PNG carries the tier label, number badge, decorative ring
// and a dark inner circle. The user's photo sits ON TOP of that dark
// inner circle (sized via `frame.picRect`) so it's the actual face
// shown, with the frame's ring & glow visible around it.
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
      {/* Soft radial glow behind everything in the tier accent colour */}
      {animate && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${frame.glow}33 0%, transparent 65%)`,
          }}
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Frame asset — drawn first so the photo can sit on top of its dark center */}
      <img
        alt=""
        aria-hidden="true"
        src={frame.src}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        draggable="false"
      />

      {/* Photo — covers the frame's dark inner circle with the user's actual picture */}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{
          width: photoSizePx,
          height: photoSizePx,
          left: photoLeftPx,
          top: photoTopPx,
        }}
      >
        <img
          alt={alt}
          src={photoSrc}
          className="h-full w-full object-cover"
        />

        {/* Shine sweep across the photo */}
        {animate && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
              mixBlendMode: "screen",
            }}
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              repeatDelay: 3.2,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </Wrapper>
  );
}
