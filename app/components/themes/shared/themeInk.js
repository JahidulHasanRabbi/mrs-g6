"use client";

import { THEME_IDS } from '../../../config/themes';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Colour for text that sits directly on a skin's page backdrop.
 *
 * Four of the six backdrops are dark enough for the shared gold (mean
 * luminance 29-64); kgame99's pale sky and lv918's pink are not (189 / 185),
 * so headings, labels and captions go dark there instead.
 */
const ON_LIGHT_BACKDROP = {
  [THEME_IDS.KGAME99]: { heading: '#0d3566', label: '#0f2a4a', meta: '#1c4172' },
  [THEME_IDS.LV918]: { heading: '#6b1436', label: '#5a1230', meta: '#3d0a20' },
};

const ON_DARK_BACKDROP = { heading: '#e9af41', label: '#e9af41', meta: '#d0c6ab' };

/**
 * Chrome for the Special For You banner: its rule, glow and the scrim that
 * keeps the copy legible over the artwork. The Figma card (535:61) is gold on
 * near-black; each skin keeps that shape but in its own accent and dark base.
 */
const BANNER_CHROME = {
  [THEME_IDS.ACEBET77]: { border: '#d4af37', glow: 'rgba(243,173,60,0.20)', scrim: '10,5,3' },
  [THEME_IDS.UBETCLUB]: { border: '#e9af41', glow: 'rgba(233,175,65,0.22)', scrim: '24,8,10' },
  [THEME_IDS.EP369]: { border: '#e9af41', glow: 'rgba(140,200,120,0.22)', scrim: '4,20,10' },
  [THEME_IDS.KGAME99]: { border: '#7fb3e8', glow: 'rgba(90,150,230,0.28)', scrim: '6,21,39' },
  [THEME_IDS.LV918]: { border: '#f34f89', glow: 'rgba(243,79,137,0.28)', scrim: '42,10,31' },
  [THEME_IDS.N1GANG]: { border: '#f2cb7a', glow: 'rgba(242,203,122,0.22)', scrim: '10,10,10' },
};

export function useBannerChrome() {
  const { themeId } = useTheme();
  return BANNER_CHROME[themeId] || BANNER_CHROME[THEME_IDS.ACEBET77];
}

export function useThemeInk() {
  const { themeId } = useTheme();
  const light = ON_LIGHT_BACKDROP[themeId];
  if (light) return { ...light, halo: '0 1px 0 rgba(255,255,255,0.55)', onLight: true };
  return { ...ON_DARK_BACKDROP, halo: '0 3px 0 rgba(0,0,0,0.35)', onLight: false };
}
