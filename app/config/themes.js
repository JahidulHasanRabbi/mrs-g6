/**
 * Theme engine registry.
 *
 * Members enter the portal via /auth?id=<member_id>&o=<origin site>. The `o`
 * origin is persisted in localStorage (tokenStorage.setRedirectO) and decides
 * which visual skin the member portal renders with. Every origin without an
 * explicit rule falls back to the default MRS look, so new wallet sites work
 * without any code change.
 *
 * NOTE: app/layout.js contains a tiny inline pre-hydration script that mirrors
 * the substring matching below to set <html data-theme="..."> before React
 * mounts (prevents a default-theme flash). Keep the two in sync when adding
 * a theme.
 */

export const THEME_IDS = {
  DEFAULT: 'default',
  ACEBET77: 'acebet77',
  UBETCLUB: 'ubetclub',
};

// Substring rules matched against the hostname of the stored origin URL.
// First match wins.
const ORIGIN_THEME_RULES = [
  { match: 'acebet77', themeId: THEME_IDS.ACEBET77 },
  { match: 'ubetclub', themeId: THEME_IDS.UBETCLUB },
  // e.g. { match: 'kgame99', themeId: THEME_IDS.KGAME99 },
];

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
