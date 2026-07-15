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
      value={{ themeId, isAcebet77: themeId === THEME_IDS.ACEBET77 }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
