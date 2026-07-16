"use client";

import { COLORS } from "./constants";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_IDS } from "../../config/themes";
import { ACEBET_ASSETS, ACEBET_COLORS } from "../themes/acebet77/assets";
import { UBET_ASSETS, UBET_COLORS } from "../themes/ubetclub/assets";
import { EP369_ASSETS, EP369_COLORS } from "../themes/ep369/assets";
import AcebetOrnateCard from "../themes/acebet77/AcebetOrnateCard";
import AcebetButton from "../themes/acebet77/AcebetButton";
import UbetOrnateCard from "../themes/ubetclub/UbetOrnateCard";
import UbetButton from "../themes/ubetclub/UbetButton";
import Ep369OrnateCard from "../themes/ep369/Ep369OrnateCard";
import Ep369Button from "../themes/ep369/Ep369Button";

// Glow strings were hardcoded green rgba() literals across the phase
// components; they live here now so a theme can recolor them in one place.
const DEFAULT_PK_COLORS = {
  ...COLORS,
  glow55: "rgba(84,233,138,0.55)",
  glow40: "rgba(84,233,138,0.4)",
  glow35: "rgba(84,233,138,0.35)",
};

// Themed skins: the signature green becomes gold (Figma "SWIPE TO KICK" /
// "GOAL!" render #f2ba33 with a gold glow). Acebet77 and Ubetclub share the
// same gold gameplay accent; only the backdrop art and dialog frames differ.
const GOLD_PK_COLORS = {
  ...DEFAULT_PK_COLORS,
  primary: "#f2ba33",
  primaryDeep: "#2a1d02",
  primaryShadow: "#7a5a10",
  primaryGradStart: "#e4a825",
  greenSoft10: "rgba(242,186,51,0.1)",
  greenSoft20: "rgba(242,186,51,0.2)",
  greenSoft50: "rgba(242,186,51,0.5)",
  glow55: "rgba(242,186,51,0.55)",
  glow40: "rgba(242,186,51,0.4)",
  glow35: "rgba(242,186,51,0.35)",
};

// One pack per themed skin. Each supplies the gold gameplay palette, the accent
// used for glows, the ornate dialog components, the display palette the shared
// dialogs read, and the theme's full asset map. A pack keeps every PK component
// on a single `theme`-based branch instead of one branch per skin.
const THEME_PACKS = {
  [THEME_IDS.ACEBET77]: {
    pkColors: GOLD_PK_COLORS,
    accent: "242,186,51",
    OrnateCard: AcebetOrnateCard,
    Button: AcebetButton,
    assets: ACEBET_ASSETS,
    iconBall: ACEBET_ASSETS.pk.iconBall,
    palette: {
      cream: ACEBET_COLORS.cream,
      sand: ACEBET_COLORS.sand,
      accent: ACEBET_COLORS.tokenYellow,
      gold: ACEBET_COLORS.goldBright,
      missRed: "#ff5a5a",
    },
  },
  [THEME_IDS.UBETCLUB]: {
    pkColors: GOLD_PK_COLORS,
    accent: "242,186,51",
    OrnateCard: UbetOrnateCard,
    Button: UbetButton,
    assets: UBET_ASSETS,
    iconBall: UBET_ASSETS.pk.iconBall,
    palette: {
      cream: UBET_COLORS.cream,
      sand: UBET_COLORS.sand,
      accent: UBET_COLORS.tokenYellow,
      gold: UBET_COLORS.goldBright,
      missRed: "#ff5a5a",
    },
  },
  [THEME_IDS.EP369]: {
    pkColors: GOLD_PK_COLORS,
    accent: "242,186,51",
    OrnateCard: Ep369OrnateCard,
    Button: Ep369Button,
    assets: EP369_ASSETS,
    iconBall: EP369_ASSETS.pk.iconBall,
    palette: {
      cream: EP369_COLORS.cream,
      sand: EP369_COLORS.sand,
      accent: EP369_COLORS.tokenYellow,
      gold: EP369_COLORS.goldBright,
      missRed: "#ff5a5a",
    },
  },
};

/**
 * Theme-aware penalty-kick pack. Components render identical layouts across
 * skins; only colors, backdrop art and dialog frames swap. `soft(alpha)`
 * returns the signature accent (green / gold) at an arbitrary opacity, and
 * `theme` (null on the default skin) carries the ornate dialog components,
 * display palette and asset map so each PK component needs a single branch.
 */
export function usePkColors() {
  const { themeId, isAcebet77, isUbetclub, isEp369, isThemed } = useTheme();
  const pack = THEME_PACKS[themeId] || null;
  const base = pack ? pack.accent : "84,233,138";
  return {
    colors: pack ? pack.pkColors : DEFAULT_PK_COLORS,
    isAcebet77,
    isUbetclub,
    isEp369,
    isThemed,
    themeId,
    theme: pack
      ? {
          OrnateCard: pack.OrnateCard,
          Button: pack.Button,
          assets: pack.assets,
          iconBall: pack.iconBall,
          palette: pack.palette,
        }
      : null,
    soft: (alpha) => `rgba(${base},${alpha})`,
  };
}
