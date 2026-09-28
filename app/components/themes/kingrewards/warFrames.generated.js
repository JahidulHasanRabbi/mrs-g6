// Alpha-measured off kingrewards/war/* (no 9-slice card art, so not gen_skins.py).
// Re-measure when the art changes.

const WAR = "/assets/themes/kingrewards/war";

export const WAR_FRAMES = {
  // 1140x867 keyed @3x of the comp's 380x289 battle portrait.
  bossFrame: { art: `${WAR}/boss-frame.webp`, aspect: 1140 / 867, open: [2.9, 2.0, 2.8, 2.1] },
  // 428x438 keyed @3x of the list card's 137x139 thumbnail.
  thumbFrame: { art: `${WAR}/thumb-frame.webp`, aspect: 428 / 438, open: [4.1, 3.5, 4.3, 4.2] },
  // Flat centre panel of the gold plaque (L R T B %); the ends are pointed caps.
  attackWindow: [9, 91, 18, 82],
};
