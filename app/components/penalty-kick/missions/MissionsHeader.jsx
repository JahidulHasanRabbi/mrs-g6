"use client";

import { MISSION_COLORS } from "./data";

// Top HUD bar from the Figma "Missions Hub" frame (633:1207): sidebar menu on
// the left, gold title, and the gold-rimmed info badge on the right.
const INFO_ICON = "/assets/penalty-kick/icons/info-badge.webp";
const MENU_ICON = "/assets/penalty-kick/icons/menu-bars.webp";

function IconButton({ src, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center transition-transform active:scale-95"
      style={{ background: "transparent", border: "none", padding: 0 }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="block h-9 w-9 select-none"
        style={{ objectFit: "contain" }}
        draggable={false}
      />
    </button>
  );
}

export default function MissionsHeader({ onInfoClick, onMenuClick }) {
  return (
    <div className="flex w-full items-center justify-between px-5 pb-1 pt-4">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton src={MENU_ICON} onClick={onMenuClick} label="Menu" />
        <h1
          className="min-w-0 truncate font-bold leading-none"
          style={{
            fontFamily: '"Times New Roman", serif',
            // Caps at the design size on the 475 layout, shrinks on narrow phones.
            fontSize: "clamp(24px, 7vw, 30px)",
            color: MISSION_COLORS.gold,
            textShadow: "0 2px 1px rgba(0,0,0,0.6)",
          }}
        >
          Missions
        </h1>
      </div>
      <IconButton src={INFO_ICON} onClick={onInfoClick} label="Mission info" />
    </div>
  );
}
