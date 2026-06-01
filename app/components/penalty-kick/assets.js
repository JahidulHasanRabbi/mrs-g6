// Image asset paths. Backgrounds are SVG-drawn inline (see PitchBackground),
// so only the icons live here for now. When Figma artwork is exported,
// drop the files in public/assets/penalty-kick/{bg,ball,illust}/ and add
// their paths to this map — components already reference it.

export const IMAGES = {
  ballPng: "/assets/penalty-kick/ball/Football.png",
  stadiumBg: "/assets/penalty-kick/bg/stadium.png",
  goalpost: "/assets/penalty-kick/goalpost.png",
  swipeArrows: "/assets/penalty-kick/illust/swipe-arrows.png",
};

// Goalkeeper sprite atlas — vendored PNGs from Figma. Each keeper sprite has
// a natural anchor at the standing-feet position; CSS positions the
// container so all frames register correctly when swapped.
export const KEEPER = {
  noMove: "/assets/penalty-kick/keeper/no-move.png",
  // Static extended dive pose for the landed/miss state. Both directions
  // now use natively-drawn sprites (left=jump-left.png, right=last frame
  // of the right-side dive sequence) so the keeper faces the correct way
  // without CSS mirroring.
  jumpLeft: "/assets/penalty-kick/keeper/jump-left.png",
  jumpRight: "/assets/penalty-kick/keeper/jump-right-4.png",
  saveCenter: "/assets/penalty-kick/keeper/save-center.png",
  // Idle-cycle frames — 2-frame standing animation (relaxed ↔ arms slightly
  // raised). Cycled in Keeper.jsx during phase 0.
  idleCycle: [
    "/assets/penalty-kick/keeper/still-pose-1.png",
    "/assets/penalty-kick/keeper/still-pose-2.png",
  ],
  diveLeft: [
    "/assets/penalty-kick/keeper/jump-left-1.png",
    "/assets/penalty-kick/keeper/jump-left-2.png",
    "/assets/penalty-kick/keeper/jump-left-3.png",
    "/assets/penalty-kick/keeper/jump-left-4.png",
  ],
  diveRight: [
    "/assets/penalty-kick/keeper/jump-right-1.png",
    "/assets/penalty-kick/keeper/jump-right-2.png",
    "/assets/penalty-kick/keeper/jump-right-3.png",
    "/assets/penalty-kick/keeper/jump-right-4.png",
  ],
};
