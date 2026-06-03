"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { FooterNav } from "../../components/footer";
import { HamburgerMenu } from "../../components/hamburger";
import MissionCard from "../../components/penalty-kick/missions/MissionCard";
import MissionsHeader from "../../components/penalty-kick/missions/MissionsHeader";
import GoldButton from "../../components/penalty-kick/missions/GoldButton";
import {
  MISSIONS,
  MISSION_TABS,
  MISSION_COLORS,
} from "../../components/penalty-kick/missions/data";
import { useUser } from "../../contexts/UserContext";
import { HOME_ASSETS } from "../../components/home/homeAssets";

const TOKEN_ICON = "/assets/penalty-kick/missions/token-icon.svg";
const HISTORY_ICON = "/assets/penalty-kick/missions/icon-history.svg";
const TAB_FRAME = "/assets/penalty-kick/missions/tab-active.png";

const SERIF = '"Times New Roman", serif';

const TAB_IDS = MISSION_TABS.map((t) => t.id);

// Horizontal slide for the mission list — enters from the side the new tab
// sits on relative to the old one, exits to the opposite side. `custom` feeds
// the signed direction into the variants.
const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir >= 0 ? -32 : 32, opacity: 0 }),
};

function formatTokens(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "2,450";
  return Math.round(value).toLocaleString("en-US");
}

export default function MissionsPage() {
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState("daily");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Sign of the last tab move (+1 → moved right, -1 → moved left) so the
  // content can slide in the matching direction.
  const [direction, setDirection] = useState(0);
  // Track claimed missions locally so the completed card flips to "Claimed".
  // A real implementation would POST the claim and refresh server balance.
  const [claimed, setClaimed] = useState(() => new Set());

  const changeTab = (id) => {
    if (id === activeTab) return;
    setDirection(Math.sign(TAB_IDS.indexOf(id) - TAB_IDS.indexOf(activeTab)));
    setActiveTab(id);
  };

  const balance = formatTokens(userData?.balance);

  const visibleMissions = useMemo(
    () =>
      MISSIONS.filter((m) => m.tab === activeTab).map((m) => ({
        ...m,
        claimed: claimed.has(m.id),
      })),
    [activeTab, claimed],
  );

  const handleClaim = (id) =>
    setClaimed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col"
      style={{
        // Deep-green base + the shared VIP floral pattern, matching the Figma
        // backdrop. Same asset the rest of the member portal uses, fixed so it
        // stays put while the mission list scrolls.
        backgroundColor: MISSION_COLORS.bg,
        backgroundImage: `url(${HOME_ASSETS.backgroundPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Top HUD bar (gold "Missions" + info / menu chips) from the Figma
          "Missions Hub" frame. The hamburger opens the shared member nav. */}
      <MissionsHeader
        onInfoClick={() => {}}
        onMenuClick={() => setIsMenuOpen(true)}
      />

      {/* pb clears the fixed 100px FooterNav. */}
      <div className="flex flex-col gap-6 px-5 pb-32 pt-2">
        {/* ── Section header ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <h2
                className="font-bold leading-[28.8px]"
                style={{ fontFamily: SERIF, color: MISSION_COLORS.title, fontSize: 24 }}
              >
                Missions
              </h2>
              <p
                className="leading-[24px]"
                style={{ fontFamily: SERIF, color: MISSION_COLORS.muted, fontSize: 16 }}
              >
                Complete tasks for huge rewards
              </p>
            </div>

            {/* Token balance pill */}
            <div
              className="flex shrink-0 items-center justify-center gap-2 rounded-full px-[9px] py-[5px]"
              style={{
                backgroundColor: MISSION_COLORS.pillFill,
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 0 7.5px rgba(255,221,116,0.3)",
              }}
            >
              <img
                src={TOKEN_ICON}
                alt=""
                aria-hidden="true"
                style={{ width: 18.33, height: 13.33 }}
              />
              <span
                className="leading-[24px]"
                style={{ fontFamily: SERIF, color: MISSION_COLORS.gold, fontSize: 16 }}
              >
                {balance}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex items-center gap-1 rounded-[12px] p-[5px] backdrop-blur-[6px]"
            style={{
              backgroundColor: MISSION_COLORS.tabsFill,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {MISSION_TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => changeTab(tab.id)}
                  className="relative grid h-[54px] min-w-0 flex-1 place-items-center rounded-[8px] px-1"
                >
                  {isActive && (
                    // Shared-layout element: framer slides the same frame from
                    // the previous tab's slot to this one when the active tab
                    // changes (all tabs are equal width, so it's a clean
                    // horizontal glide with no distortion).
                    <motion.img
                      layoutId="missionTabFrame"
                      src={TAB_FRAME}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full select-none"
                      style={{ objectFit: "fill" }}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span
                    className={`relative z-10 whitespace-nowrap leading-[24px] ${isActive ? "font-bold" : ""}`}
                    style={{
                      fontFamily: SERIF,
                      // Scale with viewport so the longest label ("Challenge")
                      // stays inside the ornate active frame on narrow phones;
                      // caps at the 16px design size on the 475 layout.
                      fontSize: "clamp(11px, 3.4vw, 16px)",
                      color: isActive ? MISSION_COLORS.goldText : MISSION_COLORS.muted,
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mission cards ────────────────────────────────────────── */}
        {/* overflow-x-clip keeps the off-screen enter/exit slide from spawning
            a horizontal scrollbar. */}
        <div className="relative overflow-x-clip">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              {visibleMissions.length > 0 ? (
                visibleMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} onClaim={handleClaim} />
                ))
              ) : (
                <p
                  className="py-10 text-center leading-[24px]"
                  style={{ fontFamily: SERIF, color: MISSION_COLORS.muted, fontSize: 16 }}
                >
                  No missions available yet — check back soon.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── History button ───────────────────────────────────────── */}
        <div className="flex justify-center pt-4">
          <div className="w-full max-w-[254px]">
            <GoldButton>
              <img
                src={HISTORY_ICON}
                alt=""
                aria-hidden="true"
                style={{ width: 15, height: 15 }}
              />
              Mission Progress History
            </GoldButton>
          </div>
        </div>
      </div>

      <FooterNav />

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
