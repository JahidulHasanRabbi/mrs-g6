"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { adminLogout } from "../../api/adminApi";
import { tokenStorage } from "../../api/tokenStorage";

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
  if (pathname.startsWith("/admin/redemption-mall")) return "redemption-mall";
  if (pathname.startsWith("/admin/reports/token")) return "token-report";
  if (pathname.startsWith("/admin/reports/reward")) return "reward-report";
  if (pathname.startsWith("/admin/reports/member")) return "member-report";
  if (pathname.startsWith("/admin/members")) return "member-list";
  if (pathname.startsWith("/admin/redemption")) return "redemption";
  if (pathname.startsWith("/admin/checkin-settings")) return "checkin-settings";
  if (pathname.startsWith("/admin/banners")) return "banners";
  if (pathname.startsWith("/admin/frame-setting")) return "frame-setting";
  if (pathname.startsWith("/admin/wallet-site-vip")) return "wallet-site-vip";
  if (pathname.startsWith("/admin/mrs-vip")) return "mrs-vip-level";
  if (pathname.startsWith("/admin/vip-tiers")) return "vip-tiers";
  if (pathname === "/admin" || pathname === "/admin/") return "home";
  return "home";
}

const MENU_ITEMS = [
  {
    id: "home",
    label: "Home Dashboard",
    icon: "/assets/admin/home-icon.png",
    href: "/admin",
    isHighlighted: true,
    disabled: false,
  },
  {
    id: "member-list",
    label: "Member List",
    icon: "/assets/admin/member-list.png",
    href: "/admin/members",
    disabled: false,
  },
  {
    id: "lucky-spin",
    label: "Lucky Spin Management",
    icon: "/assets/admin/lucky-spin-icon.png",
    href: "/admin/lucky-spin",
    hasSubmenu: true,
    disabled: false,
  },
  {
    id: "redemption-mall",
    label: "Points Redemption Mall",
    icon: "/assets/admin/redemption-mall-icon.png",
    href: "/admin/redemption-mall",
    hasSubmenu: true,
    disabled: false,
  },
];

const SECONDARY_MENU = [
  {
    id: "tournament",
    label: "Tournament",
    icon: "/assets/admin/tournament-icon.png",
    href: "/admin/tournament",
    disabled: true, // No page yet
  },
  {
    id: "frame-setting",
    label: "Frame Setting",
    icon: "/assets/admin/Frame-setting.png", // Using home icon as placeholder
    href: "/admin/frame-setting",
    disabled: false,
  },
  {
    id: "vip",
    label: "VIP Membership Panel",
    icon: "/assets/admin/vip-icon.png",
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
    icon: "/assets/admin/home-icon.png", // Using home icon as placeholder
    href: "/admin/checkin-settings",
    disabled: false,
  },
  {
    id: "banners",
    label: "Banners Management",
    icon: "/assets/admin/home-icon.png", // Using home icon as placeholder
    href: "/admin/banners",
    disabled: false,
  },
  {
    id: "reports",
    label: "Reports",
    icon: "/assets/admin/reports-icon.png",
    href: "/admin/reports",
    hasSubmenu: true,
    disabled: false,
    children: [
      { id: "token-report", label: "Token Report", href: "/admin/reports/token" },
      { id: "reward-report", label: "Reward Report", href: "/admin/reports/reward" },
      { id: "member-report", label: "Member Report", href: "/admin/reports/member" },
    ],
  },
  {
    id: "user-management",
    label: "User Management",
    icon: "/assets/admin/user-management-icon.png",
    href: "/admin/user-management",
    hasSubmenu: true,
    disabled: true, // No page yet
  },
  {
    id: "notifications",
    label: "Notification Management",
    icon: "/assets/admin/notifications-icon.png",
    href: "/admin/notifications",
    hasSubmenu: true,
    disabled: true, // No page yet
  },
];

const MenuItem = ({ item, isActive }) => {
  const content = (
    <div
      className={`relative overflow-hidden rounded-[10px] border transition-all duration-200 ${
        isActive
          ? "border-[#e9af41] bg-[rgba(232,181,88,0.14)] shadow-[0_0_24px_rgba(231,196,87,0.22)]"
          : "border-transparent"
      }`}
    >
      <div
        className={`flex min-h-10 items-center gap-1.5 px-2 py-1.5 ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <div className="relative h-5 w-5 shrink-0">
          <img
            src={item.icon}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <p className={`text-[18px] font-bold tracking-[-0.396px] font-['Times_New_Roman'] ${isActive ? 'text-white' : 'text-white/70'}`}>
          {item.label}
        </p>
      </div>
    </div>
  );

  if (item.disabled) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return <Link href={item.href}>{content}</Link>;
};

const HighlightedMenuItem = ({ item }) => {
  const content = (
    <div
      className={`relative h-[51.765px] w-full overflow-hidden rounded-[6.471px] border-[0.324px] shadow-[3.235px_3.235px_48.529px_3.235px_rgba(231,196,87,0.5)] ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      style={{
        backgroundColor: "#e8b558",
      }}
    >
      <div className="absolute left-[calc(50%+0.6px)] top-[calc(50%-0.24px)] flex -translate-x-1/2 -translate-y-1/2 items-center gap-[25.882px]">
        <div className="relative h-[38px] w-[38px] shrink-0">
          <img
            src={item.icon}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <p className="font-['Times_New_Roman'] text-[16px] font-bold leading-[normal] text-white w-[181.176px] whitespace-pre-wrap">
          {item.label}
        </p>
      </div>
    </div>
  );

  if (item.disabled) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return <Link href={item.href}>{content}</Link>;
};

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

const ExpandableMenuItem = ({ item, activeItem }) => {
  const isAnyChildActive = item.children?.some((c) => c.id === activeItem);
  const [open, setOpen] = useState(isAnyChildActive);

  // Full gold highlight only when a child page is actually active.
  // When merely expanded (open) but no child active, use a subtle outline style.
  const headerClass = isAnyChildActive
    ? "border-[0.324px] border-[#9f7722] bg-[#e8b558] shadow-[3.235px_3.235px_48.529px_3.235px_rgba(231,196,87,0.5)]"
    : open
      ? "border-[rgba(233,175,65,0.35)] bg-white/5"
      : "border-transparent bg-transparent hover:border-[rgba(233,175,65,0.35)] hover:bg-white/5";

  return (
    <div>
      {/* Parent header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-[51.765px] w-full items-center justify-between overflow-hidden rounded-[6.471px] border px-3 transition-all duration-200 ${headerClass}`}
      >
        <div className="flex items-center gap-[10px]">
          <div className="relative h-[22px] w-[22px] shrink-0">
            <img src={item.icon} alt="" className="w-full h-full object-cover" />
          </div>
          <span
            className={`font-['Times_New_Roman'] text-[16px] font-bold leading-normal ${
              isAnyChildActive ? "text-white" : "text-white/80"
            }`}
          >
            {item.label}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isAnyChildActive ? "white" : "rgba(255,255,255,0.8)"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Sub-items */}
      {open && (
        <div className="mt-1 flex flex-col gap-1 pl-2">
          {item.children.map((child) => {
            const isActive = child.id === activeItem;
            return (
              <Link key={child.id} href={child.href}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-[6px] transition-colors ${
                    isActive
                      ? "bg-[rgba(232,181,88,0.18)]"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className={isActive ? "text-[#e9af41]" : "text-white/60"}>
                    {(() => { const Icon = CHILD_ICONS[item.id] || BarChartIcon; return <Icon />; })()}
                  </span>
                  <span
                    className={`font-['Times_New_Roman'] text-[15px] font-bold ${
                      isActive ? "text-white" : "text-white/70"
                    }`}
                  >
                    {child.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function Sidebar({ activeItem: activeItemProp }) {
  const pathname = usePathname();
  const activeItem = activeItemProp ?? pathnameToActiveItem(pathname);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call logout API
      await adminLogout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Always clear tokens and redirect, regardless of API success
      tokenStorage.clearAdminTokens();
      router.push('/admin/login');
    }
  };

  return (
    <div 
      className="scrollbar-admin relative h-full w-full overflow-y-auto overflow-x-hidden rounded-[14px] border border-[rgba(255,255,132,0.2)]"
      style={{
        background: "linear-gradient(180deg, rgba(7, 25, 13, 1) 0%, rgba(10, 30, 15, 1) 100%)",
      }}
    >
      {/* Breadcrumb Navigation */}
      <div className="absolute left-1/2 top-[9px] flex -translate-x-1/2 items-center gap-[58px]">
        <div className="relative h-[42px] w-[29px]">
         
          <p className="absolute bottom-[14px] right-[13.5px] translate-x-1/2 translate-y-1/2 text-center text-[7px] font-bold leading-[normal] text-[#e9af41] font-['Times_New_Roman']">
            Home
          </p>
          <div className="absolute bottom-[19px] right-[4px] h-[20px] w-[21px]">
            <img
              src="/assets/admin/home-icon.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="relative h-6 w-6 shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="white"
              strokeOpacity="0.7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Menu Items */}
      <div className="pt-[110px] pb-6 px-3 flex w-full flex-col gap-4">
        {/* Primary Menu */}
        <div className="flex flex-col gap-4">
          {MENU_ITEMS.map((item) => {
            // Check if this item should be highlighted
            const shouldHighlight =
              (item.id === "lucky-spin" && (activeItem === "lucky-spin" || activeItem === "prize-settings" || activeItem === "user-logs" || activeItem === "daily-limits")) ||
              (item.id === "redemption" && activeItem === "redemption") ||
              (item.id === "redemption-mall" && activeItem === "redemption-mall") ||
              (item.id === "home" && activeItem === "home") ||
              (item.id === "member-list" && activeItem === "member-list");

            if (shouldHighlight) {
              return <HighlightedMenuItem key={item.id} item={item} />;
            }

            // Regular menu item with proper active state
            const isActive = item.id === activeItem;
            return <MenuItem key={item.id} item={item} isActive={isActive} />;
          })}
        </div>

        {/* Secondary Menu */}
        <div className="flex flex-col gap-4">
          {SECONDARY_MENU.map((item) => {
            if (item.children) {
              return <ExpandableMenuItem key={item.id} item={item} activeItem={activeItem} />;
            }

            const shouldHighlight =
              (item.id === "vip" && (activeItem === "vip" || activeItem === "vip-tiers")) ||
              item.id === activeItem;

            if (shouldHighlight) {
              return <HighlightedMenuItem key={item.id} item={item} />;
            }

            return <MenuItem key={item.id} item={item} isActive={false} />;
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-[#202020] px-4 py-3 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="text-[16px] font-bold text-white font-['Times_New_Roman']">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );
}
