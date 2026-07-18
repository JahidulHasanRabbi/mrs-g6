"use client";

import { LV918_ASSETS } from './assets';

/**
 * Lv918 ornate list/terms panel (Figma 154:692). The wide pink+gold frame is
 * the background behind the Winning Record / Winning List / Prize List / Winner
 * / Terms sections. Section titles render OUTSIDE the frame
 * (Lv918SectionHeading). Content scrolls directly on the frame's light-pink
 * interior — no dark scrim — so callers must use dark-rose text for legibility.
 */
export default function Lv918ListPanel({ children, height = 300, className = '' }) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[360px] ${className}`}
      style={{
        height,
        backgroundImage: `url(${LV918_ASSETS.spin.listPanel})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Content sits inside the ornate border (clears the crown + side gems),
          directly on the pink interior. */}
      <div className="absolute inset-x-[15%] top-[21%] bottom-[16%] overflow-hidden rounded-[12px]">
        <div className="h-full overflow-y-auto px-2.5 py-2 [scrollbar-color:rgba(146,64,102,0.55)_transparent] [scrollbar-width:thin]">
          {children}
        </div>
      </div>
    </div>
  );
}
