"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { redirectToStation } from "./MenuItem";
import { ANIMATION_CONFIG, MENU_CONFIG } from "./menuConfig";
import { NationalDayMenuOverlay } from "../phase4/NationalDayChrome";
import { getPublicBanners } from "@/app/api/memberApi";
import { GoldText } from "../themes/kingrewards/KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_GRADIENTS, KR_SURFACES } from "../themes/kingrewards/assets";

const M = KR_ASSETS.modules;

// The default menu's Top 20 / Turnover shortcuts, so both menus deep-link the same tabs.
const LEADERBOARD_SHORTCUTS = MENU_CONFIG.mainItems.find((i) => i.link === "/leaderboard")?.children || [];

// Figma 629:982.
const KR_MENU_GROUPS = [
  {
    title: "Mini Games",
    items: [
      { icon: M.luckySpin, label: "Lucky Spin", link: "/spin" },
      { icon: M.smashEgg, label: "Smash Egg", link: "/smash-egg" },
      { icon: M.penaltyKick, label: "Penalty Kick", link: "/penalty-kick" },
      { icon: M.avatar, label: "Avatar", link: "/avatar" },
      // Not in the Figma drawer, but it is a live game every other skin lists.
      { icon: "/assets/boss-war/boss/goblin-king.webp", label: "Boss War", link: "/boss-war" },
    ],
  },
  {
    title: "Rewards",
    items: [
      { icon: M.dailyCheckin, label: "Daily Check-in", link: "/daily-checkin" },
      { icon: M.missions, label: "Missions", link: "/missions" },
      { icon: M.leaderboard, label: "Leaderboard", link: "/leaderboard", children: LEADERBOARD_SHORTCUTS },
      { icon: M.vip, label: "Membership", link: "/vip" },
      { icon: M.mart, label: "Mart", link: "/mart" },
    ],
  },
  {
    title: "Help",
    items: [
      { icon: M.feedback, label: "Feedback", action: "feedback" },
      { icon: KR_ASSETS.nav.livechatMenu, label: "Live Chat", action: "livechat" },
      { icon: M.terms, label: "Terms & Conditions", link: "/terms-and-conditions", withFrom: true },
    ],
  },
  {
    title: null,
    items: [{ icon: M.backToStation, label: "Back to Station", action: "station" }],
  },
];

const DIVIDER = "linear-gradient(90deg, rgba(96,96,96,0.35), rgba(255,255,255,0.35), rgba(96,96,96,0.35))";

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: -8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 28, staggerChildren: 0.05, delayChildren: 0.05 },
  },
  exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// Fetched once per session, like the default drawer; a failed fetch retries on the next open.
let sidePanelBannerRequest = null;
function loadSidePanelBanners() {
  if (!sidePanelBannerRequest) {
    sidePanelBannerRequest = getPublicBanners(2).catch((err) => {
      sidePanelBannerRequest = null;
      throw err;
    });
  }
  return sidePanelBannerRequest;
}

/** Admin side-panel banner (location 2): the first one still active, hidden when there is none. */
function SidePanelBanner() {
  const [banner, setBanner] = useState(null);
  useEffect(() => {
    let alive = true;
    loadSidePanelBanners()
      .then((data) => {
        const now = new Date();
        const active = (Array.isArray(data) ? data : []).find((b) => new Date(b.active_until) > now);
        if (alive) setBanner(active || null);
      })
      .catch((err) => console.error("Error fetching side panel banners:", err));
    return () => {
      alive = false;
    };
  }, []);

  if (!banner?.image) return null;
  const open = () => {
    if (!banner.slug) return;
    const url = /^https?:\/\//.test(banner.slug) ? banner.slug : `https://${banner.slug}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <motion.div variants={cardVariants} className="flex justify-center rounded-[8px] bg-[rgba(255,255,255,0.1)] p-2">
      <button
        type="button"
        onClick={open}
        aria-label={banner.name || "Promotion"}
        className={`block aspect-[130/79] w-full max-w-[240px] overflow-hidden rounded-[8px] ${banner.slug ? "cursor-pointer" : "cursor-default"}`}
        style={{ border: `1px solid ${KR_COLORS.goldBright}`, boxShadow: "0 5px 20px rgba(0,0,0,0.25)" }}
      >
        <img src={banner.image} alt={banner.name || "Banner"} draggable={false} className="h-full w-full object-cover" />
      </button>
    </motion.div>
  );
}

/** Indented leaderboard shortcut under the LEADERBOARD row, with the default menu's badge/date line. */
function SubRow({ item, onClose }) {
  return (
    <Link
      href={item.link}
      onClick={onClose}
      role="menuitem"
      aria-label={item.label}
      className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] py-[6px] pl-8 pr-1 transition-colors hover:bg-white/10 active:scale-[0.99]"
    >
      <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full" style={{ background: KR_GRADIENTS.gold }} />
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center gap-[6px]">
          <span className="truncate text-[12px] font-semibold leading-[1.2]" style={{ color: KR_COLORS.goldText }}>
            {item.label}
          </span>
          {item.badge && (
            <span
              className="shrink-0 rounded-full px-[6px] py-[1px] text-[8px] font-extrabold uppercase leading-[1.3] tracking-[0.5px]"
              style={{ color: KR_COLORS.onGold, background: KR_GRADIENTS.gold }}
            >
              {item.badge}
            </span>
          )}
        </span>
        {item.subtitle && (
          <span className="text-[10px] leading-[1.3]" style={{ color: KR_COLORS.sand }}>
            {item.subtitle}
          </span>
        )}
      </span>
    </Link>
  );
}

function Row({ item, compact, onClose, onAction, pathname }) {
  const body = (
    <span className={`flex w-full items-center gap-2 ${compact ? "py-1" : "py-2"}`}>
      <img src={item.icon} alt="" draggable={false} className="size-6 shrink-0 select-none object-contain" />
      <GoldText className="truncate text-left text-[14px] font-bold uppercase">{item.label}</GoldText>
    </span>
  );
  const className = "block w-full cursor-pointer rounded-[6px] transition-colors hover:bg-white/10 active:scale-[0.99]";

  if (item.link) {
    // T&C's Back returns to the page the menu was opened from.
    const href = item.withFrom && pathname && pathname !== item.link ? `${item.link}?from=${encodeURIComponent(pathname)}` : item.link;
    return (
      <Link href={href} onClick={onClose} className={className} aria-label={item.label} role="menuitem">
        {body}
      </Link>
    );
  }

  const handleClick = () => {
    if (item.action === "station") {
      redirectToStation();
      onClose();
      return;
    }
    onAction(item.action);
  };

  return (
    <button type="button" onClick={handleClick} className={className} aria-label={item.label} role="menuitem">
      {body}
    </button>
  );
}

/** King Rewards side menu: a glass drop-down panel of grouped cards under the header. */
export default function KingRewardsMenuDrawer({ onClose, onAction }) {
  const pathname = usePathname();
  return (
    <>
      <motion.div
        {...ANIMATION_CONFIG.overlay}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        aria-hidden="true"
      />

      <div className="pointer-events-none fixed inset-0 left-1/2 z-50 w-full max-w-[475px] -translate-x-1/2">
        <motion.aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="scrollbar-hide pointer-events-auto absolute left-4 right-4 top-[56px] mx-auto flex max-h-[calc(100dvh-72px)] max-w-[380px] origin-top-left flex-col gap-2 overflow-y-auto overscroll-contain rounded-[16px] px-2 py-4 min-[412px]:right-auto min-[412px]:w-[380px]"
          style={{ ...KR_SURFACES.glass, fontFamily: KR_FONT }}
          variants={panelVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <NationalDayMenuOverlay />
          <SidePanelBanner />
          <nav role="menu" className="flex flex-col gap-2">
            {KR_MENU_GROUPS.map((group, gi) => {
              const last = gi === KR_MENU_GROUPS.length - 1;
              return (
                <motion.div
                  key={group.title || "station"}
                  variants={cardVariants}
                  className={`flex flex-col gap-2 rounded-[8px] bg-[rgba(255,255,255,0.1)] px-2 ${last ? "py-2" : "pt-2"}`}
                >
                  {group.title && (
                    <p className="text-[16px] font-medium leading-[1.2] text-[#dbdbdb]">{group.title}</p>
                  )}
                  <div className="flex flex-col">
                    {group.items.map((item, i) => (
                      <Fragment key={item.label}>
                        {i > 0 && <span aria-hidden="true" className="h-px w-full" style={{ background: DIVIDER }} />}
                        <Row item={item} compact={last} onClose={onClose} onAction={onAction} pathname={pathname} />
                        {item.children?.map((child) => (
                          <SubRow key={child.label} item={child} onClose={onClose} />
                        ))}
                      </Fragment>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </nav>
        </motion.aside>
      </div>
    </>
  );
}
