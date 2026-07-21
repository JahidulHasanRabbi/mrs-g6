"use client";

import { KGAME99_ASSETS } from './assets';

/**
 * Kgame99 ornate list/terms panel (Figma 154:692). The wide silver-gold frame
 * with a castle-cloud interior is the background behind the Winning Record /
 * Winning List / Prize List / Winner / Terms sections. Section titles render
 * OUTSIDE the frame (KgameSectionHeading); here a dark rounded scrim is laid
 * over the busy cloud interior so the light gold/cream row text (Penalty-Kick
 * styling) stays legible. Content scrolls inside the scrim.
 */
export default function KgameListPanel({ children, height = 300, className = '' }) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[360px] ${className}`}
      style={{
        height,
        backgroundImage: `url(${KGAME99_ASSETS.spin.listPanel})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Frosted blue glass inside the ornate border (clears the crown + side
          gems) — translucent so the castle-cloud interior still shows through,
          just muted enough for the light gold/cream text to read. Without the
          dark fill the bright cloud interior swallowed the celestial text. */}
      <div className="absolute inset-x-[15%] top-[21%] bottom-[16%] overflow-hidden rounded-[12px] ring-1 ring-inset ring-[rgba(242,203,122,0.30)]">
        <div
          className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
          style={{ background: 'linear-gradient(180deg, rgba(7,22,42,0.78) 0%, rgba(11,42,74,0.72) 100%)', backdropFilter: 'blur(2px)' }}
        />
        <div className="relative h-full overflow-y-auto px-2.5 py-2 scrollbar-kgame99">
          {children}
        </div>
      </div>
    </div>
  );
}
