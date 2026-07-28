'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { tokenStorage } from '../api/tokenStorage';
import { onAuthChanged } from '../api/authEvents';
import { THEME_IDS, resolveThemeIdFromOrigin } from '../config/themes';

/**
 * Origin-based theme engine.
 *
 * Reads the origin site persisted by /auth (tokenStorage.getRedirectO) and
 * exposes the resolved theme id to the member portal. Re-resolves whenever a
 * new auth happens (mrs_auth_changed), so switching wallets switches skins
 * without a reload.
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
});

function currentThemeId() {
  return resolveThemeIdFromOrigin(tokenStorage.getRedirectO());
}

export function ThemeProvider({ children }) {
  // Lazy init so a returning member gets their skin on first client render
  // (SSR always renders default; the pre-hydration script in app/layout.js
  // keeps <html data-theme> correct before paint).
  const [themeId, setThemeId] = useState(() =>
    typeof window === 'undefined' ? THEME_IDS.DEFAULT : currentThemeId()
  );

  useEffect(() => {
    const sync = () => setThemeId(currentThemeId());
    sync();
    const unsubscribe = onAuthChanged(sync);
    return unsubscribe;
  }, []);

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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
