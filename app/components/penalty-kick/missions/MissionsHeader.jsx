"use client";

import { MISSION_COLORS } from "./data";

// Top HUD bar from the Figma "Missions Hub" frame (633:1207): a gold "Missions"
// title with the gold-rimmed (i) info badge and the arcade hamburger on the
// right. Reuses the same PNG chips the Penalty Kick game's TopHud uses so the
// two screens share one icon language.
const INFO_ICON = "/assets/penalty-kick/icons/info-badge.png";
const MENU_ICON = "/assets/penalty-kick/icons/menu-bars.png";

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
      <h1
        className="font-bold leading-none"
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
      <div className="flex items-center gap-4">
        <IconButton src={INFO_ICON} onClick={onInfoClick} label="Mission info" />
        <IconButton src={MENU_ICON} onClick={onMenuClick} label="Menu" />
      </div>
    </div>
  );
}
