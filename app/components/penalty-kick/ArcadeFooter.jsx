"use client";

import Image from "next/image";
import { COLORS, NAV_ICONS } from "./constants";

// Arcade-themed bottom nav strip from Figma node 614:110. The "Union"
// background is a single SVG with a half-circle cutout at the centre —
// the HOME icon is sized larger (64px) and elevated so it pops out of
// the cutout while the four side items sit flat against the bezel.
//
// Currently decorative — every tap calls the parent's handler so the
// page can wire real routes later (Leaderboard / Hot list / etc).
// Defaults are no-ops so the footer renders fine without props.
function NavItem({ icon, label, size = 40, labelSize = 8, labelWidth, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-end gap-1 active:scale-95 transition-transform"
      style={{ background: "transparent", border: "none", padding: 0 }}
    >
      <span
        aria-hidden="true"
        className="relative block"
        style={{ width: size, height: size }}
      >
        <Image
          src={icon}
          alt=""
          width={size}
          height={size}
          className="select-none object-contain"
          draggable={false}
          unoptimized
        />
      </span>
      <span
        className="block text-center font-bold leading-none"
        style={{
          fontFamily: "'Times New Roman', Times, serif",
          color: COLORS.navGold,
          fontSize: labelSize,
          width: labelWidth,
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function ArcadeFooter({
  onLeaderboard,
  onHot,
  onHome,
  onProfile,
  onLivechat,
}) {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
      style={{ height: 100 }}
    >
      {/* Union bezel — fills the whole strip plus a 7-px overshoot at the
          top so the elevated HOME icon sits inside the curved cutout. */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0"
        style={{ top: -7, height: 107 }}
      >
        <img
          src={NAV_ICONS.unionBezel}
          alt=""
          className="block h-full w-full select-none"
          draggable={false}
        />
      </div>

      {/* Nav items — pointer-events re-enabled here so the bezel above
          doesn't block taps. items-end so the side icons sit flush at the
          bottom while the elevated HOME pushes up via larger size. */}
      <div
        className="pointer-events-auto relative flex h-full items-end justify-between px-4 pt-1 pb-4"
      >
        <NavItem
          icon={NAV_ICONS.leaderboard}
          label="LEADERBOARD"
          labelWidth={70}
          onClick={onLeaderboard}
        />
        <NavItem
          icon={NAV_ICONS.hot}
          label="HOT"
          labelWidth={37}
          onClick={onHot}
        />
        <NavItem
          icon={NAV_ICONS.home}
          label="HOME"
          size={64}
          labelSize={10}
          labelWidth={92}
          onClick={onHome}
        />
        <NavItem
          icon={NAV_ICONS.profile}
          label="PROFILE"
          labelWidth={62}
          onClick={onProfile}
        />
        <NavItem
          icon={NAV_ICONS.livechat}
          label="LIVECHAT"
          labelWidth={58}
          onClick={onLivechat}
        />
      </div>
    </div>
  );
}
