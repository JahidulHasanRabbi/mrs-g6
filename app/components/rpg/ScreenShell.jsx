"use client";

// Shared chrome for the in-game screens (everything after hero creation):
// damask backdrop + ambient glows, fixed RpgTopBar, HUD strip, a scrollable
// content column, and the RPG bottom nav. Screens render inside as children;
// AnimatePresence crossfades between views.

import { motion } from "framer-motion";
import RpgTopBar from "./RpgTopBar";
import HudStrip from "./HudStrip";
import RpgNav from "./RpgNav";
import { RPG_IMAGES } from "./rpgAssets";

export default function ScreenShell({
  view,
  profile,
  onNavigate,
  onInfoClick,
  onMenuClick,
  hideHud = false,
  // Optional full-bleed backdrop (e.g. the battle arena). When set it covers
  // the whole shell — behind the top bar and HUD too — so the scene reads as
  // one image instead of the damask showing through above the content.
  backgroundImage,
  // `fit`: lock the screen to exactly one viewport (no page scroll) and let
  // the content flex to fit. Used by the battle screen so the ATTACK button
  // is always on-screen. Other screens keep min-height + normal scrolling.
  fit = false,
  children,
}) {
  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden ${fit ? "h-[100dvh]" : "min-h-[100dvh]"}`}
      style={{ background: "#07130d" }}
    >
      {/* Backdrop: damask tile + the design's ambient colour glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(${RPG_IMAGES.bg})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 22% at 88% 22%, rgba(167,139,250,0.18) 0%, rgba(167,139,250,0) 70%), radial-gradient(45% 25% at 10% 88%, rgba(47,230,200,0.14) 0%, rgba(47,230,200,0) 70%), radial-gradient(35% 18% at 15% 8%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      {backgroundImage && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(4,6,20,0.35)" }} />
        </>
      )}

      <RpgTopBar onInfoClick={onInfoClick} onMenuClick={onMenuClick} />

      {/* Content column between the fixed bars */}
      <div className={`relative z-10 flex w-full flex-1 flex-col pt-[64px] pb-[92px] ${fit ? "min-h-0" : ""}`}>
        {!hideHud && <HudStrip profile={profile} />}
        {/* Keyed remount, enter-only fade. Deliberately NOT AnimatePresence
            mode="wait": waiting on an exit animation stalls the screen swap
            entirely in rAF-throttled (backgrounded) tabs. */}
        <motion.div
          key={view}
          className={`flex w-full flex-1 flex-col ${fit ? "min-h-0" : ""}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>

      <RpgNav view={view} onNavigate={onNavigate} />
    </div>
  );
}
