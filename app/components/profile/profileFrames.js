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

export const PROFILE_FRAMES = [
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
