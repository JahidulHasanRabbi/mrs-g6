"use client";

// RPG bottom navigation. The default MRS look is a flat four-tab bar; the
// station skins render the theme's ornate arch with a raised centre crest that
// leaves the game for the portal home, exactly as the portal nav does. Either
// way the four game tabs are the same.

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS, RPG_VIEWS } from "./constants";
import { RPG_IMAGES } from "./rpgAssets";
import { useRpgSkin } from "./rpgSkin";

const TABS = [
  { key: "base", view: RPG_VIEWS.HOME, label: "HOME", themedLabel: "BASE", icon: RPG_IMAGES.icons.navHome },
  { key: "items", view: RPG_VIEWS.ITEMS, label: "HERO ITEM", icon: RPG_IMAGES.icons.navHeroItem },
  { key: "challenge", view: RPG_VIEWS.CHALLENGE, label: "CHALLENGE", icon: RPG_IMAGES.icons.navChallenge },
  { key: "mission", view: RPG_VIEWS.MISSIONS, label: "MISSION", icon: RPG_IMAGES.icons.navMission },
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

// Matches the portal nav: min() keeps the crests from crowding narrow phones.
const fluid = (px) => `min(${px}px, ${((px / 475) * 100).toFixed(2)}vw)`;

// Side crests are one fixed size for every station, so their fluid strings are
// constants; only the raised centre differs per theme.
const SIDE_BOX = { width: fluid(34), height: fluid(40) };
// Which skin icon each game tab wears, in nav order around the centre crest.
const THEMED_ORDER = [
  [TABS[0], "base"],
  [TABS[1], "items"],
  null, // the portal-home crest
  [TABS[2], "challenge"],
  [TABS[3], "mission"],
];

function ThemedNav({ skin, activeTab, onNavigate }) {
  const { nav } = skin;
  const centerBox = { width: fluid(nav.centerBox.w), height: fluid(nav.centerBox.h) };
  const items = THEMED_ORDER.map((entry) =>
    entry
      ? { ...entry[0], icon: nav.icons[entry[1]], box: SIDE_BOX }
      : { key: "portal", label: "HOME", href: "/", icon: nav.icons.portalHome, box: centerBox, center: true }
  );

  return (
    <footer className="pointer-events-none fixed bottom-0 left-1/2 z-40 h-[100px] w-full max-w-[475px] -translate-x-1/2">
      <img src={nav.bar} alt="" className="absolute bottom-0 left-[-1%] right-[-1%] top-[-8%] h-[108%] w-[102%] max-w-none" />
      <nav className="pointer-events-auto relative z-10 flex h-full items-end justify-between px-[16px] pb-[8px]" aria-label="Avatar navigation">
        {items.map((item) => {
          const active = !item.center && item.view === activeTab;
          const body = (
            <motion.div className="flex flex-col items-center justify-end gap-[4px]" whileTap={{ scale: 0.95 }}>
              <img src={item.icon} alt="" className="object-contain" style={item.box} />
              <p
                className="whitespace-nowrap text-center font-bold"
                style={{
                  fontFamily: nav.labelFont,
                  color: active ? nav.labelActive : nav.label,
                  fontSize: item.center ? "clamp(8px, 2.1vw, 10px)" : "clamp(6.5px, 1.69vw, 8px)",
                }}
              >
                {item.themedLabel || item.label}
              </p>
            </motion.div>
          );
          const wrap = item.center
            ? "relative flex flex-1 items-end justify-center -translate-y-[10px]"
            : "flex flex-1 items-end justify-center pb-[6px]";

          return item.href ? (
            <Link key={item.key} href={item.href} className={`${wrap} cursor-pointer`} aria-label={item.label}>
              {body}
            </Link>
          ) : (
            <button key={item.key} type="button" onClick={() => onNavigate(item.view)} className={`${wrap} cursor-pointer`} aria-label={item.label}>
              {body}
            </button>
          );
        })}
      </nav>
    </footer>
  );
}

function DefaultNav({ activeTab, onNavigate }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[475px] -translate-x-1/2 items-start justify-center border-t"
      style={{ background: RPG_COLORS.chrome, borderColor: RPG_COLORS.navGold }}
    >
      {TABS.map((item) => {
        const active = item.view === activeTab;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.view)}
            className="flex min-w-0 flex-1 flex-col items-center gap-[4px] px-[2px] pb-[22px] pt-[14px] active:scale-95 transition-transform"
          >
            {/* The icons ship with a very dark #036D49 stroke baked in, so the
                inactive state is brightened rather than dimmed. */}
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

// Memoised: the nav sits outside ScreenShell's keyed content, so it would
// otherwise re-render on every page state change (menu toggle, modal, refetch).
function RpgNav({ view, onNavigate }) {
  const skin = useRpgSkin();
  const activeTab = TAB_FOR_VIEW[view] || RPG_VIEWS.HOME;

  return skin.themed ? (
    <ThemedNav skin={skin} activeTab={activeTab} onNavigate={onNavigate} />
  ) : (
    <DefaultNav activeTab={activeTab} onNavigate={onNavigate} />
  );
}

export default memo(RpgNav);
