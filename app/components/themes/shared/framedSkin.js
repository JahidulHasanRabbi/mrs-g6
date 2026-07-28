/**
 * Builds a "skin" for the shared Framed* section components (winning record /
 * winning list / prize list / winner / terms) from a theme's asset map + palette.
 * Each themed spin/egg page passes the result so those sections sit on the
 * theme's ornate panel frame with a gold heading outside — matching the
 * kgame99 / lv918 treatment across acebet77 / ubetclub / ep369.
 *
 * `insets` are the safe content box inside the panel art (the ornate crown/
 * flourish/side gems eat into the frame), tuned per theme's panel image.
 */
export function buildFramedSkin(ASSETS, COLORS, insets, { scrollbarClass = '' } = {}) {
  const cream = COLORS.cream || '#fff6df';
  const creamMuted = COLORS.creamMuted || cream;
  return {
    frame: ASSETS.spin.panel,
    insets,
    scrim: 'rgba(0,0,0,0.44)',
    ring: 'rgba(255,215,120,0.32)',
    headingGradient: `linear-gradient(180deg, ${cream} 0%, ${COLORS.goldBright} 50%, ${COLORS.gold} 100%)`,
    c: {
      date: COLORS.sand,
      name: COLORS.goldBright,
      reward: '#ffb77d',
      term: creamMuted,
      empty: COLORS.sand,
      rowText: cream,
      freeCreditLabel: '#ffb77d',
      freeCreditValue: creamMuted,
    },
    rankAccents: { 1: '#00d15a', 2: COLORS.goldBright, 3: '#fd8b00' },
    scrollbarClass,
  };
}
