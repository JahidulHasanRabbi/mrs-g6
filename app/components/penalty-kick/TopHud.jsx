"use client";

import { COLORS, ICONS } from "./constants";
import { usePkColors } from "./usePkColors";

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
  const { theme } = usePkColors();

  // Themed header: ornate hamburger + the "PENALTY KICK" title (parity with the
  // default portal's header), info badge + history flag on the right. The title
  // matches the shared ThemeHeader (Acme 22px gold) so every themed game header
  // reads consistently.
  if (theme) {
    return (
      <div className="flex w-full items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <IconButton src={theme.assets.ui.hamburger} onClick={onNavMenuClick} label="Navigation menu" />
          {theme.iconBall && (
            <span className="grid h-[24px] w-[24px] place-items-center">
              <img src={theme.iconBall} alt="" className="h-[24px] w-[24px] object-contain select-none" draggable={false} />
            </span>
          )}
          <h1
            className="whitespace-nowrap uppercase leading-none"
            style={{
              fontFamily: "var(--font-acme), 'Acme', sans-serif",
              fontSize: 22,
              letterSpacing: "-1px",
              color: "#ffd700",
              textShadow: "0 2px 6px rgba(0,0,0,0.75)",
            }}
          >
            PENALTY KICK
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <IconButton
            src={ICONS.history}
            onClick={onMenuClick}
            label="History"
            imgStyle={{ filter: "brightness(0) saturate(100%) invert(74%) sepia(60%) saturate(500%) hue-rotate(5deg) brightness(105%)" }}
          />
          <IconButton src={theme.assets.ui.info} onClick={onInfoClick} label="Info" imgStyle={{ borderRadius: "9999px" }} />
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
