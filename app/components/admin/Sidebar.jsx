"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "../../contexts/SidebarContext";
import { filterMenuByPermissions, getStoredAdminPermissions } from "../../config/adminPermissions";
import { onAuthChanged } from "../../api/authEvents";
import { getPrioritySummary } from "../../api/crmApi";

// Panel-left icon used by the collapse/expand toggle (Radix-style).
const PanelLeftIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="1.5" y="2" width="12" height="11" rx="1" />
    <line x1="6" y1="2" x2="6" y2="13" />
  </svg>
);

// Magnifying-glass for the search button when the sidebar is collapsed.
const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.65" y2="16.65" />
  </svg>
);

// Shared expand/collapse animation for nested menus and section bodies.
// Animating height: 0 ? "auto" plus opacity gives a smooth slide-fade without
// the snappy display:none hop.
const collapseTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };
const collapseVariants = {
  collapsed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1 },
};

// Map a pathname ? sidebar item id. Keeps the sidebar a single source of truth
// so it doesn't depend on a per-page `activeItem` prop (which would force a
// re-render dance from each page).
function pathnameToActiveItem(pathname) {
  if (!pathname) return "home";
  // Most specific first
  if (pathname.startsWith("/admin/lucky-spin/prize-settings")) return "prize-settings";
  if (pathname.startsWith("/admin/lucky-spin/user-logs")) return "user-logs";
  if (pathname.startsWith("/admin/lucky-spin/daily-limits")) return "daily-limits";
  if (pathname.startsWith("/admin/lucky-spin")) return "lucky-spin";
  if (pathname.startsWith("/admin/smash-egg")) return "smash-egg";
  if (pathname.startsWith("/admin/mission-game")) return "mission-game";
  if (pathname.startsWith("/admin/rpg/equipment")) return "rpg-equipment";
  if (pathname.startsWith("/admin/rpg/bosses")) return "rpg-bosses";
  if (pathname.startsWith("/admin/rpg/missions")) return "rpg-missions";
  if (pathname.startsWith("/admin/rpg/mystery-box")) return "rpg-mystery-box";
  if (pathname.startsWith("/admin/rpg")) return "rpg-settings";
  if (pathname.startsWith("/admin/leaderboards/deposit")) return "lb-deposit";
  if (pathname.startsWith("/admin/leaderboards/referrer")) return "lb-referrer";
  if (pathname.startsWith("/admin/leaderboards/withdrawal")) return "lb-withdrawal";
  if (pathname.startsWith("/admin/world-cup/predictions")) return "wc-predictions";
  if (pathname.startsWith("/admin/world-cup/settings")) return "wc-settings";
  if (pathname.startsWith("/admin/world-cup")) return "wc-dashboard";
  if (pathname.startsWith("/admin/penalty-kick")) return "penalty-kick";
  if (pathname.startsWith("/admin/mart-tiers")) return "mart-tiers";
  if (pathname.startsWith("/admin/redemption-mall")) return "redemption-mall";
  if (pathname.startsWith("/admin/reports/token")) return "token-report";
  if (pathname.startsWith("/admin/reports/reward")) return "reward-report";
  if (pathname.startsWith("/admin/reports/member")) return "member-report";
  if (pathname.startsWith("/admin/reports/usage")) return "usage-report";
  if (pathname.startsWith("/admin/retention/member-alert")) return "retention-member-alert";
  if (pathname.startsWith("/admin/retention/members")) return "retention-member-list";
  if (pathname.startsWith("/admin/retention/settings")) return "retention-settings";
  if (pathname.startsWith("/admin/retention/pic-dashboard")) return "retention-pic-dashboard";
  if (pathname.startsWith("/admin/retention")) return "retention-pic-dashboard";
  if (pathname.startsWith("/admin/settings/user-access")) return "settings-user-access";
  if (pathname.startsWith("/admin/settings/role-management")) return "settings-role-management";
  if (pathname.startsWith("/admin/settings/user-activity-log")) return "settings-user-activity-log";
  if (pathname.startsWith("/admin/settings/login-requests")) return "settings-login-requests";
  if (pathname.startsWith("/admin/settings/promotions")) return "settings-promotions";
  if (pathname.startsWith("/admin/members")) return "member-list";
  if (pathname.startsWith("/admin/redemption")) return "redemption";
  if (pathname.startsWith("/admin/checkin-settings")) return "checkin-settings";
  if (pathname.startsWith("/admin/feedback")) return "feedback";
  if (pathname.startsWith("/admin/banners")) return "banners";
  if (pathname.startsWith("/admin/terms-conditions")) return "terms-conditions";
  if (pathname.startsWith("/admin/frame-setting")) return "frame-setting";
  if (pathname.startsWith("/admin/floating-menu")) return "floating-menu";
  if (pathname.startsWith("/admin/external-api")) return "external-api";
  if (pathname.startsWith("/admin/wallet-site-vip")) return "wallet-site-vip";
  if (pathname.startsWith("/admin/mrs-vip")) return "mrs-vip-level";
  if (pathname.startsWith("/admin/vip-tiers")) return "vip-tiers";
  if (pathname === "/admin" || pathname === "/admin/") return "home";
  return "home";
}

// Inline SVG icons for the Retention System section
const DashboardIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const AlertIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const PersonIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const GearIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// User with a small key/check � represents "role management"
const RoleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="7" r="4" />
    <path d="M2 21v-2a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v2" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

// ID-badge with lines � represents "activity log"
const ActivityLogIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8" cy="10" r="2" />
    <path d="M6 17c0-1.5 1.5-3 4-3" />
    <line x1="14" y1="9" x2="18" y2="9" />
    <line x1="14" y1="13" x2="18" y2="13" />
    <line x1="14" y1="17" x2="18" y2="17" />
  </svg>
);

// Person with arrow � represents "login request"
const LoginRequestIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <polyline points="17 8 21 12 17 16" />
    <line x1="13" y1="12" x2="21" y2="12" />
  </svg>
);

// Price tag � represents "promotions"
const PromotionIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// --- RPG submenu icons — one glyph per page so the children are scannable ---

const RpgGearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

const SwordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M16 16l4 4" />
    <path d="M19 21l2-2" />
  </svg>
);

const SkullIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a8 8 0 0 0-8 8c0 2.9 1.56 5.43 3.89 6.82L8 21h8l.11-4.18A7.99 7.99 0 0 0 20 10a8 8 0 0 0-8-8Z" />
    <circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1.4" fill="currentColor" stroke="none" />
    <path d="M12 14v2" />
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const GiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
    <line x1="12" y1="8" x2="12" y2="21" />
    <path d="M12 8c-2.5 0-4.5-1-4.5-3a2 2 0 0 1 4-.5c.2.8.5 2 .5 3.5Z" />
    <path d="M12 8c2.5 0 4.5-1 4.5-3a2 2 0 0 0-4-.5c-.2.8-.5 2-.5 3.5Z" />
  </svg>
);

const MENU_ITEMS = [
  {
    id: "home",
    label: "Home Dashboard",
    iconMask: "/assets/admin/sidebar/icons/bitcoin-icons-home-outline.svg",
    href: "/admin",
    isHighlighted: true,
    disabled: false,
  },
  {
    id: "member-list",
    label: "Member List",
    iconMask: "/assets/admin/sidebar/icons/si-user-alt-5-line.svg",
    href: "/admin/members",
    disabled: false,
  },
  {
    id: "lucky-spin",
    label: "Lucky Spin Management",
    iconMask: "/assets/admin/sidebar/icons/cil-casino.svg",
    href: "/admin/lucky-spin",
    hasSubmenu: true,
    disabled: false,
  },
  {
    id: "smash-egg",
    label: "Smash Egg",
    iconMask: "/assets/admin/sidebar/icons/material-symbols-light-egg-outline-sharp.svg",
    href: "/admin/smash-egg",
    disabled: false,
  },
  {
    id: "penalty-kick",
    label: "Penalty Kick",
    iconMask: "/assets/admin/sidebar/icons/lucide-lab-soccer-ball.svg",
    href: "/admin/penalty-kick",
    disabled: false,
  },
  {
    id: "mission-game",
    label: "Mission Game",
    iconMask: "/assets/admin/sidebar/icons/gravity-ui-target.svg",
    href: "/admin/mission-game",
    disabled: false,
  },
  {
    id: "rpg",
    label: "RPG Game",
    iconMask: "/assets/rpg/ui/logo-gem.svg",
    href: "/admin/rpg",
    hasSubmenu: true,
    disabled: false,
    children: [
      { id: "rpg-settings", label: "Game Settings", href: "/admin/rpg", iconNode: RpgGearIcon },
      { id: "rpg-equipment", label: "Equipment Items", href: "/admin/rpg/equipment", iconNode: SwordIcon },
      { id: "rpg-bosses", label: "Bosses", href: "/admin/rpg/bosses", iconNode: SkullIcon },
      { id: "rpg-missions", label: "Avatar Missions", href: "/admin/rpg/missions", iconNode: TargetIcon },
      { id: "rpg-mystery-box", label: "Mystery Box Items", href: "/admin/rpg/mystery-box", iconNode: GiftIcon },
    ],
  },
  {
    id: "redemption-mall",
    label: "Points Redemption Mall",
    iconMask: "/assets/admin/sidebar/icons/iconoir-coins.svg",
    href: "/admin/redemption-mall",
    hasSubmenu: true,
    disabled: false,
  },
  {
    id: "mart-tiers",
    label: "Mart Tiers",
    iconMask: "/assets/admin/sidebar/icons/mynaui-gift.svg",
    href: "/admin/mart-tiers",
    disabled: false,
  },
];

const RETENTION_MENU = [
  {
    id: "retention-pic-dashboard",
    label: "Dashboard",
    iconMask: "/assets/admin/sidebar/icons/retention-dashboard.svg",
    href: "/admin/retention/pic-dashboard",
    disabled: false,
  },
  {
    id: "retention-member-alert",
    label: "Member Alert",
    iconMask: "/assets/admin/sidebar/icons/retention-member-alert.svg",
    href: "/admin/retention/member-alert",
    disabled: false,
  },
  {
    id: "retention-member-list",
    label: "Member List",
    iconMask: "/assets/admin/sidebar/icons/retention-member-list.svg",
    href: "/admin/retention/members",
    disabled: false,
  },
  {
    id: "retention-settings",
    label: "Settings",
    iconMask: "/assets/admin/sidebar/icons/retention-settings.svg",
    href: "/admin/retention/settings",
    disabled: false,
  },
];

const LEADERBOARDS_MENU = [
  {
    id: "lb-deposit",
    label: "Deposit",
    iconMask: "/assets/admin/sidebar/icons/leaderboard-deposit.svg",
    href: "/admin/leaderboards/deposit",
    disabled: false,
  },
  {
    id: "lb-referrer",
    label: "Referrer",
    iconMask: "/assets/admin/sidebar/icons/leaderboard-referrer.svg",
    href: "/admin/leaderboards/referrer",
    disabled: false,
  },
  {
    id: "lb-withdrawal",
    label: "Withdrawal",
    iconMask: "/assets/leaderboard/withdrawal-icon.svg",
    href: "/admin/leaderboards/withdrawal",
    disabled: false,
  },
];

const WORLD_CUP_MENU = [
  {
    id: "wc-dashboard",
    label: "World Cup Dashboard",
    iconMask: "/assets/admin/sidebar/icons/solar-cup-outline.svg",
    href: "/admin/world-cup",
    disabled: false,
  },
  {
    id: "wc-predictions",
    label: "Predictions",
    iconMask: "/assets/admin/sidebar/icons/icon-park-outline-ranking.svg",
    href: "/admin/world-cup/predictions",
    disabled: false,
  },
  {
    id: "wc-settings",
    label: "Settings",
    iconMask: "/assets/admin/sidebar/icons/hugeicons-football.svg",
    href: "/admin/world-cup/settings",
    disabled: false,
  },
];

const SETTINGS_MENU = [
  {
    id: "settings-user-access",
    label: "User Access Management",
    iconMask: "/assets/admin/sidebar/icons/la-user-check.svg",
    href: "/admin/settings/user-access",
    disabled: false,
  },
  {
    id: "settings-role-management",
    label: "Role Management",
    iconNode: RoleIcon,
    href: "/admin/settings/role-management",
    disabled: false,
  },
  {
    id: "settings-user-activity-log",
    label: "User Activity Log",
    iconNode: ActivityLogIcon,
    href: "/admin/settings/user-activity-log",
    disabled: false,
  },
  {
    id: "settings-login-requests",
    label: "Login Requests",
    iconNode: LoginRequestIcon,
    href: "/admin/settings/login-requests",
    disabled: false,
  },
  {
    id: "settings-promotions",
    label: "Promotions",
    iconNode: PromotionIcon,
    href: "/admin/settings/promotions",
    disabled: false,
  },
];

const SECONDARY_MENU = [
  {
    id: "tournament",
    label: "Tournament",
    iconMask: "/assets/admin/sidebar/icons/cil-casino-2.svg",
    href: "/admin/tournament",
    disabled: true, // No page yet
  },
  {
    id: "frame-setting",
    label: "Frame Setting",
    iconMask: "/assets/admin/sidebar/icons/iconamoon-frame-fill.svg",
    href: "/admin/frame-setting",
    disabled: false,
  },
  {
    id: "floating-menu",
    label: "Floating Menu",
    icon: "/assets/admin/home-icon.png", // Using home icon as placeholder
    href: "/admin/floating-menu",
    disabled: false,
  },
  {
    id: "external-api",
    label: "External API",
    icon: "/assets/admin/home-icon.png", // Using home icon as placeholder
    href: "/admin/external-api",
    disabled: false,
  },
  {
    id: "vip",
    label: "VIP Membership Panel",
    iconMask: "/assets/admin/sidebar/icons/tabler-crown.svg",
    href: "/admin/vip-tiers",
    hasSubmenu: true,
    disabled: false,
    children: [
      { id: "wallet-site-vip", label: "Wallet Side VIP", href: "/admin/wallet-site-vip" },
      { id: "mrs-vip-level", label: "MRS VIP Level", href: "/admin/mrs-vip" },
    ],
  },
  {
    id: "checkin-settings",
    label: "Check-In Settings",
    iconMask: "/assets/admin/sidebar/icons/lsicon-batch-check-outline.svg",
    href: "/admin/checkin-settings",
    disabled: false,
  },
  {
    id: "feedback",
    label: "Member Feedback",
    icon: "/assets/images/feedback-icon.svg",
    href: "/admin/feedback",
    disabled: false,
  },
  {
    id: "banners",
    label: "Banners Management",
    iconMask: "/assets/admin/sidebar/icons/material-symbols-planner-banner-ad-pt-outline-rounded.svg",
    href: "/admin/banners",
    disabled: false,
  },
  {
    id: "terms-conditions",
    label: "Terms & Conditions",
    icon: "/assets/images/terms-icon.png",
    href: "/admin/terms-conditions",
    disabled: false,
  },
  {
    id: "reports",
    label: "Reports",
    iconMask: "/assets/admin/sidebar/icons/icon-park-outline-sales-report.svg",
    href: "/admin/reports",
    hasSubmenu: true,
    disabled: false,
    children: [
      { id: "token-report", label: "Token Report", href: "/admin/reports/token" },
      { id: "reward-report", label: "Reward Report", href: "/admin/reports/reward" },
      { id: "member-report", label: "Member Report", href: "/admin/reports/member" },
      { id: "usage-report", label: "Usage Report", href: "/admin/reports/usage" },
    ],
  },
];

// Renders one of:
//   item.iconNode  ? inline React SVG component, colored via currentColor
//   item.iconMask  ? PNG used as a CSS mask so we can tint it via currentColor too
//   item.icon      ? plain <img> (color is whatever the source asset has baked in)
const ItemIcon = ({ item, sizeClass }) => {
  if (item.iconNode) {
    const Icon = item.iconNode;
    return <Icon className={sizeClass} />;
  }
  if (item.iconMask) {
    return (
      <span
        aria-hidden="true"
        className={`${sizeClass} block bg-current`}
        style={{
          WebkitMaskImage: `url(${item.iconMask})`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",
          maskImage: `url(${item.iconMask})`,
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
        }}
      />
    );
  }
  return <img src={item.icon} alt="" className={`${sizeClass} object-contain`} />;
};

// Shared active highlight. Every active row/square renders this same element
// with the same `layoutId`, so when the route changes Framer Motion animates
// the gold pill sliding from the previously-active item to the new one � the
// sidebar's counterpart to the content slide in app/admin/layout.jsx.
const ACTIVE_PILL_LAYOUT_ID = "sidebar-active-pill";
const ActivePill = () => (
  <motion.span
    aria-hidden="true"
    layoutId={ACTIVE_PILL_LAYOUT_ID}
    className="absolute inset-0 z-0 rounded-[12px] border-[2.5px] border-[#f2cb7a]"
    style={{ backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" }}
    transition={{ type: "spring", stiffness: 420, damping: 36 }}
  />
);

// Red attention dot rendered when a sidebar item has pending work that needs
// the admin's attention (currently: Member Alert when there are flagged
// members). The slight outer glow lifts it off the dark sidebar background.
const RedDot = ({ corner = false }) => (
  <span
    aria-label="Has alerts"
    className={`pointer-events-none z-10 h-2 w-2 rounded-full bg-[#fb3748] shadow-[0_0_6px_rgba(251,55,72,0.7)] ${
      corner ? "absolute right-1 top-1" : "relative ml-auto shrink-0"
    }`}
  />
);

// Spec from Figma 231:3393 � items/nav item:
//   - rounded-[12px] container, 12px horizontal / 8px vertical padding
//   - 32px icon container with the actual glyph centered at 18-20px
//   - label: Inter Semi Bold, 14px, leading-21, tracking-[-1px], color #fbeed2 (Primary 100)
//   - active: gold gradient background, 2.5px solid #f2cb7a border, dark text #141828
const MenuItem = ({ item, isActive }) => {
  const { collapsed } = useSidebar();

  if (collapsed) {
    const content = (
      <div
        title={item.label}
        className={`relative isolate mx-auto flex h-10 w-10 items-center justify-center rounded-[12px] transition-all duration-200 ${
          isActive
            ? ""
            : "border border-transparent hover:border-[#f2cb7a]/40 hover:bg-white/5"
        } ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {isActive && <ActivePill />}
        <div
          className={`relative z-10 h-5 w-5 shrink-0 flex items-center justify-center ${
            item.iconNode || item.iconMask ? (isActive ? "text-[#141828]" : "text-[#fbeed2]") : ""
          }`}
        >
          <ItemIcon item={item} sizeClass="w-full h-full" />
        </div>
        {item._hasAlert && <RedDot corner />}
      </div>
    );
    if (item.disabled) return <div className="cursor-not-allowed">{content}</div>;
    return <Link href={item.href}>{content}</Link>;
  }

  const content = (
    <div
      className={`relative isolate flex items-center gap-2 rounded-[12px] px-3 py-2 transition-all duration-200 border-[2.5px] border-transparent ${
        isActive
          ? ""
          : "hover:bg-[#f2cb7a]/8 hover:border-[#f2cb7a]/20"
      } ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {isActive && <ActivePill />}
      <div
        className={`relative z-10 h-8 w-8 shrink-0 flex items-center justify-center ${
          item.iconNode || item.iconMask ? (isActive ? "text-[#141828]" : "text-[#fbeed2]") : ""
        }`}
      >
        <ItemIcon item={item} sizeClass="w-[20px] h-[20px]" />
      </div>
      <p
        className={`sidebar-inter relative z-10 text-[14px] leading-[21px] tracking-[-1px] whitespace-nowrap ${
          isActive ? "text-[#141828]" : "text-[#fbeed2]"
        }`}
      >
        {item.label}
      </p>
      {item._hasAlert && <RedDot />}
    </div>
  );

  if (item.disabled) return <div className="cursor-not-allowed">{content}</div>;
  return <Link href={item.href}>{content}</Link>;
};

// Active-state item � visually identical to MenuItem but with the gold gradient
// + light-gold border + dark text from the Figma spec. Kept as a thin wrapper
// so the renderItem dispatcher stays readable.
const HighlightedMenuItem = ({ item }) => <MenuItem item={item} isActive={true} />;

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CoinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Fallback icon per parent (legacy behavior) — used when a child doesn't
// declare its own `iconNode`.
const CHILD_ICONS = {
  reports: BarChartIcon,
  vip: CoinIcon,
};

// Per-child icon: a child's own iconNode wins, then the parent fallback.
function childIconFor(parentId, child) {
  return child?.iconNode || CHILD_ICONS[parentId] || BarChartIcon;
}

const ExpandableMenuItem = ({ item, activeItem, forceOpen = false }) => {
  const { collapsed } = useSidebar();
  const isAnyChildActive = item.children?.some((c) => c.id === activeItem);
  const [open, setOpen] = useState(isAnyChildActive);
  const effectivelyOpen = forceOpen || open;

  // Collapsed-mode hover flyout � anchors a small popover to the right of the
  // icon listing this item's children. The inline submenu has no room in the
  // 56px column, so a fixed-position flyout is the standard pattern (VS Code /
  // GitHub style).
  const wrapperRef = useRef(null);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const closeTimerRef = useRef(null);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openFlyout = () => {
    cancelClose();
    const r = wrapperRef.current?.getBoundingClientRect();
    if (r) setFlyoutPos({ top: r.top, left: r.right + 12 });
    setFlyoutOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setFlyoutOpen(false), 180);
  };

  useEffect(() => () => cancelClose(), []);

  if (collapsed) {
    const square = (
      <div
        title={item.label}
        className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-200 ${
          isAnyChildActive || flyoutOpen
            ? "border-[#e9af41] bg-[rgba(232,181,88,0.14)] shadow-[0_0_24px_rgba(231,196,87,0.22)]"
            : "border-transparent hover:border-[rgba(233,175,65,0.35)] hover:bg-white/5"
        }`}
      >
        <div
          className={`relative h-5 w-5 shrink-0 flex items-center justify-center ${
            item.iconNode || item.iconMask ? (isAnyChildActive ? "text-white" : "text-[#e9af41]") : ""
          }`}
        >
          <ItemIcon item={item} sizeClass="w-full h-full" />
        </div>
      </div>
    );
    return (
      <div
        ref={wrapperRef}
        onMouseEnter={openFlyout}
        onMouseLeave={scheduleClose}
      >
        {item.href ? <Link href={item.href}>{square}</Link> : square}
        <AnimatePresence>
          {flyoutOpen && (
            <motion.div
              key="flyout"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              className="fixed z-[90] w-56 rounded-[12px] border border-[#f2cb7a] shadow-2xl"
              style={{
                top: flyoutPos.top,
                left: flyoutPos.left,
                background: "linear-gradient(143deg, #11320e 0%, #031101 99.749%)",
              }}
              role="menu"
              aria-label={item.label}
            >
              <div className="px-3 py-2 border-b border-[#f2cb7a]/20">
                <span
                  className="sidebar-inter text-[12px] uppercase tracking-[-0.5px] bg-clip-text text-transparent"
                  style={{ backgroundImage: SECTION_TITLE_GRADIENT }}
                >
                  {item.label}
                </span>
              </div>
              <div className="p-2">
                {item.children.map((child) => {
                  const isActive = child.id === activeItem;
                  return (
                    <Link
                      key={child.id}
                      href={child.href}
                      onClick={() => setFlyoutOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-2 rounded-[8px] px-3 py-2 transition-colors ${
                          isActive
                            ? "bg-[#f2cb7a]/15 text-[#f2cb7a]"
                            : "text-[#fbeed2] hover:bg-[#f2cb7a]/8"
                        }`}
                      >
                        <span className={isActive ? "text-[#f2cb7a]" : "text-[#fbeed2]"}>
                          {(() => { const Icon = childIconFor(item.id, child); return <Icon />; })()}
                        </span>
                        <span className="sidebar-inter text-[13px] leading-[20px] tracking-[-1px]">
                          {child.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Header background: full gold gradient only when a child page is actually
  // active. When the menu is merely expanded, fall back to the regular row.
  const isActiveStyle = isAnyChildActive;

  return (
    <div className="flex flex-col gap-2">
      {/* Parent header � same row dimensions as a MenuItem */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative isolate flex w-full items-center gap-2 rounded-[12px] px-3 py-2 transition-all duration-200 border-[2.5px] border-transparent ${
          isActiveStyle
            ? ""
            : "hover:bg-[#f2cb7a]/8 hover:border-[#f2cb7a]/20"
        }`}
      >
        {isActiveStyle && <ActivePill />}
        <div
          className={`relative z-10 h-8 w-8 shrink-0 flex items-center justify-center ${
            item.iconNode || item.iconMask ? (isActiveStyle ? "text-[#141828]" : "text-[#fbeed2]") : ""
          }`}
        >
          <ItemIcon item={item} sizeClass="w-[20px] h-[20px]" />
        </div>
        <span
          className={`sidebar-inter relative z-10 flex-1 text-left text-[14px] leading-[21px] tracking-[-1px] whitespace-nowrap ${
            isActiveStyle ? "text-[#141828]" : "text-[#fbeed2]"
          }`}
        >
          {item.label}
        </span>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isActiveStyle ? "#141828" : "#fbeed2"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
          animate={{ rotate: effectivelyOpen ? 180 : 0 }}
          transition={collapseTransition}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      {/* Sub-items */}
      <AnimatePresence initial={false}>
        {effectivelyOpen && (
          <motion.div
            key="children"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={collapseVariants}
            transition={collapseTransition}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col gap-1 pl-4">
              {item.children.map((child) => {
                const isActive = child.id === activeItem;
                return (
                  <Link key={child.id} href={child.href}>
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-[12px] transition-all duration-200 ${
                        isActive
                          ? "bg-[#f2cb7a]/15 border-l-2 border-[#f2cb7a]/50"
                          : "hover:bg-[#f2cb7a]/8"
                      }`}
                    >
                      <span className={isActive ? "text-[#f2cb7a]" : "text-[#fbeed2]"}>
                        {(() => { const Icon = childIconFor(item.id, child); return <Icon />; })()}
                      </span>
                      <span
                        className={`sidebar-inter text-[13px] leading-[20px] tracking-[-1px] ${
                          isActive ? "text-[#f2cb7a]" : "text-[#fbeed2]"
                        }`}
                      >
                        {child.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Section title gradient � Primary 600 ? Primary 300 from the Figma tokens.
const SECTION_TITLE_GRADIENT = "linear-gradient(102deg, #dc9d16 1%, #f2cb7a 98%)";
// Collapsible section wrapper � renders a header with the section title
// and a chevron that toggles visibility of the items inside.
//
// When the sidebar is collapsed, the title shows a short prefix (~3 chars +
// ellipsis) so the section is still distinguishable in the narrow track.
const CollapsibleSection = ({ title, sectionKey, open, onToggle, forceOpen = false, children }) => {
  const { collapsed: sidebarCollapsed } = useSidebar();
  const effectivelyOpen = forceOpen || open;

  // In collapsed mode the section header has no room for readable text and
  // toggling a section you can't name is pointless � just render the items
  // directly. The parent's gap-6 still separates groups visually.
  if (sidebarCollapsed) {
    return <div className="flex flex-col gap-2">{children}</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onToggle?.(sectionKey)}
        disabled={forceOpen}
        className="flex items-center w-full py-1 group justify-between gap-2 px-0"
        aria-expanded={effectivelyOpen}
      >
        <span
          className="sidebar-inter uppercase whitespace-nowrap tracking-[-1px] leading-[24px] bg-clip-text text-transparent text-[16px]"
          style={{ backgroundImage: SECTION_TITLE_GRADIENT }}
        >
          {title}
        </span>
        <motion.svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f2cb7a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: effectivelyOpen ? 180 : 0 }}
          transition={collapseTransition}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {effectivelyOpen && (
          <motion.div
            key="section-body"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={collapseVariants}
            transition={collapseTransition}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col gap-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Per-item highlight rules carried over from the original primary-menu logic.
// Aliases let a single sidebar item stay active across child routes.
const PRIMARY_HIGHLIGHT_ALIASES = {
  "lucky-spin": ["lucky-spin", "prize-settings", "user-logs", "daily-limits"],
};

function isPrimaryActive(itemId, activeItem) {
  const aliases = PRIMARY_HIGHLIGHT_ALIASES[itemId];
  if (aliases) return aliases.includes(activeItem);
  return itemId === activeItem;
}

// Centralized render for a single sidebar entry. Handles three cases:
// 1. Item has children ? ExpandableMenuItem (its own collapsible)
// 2. Item is active for the current route ? HighlightedMenuItem (gold pill)
// 3. Otherwise ? regular MenuItem
//
// `forceOpen` is set when the sidebar search has matched a child of an
// expandable parent � we open the parent so the match is visible.
function renderItem(item, activeItem, forceOpen = false) {
  if (item.children) {
    return <ExpandableMenuItem key={item.id} item={item} activeItem={activeItem} forceOpen={forceOpen} />;
  }
  if (isPrimaryActive(item.id, activeItem)) {
    return <HighlightedMenuItem key={item.id} item={item} />;
  }
  return <MenuItem key={item.id} item={item} isActive={false} />;
}

// Filter sidebar items by label substring (case-insensitive). For parents
// with children: include the whole parent if its own label matches, otherwise
// include with only the matching children (and mark `_forceOpen` so the
// expandable opens automatically). Returns the items list unchanged when
// the query is empty.
function filterMenuItems(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const result = [];
  for (const item of items) {
    const labelMatches = (item.label || "").toLowerCase().includes(q);
    if (item.children) {
      if (labelMatches) {
        result.push(item);
        continue;
      }
      const matchedChildren = item.children.filter((c) => (c.label || "").toLowerCase().includes(q));
      if (matchedChildren.length) {
        result.push({ ...item, children: matchedChildren, _forceOpen: true });
      }
    } else if (labelMatches) {
      result.push(item);
    }
  }
  return result;
}

function activeSectionForItem(activeItem) {
  const hasActive = (items) => items.some((item) => {
    if (item.id === activeItem) return true;
    return Array.isArray(item.children) && item.children.some((child) => child.id === activeItem);
  });
  if (hasActive(LEADERBOARDS_MENU)) return "lb";
  if (hasActive(WORLD_CUP_MENU)) return "wc";
  if (hasActive(RETENTION_MENU)) return "rt";
  if (hasActive(SETTINGS_MENU)) return "st";
  if (hasActive([...MENU_ITEMS, ...SECONDARY_MENU])) return "mrs";
  return "mrs";
}

export default function Sidebar({ activeItem: activeItemProp }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem = activeItemProp ?? pathnameToActiveItem(pathname);
  const { collapsed, toggle } = useSidebar();
  const [search, setSearch] = useState("");
  const [permissions, setPermissions] = useState(() => getStoredAdminPermissions());
  const [openSection, setOpenSection] = useState(() => activeSectionForItem(activeItem));
  // Sidebar items keyed to a boolean � true means render the red attention dot.
  // Currently driven only by getPrioritySummary for the Member Alert row, but
  // shaped as a map so future alert sources can plug in without restructuring.
  const [alertItems, setAlertItems] = useState({});

  // Collapsed-mode search popover. When the sidebar is collapsed, the search
  // icon opens a floating panel anchored beside it; the sidebar stays narrow.
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPos, setSearchPos] = useState({ top: 0, left: 0 });
  const searchBtnRef = useRef(null);
  const popoverRef = useRef(null);
  const popoverInputRef = useRef(null);

  const hasQuery = search.trim().length > 0;

  useEffect(() => {
    setOpenSection(activeSectionForItem(activeItem));
  }, [activeItem]);

  const toggleSection = (sectionKey) => {
    setOpenSection((current) => (current === sectionKey ? "" : sectionKey));
  };

  useEffect(() => {
    const refreshPermissions = () => setPermissions(getStoredAdminPermissions());
    refreshPermissions();
    return onAuthChanged(refreshPermissions);
  }, []);

  // Poll the priority summary so the Member Alert row gets a red dot whenever
  // any member is sitting in a follow-up bucket (high / medium / low / inactive).
  // The endpoint requires an admin token; if the user isn't logged in or the
  // backend errors, we silently skip � the sidebar must not break.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getPrioritySummary();
        if (cancelled) return;
        const pending =
          Number(res?.high_priority || 0) +
          Number(res?.medium_priority || 0) +
          Number(res?.low_priority || 0) +
          Number(res?.inactive_members || 0);
        setAlertItems((prev) => ({
          ...prev,
          "retention-member-alert": pending > 0,
        }));
      } catch {
        // Sidebar should not surface API failures.
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const openCollapsedSearch = () => {
    const r = searchBtnRef.current?.getBoundingClientRect();
    if (r) setSearchPos({ top: r.top, left: r.right + 12 });
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch("");
  };

  // Focus the popover input as soon as it mounts.
  useEffect(() => {
    if (searchOpen && popoverInputRef.current) {
      popoverInputRef.current.focus();
    }
  }, [searchOpen]);

  // Esc to close + click-outside to dismiss the popover.
  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeSearch(); };
    const onDown = (e) => {
      if (popoverRef.current?.contains(e.target)) return;
      if (searchBtnRef.current?.contains(e.target)) return;
      closeSearch();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [searchOpen]);

  // Close the popover automatically if the user expands the sidebar; the
  // inline input there takes over.
  useEffect(() => {
    if (!collapsed) setSearchOpen(false);
  }, [collapsed]);

  // Inline filtering only applies to the expanded sidebar (its input lives
  // there). In collapsed mode the popover handles its own filtering, so the
  // underlying icon list stays intact.
  const inlineQuery = collapsed ? "" : search;
  const mrsItems = filterMenuItems(filterMenuByPermissions([...MENU_ITEMS, ...SECONDARY_MENU], permissions), inlineQuery);
  const leaderboardItems = filterMenuItems(filterMenuByPermissions(LEADERBOARDS_MENU, permissions), inlineQuery);
  const worldCupItems = filterMenuItems(filterMenuByPermissions(WORLD_CUP_MENU, permissions), inlineQuery);
  const retentionItems = filterMenuItems(filterMenuByPermissions(RETENTION_MENU, permissions), inlineQuery)
    .map((item) => (alertItems[item.id] ? { ...item, _hasAlert: true } : item));
  const settingsItems = filterMenuItems(filterMenuByPermissions(SETTINGS_MENU, permissions), inlineQuery);
  const noResults = hasQuery && !collapsed && !mrsItems.length && !leaderboardItems.length && !worldCupItems.length && !retentionItems.length && !settingsItems.length;

  // Popover sections � independently filtered so opening the dialog doesn't
  // disturb the collapsed sidebar behind it.
  const popoverSections = collapsed && searchOpen
    ? [
        { title: "Leaderboards", items: filterMenuItems(filterMenuByPermissions(LEADERBOARDS_MENU, permissions), search) },
        { title: "World Cup Leaderboards", items: filterMenuItems(filterMenuByPermissions(WORLD_CUP_MENU, permissions), search) },
        { title: "MRS System", items: filterMenuItems(filterMenuByPermissions([...MENU_ITEMS, ...SECONDARY_MENU], permissions), search) },
        {
          title: "Retention System",
          items: filterMenuItems(filterMenuByPermissions(RETENTION_MENU, permissions), search)
            .map((item) => (alertItems[item.id] ? { ...item, _hasAlert: true } : item)),
        },
        { title: "Settings", items: filterMenuItems(filterMenuByPermissions(SETTINGS_MENU, permissions), search) },
      ].filter((s) => s.items.length > 0)
    : [];
  const popoverEmpty = collapsed && searchOpen && hasQuery && popoverSections.length === 0;

  return (
    // Sidebar shell � gold border + dark green gradient per Figma 243:6071.
    // Background uses Como-style deep green (rgb(17,50,14) ? rgb(3,17,1)).
    <div
      className="scrollbar-admin relative h-full w-full overflow-y-auto overflow-x-hidden rounded-[12px] border border-[#f2cb7a]"
      style={{
        background: "linear-gradient(143deg, #11320e 0%, #031101 99.749%)",
      }}
    >
      {/* Sticky top region � logo, toggle button and search bar stay pinned
          at the top of the sidebar while the menu list scrolls behind them.
          Background matches the top of the shell's diagonal gradient so the
          scrolling content doesn't peek through. */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: "linear-gradient(143deg, #11320e 0%, #0d2a0b 100%)",
        }}
      >
      {/* Header: logo + collapse toggle */}
      <div
        className={`flex items-center pt-6 pb-4 ${
          collapsed ? "flex-col gap-3 px-2" : "justify-between gap-2 px-4"
        }`}
      >
        {/* Logo block.
            Expanded: full King Group 44 wordmark (same PNG used on the login page).
            Collapsed: dedicated crown badge PNG that fits the narrow 56px column. */}
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.img
              key="logo-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={collapseTransition}
              src="/assets/admin/sidebar/icons/Logo-collapsed.png"
              alt="King Group 44"
              title="King Group 44"
              className="h-9 w-9 shrink-0 object-contain"
            />
          ) : (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={collapseTransition}
              className="flex items-center"
            >
              <img
                src="/assets/login/KingGroup44.png"
                alt="King Group 44"
                className="h-16 w-auto"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button. The icon mirrors when collapsed so it always points
            in the direction the button would expand. */}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-[#e9af41] hover:border-[#e9af41]/60 hover:bg-white/5 transition-colors"
        >
          <motion.span
            className="block"
            animate={{ scaleX: collapsed ? -1 : 1 }}
            transition={collapseTransition}
          >
            <PanelLeftIcon className="h-4 w-4" />
          </motion.span>
        </button>
      </div>

      {/* Search � full input when expanded, icon-only button when collapsed.
          Wiring of the search itself is left to a future step; this matches
          the design and reserves the slot. */}
      <div className={`pb-4 ${collapsed ? "px-2" : "px-4"}`}>
        {collapsed ? (
          <button
            ref={searchBtnRef}
            type="button"
            onClick={openCollapsedSearch}
            title="Search"
            aria-label="Open search"
            aria-expanded={searchOpen}
            className={`mx-auto flex h-10 w-10 items-center justify-center rounded-[8px] border bg-black/40 transition-all duration-200 ${
              searchOpen
                ? "border-[#f2cb7a] text-[#f2cb7a] bg-[#f2cb7a]/10"
                : "border-[#f2cb7a]/40 text-[#f2cb7a] hover:bg-[#f2cb7a]/8 hover:border-[#f2cb7a]/60"
            }`}
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-[8px] border border-[#f2cb7a]/40 bg-black/40 px-3 py-2">
            <SearchIcon className="h-4 w-4 text-[#f2cb7a] shrink-0" />
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sidebar-inter flex-1 min-w-0 bg-transparent text-[14px] text-[#fbeed2] placeholder:text-[#fbeed2]/40 focus:outline-none"
            />
          </div>
        )}
      </div>
      </div>
      {/* /sticky top region */}

      {/* Menu Items � gap-[24px] between sections per Figma when expanded.
          In collapsed mode, gap shrinks and a thin gold divider sits between
          adjacent sections so the icon-only column still telegraphs the group
          boundaries. */}
      <div className={`pb-6 flex w-full flex-col ${collapsed ? "gap-3 px-3" : "gap-6 px-4"}`}>
        {(() => {
          const blocks = [
            retentionItems.length > 0 && (
              <CollapsibleSection key="rt" sectionKey="rt" title="Retention System" open={openSection === "rt"} onToggle={toggleSection} forceOpen={hasQuery}>
                {retentionItems.map((item) => renderItem(item, activeItem, item._forceOpen))}
              </CollapsibleSection>
            ),
            leaderboardItems.length > 0 && (
              <CollapsibleSection key="lb" sectionKey="lb" title="Leaderboards" open={openSection === "lb"} onToggle={toggleSection} forceOpen={hasQuery}>
                {leaderboardItems.map((item) => renderItem(item, activeItem, item._forceOpen))}
              </CollapsibleSection>
            ),
            worldCupItems.length > 0 && (
              <CollapsibleSection key="wc" sectionKey="wc" title="World Cup Leaderboards" open={openSection === "wc"} onToggle={toggleSection} forceOpen={hasQuery}>
                {worldCupItems.map((item) => renderItem(item, activeItem, item._forceOpen))}
              </CollapsibleSection>
            ),
            mrsItems.length > 0 && (
              <CollapsibleSection key="mrs" sectionKey="mrs" title="MRS System" open={openSection === "mrs"} onToggle={toggleSection} forceOpen={hasQuery}>
                {mrsItems.map((item) => renderItem(item, activeItem, item._forceOpen))}
              </CollapsibleSection>
            ),
            settingsItems.length > 0 && (
              <CollapsibleSection key="st" sectionKey="st" title="Settings" open={openSection === "st"} onToggle={toggleSection} forceOpen={hasQuery}>
                {settingsItems.map((item) => renderItem(item, activeItem, item._forceOpen))}
              </CollapsibleSection>
            ),
          ].filter(Boolean);
          if (!collapsed) return blocks;
          return blocks.flatMap((section, i) =>
            i === 0
              ? [section]
              : [
                  <div
                    key={`divider-${section.key}`}
                    aria-hidden="true"
                    className="mx-2 h-px bg-[#f2cb7a]/30"
                  />,
                  section,
                ]
          );
        })()}

        {noResults && !collapsed && (
          <p className="sidebar-inter px-2 py-3 text-center text-[12px] text-[#fbeed2]/50">
            No matching menu items.
          </p>
        )}
      </div>

      <AnimatePresence>
        {collapsed && searchOpen && (
          <motion.div
            ref={popoverRef}
            key="search-popover"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-[100] w-72 rounded-[12px] border border-[#f2cb7a] shadow-2xl"
            style={{
              top: searchPos.top,
              left: searchPos.left,
              background: "linear-gradient(143deg, #11320e 0%, #031101 99.749%)",
            }}
            role="dialog"
            aria-label="Search menu"
          >
            <div className="p-3 border-b border-[#f2cb7a]/20">
              <div className="flex items-center gap-2 rounded-[8px] border border-[#f2cb7a]/40 bg-black/40 px-3 py-2">
                <SearchIcon className="h-4 w-4 text-[#f2cb7a] shrink-0" />
                <input
                  ref={popoverInputRef}
                  type="search"
                  placeholder="Search menu"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sidebar-inter flex-1 min-w-0 bg-transparent text-[14px] text-[#fbeed2] placeholder:text-[#fbeed2]/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="scrollbar-admin max-h-[60vh] overflow-y-auto p-2">
              {popoverEmpty && (
                <p className="sidebar-inter px-3 py-6 text-center text-[12px] text-[#fbeed2]/50">
                  No matching menu items.
                </p>
              )}
              {!hasQuery && !popoverEmpty && popoverSections.length === 0 && (
                <p className="sidebar-inter px-3 py-6 text-center text-[12px] text-[#fbeed2]/50">
                  Start typing to search.
                </p>
              )}
              {popoverSections.map((section) => (
                <div key={section.title} className="mb-2 last:mb-0">
                  <p
                    className="sidebar-inter px-3 py-1 text-[11px] uppercase tracking-[-0.5px] bg-clip-text text-transparent"
                    style={{ backgroundImage: SECTION_TITLE_GRADIENT }}
                  >
                    {section.title}
                  </p>
                  {section.items.flatMap((item) => {
                    const rows = [];
                    const showChildrenAsRows = item.children && item._forceOpen;
                    if (showChildrenAsRows) {
                      for (const child of item.children) {
                        rows.push(
                          <Link
                            key={`${item.id}-${child.id}`}
                            href={child.href}
                            onClick={closeSearch}
                          >
                            <div
                              className={`flex items-center gap-2 rounded-[8px] px-3 py-2 transition-colors ${
                                child.id === activeItem
                                  ? "bg-[#f2cb7a]/15 text-[#f2cb7a]"
                                  : "text-[#fbeed2] hover:bg-[#f2cb7a]/8"
                              }`}
                            >
                              <div className={`h-4 w-4 shrink-0 flex items-center justify-center ${item.iconNode || item.iconMask ? "text-current" : ""}`}>
                                <ItemIcon item={item} sizeClass="w-full h-full" />
                              </div>
                              <span className="sidebar-inter text-[13px] leading-[20px] tracking-[-1px]">
                                <span className="opacity-60">{item.label}</span>
                                <span className="opacity-40 px-1">/</span>
                                {child.label}
                              </span>
                            </div>
                          </Link>
                        );
                      }
                    } else {
                      const isActive = isPrimaryActive(item.id, activeItem);
                      rows.push(
                        <Link key={item.id} href={item.href} onClick={closeSearch}>
                          <div
                            className={`flex items-center gap-2 rounded-[8px] px-3 py-2 transition-colors ${
                              isActive
                                ? "bg-[#f2cb7a]/15 text-[#f2cb7a]"
                                : "text-[#fbeed2] hover:bg-[#f2cb7a]/8"
                            }`}
                          >
                            <div className={`h-4 w-4 shrink-0 flex items-center justify-center ${item.iconNode || item.iconMask ? "text-current" : ""}`}>
                              <ItemIcon item={item} sizeClass="w-full h-full" />
                            </div>
                            <span className="sidebar-inter text-[13px] leading-[20px] tracking-[-1px]">
                              {item.label}
                            </span>
                            {item._hasAlert && <RedDot />}
                          </div>
                        </Link>
                      );
                    }
                    return rows;
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
