// Profile frame catalog
//
// Each frame asset is a circular medallion whose dark inner circle is
// where the actual member photo sits. The decorative ring/wings/sparkles
// around that center stay visible. `picRect` describes the photo's
// placement inside the frame as percentages of the frame's bounding
// box, so the same metadata works at any render size.
//
// Animation effects (shine sweep, aura, sparkles, per-tier decorations
// like comet trails, embers, planet orbits, etc.) are applied at runtime
// via ProfileFrame.module.css using the `tierKey` field below.

// Default frame metadata for positioning and effects
// These are fallback values when API frames don't specify them
const DEFAULT_FRAME_METADATA = {
  picRect: { left: 50, top: 49, size: 52 },
  glow: "#9bb8ff",
  tierKey: "t1",
};

// Legacy hardcoded frames (kept as fallback)
export const LEGACY_PROFILE_FRAMES = [
  {
    id: "starlight",
    name: "Starlight",
    tierIndex: 1,
    tierKey: "t1",
    src: "/assets/profile/frames/01-starlight.png",
    picRect: { left: 50, top: 49, size: 53 },
    glow: "#9bb8ff",
  },
  {
    id: "comet",
    name: "Comet",
    tierIndex: 2,
    tierKey: "t2",
    src: "/assets/profile/frames/02-comet.png",
    picRect: { left: 48, top: 48, size: 52 },
    glow: "#6ee9ff",
  },
  {
    id: "meteor",
    name: "Meteor",
    tierIndex: 3,
    tierKey: "t3",
    src: "/assets/profile/frames/03-meteor.png",
    picRect: { left: 49, top: 47, size: 52 },
    glow: "#ff7a1f",
  },
  {
    id: "nebula",
    name: "Nebula",
    tierIndex: 4,
    tierKey: "t4",
    src: "/assets/profile/frames/04-nebula.png",
    picRect: { left: 51, top: 49, size: 52 },
    glow: "#c084fc",
  },
  {
    id: "galaxy",
    name: "Galaxy",
    tierIndex: 5,
    tierKey: "t5",
    src: "/assets/profile/frames/05-galaxy.png",
    picRect: { left: 49, top: 49, size: 50 },
    glow: "#fbbf24",
  },
  {
    id: "universe",
    name: "Universe",
    tierIndex: 6,
    tierKey: "t6",
    src: "/assets/profile/frames/06-universe.png",
    picRect: { left: 50, top: 49, size: 52 },
    glow: "#22d3ee",
  },
  {
    id: "supernova",
    name: "Supernova",
    tierIndex: 7,
    tierKey: "t7",
    src: "/assets/profile/frames/07-supernova.png",
    picRect: { left: 48, top: 47, size: 52 },
    glow: "#ff2d6f",
  },
  {
    id: "cosmic-emperor",
    name: "Cosmic Emperor",
    tierIndex: 8,
    tierKey: "t8",
    src: "/assets/profile/frames/08-cosmic-emperor.png",
    picRect: { left: 50, top: 48, size: 42 },
    glow: "#fbbf24",
  },
  {
    id: "cosmic-king",
    name: "Cosmic King",
    tierIndex: 9,
    tierKey: "t9",
    src: "/assets/profile/frames/09-cosmic-king.png",
    picRect: { left: 50, top: 51, size: 40 },
    glow: "#fde047",
  },
];

export const DEFAULT_FRAME_ID = "starlight";

// Active frames list (will be populated from API or fallback to legacy)
let ACTIVE_FRAMES = [...LEGACY_PROFILE_FRAMES];

// Set active frames (called from UserContext after API fetch)
export const setActiveFrames = (frames) => {
  if (Array.isArray(frames) && frames.length > 0) {
    ACTIVE_FRAMES = frames;
  }
};

// Get all active frames
export const getActiveFrames = () => ACTIVE_FRAMES;

// Map API frame data to internal frame structure
export const mapApiFrameToInternal = (apiFrame, index) => {
  // Try to find matching legacy frame by name for metadata
  const legacyMatch = LEGACY_PROFILE_FRAMES.find(
    (f) => f.name.toLowerCase() === apiFrame.name.toLowerCase()
  );

  return {
    id: apiFrame.uuid || `frame-${index}`,
    uuid: apiFrame.uuid,
    name: apiFrame.name,
    tierIndex: index + 1,
    tierKey: legacyMatch?.tierKey || `t${index + 1}`,
    src: apiFrame.icon || legacyMatch?.src || "/assets/profile/frames/01-starlight.png",
    picRect: legacyMatch?.picRect || DEFAULT_FRAME_METADATA.picRect,
    glow: legacyMatch?.glow || DEFAULT_FRAME_METADATA.glow,
    details: apiFrame.details,
    challenge: apiFrame.challenge,
    vip_tier: apiFrame.vip_tier,
    vip_tier_uuid: apiFrame.vip_tier_uuid,
  };
};

export const getFrameById = (id) => {
  const frame = ACTIVE_FRAMES.find((f) => f.id === id || f.uuid === id);
  if (frame) return frame;
  
  // Fallback to default
  return ACTIVE_FRAMES.find((f) => f.id === DEFAULT_FRAME_ID) || ACTIVE_FRAMES[0];
};

// Map a member's VIP tier (1-based ordinal among sorted tiers) to a frame.
// Used as a fallback when the member hasn't picked a frame manually.
export const getFrameForTier = (tierIndex) => {
  if (!tierIndex) return getFrameById(DEFAULT_FRAME_ID);
  return (
    ACTIVE_FRAMES.find((f) => f.tierIndex === tierIndex) ||
    getFrameById(DEFAULT_FRAME_ID)
  );
};

// Filter frames based on user's VIP tier
export const getAvailableFramesForUser = (userVipTierName, allVipTiers) => {
  if (!userVipTierName || !allVipTiers || allVipTiers.length === 0) {
    return ACTIVE_FRAMES;
  }

  // Find user's tier index
  const userTier = allVipTiers.find((t) => t.name === userVipTierName);
  if (!userTier) return ACTIVE_FRAMES;

  // Sort tiers by lifetime_deposit_required to get tier hierarchy
  const sortedTiers = [...allVipTiers].sort(
    (a, b) => parseFloat(a.lifetime_deposit_required || 0) - parseFloat(b.lifetime_deposit_required || 0)
  );
  const userTierIndex = sortedTiers.findIndex((t) => t.uuid === userTier.uuid);

  // Filter frames: user can access frames for their tier and below
  return ACTIVE_FRAMES.filter((frame) => {
    // If frame has no VIP requirement, it's available to everyone
    if (!frame.vip_tier && !frame.vip_tier_uuid) return true;

    // If frame requires a specific VIP tier
    if (frame.vip_tier_uuid) {
      const frameTierIndex = sortedTiers.findIndex((t) => t.uuid === frame.vip_tier_uuid);
      // User can access if their tier is >= frame's required tier
      return frameTierIndex !== -1 && userTierIndex >= frameTierIndex;
    }

    // If only vip_tier name is provided (legacy)
    if (frame.vip_tier) {
      const frameTierIndex = sortedTiers.findIndex((t) => t.name === frame.vip_tier);
      return frameTierIndex !== -1 && userTierIndex >= frameTierIndex;
    }

    return true;
  });
};
