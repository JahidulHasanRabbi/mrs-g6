"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const MENU_ITEMS = [
  {
    id: "home",
    label: "Home Dashboard",
    icon: "https://www.figma.com/api/mcp/asset/c410da3d-b2e1-4c8b-8a12-01bb5fd35fa0",
    href: "/admin",
    isHighlighted: true,
  },
  {
    id: "lucky-spin",
    label: "Lucky Spin Management",
    icon: "https://www.figma.com/api/mcp/asset/2ac8ef32-ce18-428a-98db-8791f36124f3",
    href: "/admin/lucky-spin",
    hasSubmenu: true,
  },
  {
    id: "redemption-mall",
    label: "Points Redemption Mall",
    icon: "https://www.figma.com/api/mcp/asset/c9a60cbd-f7a9-4547-8c67-05985714695b",
    href: "/admin/redemption-items",
    hasSubmenu: true,
  },
  {
    id: "redemption-gift",
    label: "Points Redemption Gift",
    icon: "https://www.figma.com/api/mcp/asset/f6833d4f-4f5f-4ee8-b842-44e3cde3d5b9",
    href: "/admin/redemption-gift",
    hasSubmenu: true,
  },
];

const SECONDARY_MENU = [
  {
    id: "tournament",
    label: "Tournament",
    icon: "https://www.figma.com/api/mcp/asset/e3bb06a1-ee82-4156-869d-e03185e16767",
    href: "/admin/tournament",
  },
  {
    id: "vip",
    label: "VIP Membership Panel",
    icon: "https://www.figma.com/api/mcp/asset/550b9d48-a153-4a11-8895-d389eee6d920",
    href: "/admin/vip-tiers",
    hasSubmenu: true,
  },
  {
    id: "reports",
    label: "Reports",
    icon: "https://www.figma.com/api/mcp/asset/3c66f4d6-50f4-497f-849d-5143cae382f5",
    href: "/admin/reports",
    hasSubmenu: true,
  },
  {
    id: "user-management",
    label: "User Management",
    icon: "https://www.figma.com/api/mcp/asset/83b20cb2-2759-4347-bf2f-edbfe22a04ef",
    href: "/admin/user-management",
    hasSubmenu: true,
  },
  {
    id: "notifications",
    label: "Notification Management",
    icon: "https://www.figma.com/api/mcp/asset/d78758e0-74c6-48c2-97b0-a89dcfd736b7",
    href: "/admin/notifications",
    hasSubmenu: true,
  },
];

const MenuItem = ({ item }) => (
  <Link href={item.href}>
    <div className="relative h-10 overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <div className="relative h-5 w-5 shrink-0">
          <Image
            src={item.icon}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <p className="text-[18px] font-bold text-white/70 tracking-[-0.396px] font-['Times_New_Roman']">
          {item.label}
        </p>
      </div>
    
    </div>
  </Link>
);

const HighlightedMenuItem = ({ item }) => (
  <Link href={item.href}>
    <div
      className="relative h-[51.765px] w-full overflow-hidden rounded-[6.471px] border-[0.324px] shadow-[3.235px_3.235px_48.529px_3.235px_rgba(231,196,87,0.5)]"
      style={{
        backgroundColor: "#e8b558",
      }}
    >
      <div className="absolute left-[calc(50%+0.6px)] top-[calc(50%-0.24px)] flex -translate-x-1/2 -translate-y-1/2 items-center gap-[25.882px]">
        <div className="relative h-[38px] w-[38px] shrink-0">
          <Image
            src={item.icon}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <p className="font-['Times_New_Roman'] text-[16px] font-bold leading-[normal] text-white w-[181.176px] whitespace-pre-wrap">
          {item.label}
        </p>
      </div>
    </div>
  </Link>
);

export default function Sidebar({ activeItem = "home" }) {
  const [profileExpanded, setProfileExpanded] = useState(false);

  return (
    <div 
      className="relative h-full w-full overflow-hidden rounded-[14px] border border-[rgba(255,255,132,0.2)]"
      style={{
        background: "linear-gradient(180deg, rgba(7, 25, 13, 1) 0%, rgba(10, 30, 15, 1) 100%)",
      }}
    >
      {/* Breadcrumb Navigation */}
      <div className="absolute left-1/2 top-[9px] flex -translate-x-1/2 items-center gap-[58px]">
        <div className="relative h-[42px] w-[29px]">
          <p className="absolute bottom-[4.5px] right-[14px] translate-x-1/2 translate-y-1/2 text-center text-[8px] font-bold leading-[normal] text-[#e9af41] font-['Times_New_Roman']">
            Mart
          </p>
          <p className="absolute bottom-[14px] right-[13.5px] translate-x-1/2 translate-y-1/2 text-center text-[7px] font-bold leading-[normal] text-[#e9af41] font-['Times_New_Roman']">
            Home
          </p>
          <div className="absolute bottom-[19px] right-[4px] h-[20px] w-[21px]">
            <Image
              src="https://www.figma.com/api/mcp/asset/aaa032d8-e97a-4a0d-add7-2751bd57a14f"
              alt=""
              fill
              className="object-cover"
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
      <div className="absolute left-1/2 top-[110px] flex w-[304px] -translate-x-1/2 flex-col gap-4">
        {/* Primary Menu */}
        <div className="flex flex-col gap-4">
          {MENU_ITEMS.map((item) =>
            item.isHighlighted ? (
              <HighlightedMenuItem key={item.id} item={item} />
            ) : (
              <MenuItem key={item.id} item={item} />
            )
          )}
        </div>

        {/* Secondary Menu */}
        <div className="flex flex-col gap-4">
          {SECONDARY_MENU.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Profile Section */}
      <div className="absolute bottom-6 left-[27px] w-[270px]">
        <button
          onClick={() => setProfileExpanded(!profileExpanded)}
          className="flex w-full items-center gap-[17px] rounded-md border border-white/20 bg-[#202020] p-2"
        >
          <div className="flex flex-1 items-center gap-2">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src="https://www.figma.com/api/mcp/asset/5698a08b-cd53-4a1e-b432-874d00e5232e"
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start gap-1">
              <p className="text-[16px] font-bold leading-6 text-white font-['Times_New_Roman']">
                Andrew Forbist
              </p>
              <p className="text-[14px] leading-5 text-[#8c8c8c] font-['Times_New_Roman']">
                Andrew@Forbist.com
              </p>
            </div>
          </div>
          <div className="relative h-6 w-6 shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className={`transition-transform ${profileExpanded ? "rotate-180" : ""}`}
            >
              <path
                d="M7 10L12 15L17 10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
