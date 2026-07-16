"use client";

import { COLORS } from "./constants";
import { useTheme } from "../../contexts/ThemeContext";

// Glow strings were hardcoded green rgba() literals across the phase
// components; they live here now so a theme can recolor them in one place.
const DEFAULT_PK_COLORS = {
  ...COLORS,
  glow55: "rgba(84,233,138,0.55)",
  glow40: "rgba(84,233,138,0.4)",
  glow35: "rgba(84,233,138,0.35)",
};

// Acebet77 skin: the signature green becomes royal gold (Figma nodes
// 4:704 / 4:595 / 4:665 — INITIALIZING ARENA / SWIPE TO KICK / GOAL! all
// render #f2ba33 with a gold glow).
const ACEBET_PK_COLORS = {
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

/**
 * Theme-aware penalty-kick palette. Components render identical layouts in
 * both themes; only colors/art swap. `soft(alpha)` returns the signature
 * accent (green / gold) at an arbitrary opacity for glows and tints.
 */
export function usePkColors() {
  const { isAcebet77 } = useTheme();
  const base = isAcebet77 ? "242,186,51" : "84,233,138";
  return {
    colors: isAcebet77 ? ACEBET_PK_COLORS : DEFAULT_PK_COLORS,
    isAcebet77,
    soft: (alpha) => `rgba(${base},${alpha})`,
  };
}
