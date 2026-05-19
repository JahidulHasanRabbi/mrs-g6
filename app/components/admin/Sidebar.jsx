"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "../../contexts/SidebarContext";

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
// Animating height: 0 ↔ "auto" plus opacity gives a smooth slide-fade without
// the snappy display:none hop.
const collapseTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };
const collapseVariants = {
  collapsed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1 },
};

// Map a pathname → sidebar item id. Keeps the sidebar a single source of truth
// so it doesn't depend on a per-page `activeItem` prop (which would force a
// re-render dance from each page).
function pathnameToActiveItem(pathname) {
  if (!pathname) return "home";
  // Most specific first
  if (pathname.startsWith("/admin/lucky-spin/prize-settings")) return "prize-settings";
  if (pathname.startsWith("/admin/lucky-spin/user-logs")) return "user-logs";
  if (pathname.startsWith("/admin/lucky-spin/daily-limits")) return "daily-limits";
  if (pathname.startsWith("/admin/lucky-spin")) return "lucky-spin";
  if (pathname.startsWith("/admin/mart-tiers")) return "mart-tiers";
  if (pathname.startsWith("/admin/redemption-mall")) return "redemption-mall";
  if (pathname.startsWith("/admin/reports/token")) return "token-report";
  if (pathname.startsWith("/admin/reports/reward")) return "reward-report";
  if (pathname.startsWith("/admin/reports/member")) return "member-report";
  if (pathname.startsWith("/admin/retention/member-alert")) return "retention-member-alert";
  if (pathname.startsWith("/admin/retention/members")) return "retention-member-list";
  if (pathname.startsWith("/admin/retention/settings")) return "retention-settings";
  if (pathname.startsWith("/admin/retention/pic-dashboard")) return "retention-pic-dashboard";
  if (pathname.startsWith("/admin/retention")) return "retention-pic-dashboard";
  if (pathname.startsWith("/admin/settings/user-access")) return "settings-user-access";
  if (pathname.startsWith("/admin/settings/role-management")) return "settings-role-management";
  if (pathname.startsWith("/admin/settings/user-activity-log")) return "settings-user-activity-log";
  if (pathname.startsWith("/admin/settings/login-requests")) return "settings-login-requests";
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

// User with a small key/check — represents "role management"
const RoleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="7" r="4" />
    <path d="M2 21v-2a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v2" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

// ID-badge with lines — represents "activity log"
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

// Person with arrow — represents "login request"
const LoginRequestIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <polyline points="17 8 21 12 17 16" />
    <line x1="13" y1="12" x2="21" y2="12" />
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
    ],
  },
];

// Renders one of:
//   item.iconNode  → inline React SVG component, colored via currentColor
//   item.iconMask  → PNG used as a CSS mask so we can tint it via currentColor too
//   item.icon      → plain <img> (color is whatever the source asset has baked in)
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

// Spec from Figma 231:3393 — items/nav item:
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
        className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-[12px] transition-all duration-200 ${
          isActive
            ? "border-[2.5px] border-[#f2cb7a]"
            : "border border-transparent hover:border-[#f2cb7a]/40 hover:bg-white/5"
        } ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        style={
          isActive
            ? { backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" }
            : undefined
        }
      >
        <div
          className={`relative h-5 w-5 shrink-0 flex items-center justify-center ${
            item.iconNode || item.iconMask ? (isActive ? "text-[#141828]" : "text-white") : ""
          }`}
        >
          <ItemIcon item={item} sizeClass="w-full h-full" />
        </div>
      </div>
    );
    if (item.disabled) return <div className="cursor-not-allowed">{content}</div>;
    return <Link href={item.href}>{content}</Link>;
  }

  const content = (
    <div
      className={`relative flex items-center gap-2 rounded-[12px] px-3 py-2 transition-colors ${
        isActive
          ? "border-[2.5px] border-[#f2cb7a]"
          : "border-[2.5px] border-transparent hover:bg-white/5"
      } ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      style={
        isActive
          ? { backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" }
          : undefined
      }
    >
      <div
        className={`relative h-8 w-8 shrink-0 flex items-center justify-center ${
          item.iconNode || item.iconMask ? (isActive ? "text-[#141828]" : "text-white") : ""
        }`}
      >
        <ItemIcon item={item} sizeClass="w-[20px] h-[20px]" />
      </div>
      <p
        className={`text-[14px] font-semibold leading-[21px] tracking-[-1px] whitespace-nowrap ${
          isActive ? "text-[#141828]" : "text-white"
        }`}
      >
        {item.label}
      </p>
    </div>
  );

  if (item.disabled) return <div className="cursor-not-allowed">{content}</div>;
  return <Link href={item.href}>{content}</Link>;
};

// Active-state item — visually identical to MenuItem but with the gold gradient
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

const CHILD_ICONS = {
  reports: BarChartIcon,
  vip: CoinIcon,
};

const ExpandableMenuItem = ({ item, activeItem, forceOpen = false }) => {
  const { collapsed } = useSidebar();
  const isAnyChildActive = item.children?.some((c) => c.id === activeItem);
  const [open, setOpen] = useState(isAnyChildActive);
  const effectivelyOpen = forceOpen || open;

  // When the sidebar is collapsed, render the parent as a plain icon-only
  // button and hide the children entirely — the nested label list has nowhere
  // to live in 56px of width. Clicking it still routes to the parent href.
  if (collapsed) {
    const square = (
      <div
        title={item.label}
        className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-200 ${
          isAnyChildActive
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
    return item.href ? <Link href={item.href}>{square}</Link> : square;
  }

  // Header background: full gold gradient only when a child page is actually
  // active. When the menu is merely expanded, fall back to the regular row.
  const isActiveStyle = isAnyChildActive;

  return (
    <div className="flex flex-col gap-2">
      {/* Parent header — same row dimensions as a MenuItem */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex w-full items-center gap-2 rounded-[12px] px-3 py-2 transition-colors ${
          isActiveStyle
            ? "border-[2.5px] border-[#f2cb7a]"
            : "border-[2.5px] border-transparent hover:bg-white/5"
        }`}
        style={
          isActiveStyle
            ? { backgroundImage: "linear-gradient(105deg, #dc9d16 1%, #f2cb7a 98%)" }
            : undefined
        }
      >
        <div
          className={`relative h-8 w-8 shrink-0 flex items-center justify-center ${
            item.iconNode || item.iconMask ? (isActiveStyle ? "text-[#141828]" : "text-white") : ""
          }`}
        >
          <ItemIcon item={item} sizeClass="w-[20px] h-[20px]" />
        </div>
        <span
          className={`flex-1 text-left text-[14px] font-semibold leading-[21px] tracking-[-1px] whitespace-nowrap ${
            isActiveStyle ? "text-[#141828]" : "text-white"
          }`}
        >
          {item.label}
        </span>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isActiveStyle ? "#141828" : "#ffffff"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-[12px] transition-colors ${
                        isActive ? "bg-[#f2cb7a]/15" : "hover:bg-white/5"
                      }`}
                    >
                      <span className={isActive ? "text-[#f2cb7a]" : "text-white"}>
                        {(() => { const Icon = CHILD_ICONS[item.id] || BarChartIcon; return <Icon />; })()}
                      </span>
                      <span
                        className={`text-[13px] font-semibold leading-[20px] tracking-[-1px] ${
                          isActive ? "text-[#f2cb7a]" : "text-white"
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

// Section title gradient — Primary 600 → Primary 300 from the Figma tokens.
const SECTION_TITLE_GRADIENT = "linear-gradient(102deg, #dc9d16 1%, #f2cb7a 98%)";

// Collapsible section wrapper — renders a header with the section title
// and a chevron that toggles visibility of the items inside.
//
// When the sidebar is collapsed, the title shows a short prefix (~3 chars +
// ellipsis) so the section is still distinguishable in the narrow track.
const CollapsibleSection = ({ title, defaultOpen = true, forceOpen = false, children }) => {
  const { collapsed: sidebarCollapsed } = useSidebar();
  const [open, setOpen] = useState(defaultOpen);
  const effectivelyOpen = forceOpen || open;

  // First 3 chars + ellipsis when the whole sidebar is squeezed
  const shortTitle = title.length > 3 ? `${title.slice(0, 3)}…` : title;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={forceOpen}
        className={`flex items-center w-full py-1 group ${
          sidebarCollapsed ? "justify-center gap-1 px-0" : "justify-between gap-2 px-0"
        }`}
        aria-expanded={effectivelyOpen}
        title={sidebarCollapsed ? title : undefined}
      >
        <span
          className={`font-semibold uppercase whitespace-nowrap tracking-[-1px] leading-[24px] bg-clip-text text-transparent ${
            sidebarCollapsed ? "text-[12px]" : "text-[16px]"
          }`}
          style={{ backgroundImage: SECTION_TITLE_GRADIENT }}
        >
          {sidebarCollapsed ? shortTitle : title}
        </span>
        <motion.svg
          width={sidebarCollapsed ? 10 : 12}
          height={sidebarCollapsed ? 10 : 12}
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
// 1. Item has children → ExpandableMenuItem (its own collapsible)
// 2. Item is active for the current route → HighlightedMenuItem (gold pill)
// 3. Otherwise → regular MenuItem
//
// `forceOpen` is set when the sidebar search has matched a child of an
// expandable parent — we open the parent so the match is visible.
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

export default function Sidebar({ activeItem: activeItemProp }) {
  const pathname = usePathname();
  const activeItem = activeItemProp ?? pathnameToActiveItem(pathname);
  const { collapsed, toggle } = useSidebar();
  const [search, setSearch] = useState("");
  const hasQuery = search.trim().length > 0;

  const mrsItems = filterMenuItems([...MENU_ITEMS, ...SECONDARY_MENU], search);
  const retentionItems = filterMenuItems(RETENTION_MENU, search);
  const settingsItems = filterMenuItems(SETTINGS_MENU, search);
  const noResults = hasQuery && !mrsItems.length && !retentionItems.length && !settingsItems.length;

  return (
    // Sidebar shell — gold border + dark green gradient per Figma 243:6071.
    // Background uses Como-style deep green (rgb(17,50,14) → rgb(3,17,1)).
    <div
      className="scrollbar-admin relative h-full w-full overflow-y-auto overflow-x-hidden rounded-[12px] border border-[#f2cb7a]"
      style={{
        background: "linear-gradient(143deg, #11320e 0%, #031101 99.749%)",
      }}
    >
      {/* Sticky top region — logo, toggle button and search bar stay pinned
          at the top of the sidebar while the menu list scrolls behind them.
          Background matches the top of the shell's diagonal gradient so the
          scrolling content doesn't peek through. */}
      <div
        className="sticky top-0 z-10"
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

      {/* Search — full input when expanded, icon-only button when collapsed.
          Wiring of the search itself is left to a future step; this matches
          the design and reserves the slot. */}
      <div className={`pb-4 ${collapsed ? "px-2" : "px-4"}`}>
        {collapsed ? (
          <button
            type="button"
            title="Search"
            aria-label="Search"
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-md border border-[#e9af41]/40 bg-black/40 text-[#e9af41] hover:bg-white/5 transition-colors"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-[#e9af41]/40 bg-black/40 px-3 py-2">
            <SearchIcon className="h-4 w-4 text-[#e9af41] shrink-0" />
            <input
              type="search"
              placeholder="Search menu"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-[14px] text-white placeholder-white/40 focus:outline-none"
            />
          </div>
        )}
      </div>
      </div>
      {/* /sticky top region */}

      {/* Menu Items — three collapsible sections, gap-[24px] per Figma.
          When the search has a query, empty sections collapse out of view and
          a "No matches" hint appears if every section is empty. */}
      <div className={`pb-6 flex w-full flex-col gap-6 ${collapsed ? "px-3" : "px-4"}`}>
        {mrsItems.length > 0 && (
          <CollapsibleSection title="MRS System" forceOpen={hasQuery}>
            {mrsItems.map((item) => renderItem(item, activeItem, item._forceOpen))}
          </CollapsibleSection>
        )}

        {retentionItems.length > 0 && (
          <CollapsibleSection title="Retention System" forceOpen={hasQuery}>
            {retentionItems.map((item) => renderItem(item, activeItem, item._forceOpen))}
          </CollapsibleSection>
        )}

        {settingsItems.length > 0 && (
          <CollapsibleSection title="Settings" forceOpen={hasQuery}>
            {settingsItems.map((item) => renderItem(item, activeItem, item._forceOpen))}
          </CollapsibleSection>
        )}

        {noResults && !collapsed && (
          <p className="px-2 py-3 text-center text-[12px] text-white/50">
            No matching menu items.
          </p>
        )}
      </div>
    </div>
  );
}
