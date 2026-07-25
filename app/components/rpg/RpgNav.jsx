"use client";

// RPG bottom navigation (Figma 2026:3137): HOME / HERO ITEM / CHALLENGE /
// MISSION. Active tab gets the gold gradient label; inactive labels sink into
// the dark green. ("CHALLANGE" in the design is a typo — designer note #3
// names the tab "Challenge".)

import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS, RPG_VIEWS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";

const NAV_ITEMS = [
  { view: RPG_VIEWS.HOME, label: "HOME", icon: RPG_IMAGES.icons.navHome },
  { view: RPG_VIEWS.ITEMS, label: "HERO ITEM", icon: RPG_IMAGES.icons.navHeroItem },
  { view: RPG_VIEWS.CHALLENGE, label: "CHALLENGE", icon: RPG_IMAGES.icons.navChallenge },
  { view: RPG_VIEWS.MISSIONS, label: "MISSION", icon: RPG_IMAGES.icons.navMission },
];

// Sub-screens highlight their parent tab.
const TAB_FOR_VIEW = {
  [RPG_VIEWS.HOME]: RPG_VIEWS.HOME,
  [RPG_VIEWS.LEVEL]: RPG_VIEWS.HOME,
  [RPG_VIEWS.ITEMS]: RPG_VIEWS.ITEMS,
  [RPG_VIEWS.CHALLENGE]: RPG_VIEWS.CHALLENGE,
  [RPG_VIEWS.BATTLE]: RPG_VIEWS.CHALLENGE,
  [RPG_VIEWS.BOX]: RPG_VIEWS.CHALLENGE,
  [RPG_VIEWS.MISSIONS]: RPG_VIEWS.MISSIONS,
};

export default function RpgNav({ view, onNavigate }) {
  const activeTab = TAB_FOR_VIEW[view] || RPG_VIEWS.HOME;
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[475px] -translate-x-1/2 items-start justify-center border-t"
      style={{ background: RPG_COLORS.chrome, borderColor: RPG_COLORS.navGold }}
    >
      {NAV_ITEMS.map((item) => {
        const active = item.view === activeTab;
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => onNavigate(item.view)}
            className="flex min-w-0 flex-1 flex-col items-center gap-[4px] px-[2px] pb-[22px] pt-[14px] active:scale-95 transition-transform"
          >
            {/* The icons ship with a very dark #036D49 stroke baked in, so the
                inactive state is brightened rather than dimmed — the original
                brightness(0.55) left them almost invisible on the dark nav. */}
            <img
              src={item.icon}
              alt=""
              className="size-[22px]"
              style={
                active
                  ? undefined
                  : { filter: "grayscale(1) brightness(1.9) sepia(1) hue-rotate(103deg) saturate(1.6)", opacity: 1 }
              }
            />
            {/* Tight tracking keeps "HERO ITEM" and "CHALLENGE" on one line. */}
            <span
              className="whitespace-nowrap text-[9px] font-semibold tracking-[0.5px]"
              style={
                active
                  ? {
                      fontFamily: RPG_FONTS.display,
                      fontWeight: 700,
                      background: RPG_GRADIENTS.cta,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }
                  : { fontFamily: RPG_FONTS.display, color: RPG_COLORS.navInactive }
              }
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
