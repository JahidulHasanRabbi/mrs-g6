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
  children,
}) {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden" style={{ background: "#07130d" }}>
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

      <RpgTopBar onInfoClick={onInfoClick} onMenuClick={onMenuClick} />

      {/* Content column between the fixed bars */}
      <div className="relative z-10 flex w-full flex-1 flex-col pt-[64px] pb-[92px]">
        {!hideHud && <HudStrip profile={profile} />}
        {/* Keyed remount, enter-only fade. Deliberately NOT AnimatePresence
            mode="wait": waiting on an exit animation stalls the screen swap
            entirely in rAF-throttled (backgrounded) tabs. */}
        <motion.div
          key={view}
          className="flex w-full flex-1 flex-col"
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
