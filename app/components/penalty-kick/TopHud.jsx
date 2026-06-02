"use client";

import { COLORS, ICONS } from "./constants";

// Header bar from Figma node 1134:3893. The title is rendered in the Anybody
// Bold variable face at 32px with the signature green tint + 2px black drop
// shadow so it reads against the bright stadium photo behind it. Two PNG
// icon chips sit to the right — gold-bordered (i) info badge and the
// arcade-style hamburger bars. PNGs (not SVG masks) so the embedded gold
// gradient + inner shadow render as designed.
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

export default function TopHud({ onInfoClick, onMenuClick }) {
  return (
    <div className="flex w-full items-center justify-between p-4">
      <h1
        className="whitespace-nowrap font-bold leading-none"
        style={{
          fontFamily: "'Anybody', 'Lexend', sans-serif",
          // 32px at the 475 design width (32/475 ≈ 6.7vw); shrinks on
          // narrow phones so the title stays on one line instead of
          // wrapping to "PENALTY / KICK".
          fontSize: "clamp(22px, 6.7vw, 32px)",
          letterSpacing: "-1.6px",
          color: COLORS.primary,
          textShadow: "0 2px 1px rgba(0,0,0,0.8)",
        }}
      >
        PENALTY KICK
      </h1>
      <div className="flex items-center gap-4">
        <IconButton src={ICONS.info} onClick={onInfoClick} label="Info" />
        <IconButton src={ICONS.menu} onClick={onMenuClick} label="Menu" />
      </div>
    </div>
  );
}
