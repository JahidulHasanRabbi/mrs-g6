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

/**
 * `anchor` decides which edge stays put when `cardScale` grows a tile: the top
 * row grows downward and the bottom row upward, so enlarging the tiles eats the
 * dead space in the middle of the panel instead of pushing the day labels into
 * the frame's top crown / bottom scroll rail.
 */
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
 * Bounding box the seven day slots + their DAY labels occupy in the comps, as %
 * of the 362x319 board box. The labels sit below the bottom row, which is why
 * `b` reaches past the tiles themselves.
 */
export const COMP_BOUNDS = { l: 10.8, r: 90.6, t: 15.7, b: 82.5 };

/**
 * Fits the comp's day layout inside the active frame's inner panel.
 *
 * The comps position all seven slots against the full board box, but each
 * theme's frame art has a different border thickness — so those fixed
 * percentages spill over the panel edge and onto the corner ornaments on most
 * skins (worst on lv918: ~6% past the right edge, ~5% past the bottom).
 *
 * Scaling is uniform and the block is centred, so the comp's internal
 * arrangement is preserved exactly — only its overall size and offset change.
 */
export function layoutTransform(panel) {
  const C = COMP_BOUNDS;
  const s = Math.min(
    (panel.r - panel.l) / (C.r - C.l),
    (panel.b - panel.t) / (C.b - C.t)
  );
  const ox = panel.l + ((panel.r - panel.l) - (C.r - C.l) * s) / 2;
  const oy = panel.t + ((panel.b - panel.t) - (C.b - C.t) * s) / 2;
  return {
    scale: s,
    x: (v) => ox + (v - C.l) * s,
    y: (v) => oy + (v - C.t) * s,
  };
}

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
  bolt: '/assets/themes/shared/checkin/icon-bolt.webp',
  coin: '/assets/themes/shared/checkin/icon-coin.webp',
  cards: '/assets/themes/shared/checkin/icon-cards.webp',
};

/**
 * Per-asset image transform inside its own slot, as % of that slot.
 *
 * The exported PNGs carry differing amounts of baked-in transparent padding, so
 * the comps scale and nudge each one to make the visible art fill its box (e.g.
 * lv918's day card is drawn at 134% width). Reproducing that is what stops the
 * tiles reading as too small with wide gaps between them. Defaults are a plain
 * 1:1 fill; every theme overrides these with the values from its own comp.
 */
const NO_FIT = { w: 100, h: 100, left: 0, top: 0 };
export const fitStyle = (f = NO_FIT) => ({
  width: `${f.w}%`,
  height: `${f.h}%`,
  left: `${f.left}%`,
  top: `${f.top}%`,
});

export function buildCheckinSkin(ASSETS, COLORS, overrides = {}) {
  // `c` and `fit` are pulled out of `rest` so a partial override merges with the
  // defaults below instead of replacing the whole map.
  const { icons = {}, c = {}, fit = {}, ...rest } = overrides;
  return {
    title: ASSETS.checkin.title,
    // Title plaque width as a % of the screen. Five skins use a 408px-wide
    // plaque on a 402px frame (i.e. full-bleed); n1gang's check-in title is a
    // narrower 206px crest, so it overrides this.
    titleWidthPct: 100,
    boardFrame: ASSETS.checkin.boardFrame,
    chest: ASSETS.checkin.chest,
    // The comps place every board in a 362x319 node, but only acebet77's frame
    // art is actually that shape (1351x1164). ubetclub / ep369 / kgame99 / lv918
    // ship SQUARE frames and n1gang a 1.25 one, so a single hardcoded ratio
    // stretched them and shrank their inner panel. Each theme now declares the
    // aspect of its own art so nothing is squashed.
    boardAspect: '362 / 319',
    // The comps draw the board 362px wide on a 402px frame (~90%). The member
    // portal is clamped to 475px, so scaling the board to the same ~90% share
    // (430px) enlarges the frame, tiles and labels together — rather than
    // growing tiles alone, which has no room once the labels are placed.
    boardMaxWidth: 430,
    // Inner flat area of THIS theme's frame art, as % of the board box, inset a
    // little so tiles don't kiss the border or the corner ornaments. The day
    // layout is fitted into this (see layoutTransform), which is what keeps the
    // tiles inside the frame on every skin. Defaults to the comps' own bounds,
    // i.e. no correction.
    panel: { ...COMP_BOUNDS },
    cardW: CARD_W,
    cardH: CARD_H,
    icons: {
      bolt: { src: ASSETS.checkin.iconBolt || SHARED_ICONS.bolt, ...ICON_BOX.bolt, ...icons.bolt },
      coin: { src: ASSETS.checkin.iconCoin || SHARED_ICONS.coin, ...ICON_BOX.coin, ...icons.coin },
      cards: { src: ASSETS.checkin.iconCards || SHARED_ICONS.cards, ...ICON_BOX.cards, ...icons.cards },
    },
    dayCard: ASSETS.checkin.dayCard,
    // Overscale/offset per asset so the visible art fills its slot despite the
    // PNGs' baked-in transparent padding (see NO_FIT above).
    fit: {
      board: { ...NO_FIT, ...fit.board },
      dayCard: { ...NO_FIT, ...fit.dayCard },
      chest: { ...NO_FIT, ...fit.chest },
    },
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
      // Day 7's reward text sits inside a brightly-lit chest mouth on every
      // skin, where gold-on-gold is unreadable — so it goes dark.
      rewardSpecial: '#1c1400',
      ...c,
    },
    font: '"Times New Roman", serif',
    ...rest,
  };
}

/**
 * Mart item card (Figma acebet77 468:1997, 163x162):
 *   name  8px at y=109   coins 6px at y=127
 *   redeem plaque 143x51 at (10, 132) — deliberately overhangs the frame's
 *   bottom edge, which the grid's row gap absorbs (matches the comp).
 */
export const MART_CARD = {
  aspect: '163 / 162',
  // No gold plinth: the shot sits on the frame itself, sized to the tightest of
  // the six inner areas (ep369's sides, acebet77's dipping top crown).
  image: { left: 12, top: 14, w: 76, h: 44, lockW: 34 },
  // Magnifier badge, as % of the image box it corners itself into.
  zoom: { size: 21 },
  // Name is nudged up from the comp's y=109 to make room below it: the comps
  // only ever show ONE price line, but the real card can show two (a
  // strikethrough original plus the promo price), which collided at y=127.
  // Sizes are bumped up from the comp's 8px/6px (too small to read on device)
  // to 13px/11px equivalents — still anchored the same way so nothing overlaps.
  name: { top: (99 / 162) * 100, sizeCqi: (13 / 163) * 100 },
  // The price block is anchored just above the redeem plaque and grows upward,
  // so one or two lines both sit correctly without overlapping anything.
  coins: { bottom: 100 - (130 / 162) * 100, sizeCqi: (11 / 163) * 100 },
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
    // The comps put two 163px cards + a 16px gap on a 402px frame (~85% of the
    // screen). The portal is clamped to 475px, so the grid takes the same ~85%
    // share instead of the 358px it was capped at, which left the cards small
    // with wide dead margins — the same problem the check-in board had.
    gridMaxWidth: 404,
    itemFrame: ASSETS.mart.itemFrame,
    redeemButton: ASSETS.mart.btnRedeem,
    // As with the check-in board, the comps use these golds across all six
    // skins rather than each theme's palette.
    // Background of the "Mart is currently closed" panel. Matches the value the
    // default page already used for themed members (app/mart/page.js) — the two
    // blue-ish skins get the navy tint, everyone else the warm dark one.
    closedPanelBg: 'rgba(35,31,20,0.95)',
    c: {
      name: '#e9af41',
      coins: '#e9af41',
      redeem: '#f2ba33',
      locked: COLORS.sand || COLORS.creamMuted || '#d0c6ab',
      // The default card uses this red for the strikethrough original price and
      // the "Upgrade to X to unlock" notice.
      lockedText: '#e94141',
      ...c,
    },
    font: 'var(--font-berkshire-swash), "Times New Roman", serif',
    ...rest,
  };
}
