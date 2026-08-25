'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChanged } from '../api/authEvents';
import { THEME_IDS, readActiveThemeId, pinThemeId, unpinTheme } from '../config/themes';

/**
 * Origin-based theme engine.
 *
 * Resolves the skin from the persisted origin first and uses the `o` origin on
 * the /auth URL as the first-time visitor fallback. Reading the URL
 * keeps the skin off the critical path of the token request — the brand is in
 * the address bar from the first byte, so the member never renders default
 * chrome while auth is in flight. Re-resolves on mrs_auth_changed, so
 * switching wallets switches skins without a reload.
 *
 * `setTheme` / `resetTheme` back Personal Data → Change Theme: a manual pick is
 * persisted and outranks the origin until it's reset.
 */
const ThemeContext = createContext({
  themeId: THEME_IDS.DEFAULT,
  isAcebet77: false,
  isUbetclub: false,
  isEp369: false,
  isKgame99: false,
  isLv918: false,
  isN1gang: false,
  isThemed: false,
  setTheme: () => {},
  resetTheme: () => {},
});

// A shared redeem link (/?o=<station_url>&reward=<uuid>) carries the station
// URL in `o` — the same value /auth persists — so the theme can be resolved
// from the link itself, with no session required.
//
// A logged-in member's own origin wins over the link's. Someone whose session
// belongs to N1GANG must keep the N1GANG skin when they open a link shared
// from KGAME99 — the claim link never switches an existing session's theme.
// The link's `o` is only the fallback, for a visitor who has no session yet.
export function ThemeProvider({ children }) {
  // Lazy init so the first client render is already themed (SSR always renders
  // default; the pre-hydration script in app/layout.js keeps <html data-theme>
  // correct before paint).
  const [themeId, setThemeId] = useState(readActiveThemeId);

  useEffect(() => {
    const sync = () => setThemeId(readActiveThemeId());
    sync();
    const unsubscribe = onAuthChanged(sync);
    return unsubscribe;
  }, []);

  // Personal Data → Change Theme.
  const setTheme = (nextThemeId) => {
    pinThemeId(nextThemeId);
    setThemeId(readActiveThemeId());
  };

  // Drop the manual pick and hand the skin back to the station's origin rules.
  const resetTheme = () => {
    unpinTheme();
    setThemeId(readActiveThemeId());
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        isAcebet77: themeId === THEME_IDS.ACEBET77,
        isUbetclub: themeId === THEME_IDS.UBETCLUB,
        isEp369: themeId === THEME_IDS.EP369,
        isKgame99: themeId === THEME_IDS.KGAME99,
        isLv918: themeId === THEME_IDS.LV918,
        isN1gang: themeId === THEME_IDS.N1GANG,
        // True for any non-default skin — lets shared chrome (AppLayout,
        // penalty-kick components) branch once instead of per-theme.
        isThemed: themeId !== THEME_IDS.DEFAULT,
        setTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
