"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { VIP_DETAILS_ASSETS } from "./vipDetailsAssets";

const DEFAULT_VIP_LEVELS = [
  { name: "Bronze",   badge: VIP_DETAILS_ASSETS.badges.bronze,   left:  40, leftSm:  55 },
  { name: "Silver",   badge: VIP_DETAILS_ASSETS.badges.silver,   left: 120, leftSm: 120 },
  { name: "Gold",     badge: VIP_DETAILS_ASSETS.badges.gold,     left: 210, leftSm: 205 },
  { name: "Platinum", badge: VIP_DETAILS_ASSETS.badges.platinum, left: 300, leftSm: 285 },
  { name: "Diamond",  badge: VIP_DETAILS_ASSETS.badges.diamond,  left: 390, leftSm: 350 },
  { name: "Emerald",  badge: VIP_DETAILS_ASSETS.badges.emerald,  left: 480, leftSm: 420 },
  { name: "Ruby",     badge: VIP_DETAILS_ASSETS.badges.ruby,     left: 570, leftSm: 485 },
  { name: "Sapphire", badge: VIP_DETAILS_ASSETS.badges.sapphire, left: 660, leftSm: 550 },
  { name: "Amethyst", badge: VIP_DETAILS_ASSETS.badges.amethyst, left: 750, leftSm: 615 },
];

// Map API tier names to badge assets
function getBadgeForTier(tierName, index = 0) {
  const lowerName = (tierName || "").toLowerCase();

  if (lowerName.includes('bronze')) return VIP_DETAILS_ASSETS.badges.bronze;
  if (lowerName.includes('silver')) return VIP_DETAILS_ASSETS.badges.silver;
  if (lowerName.includes('gold')) return VIP_DETAILS_ASSETS.badges.gold;
  if (lowerName.includes('platinum')) return VIP_DETAILS_ASSETS.badges.platinum;
  if (lowerName.includes('diamond')) return VIP_DETAILS_ASSETS.badges.diamond;
  if (lowerName.includes('emerald')) return VIP_DETAILS_ASSETS.badges.emerald;
  if (lowerName.includes('ruby')) return VIP_DETAILS_ASSETS.badges.ruby;
  if (lowerName.includes('sapphire')) return VIP_DETAILS_ASSETS.badges.sapphire;
  if (lowerName.includes('amethyst') || lowerName.includes('amiehyst')) return VIP_DETAILS_ASSETS.badges.amethyst;

  const badgeOrder = [
    VIP_DETAILS_ASSETS.badges.bronze,
    VIP_DETAILS_ASSETS.badges.silver,
    VIP_DETAILS_ASSETS.badges.gold,
    VIP_DETAILS_ASSETS.badges.platinum,
    VIP_DETAILS_ASSETS.badges.diamond,
    VIP_DETAILS_ASSETS.badges.emerald,
    VIP_DETAILS_ASSETS.badges.ruby,
    VIP_DETAILS_ASSETS.badges.sapphire,
    VIP_DETAILS_ASSETS.badges.amethyst,
  ];
  return badgeOrder[index % badgeOrder.length];
}

// Catenary curve approximating the chain image's drape across the viewport.
// Returns the gem's top y at a given viewport x, plus the rotation that keeps
// the gem aligned with the chain's tangent at that point.
function chainPose(visibleX, viewportCenter, halfWidth, isSmallScreen) {
  // Normalised position: 0 at center, ±1 at edges.
  const t = (visibleX - viewportCenter) / halfWidth;
  const tClamped = Math.max(-1.2, Math.min(1.2, t));
  // Top: chain rides high near edges and dips low at center (catenary).
  const topMin = isSmallScreen ? 20 : 8;   // edge value (chain high → small y)
  const topMax = isSmallScreen ? 44 : 38;  // center value (chain low → large y)
  const top = topMin + (topMax - topMin) * (1 - tClamped * tClamped);
  // Rotation: gems lean toward the chain's curve. Positive on the left, negative on the right.
  const rotation = -tClamped * 22;
  return { top, rotation };
}

export default function VipLevelChain({ selectedLevel, onLevelSelect, vipTiers = [] }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const viewportRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(475);

  useEffect(() => {
    const update = () => {
      setIsSmallScreen(window.innerWidth <= 400);
      if (viewportRef.current) {
        setViewportWidth(viewportRef.current.getBoundingClientRect().width);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Render only the tiers from the API
  const displayLevels = vipTiers.map((tier, index) => {
    const defaultLevel = DEFAULT_VIP_LEVELS[index] || DEFAULT_VIP_LEVELS[0];
    return {
      ...defaultLevel,
      name: tier.name,
      badge: tier.rank_icon || getBadgeForTier(tier.name, index),
    };
  });

  const VIEWPORT_WIDTH = viewportWidth;
  const VIEWPORT_CENTER = VIEWPORT_WIDTH / 2;
  const HALF_WIDTH = VIEWPORT_CENTER;
  const TRACK_WIDTH = isSmallScreen ? 670 : 800;

  const activeIdx = Math.max(0, displayLevels.findIndex((l) => l.name === selectedLevel));
  const activeLeft = isSmallScreen
    ? displayLevels[activeIdx]?.leftSm ?? 55
    : displayLevels[activeIdx]?.left ?? 30;
  const gemOffset = Math.max(
    0,
    Math.min(TRACK_WIDTH - VIEWPORT_WIDTH, activeLeft - VIEWPORT_CENTER)
  );

  return (
    <div className="relative w-full h-[130px] flex justify-center items-start">
      <motion.div
        ref={viewportRef}
        className="relative w-full h-[130px] shrink-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Chain Background — fills the full viewport width so chain is visible past
            the leftmost and rightmost gems. Stays anchored, does not slide. */}
        <div className="absolute inset-x-0 top-0 h-[120px]">
          <Image
            alt="VIP Chain"
            src={VIP_DETAILS_ASSETS.vipChain}
            fill
            className="object-cover"
            priority
            sizes="475px"
          />
        </div>

        {/* Gems — positioned in viewport coords. Each gem's y follows the chain curve
            at its current visible x, so the 5-on-screen always trace the chain's arc. */}
        {displayLevels.map((level, index) => {
          const isSelected = selectedLevel === level.name;
          const size = isSelected ? (isSmallScreen ? 51 : 60) : (isSmallScreen ? 36 : 48);
          const baseLeft = isSmallScreen ? level.leftSm : level.left;
          const visibleX = baseLeft - gemOffset;
          const { top, rotation } = chainPose(visibleX, VIEWPORT_CENTER, HALF_WIDTH, isSmallScreen);
          const topPos = isSelected ? top - 9 : top;

          return (
            <motion.div
              key={`${level.name}-${index}`}
              className="absolute top-0 left-0 cursor-pointer flex flex-col items-center -translate-x-1/2"
              style={{ zIndex: isSelected ? 10 : 1 }}
              onClick={() => onLevelSelect(level.name)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                x: visibleX,
                y: topPos,
                opacity: 1,
                scale: isSelected ? 1.2 : 1,
              }}
              whileHover={{ scale: isSelected ? 1.25 : 1.1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 32,
              }}
            >
              <motion.div
                className="relative transition-all duration-300"
                style={{ width: `${size}px`, height: `${size}px` }}
                animate={{ rotate: rotation }}
                transition={{ type: "spring", stiffness: 220, damping: 32 }}
              >
                {typeof level.badge === 'string' && level.badge.startsWith('http') ? (
                  <img
                    alt={level.name}
                    src={level.badge}
                    className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 ${!isSelected ? "grayscale-[0.7] opacity-90" : ""}`}
                  />
                ) : (
                  <Image
                    alt={level.name}
                    src={level.badge}
                    fill
                    className={`object-contain transition-all duration-300 ${!isSelected ? "grayscale-[0.7] opacity-90" : ""}`}
                  />
                )}
              </motion.div>
              <p
                className={`text-center text-[#e9af41] font-bold font-['Times_New_Roman'] mt-2 transition-all leading-tight uppercase ${isSelected ? "scale-110" : ""}`}
                style={{
                  fontSize: "clamp(8px, 2.4vw, 12px)",
                  maxWidth: "clamp(52px, 16vw, 80px)",
                  wordBreak: "break-word",
                }}
              >
                {level.name}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
