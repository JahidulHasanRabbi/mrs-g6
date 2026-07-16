"use client";

import { COLORS, ICONS } from "./constants";
import { usePkColors } from "./usePkColors";
import { ACEBET_ASSETS } from "../themes/acebet77/assets";

// Header bar from Figma node 1134:3893. The title is rendered in the Anybody
// Bold variable face at 32px with the signature green tint + 2px black drop
// shadow so it reads against the bright stadium photo behind it. Two PNG
// icon chips sit to the right — gold-bordered (i) info badge and the
// arcade-style hamburger bars. PNGs (not SVG masks) so the embedded gold
// gradient + inner shadow render as designed.
function IconButton({ src, onClick, label, imgStyle }) {
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
        style={{ objectFit: "contain", ...imgStyle }}
        draggable={false}
      />
    </button>
  );
}

export default function TopHud({ onInfoClick, onMenuClick, onNavMenuClick }) {
  const { isAcebet77 } = usePkColors();

  // Acebet77 header (Figma 59:811): ornate gold hamburger left, gold info
  // badge right, no page title. History stays reachable via its gold flag.
  if (isAcebet77) {
    return (
      <div className="flex w-full items-center justify-between p-4">
        <IconButton src={ACEBET_ASSETS.ui.hamburger} onClick={onNavMenuClick} label="Navigation menu" />
        <div className="flex items-center gap-4">
          <IconButton
            src={ICONS.history}
            onClick={onMenuClick}
            label="History"
            imgStyle={{ filter: "brightness(0) saturate(100%) invert(74%) sepia(60%) saturate(500%) hue-rotate(5deg) brightness(105%)" }}
          />
          <IconButton src={ACEBET_ASSETS.ui.info} onClick={onInfoClick} label="Info" imgStyle={{ borderRadius: "9999px" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <IconButton src={ICONS.menu} onClick={onNavMenuClick} label="Navigation menu" />
        <h1
          className="whitespace-nowrap font-bold leading-none"
          style={{
            fontFamily: "'Anybody', 'Lexend', sans-serif",
            fontSize: "clamp(22px, 6.7vw, 32px)",
            letterSpacing: "-1.6px",
            color: COLORS.primary,
            textShadow: "0 2px 1px rgba(0,0,0,0.8)",
          }}
        >
          PENALTY KICK
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <IconButton src={ICONS.info} onClick={onInfoClick} label="Info" />
        <IconButton
          src={ICONS.history}
          onClick={onMenuClick}
          label="History"
          imgStyle={{ filter: "brightness(0) saturate(100%) invert(74%) sepia(60%) saturate(500%) hue-rotate(5deg) brightness(105%)" }}
        />
      </div>
    </div>
  );
}
