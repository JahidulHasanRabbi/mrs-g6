"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminLogout } from "../../api/adminApi";
import { tokenStorage } from "../../api/tokenStorage";

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
    id: "lucky-spin",
    label: "Lucky Spin Management",
    icon: "/assets/admin/lucky-spin-icon.png",
    href: "/admin/lucky-spin",
    hasSubmenu: true,
    disabled: false,
  },
  {
    id: "redemption",
    label: "Points Redemption Mall",
    icon: "/assets/admin/redemption-mall-icon.png",
    href: "/admin/redemption",
    hasSubmenu: true,
    disabled: false,
  },
  {
    id: "redemption-gift",
    label: "Points Redemption Gift",
    icon: "/assets/admin/redemption-gift-icon.png",
    href: "/admin/redemption-gift",
    hasSubmenu: true,
    disabled: true, // No page yet
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
    id: "vip",
    label: "VIP Membership Panel",
    icon: "/assets/admin/vip-icon.png",
    href: "/admin/vip-tiers",
    hasSubmenu: true,
    disabled: false,
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
    disabled: true, // No page yet
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
    <div className="relative h-10 overflow-hidden">
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
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

export default function Sidebar({ activeItem = "home" }) {
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
      className="relative h-full w-full overflow-y-auto overflow-x-hidden rounded-[14px] border border-[rgba(255,255,132,0.2)]"
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
              (item.id === activeItem && !item.isHighlighted) ||
              (item.id === "home" && activeItem === "home");
            
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
            // Check if VIP item should be highlighted
            const shouldHighlight = item.id === "vip" && (activeItem === "vip" || activeItem === "vip-tiers");
            
            if (shouldHighlight) {
              return <HighlightedMenuItem key={item.id} item={item} />;
            }
            
            return <MenuItem key={item.id} item={item} isActive={activeItem === item.id || (item.id === "vip" && activeItem === "vip-tiers")} />;
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
