/**
 * Builds "skins" for the shared <ThemedCheckInBoard> and <ThemedMartGrid>
 * sections from a theme's asset map + palette — the same pattern as
 * buildFramedSkin() in ./framedSkin.js.
 *
 * The geometry below is measured off the Figma comps (MRS Theme Engine file
 * 17w977xIeksUHXzzofUkO7) and is IDENTICAL across all six themes — only the art
 * changes per theme. Keeping it here means the per-theme pages stay art-only.
 *
 * Check-in board (Figma acebet77 461:266, 362x319):
 *   day cards   66x88 at x=39/112/183/254, y=50 (row 1) and y=160/161 (row 2)
 *   day-7 chest 148x98 at x=180, y=152
 * Every value is expressed as a percentage of the board box so the whole thing
 * scales with the viewport inside the 475px member-portal clamp.
 */

// Card / chest boxes as % of the 362x319 board.
const CARD_W = (66 / 362) * 100;   // 18.23%
const CARD_H = (88 / 319) * 100;   // 27.59%

const pctX = (x) => ((x + 66 / 2) / 362) * 100;
const pctY = (y) => ((y + 88 / 2) / 319) * 100;

export const CHECKIN_DAYS = [
  { day: 1, label: 'DAY 1', cx: pctX(39), cy: pctY(50), icon: 'bolt' },
  { day: 2, label: 'DAY 2', cx: pctX(112), cy: pctY(50), icon: 'bolt' },
  { day: 3, label: 'DAY 3', cx: pctX(183), cy: pctY(50), icon: 'coin' },
  { day: 4, label: 'DAY 4', cx: pctX(254), cy: pctY(50), icon: 'bolt' },
  { day: 5, label: 'DAY 5', cx: pctX(39), cy: pctY(161), icon: 'cards' },
  { day: 6, label: 'DAY 6', cx: pctX(112), cy: pctY(160), icon: 'bolt' },
  {
    day: 7,
    label: 'DAY 7',
    isSpecial: true,
    cx: ((180 + 148 / 2) / 362) * 100,
    cy: ((152 + 98 / 2) / 319) * 100,
    w: (148 / 362) * 100,
    h: (98 / 319) * 100,
  },
];

/**
 * Per-icon geometry, as % of a day card. The three reward glyphs have different
 * aspect ratios (bolt 22x29, coin 31x24, cards 32x28), so each keeps its own
 * box instead of being forced through one shared size.
 */
const ICON_BOX = {
  bolt: { w: (22 / 66) * 100, h: (29 / 88) * 100, top: (22 / 88) * 100 },
  coin: { w: (31 / 66) * 100, h: (24 / 88) * 100, top: (24 / 88) * 100 },
  cards: { w: (32 / 66) * 100, h: (28 / 88) * 100, top: (22 / 88) * 100 },
};

/**
 * The three reward glyphs are byte-identical in every theme's comp, so they are
 * stored once instead of duplicated six times (~2MB each). A theme can still
 * override any of them by setting ASSETS.checkin.iconBolt / iconCoin / iconCards.
 */
const SHARED_ICONS = {
  bolt: '/assets/themes/shared/checkin/icon-bolt.png',
  coin: '/assets/themes/shared/checkin/icon-coin.png',
  cards: '/assets/themes/shared/checkin/icon-cards.png',
};

export function buildCheckinSkin(ASSETS, COLORS, overrides = {}) {
  // `c` is pulled out of `rest` so a partial colour override merges with the
  // defaults below instead of replacing the whole map.
  const { icons = {}, c = {}, ...rest } = overrides;
  return {
    title: ASSETS.checkin.title,
    // Title plaque width as a % of the screen. Five skins use a 408px-wide
    // plaque on a 402px frame (i.e. full-bleed); n1gang's check-in title is a
    // narrower 206px crest, so it overrides this.
    titleWidthPct: 100,
    boardFrame: ASSETS.checkin.boardFrame,
    chest: ASSETS.checkin.chest,
    boardAspect: '362 / 319',
    cardW: CARD_W,
    cardH: CARD_H,
    icons: {
      bolt: { src: ASSETS.checkin.iconBolt || SHARED_ICONS.bolt, ...ICON_BOX.bolt, ...icons.bolt },
      coin: { src: ASSETS.checkin.iconCoin || SHARED_ICONS.coin, ...ICON_BOX.coin, ...icons.coin },
      cards: { src: ASSETS.checkin.iconCards || SHARED_ICONS.cards, ...ICON_BOX.cards, ...icons.cards },
    },
    dayCard: ASSETS.checkin.dayCard,
    // The comps specify these golds on most skins rather than each theme's own
    // palette, so they are design constants here. lv918 overrides them: its
    // board interior is bright pink, so day labels/rewards go dark and only the
    // day-7 label (which sits outside the pink panel) stays gold.
    c: {
      label: '#f2ba33',
      reward: '#f2ba33',
      // Day 7's label sits outside the board's inner panel, so a theme can
      // colour it separately; otherwise it follows `label`.
      labelSpecial: c.label || '#f2ba33',
      ...c,
    },
    font: '"Times New Roman", serif',
    ...rest,
  };
}

/**
 * Mart item card (Figma acebet77 468:1997, 163x162):
 *   product panel 117x68 r27 at (23, 25)
 *   product image 40x51 centred in the panel
 *   name  8px at y=109   coins 6px at y=127
 *   redeem plaque 143x51 at (10, 132) — deliberately overhangs the frame's
 *   bottom edge, which the grid's row gap absorbs (matches the comp).
 */
export const MART_CARD = {
  aspect: '163 / 162',
  panel: {
    left: (23 / 163) * 100,
    top: (25 / 162) * 100,
    w: (117 / 163) * 100,
    h: (68 / 162) * 100,
    radiusCqi: (27 / 163) * 100,
  },
  image: { w: (40 / 117) * 100, h: (51 / 68) * 100 },
  name: { top: (109 / 162) * 100, sizeCqi: (8 / 163) * 100 },
  coins: { top: (127 / 162) * 100, sizeCqi: (6 / 163) * 100 },
  redeem: {
    left: (10 / 163) * 100,
    top: (132 / 162) * 100,
    w: (143 / 163) * 100,
    h: (51 / 162) * 100,
    sizeCqi: (14 / 163) * 100,
  },
};

export function buildMartSkin(ASSETS, COLORS, overrides = {}) {
  // As in buildCheckinSkin, `c` is merged rather than replaced.
  const { c = {}, ...rest } = overrides;
  return {
    title: ASSETS.mart.title,
    // Every skin's Mart plaque is the full-bleed 408px art.
    titleWidthPct: 100,
    itemFrame: ASSETS.mart.itemFrame,
    redeemButton: ASSETS.mart.btnRedeem,
    // Gold plinth behind each product shot (Figma linear-gradient 90deg).
    // Figma 468:2000 — the same gold plinth gradient on every skin.
    panelGradient:
      ASSETS.mart.panelGradient ||
      'linear-gradient(90deg, #8c6c1e 0%, #f2ba33 52%, #8c6c1e 100%)',
    // As with the check-in board, the comps use these golds across all six
    // skins rather than each theme's palette.
    c: {
      name: '#e9af41',
      coins: '#e9af41',
      redeem: '#f2ba33',
      locked: COLORS.sand || COLORS.creamMuted || '#d0c6ab',
      ...c,
    },
    font: 'var(--font-berkshire-swash), "Times New Roman", serif',
    ...rest,
  };
}
