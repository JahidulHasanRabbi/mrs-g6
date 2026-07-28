"use client";

import { LV918_ASSETS } from "./assets";

/**
 * Lv918 ornate dialog card — the single Figma frame (154:166 dialog frame)
 * rendered as ONE image (background), not a sliced 3-part frame.
 *
 * The frame's interior is a LIGHT castle-cloud scene, but the shared dialogs
 * that render inside it (GoalDialog / FailDialog / InfoDialog / the spin + egg
 * result cards) use light text — matching acebet's DARK frame interior. So a
 * dark rounded scrim is laid over the interior (mirroring the dark reward panel
 * in Figma 154:166), giving that light text the contrast it needs. A fixed
 * aspect keeps the ornate gems from distorting; content scrolls if it overflows.
 */
export default function Lv918OrnateCard({ children, className = "" }) {
  return (
    <div
      className={`relative mx-auto aspect-[3/2] w-full max-w-[360px] ${className}`}
      style={{
        backgroundImage: `url(${LV918_ASSETS.ui.dialogFrame})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Frosted blue glass inside the ornate border → the cloud interior shows
          through, muted enough for the dialogs' light text to read. */}
      <div className="absolute inset-x-[12.5%] top-[22%] bottom-[16%] overflow-hidden rounded-[14px] ring-1 ring-inset ring-[rgba(242,203,122,0.35)]">
        <div className="absolute inset-0 bg-[rgba(18,38,74,0.44)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[5px]" />
        <div className="relative flex h-full flex-col items-center justify-center overflow-y-auto px-3 py-2 text-center scrollbar-lv918">
          {children}
        </div>
      </div>
    </div>
  );
}
