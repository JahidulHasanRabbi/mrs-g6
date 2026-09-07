"use client";

// Shared page-level scaffolding for the mini-games that ride the RPG shell
// (/avatar and /boss-war). Both pages had verbatim copies of all four.

import { lazy, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readActiveThemeId } from "../../config/themes";
import { THEME_IDS } from "../../config/themes";
import { RPG_DEFAULT_SKIN, RpgSkinProvider } from "./rpgSkin";
import { useTheme } from "../../contexts/ThemeContext";

// One chunk per station skin, warmed at module scope so the member's own skin
// is requested before React's first render (see themes/skinRoute.jsx).
const LOADERS = {
  [THEME_IDS.ACEBET77]: () => import("../themes/acebet77/Acebet77RpgSkin"),
  [THEME_IDS.UBETCLUB]: () => import("../themes/ubetclub/UbetclubRpgSkin"),
  [THEME_IDS.EP369]: () => import("../themes/ep369/Ep369RpgSkin"),
  [THEME_IDS.KGAME99]: () => import("../themes/kgame99/Kgame99RpgSkin"),
  [THEME_IDS.LV918]: () => import("../themes/lv918/Lv918RpgSkin"),
  [THEME_IDS.N1GANG]: () => import("../themes/n1gang/N1gangRpgSkin"),
};

const warm = typeof window !== "undefined" && LOADERS[readActiveThemeId()];
if (warm) warm();

const SKINS = Object.fromEntries(Object.keys(LOADERS).map((id) => [id, lazy(LOADERS[id])]));

/**
 * Wraps a game in the member's station skin. Keep this OUTSIDE the page's own
 * Suspense boundary: a boundary created inside the incoming page shows its
 * fallback immediately, blanking the screen while the chunk loads.
 */
export function RpgSkinShell({ children }) {
  const { themeId } = useTheme();
  const Skin = SKINS[themeId];
  if (!Skin) return <RpgSkinProvider skin={RPG_DEFAULT_SKIN}>{children}</RpgSkinProvider>;
  return <Skin>{children}</Skin>;
}

/**
 * `?view=` is the navigation truth for both games, so browser back/forward
 * unwinds the player's path. `defaultView` is omitted from the querystring.
 */
export function useViewNavigation(defaultView) {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(
    (nextView, extra, opts) => {
      const params = new URLSearchParams();
      if (nextView && nextView !== defaultView) params.set("view", nextView);
      if (extra) {
        Object.entries(extra).forEach(([k, v]) => {
          if (v != null) params.set(k, String(v));
        });
      }
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (opts?.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router, pathname, defaultView],
  );
}

/** Full-screen gate shown until the game's first payload lands. */
export function GameLoadingGate({ skin, message, font }) {
  return (
    <div className="grid min-h-[100dvh] w-full place-items-center px-[32px]" style={{ background: skin.surface }}>
      <p
        className="text-center text-[14px] leading-[22px] tracking-[3px]"
        style={{ color: skin.c.textDim, fontFamily: font }}
      >
        {message || "LOADING..."}
      </p>
    </div>
  );
}

/** game_status 2 — reads still work, every action is refused by the API. */
export function GameClosedOverlay({ skin, title, font }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
      <div
        className="w-full max-w-[360px] rounded-[16px] border border-white/15 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
        style={{ background: `${skin.surface}f2` }}
      >
        <p className="text-[20px] font-bold" style={{ color: skin.c.value, fontFamily: font }}>
          {title}
        </p>
        <p className="mt-3 text-[12px] leading-5" style={{ color: skin.c.textDim, fontFamily: font }}>
          Please check back later.
        </p>
      </div>
    </div>
  );
}
