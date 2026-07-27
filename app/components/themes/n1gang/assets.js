// Art comes from the "N1gang" section of the MRS Theme Engine Figma file
// (1IVoZBmY746AYkNiR05Y3Z, section 235:2051). Every entry below is the node's
// RAW image fill — the original uploaded PNG with its alpha intact. Do NOT
// re-export these as node renders: a Figma node export flattens the art onto
// the canvas matte, which bakes a grey background into every cutout.

const BASE = '/assets/themes/n1gang';

export const N1GANG_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.png`,
    info: `${BASE}/ui/icon-info.png`,
    dialogFrame: `${BASE}/ui/dialog-frame.png`,
    dialogFrameTall: `${BASE}/ui/dialog-frame-tall.png`,
    frameTop: `${BASE}/ui/frame-top.png`,
    frameMid: `${BASE}/ui/frame-mid.png`,
    frameBottom: `${BASE}/ui/frame-bottom.png`,
    btnGold: `${BASE}/ui/btn-gold.png`,
    iconGift: `${BASE}/ui/icon-gift.svg`,
    iconCoins: `${BASE}/ui/icon-coins.svg`,
    iconParty: `${BASE}/ui/icon-party.svg`,
    jackpotPanel: `${BASE}/ui/jackpot-panel.png`,
    // Empty gold ribbon — the banner behind a jackpot / prize amount.
    ribbonBanner: `${BASE}/ui/ribbon-banner.png`,
  },
  nav: {
    bar: `${BASE}/nav/nav-bar-union.svg`,
    leaderboard: `${BASE}/nav/icon-leaderboard.png`,
    hot: `${BASE}/nav/icon-hot.png`,
    home: `${BASE}/nav/icon-home.png`,
    profile: `${BASE}/nav/icon-profile.png`,
    livechat: `${BASE}/nav/icon-livechat.png`,
  },
  home: {
    bg: `${BASE}/home/bg-throne.png`,
    king: `${BASE}/home/king.png`,
    crest: `${BASE}/home/crest-n1gang.png`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.png`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.png`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.png`,
  },
  spin: {
    bg: `${BASE}/spin/bg-spin.png`,
    title: `${BASE}/spin/title-lucky-spin.png`,
    // Wider lock-up of the same title, for a full-bleed header.
    titleWide: `${BASE}/spin/title-lucky-spin-wide.png`,
    wheelFrame: `${BASE}/spin/wheel-frame.png`,
    slotGold: `${BASE}/spin/slot-gold.png`,
    // No green slot exists in the set. slot-question is pixel-identical to
    // slot-gold, so pointing here made both wheel tiles the same — slot-mystery
    // is the genuinely different second tile.
    slotGreen: `${BASE}/spin/slot-mystery.png`,
    // The reward-slot tiles that came with the Figma set.
    slotMystery: `${BASE}/spin/slot-mystery.png`,
    slotOrb: `${BASE}/spin/slot-orb.png`,
    slotQuestion: `${BASE}/spin/slot-question.png`,
    spinNow: `${BASE}/spin/spin-now.png`,
    // Alternate SPIN NOW treatments (spiked ring / compact).
    spinNowSpiky: `${BASE}/spin/spin-now-spiky.png`,
    spinNowSmall: `${BASE}/spin/spin-now-small.png`,
    btnPlay: `${BASE}/spin/btn-play.png`,
    // Container for the winning-record / terms sections (buildFramedSkin reads
    // this). Must be the header-less plate: panel-ornate.png has the N1gang
    // crest baked in, which showed through behind the first rows and forced the
    // insets down so far that the last row got clipped.
    panel: `${BASE}/vip/card-frame.png`,
    // The spin page reads these, NOT the flat keys above — keep both in sync.
    grid: {
      // The wheel background must be SQUARE: LuckySpinGrid renders the themed
      // wheel in an aspect-square box and lays the 3x3 tiles out across it, so
      // the 4:3 spin/wheel-frame.png letterboxed inside that box and the tiles
      // spilled off its top and bottom edges. dialog-frame-tall.png is the same
      // thunder-arena plate at 1:1 with a square interior.
      background: `${BASE}/ui/dialog-frame-tall.png`,
      itemEmptyGold: `${BASE}/spin/slot-gold.png`,
      itemEmptyGreen: `${BASE}/spin/slot-mystery.png`,
      centerButton: `${BASE}/spin/spin-now.png`,
      centerButtonStop: `${BASE}/spin/spin-now.png`,
    },
  },
  egg: {
    bg: `${BASE}/egg/bg-hall.png`,
    bgLoading: `${BASE}/egg/bg-loading.png`,
    rays: `${BASE}/egg/rays.png`,
    eggIntact: `${BASE}/egg/egg-intact.png`,
    // Supplied separately — the Figma set has no cracked variant. The file that
    // used to sit here was the hamburger MENU icon at 1024², so smashing turned
    // the egg into three gold bars. Shipped at the same 465x620 as egg-intact so
    // the swap has no size jump.
    eggCracked: `${BASE}/egg/egg-cracked.png`,
    eggCrown: `${BASE}/egg/egg-crown.png`,
    btnWide: `${BASE}/egg/btn-wide.png`,
    iconToken: `${BASE}/egg/icon-token.svg`,
    logo: `${BASE}/home/tile-smash-egg.png`,
    jackpotRibbon: `${BASE}/ui/ribbon-banner.png`,
    jackpotCoins: `${BASE}/egg/jackpot-coins.png`,
  },
  pk: {
    bgStadium: `${BASE}/pk/bg-stadium.png`,
    // The wide (loading/launch) variant reuses the stadium art — same as
    // ubetclub/ep369. bg-crowd.png is leftover 410x884 art that isn't the
    // N1gang arena, and PitchBackground renders bgCrowd full-bleed for the
    // wide variant, so pointing at it showed the wrong backdrop entirely.
    bgCrowd: `${BASE}/pk/bg-stadium.png`,
    iconBall: `${BASE}/pk/icon-ball.svg`,
    iconTokenHud: `${BASE}/pk/icon-token-hud.svg`,
    iconShotHud: `${BASE}/pk/icon-shot-hud.svg`,
    prizePanel: `${BASE}/pk/prize-panel.png`,
  },
  profile: {
    title: `${BASE}/profile/title-profile.png`,
    badgeNum: `${BASE}/profile/badge-num.png`,
    iconChevron: `${BASE}/profile/icon-chevron.png`,
    badgeCheck: `${BASE}/profile/badge-check.png`,
    iconStar: `${BASE}/profile/icon-star.svg`,
    iconArrow: `${BASE}/profile/icon-arrow.svg`,
  },
  vip: {
    title: `${BASE}/vip/title-vip.png`,
    cardFrame: `${BASE}/vip/card-frame.png`,
  },
  terms: {
    title: `${BASE}/ui/title-terms.png`,
  },
  frames: {
    // Card/panel frames — these are stretched to fit content and hold TEXT, so
    // they must have a dark readable interior. The crowned gate art is a solid
    // ornament with no interior plate; using it here left the profile and terms
    // copy sitting on bare gold artwork.
    crown: `${BASE}/ui/dialog-frame.png`,
    scroll: `${BASE}/ui/frame-scroll.png`,
    stone: `${BASE}/ui/frame-stone.png`,
    // Plain bordered plate with no crest/header baked in — the right container
    // when the screen already has its own title art above the panel, since a
    // baked header would collide with the first row of content.
    panel: `${BASE}/vip/card-frame.png`,
    // Decorative only — never use as a text container.
    ornamentThrone: `${BASE}/ui/ornament-throne.png`,
  },
};

export const N1GANG_COLORS = {
  gold: '#d4a830',
  goldBright: '#f2cb7a',
  cream: '#fff6df',
  creamMuted: '#eae2cf',
  sand: '#d0c6ab',
  tokenYellow: '#ffe16d',
  dark: '#0a0a0a',
};
