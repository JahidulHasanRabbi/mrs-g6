// Profile frame catalog
//
// Each frame asset is a circular badge whose dark center is where the actual
// member photo is overlaid. The decorative ring, glow and sparkles around
// that center stay visible. `picRect` describes the photo's placement
// inside the frame as percentages of the frame's bounding box, so the
// same metadata works at any render size (header avatar, profile card, picker).

export const PROFILE_FRAMES = [
  {
    id: "starlight",
    name: "Starlight",
    tierIndex: 1,
    src: "/assets/profile/Custom-profile1.png",
    picRect: { left: 50, top: 49, size: 53 },
    glow: "#5d8bff",
  },
  {
    id: "comet",
    name: "Comet",
    tierIndex: 2,
    src: "/assets/profile/Custom-profile2.png",
    picRect: { left: 48, top: 48, size: 52 },
    glow: "#3eb6ff",
  },
  {
    id: "meteor",
    name: "Meteor",
    tierIndex: 3,
    src: "/assets/profile/Custom-profile3.png",
    picRect: { left: 49, top: 47, size: 52 },
    glow: "#ff7a18",
  },
  {
    id: "nebula",
    name: "Nebula",
    tierIndex: 4,
    src: "/assets/profile/Custom-profile4.png",
    picRect: { left: 51, top: 49, size: 52 },
    glow: "#b760ff",
  },
  {
    id: "galaxy",
    name: "Galaxy",
    tierIndex: 5,
    src: "/assets/profile/Custom-profile5.png",
    picRect: { left: 49, top: 49, size: 50 },
    glow: "#f0a64b",
  },
  {
    id: "universe",
    name: "Universe",
    tierIndex: 6,
    src: "/assets/profile/Custom-profile6.png",
    picRect: { left: 50, top: 49, size: 52 },
    glow: "#3eb6ff",
  },
  {
    id: "supernova",
    name: "Supernova",
    tierIndex: 7,
    src: "/assets/profile/Super-nova.png",
    picRect: { left: 48, top: 47, size: 52 },
    glow: "#ff3a6e",
  },
  {
    id: "cosmic-emperor",
    name: "Cosmic Emperor",
    tierIndex: 8,
    src: "/assets/profile/Cosmic-emperor.png",
    picRect: { left: 50, top: 48, size: 42 },
    glow: "#ffd24a",
  },
  {
    id: "cosmic-king",
    name: "Cosmic King",
    tierIndex: 9,
    src: "/assets/profile/Cosmic-king.png",
    picRect: { left: 50, top: 51, size: 40 },
    glow: "#ffd24a",
  },
];

export const DEFAULT_FRAME_ID = "starlight";

export const getFrameById = (id) =>
  PROFILE_FRAMES.find((f) => f.id === id) ||
  PROFILE_FRAMES.find((f) => f.id === DEFAULT_FRAME_ID);

// Map a member's VIP tier (1-based ordinal among sorted tiers) to a frame.
// Used as a fallback when the member hasn't picked a frame manually.
export const getFrameForTier = (tierIndex) => {
  if (!tierIndex) return getFrameById(DEFAULT_FRAME_ID);
  return (
    PROFILE_FRAMES.find((f) => f.tierIndex === tierIndex) ||
    getFrameById(DEFAULT_FRAME_ID)
  );
};
