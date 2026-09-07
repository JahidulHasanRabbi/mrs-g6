"use client";

// Per-theme skin for the Avatar mini-game (Figma a83SqWgqIGNF6dJD1aP13w — one
// 11-screen row per brand). Layout and behaviour are unchanged; a skin only
// swaps colours and art.
//
// The comps were drawn from each station's existing portal art, so a skin is
// mostly a re-map of that theme's assets.js + palette. buildRpgSkin normalises
// the gaps: only acebet77/n1gang ship a 3-slice frame, and ubetclub/ep369 have
// no egg.btnWide plaque.
//
// Every token exists on BOTH skins, so screens read `skin.*` unconditionally
// rather than branching on `skin.themed` — that flag is only for the few places
// where the two looks differ in structure, not colour.

import { createContext, useContext } from "react";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";
import { getHeaderBalanceSkin } from "../header/headerBalanceAssets";
import { THEME_IDS } from "../../config/themes";
import { WAR_FONT } from "../boss-war/constants";

// Boss War art shared by every skin (the comps reuse one chip / gem set).
const WAR_SHARED = {
  chip: "/assets/boss-war/ui/chip-boss-type.webp",
};

const SCRIPT_FONT = "var(--font-berkshire-swash), cursive";
const SERIF_FONT = '"Times New Roman", serif';


/**
 * 9-slice spec for a Boss War frame from ornament insets measured off the art
 * (percent of the image, T R B L) and the box it usually renders in. The
 * rendered border is the inset scaled to that box; padding clears it.
 */
export function warFrame(frame, t, r, b, l, box = [358, 160], opts = {}) {
  const { extra = 4, cap = 30 } = opts;
  const [w, h] = box;
  // The rendered border is capped: a crown or gem crest can be 45% of its
  // artwork, and reserving that verbatim leaves the card mostly empty.
  const px = (pct, dim) => Math.min(cap, Math.max(4, Math.round((pct / 100) * dim)));
  const wt = px(t, h), wr = px(r, w), wb = px(b, h), wl = px(l, w);
  return {
    frame,
    slice: `${t}% ${r}% ${b}% ${l}% fill`,
    width: `${wt}px ${wr}px ${wb}px ${wl}px`,
    // border-width already holds the content clear of the ornament, so padding
    // is breathing room only — adding the inset again doubled every card.
    pad: `${extra}px`,
  };
}

/** The 9-slice style shared by the panel and slot-tile frames. */
export function nineSlice({ frame, slice, width, pad }) {
  return {
    borderStyle: "solid",
    borderImageSource: `url(${frame})`,
    borderImageSlice: slice,
    borderImageWidth: width,
    borderImageRepeat: "stretch",
    borderWidth: width,
    padding: pad,
  };
}

/**
 * The default MRS look — the cyan/violet game surface that shipped before the
 * station skins. `frame: null` everywhere makes each primitive keep its current
 * CSS treatment, so an unthemed member sees no change.
 */
const DEFAULT_SKIN = {
  id: THEME_IDS.DEFAULT,
  themed: false,
  bg: RPG_IMAGES.bg,
  surface: "#07130d",
  // One backdrop wash over the background art — ambient glows by default, a
  // readability vignette on the station halls.
  overlay:
    "radial-gradient(40% 22% at 88% 22%, rgba(167,139,250,0.18) 0%, rgba(167,139,250,0) 70%), radial-gradient(45% 25% at 10% 88%, rgba(47,230,200,0.14) 0%, rgba(47,230,200,0) 70%), radial-gradient(35% 18% at 15% 8%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 70%)",
  chrome: {
    bar: RPG_COLORS.chrome,
    barBorder: RPG_COLORS.chromeGold,
    barShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 4px 2px rgba(233,175,65,0.25)",
    menuIcon: RPG_IMAGES.ui.menu,
    infoIcon: RPG_IMAGES.ui.info,
    logoIcon: RPG_IMAGES.ui.logoGem,
    logoColor: RPG_COLORS.cyan,
    logoShadow: undefined,
  },
  nav: {
    bar: null,
    icons: null,
    centerBox: { w: 50, h: 58 },
    labelFont: RPG_FONTS.display,
    label: RPG_COLORS.navInactive,
    labelActive: null, // null = keep the gold-gradient text fill
  },
  hud: {
    border: "rgba(139,92,246,0.25)",
    badgeBg: "rgba(47,230,200,0.08)",
    badgeBorder: RPG_COLORS.cyan,
    badgeLabel: RPG_COLORS.cyanSoft,
    expLabel: RPG_COLORS.textDim,
    expGradient: RPG_GRADIENTS.exp,
    chipFrame: null,
    ringBg: "rgba(12,7,30,0.6)",
    ringShadow: "0 0 40px rgba(47,230,200,0.35), inset 0 0 30px rgba(124,77,255,0.3)",
  },
  dice: {
    face: "linear-gradient(145deg, #ffffff 0%, #edeef4 52%, #c9cedd 100%)",
    faceShadow: "inset 0 0 7px rgba(60,70,100,0.28), inset 0 -3px 6px rgba(60,70,100,0.22)",
    pip: "radial-gradient(circle at 35% 30%, #3c4150 0%, #15171f 55%, #04050a 100%)",
    pipShadow: "inset 0 2px 3px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.55)",
  },
  // `fill`/`border` dress an unframed card; `fillDark` is the more opaque
  // variant the data cards use so body copy reads over the damask.
  panel: {
    frame: null,
    fill: RPG_COLORS.violetSoft,
    border: RPG_COLORS.violetBorder,
    fillDark: "rgba(10,8,26,0.72)",
    borderDark: "rgba(139,92,246,0.4)",
  },
  tile: { frame: null },
  cta: { plaque: null, font: RPG_FONTS.display, color: null },
  bar: { track: "rgba(255,255,255,0.1)", fill: RPG_GRADIENTS.exp },
  modal: {
    bg: "rgba(10,14,24,0.97)",
    border: RPG_COLORS.violetBorder,
    shadow: "0 16px 50px rgba(0,0,0,0.5), 0 0 30px rgba(124,77,255,0.25)",
  },
  c: {
    text: RPG_COLORS.text,
    textDim: RPG_COLORS.textDim,
    title: RPG_COLORS.text,
    titleShadow: "0 0 24px rgba(124,77,255,0.8)",
    value: RPG_COLORS.gold,
    slotLabel: RPG_COLORS.slotLabel,
    slotEmpty: RPG_COLORS.slotEmpty,
    // The cyan pair the default look uses for selected/active accents; each
    // station replaces both with its gold.
    accent: RPG_COLORS.cyan,
    accentSoft: RPG_COLORS.cyanSoft,
    // Hairlines and glows. Violet on the default look, gold on a station.
    edge: RPG_COLORS.violetBorderStrong,
    edgeSoft: RPG_COLORS.violetBorder,
    rule: "rgba(139,92,246,0.35)",
    // Surface behind a small inline control (tab strip, reward list, pills).
    inset: "rgba(8,10,22,0.7)",
    // A selectable row (boss list) in its three states, and the muted fill of
    // an inactive control.
    rowIdle: "rgba(47,230,200,0.05)",
    rowActive: "rgba(47,230,200,0.09)",
    rowLocked: "rgba(255,255,255,0.02)",
    muted: "rgba(68,31,126,0.72)",
    // The spaced caption over a headline figure ("— POWER —"), and the small
    // heading over a data block ("POWER BREAKDOWN").
    caption: RPG_COLORS.textDim,
    sectionLabel: RPG_COLORS.textDim,
    // Muted disclaimer under a reward list.
    footnote: "#cbb96a",
    // An inactive control's label (unselected mission tab).
    labelMuted: "#6e5fa8",
  },
  // Ink for copy sitting on a light panel interior; null = `c` unchanged.
  onPanel: null,
  war: {
    font: WAR_FONT,
    titleGradient: `linear-gradient(180deg, #fff3cf 0%, ${RPG_COLORS.gold} 60%, ${RPG_COLORS.goldDeep} 100%)`,
    bg: null,
    titlePlaque: null,
    bossFrame: null,
    card: { frame: null, slice: "18% 10% 16% 10% fill", width: "22px 18px 22px 18px", pad: "14px 16px 14px 16px" },
    statCard: null, // null = same as `card`
    table: null, // null = same as `card`
    tab: { on: null, off: null },
    chip: WAR_SHARED.chip,
    timer: null,
    attackBtn: null,
    attackLabelBias: 0,
    frameInkSolid: null,
    inkFrame: null,
    pill: null,
    earnTile: { frame: null, ctaBand: null, inset: 13 },
    plaque: { frame: null, slice: "24% 10% 16% 10% fill", width: "34px 20px 24px 20px", pad: "36px 18px 22px 18px" },
    row: { frame: null, slice: "40% 8% 40% 8% fill", width: "18px 14px 18px 14px", pad: "4px 10px" },
    hp: { track: "rgba(255,255,255,0.1)", border: RPG_COLORS.violetBorderStrong, fill: RPG_GRADIENTS.exp },
    ink: {
      name: RPG_COLORS.gold,
      text: RPG_COLORS.text,
      meta: RPG_COLORS.textDim,
      value: RPG_COLORS.gold,
      dmg: RPG_COLORS.goldDeep,
      crit: "#59d827",
      onPlaque: RPG_COLORS.text,
    },
  },
};

// `cOnPanel` is the ink a Panel's contents should use, and `panelSkin` is the
// skin a Panel re-provides to its children. Both are derived once per skin so
// no call site has to remember to merge (and so a SlotChip reads the same ink
// whether or not it sits inside a Panel).
function withPanelInk(skin) {
  skin.cOnPanel = skin.onPanel ? { ...skin.c, ...skin.onPanel } : skin.c;
  skin.panelSkin = skin.onPanel
    ? { ...skin, c: skin.cOnPanel, cOnPanel: skin.cOnPanel, onPanel: null }
    : skin;
  return skin;
}

export const RPG_DEFAULT_SKIN = withPanelInk(DEFAULT_SKIN);

/**
 * Build a station skin from its assets.js map + palette. Each theme passes the
 * 9-slice values measured off its own frame art via `overrides`.
 */
export function buildRpgSkin(themeId, ASSETS, COLORS, overrides = {}) {
  const cream = COLORS.cream || "#fff6df";
  const gold = COLORS.gold;
  const goldBright = COLORS.goldBright || COLORS.gold;
  const dark = COLORS.dark || "#050505";
  // Gold hairline at a given alpha — the station counterpart to the default
  // look's violet edges.
  const edge = (a) => `rgba(255,215,120,${a})`;
  const W = ASSETS.war || {};

  const skin = {
    id: themeId,
    themed: true,
    // The station's hall — the comps use it on every screen but HOME.
    bg: ASSETS.egg?.bg || ASSETS.spin?.bg || ASSETS.home?.bg,
    surface: dark,
    // The halls are brightest dead-centre, where the screens put their body
    // copy; a vignette keeps the art readable underneath it.
    overlay:
      "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.24) 30%, rgba(0,0,0,0.3) 62%, rgba(0,0,0,0.55) 100%)",
    chrome: {
      ...DEFAULT_SKIN.chrome,
      // The comps tint the bar with the station's own dark; a theme overrides
      // this when its comp uses a distinct gradient.
      bar: `linear-gradient(180deg, ${dark}f5 0%, ${dark}d6 100%)`,
      barBorder: goldBright,
      barShadow: "0 4px 12px rgba(0,0,0,0.45)",
      menuIcon: ASSETS.ui.hamburger,
      infoIcon: ASSETS.ui.info,
      logoIcon: null,
      logoColor: goldBright,
      logoShadow: "0 2px 6px rgba(0,0,0,0.75)",
    },
    nav: {
      ...DEFAULT_SKIN.nav,
      bar: ASSETS.nav.bar,
      icons: {
        base: ASSETS.rpg.iconBase,
        items: ASSETS.rpg.iconHeroItem,
        challenge: ASSETS.rpg.iconChallenge,
        mission: ASSETS.rpg.iconMission,
        // acebet77/n1gang crop the shared sheet in the comp, so they fall back
        // to the station's own portal-home crest.
        portalHome: ASSETS.rpg.iconPortalHome || ASSETS.nav.home,
      },
      // The comps draw the raised centre crest larger than the portal nav does.
      centerBox: { w: 64, h: 72 },
      labelFont: SERIF_FONT,
      label: gold,
      labelActive: "#ffffff",
    },
    hud: {
      border: edge(0.22),
      badgeBg: "rgba(0,0,0,0.35)",
      badgeBorder: goldBright,
      badgeLabel: goldBright,
      expLabel: goldBright,
      ringBg: "rgba(0,0,0,0.62)",
      ringShadow: `0 0 34px rgba(0,0,0,0.45), inset 0 0 26px ${goldBright}33`,
      expGradient: `linear-gradient(90deg, ${goldBright} 0%, ${gold} 100%)`,
      chipFrame: getHeaderBalanceSkin(themeId),
    },
    // The comps tint the battle die with the station's accent, dark pips on it.
    dice: {
      face: `linear-gradient(145deg, ${cream} 0%, ${goldBright} 48%, ${gold} 100%)`,
      faceShadow: "inset 0 0 7px rgba(0,0,0,0.28), inset 0 -3px 6px rgba(0,0,0,0.24)",
      pip: "radial-gradient(circle at 35% 30%, #4a4a4a 0%, #1a1a1a 55%, #050505 100%)",
      pipShadow: "inset 0 2px 3px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.35)",
    },
    panel: {
      ...DEFAULT_SKIN.panel,
      frame: ASSETS.spin.panel,
      // 9-slice of the frame art. Percentages are of the image, measured off
      // each theme's panel; `width`/`pad` are tuned so the ornament reads at
      // the 475px member column without eating a short panel's content box.
      slice: "18% 10% 16% 10% fill",
      width: "26px 20px 25px 20px",
      // Keeps the content box the same width as the default card, so nothing
      // that fitted before starts truncating inside the frame.
      pad: "28px 20px 26px 20px",
    },
    // The slot tile is 9-sliced, not stretched: the chip box is portrait while
    // the art is square, and a theme with a thick surround (kgame99's is 35% of
    // the image) distorts badly when squeezed. `width` is the rendered border,
    // deliberately smaller than the slice so the opening stays usable at the
    // chip's ~73px width.
    tile: {
      frame: ASSETS.rpg.tileFrame,
      slice: "15% 13% 15% 13% fill",
      width: "12px 10px 11px 10px",
      pad: "2px 0px 5px",
    },
    cta: {
      // Dark filigree plaque where the theme has one, else its play plaque.
      plaque: ASSETS.egg?.btnWide || ASSETS.spin?.btnPlay,
      font: SCRIPT_FONT,
      color: goldBright,
    },
    bar: {
      track: COLORS.progressTrack || "rgba(0,0,0,0.45)",
      fill: `linear-gradient(90deg, ${goldBright} 0%, ${gold} 100%)`,
    },
    modal: {
      bg: `${dark}f7`,
      border: edge(0.34),
      shadow: "0 16px 50px rgba(0,0,0,0.6)",
    },
    c: {
      text: cream,
      textDim: COLORS.sand || COLORS.creamMuted || cream,
      title: cream,
      titleShadow: "0 2px 10px rgba(0,0,0,0.75)",
      value: goldBright,
      slotLabel: COLORS.creamMuted || cream,
      slotEmpty: COLORS.sand || cream,
      accent: goldBright,
      accentSoft: goldBright,
      edge: edge(0.5),
      edgeSoft: edge(0.3),
      rule: edge(0.32),
      inset: "rgba(0,0,0,0.55)",
      rowIdle: "rgba(0,0,0,0.52)",
      rowActive: "rgba(0,0,0,0.66)",
      rowLocked: "rgba(0,0,0,0.5)",
      muted: "rgba(0,0,0,0.55)",
      caption: cream,
      sectionLabel: goldBright,
      footnote: COLORS.sand || COLORS.creamMuted || cream,
      labelMuted: COLORS.sand || COLORS.creamMuted || cream,
    },
    onPanel: null,
    // Boss War dressing. A theme ships its own art under ASSETS.war; anything
    // missing falls back to the panel / CTA art the RPG already uses.
    war: {
      font: WAR_FONT,
      titleGradient: `linear-gradient(180deg, #fff3cf 0%, ${goldBright} 55%, ${gold} 100%)`,
      bg: W.bg || null,
      titlePlaque: W.titlePlaque || null,
      bossFrame: W.bossFrame || null,
      // Variable-height containers are 9-sliced; each theme overrides `slice`
      // with values measured off its own art (see <Theme>RpgSkin.jsx).
      card: { frame: W.cardFrame || ASSETS.spin?.panel || null, slice: "14% 6% 9% 6% fill", width: "20px 14px 16px 14px", pad: "12px 14px 12px 14px" },
      statCard: W.statCard ? { frame: W.statCard, slice: "14% 6% 9% 6% fill", width: "20px 14px 16px 14px", pad: "12px 14px 12px 14px" } : null,
      table: W.tableFrame ? { frame: W.tableFrame, slice: "14% 6% 9% 6% fill", width: "20px 14px 16px 14px", pad: "12px 14px 12px 14px" } : null,
      tab: { on: W.tabOn || null, off: W.tabOff || null },
      chip: WAR_SHARED.chip,
      timer: W.timerPlaque || null,
      // The comps reuse the header plaque as the ATTACK button and the active
      // tab pill as the wide Rewards / Rankings buttons.
      attackBtn: W.attackBtn || W.titlePlaque || ASSETS.egg?.btnWide || ASSETS.spin?.btnPlay || null,
      // Falling back to the header plaque means a crown occupies the top
      // third, so the label drops to sit in the opening (comp 2634:2423).
      attackLabelBias: W.attackBtn ? 0 : 0.14,
      // Both set by a skin whose frame interiors are light: `frameInkSolid`
      // replaces the gold gradient, `inkFrame` the label/value colours.
      // `ink` stays light — the timer plaque and boss art are still dark.
      frameInkSolid: null,
      inkFrame: null,
      pill: W.pill || W.tabOn || ASSETS.egg?.btnWide || ASSETS.spin?.btnPlay || null,
      // Fixed-aspect tile art, stretched like the comps. `ctaBand` is the
      // baked CTA pill measured off the art, as % of its height; a theme
      // whose tile has no pill leaves it null and gets a drawn one.
      earnTile: { frame: W.earnTile || null, ctaBand: W.earnTileCtaBand || null, inset: W.earnTileInset ?? 13 },
      plaque: { frame: W.plaque || W.cardFrame || ASSETS.spin?.panel || null, slice: "22% 8% 12% 8% fill", width: "30px 16px 18px 16px", pad: "30px 16px 18px 16px" },
      row: { frame: W.rowFrame || null, slice: "13% 8% 13% 8% fill", width: "8px 14px 8px 14px", pad: "4px 10px" },
      hp: { track: "rgba(45,45,45,0.75)", border: "#f2b229", fill: "linear-gradient(90deg, #fff0bf 0%, #f2b229 100%)" },
      ink: {
        name: goldBright,
        text: "#fff2d4",
        meta: "#bfa1ad",
        value: "#f2b229",
        dmg: "#ffae00",
        crit: "#59d827",
        onPlaque: cream,
      },
    },
  };

  return withPanelInk(deepMerge(skin, overrides));
}

function deepMerge(base, extra) {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra || {})) {
    out[k] =
      v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object"
        ? deepMerge(base[k], v)
        : v;
  }
  return out;
}

const RpgSkinContext = createContext(RPG_DEFAULT_SKIN);

export function RpgSkinProvider({ skin, children }) {
  return <RpgSkinContext.Provider value={skin}>{children}</RpgSkinContext.Provider>;
}

export function useRpgSkin() {
  return useContext(RpgSkinContext);
}
