/**
 * Theme engine registry.
 *
 * Members enter the portal via /auth?id=<member_id>&o=<origin site>. The `o`
 * origin is persisted in localStorage (tokenStorage.setRedirectO) and decides
 * which visual skin the member portal renders with. Every origin without an
 * explicit rule falls back to the default MRS look, so new wallet sites work
 * without any code change.
 *
 * A member can override that from Personal Data → Change Theme. The manual pick
 * wins over the station's default from then on, whichever station they enter
 * from; clearing it hands the skin back to the origin rules.
 *
 * The same precedence has to run before React mounts, to stamp
 * <html data-theme="...">. buildThemeStampScript() below emits that inline
 * script from the maps in this file, so adding a theme is one edit here.
 */

import { STORAGE_KEYS, tokenStorage } from '../api/tokenStorage';

export const THEME_IDS = {
  DEFAULT: 'default',
  ACEBET77: 'acebet77',
  UBETCLUB: 'ubetclub',
  EP369: 'ep369',
  KGAME99: 'kgame99',
  LV918: 'lv918',
  N1GANG: 'n1gang',
};

/**
 * The themes offered in the Change Theme picker, in display order. Crest paths
 * are written out as literals rather than imported from each theme's assets.js
 * so the picker doesn't pull all six asset maps into a shared chunk.
 */
export const SELECTABLE_THEMES = [
  { id: THEME_IDS.ACEBET77, label: 'ACEBET77', crest: '/assets/themes/acebet77/home/crest-acebet77.png' },
  { id: THEME_IDS.UBETCLUB, label: 'UBETCLUB', crest: '/assets/themes/ubetclub/home/crest.png' },
  { id: THEME_IDS.EP369, label: 'EP369', crest: '/assets/themes/ep369/home/crest.png' },
  { id: THEME_IDS.KGAME99, label: 'KGAME99', crest: '/assets/themes/kgame99/home/crest-kgame99.png' },
  { id: THEME_IDS.LV918, label: 'LV918', crest: '/assets/themes/lv918/home/crest-lv918.png' },
  { id: THEME_IDS.N1GANG, label: 'N1GANG', crest: '/assets/themes/n1gang/home/crest-n1gang.png' },
  { id: THEME_IDS.DEFAULT, label: 'MRS DEFAULT', crest: '/android-chrome-512x512.png' },
];

export function isValidThemeId(themeId) {
  return Object.values(THEME_IDS).includes(themeId);
}

export function getThemeLabel(themeId) {
  return SELECTABLE_THEMES.find((t) => t.id === themeId)?.label || 'MRS DEFAULT';
}

// Substring rules matched against the hostname of the stored origin URL.
// First match wins.
const ORIGIN_THEME_RULES = [
  { match: 'acebet77', themeId: THEME_IDS.ACEBET77 },
  { match: 'ubetclub', themeId: THEME_IDS.UBETCLUB },
  { match: 'ep369', themeId: THEME_IDS.EP369 },
  { match: 'kgame99', themeId: THEME_IDS.KGAME99 },
  { match: 'lv918', themeId: THEME_IDS.LV918 },
  { match: 'n1gang', themeId: THEME_IDS.N1GANG },
];

/**
 * Read the `o` origin out of a query string ("?id=1&o=https%3A%2F%2Facebet77.me%2F").
 * Members land on /auth with the brand already in the URL, so this is the
 * earliest point the skin can be known — no storage read, no network call.
 */
export function originFromSearch(search) {
  if (!search) return null;
  try {
    return new URLSearchParams(search).get('o');
  } catch {
    return null;
  }
}

/**
 * Resolve a theme id from the origin URL saved at /auth time.
 * Accepts a full URL ("https://acebet77.me"), a bare domain ("acebet77.me"),
 * or null/undefined (returns the default theme).
 */
export function resolveThemeIdFromOrigin(originUrl) {
  if (!originUrl) return THEME_IDS.DEFAULT;

  let hostname = originUrl;
  try {
    hostname = new URL(originUrl.startsWith('http') ? originUrl : `https://${originUrl}`).hostname;
  } catch {
    // keep raw string; substring match below still works
  }
  hostname = hostname.toLowerCase();

  const rule = ORIGIN_THEME_RULES.find((r) => hostname.includes(r.match));
  return rule ? rule.themeId : THEME_IDS.DEFAULT;
}

/** The skin the member's station asks for, ignoring any manual pick. */
export function readStationThemeId() {
  if (typeof window === 'undefined') return THEME_IDS.DEFAULT;
  return resolveThemeIdFromOrigin(
    tokenStorage.getRedirectO() || originFromSearch(window.location.search)
  );
}

/** The member's manual pick, or null when they've never chosen one. */
export function readPinnedThemeId() {
  const picked = tokenStorage.getMemberTheme();
  return isValidThemeId(picked) ? picked : null;
}

export function pinThemeId(themeId) {
  if (isValidThemeId(themeId)) tokenStorage.setMemberTheme(themeId);
}

export function unpinTheme() {
  tokenStorage.clearMemberTheme();
}

/**
 * The member's active skin. Safe to call at module scope on the client — it
 * reads only location and localStorage — which is what lets a route start
 * downloading its own skin chunk before React's first render.
 */
export function readActiveThemeId() {
  if (typeof window === 'undefined') return THEME_IDS.DEFAULT;
  return readPinnedThemeId() || readStationThemeId();
}

/**
 * The pre-hydration stamp, built from the maps above so the theme list lives in
 * one place. Runs before React, so it can't import — the data is inlined.
 */
export function buildThemeStampScript() {
  const ids = JSON.stringify(Object.values(THEME_IDS));
  const rules = JSON.stringify(ORIGIN_THEME_RULES);
  return (
    `try{var p=localStorage.getItem('${STORAGE_KEYS.MEMBER_THEME}')||'';` +
    `var t=${ids}.indexOf(p)>-1?p:'';` +
    `if(!t){var q='';try{q=new URLSearchParams(location.search).get('o')||''}catch(e){}` +
    `var o=(localStorage.getItem('${STORAGE_KEYS.REDIRECT_O}')||q||'').toLowerCase();` +
    `var R=${rules};t='${THEME_IDS.DEFAULT}';` +
    `for(var i=0;i<R.length;i++)if(o.indexOf(R[i].match)>-1){t=R[i].themeId;break}}` +
    `document.documentElement.setAttribute('data-theme',t);}catch(e){}`
  );
}
