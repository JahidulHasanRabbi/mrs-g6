"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import MissionCard from "../components/penalty-kick/missions/MissionCard";
import MissionsHeader from "../components/penalty-kick/missions/MissionsHeader";
import GoldButton from "../components/penalty-kick/missions/GoldButton";
import {
  MISSION_TABS,
  MISSION_COLORS,
} from "../components/penalty-kick/missions/data";
import { useUser } from "../contexts/UserContext";
import { HOME_ASSETS } from "../components/home/homeAssets";
import {
  claimMissionReward,
  getMissionProgressHistory,
  getMyMissions,
  joinMission,
} from "../api/memberApi";
import {
  MISSION_CATEGORY_BY_TAB,
  MISSION_TAB_BY_CATEGORY,
} from "../config/missionOptions";

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
  if (value === null || value === undefined || value === "") return "0.00";
  const numeric = typeof value === "number"
    ? value
    : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return "0.00";
  return numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function iconForAction(action) {
  if (action === 2 || action === 7 || action === 9) return "star";
  if (action === 3 || action === 4 || action === 6) return "target";
  return "bolt";
}

function missionStatus(row) {
  if (!row.joined) return "not-joined";
  if (row.status === 3) return "claimed";
  if (row.status === 2) return "completed";
  return "in-progress";
}

function mapMission(row) {
  return {
    id: row.uuid,
    tab: MISSION_TAB_BY_CATEGORY[row.category] ?? "daily",
    icon: iconForAction(row.condition_action),
    title: row.mission_name,
    reward: row.reward_token_quantity ?? 0,
    badge: MISSION_TAB_BY_CATEGORY[row.category] ?? "",
    progress: {
      current: row.current_value ?? 0,
      total: row.accumulate_target ?? 0,
    },
    status: missionStatus(row),
    joined: !!row.joined,
    claimed: row.status === 3,
    description: row.description,
    _raw: row,
  };
}

export default function MissionsPage() {
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState("daily");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Sign of the last tab move (+1 → moved right, -1 → moved left) so the
  // content can slide in the matching direction.
  const [direction, setDirection] = useState(0);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(null);

  const changeTab = (id) => {
    if (id === activeTab) return;
    setDirection(Math.sign(TAB_IDS.indexOf(id) - TAB_IDS.indexOf(activeTab)));
    setActiveTab(id);
  };

  const balance = formatTokens(userData?.balance);

  const loadMissions = () => {
    setLoading(true);
    setError("");
    getMyMissions({ category: MISSION_CATEGORY_BY_TAB[activeTab], page_size: 100 })
      .then((data) => {
        const rows = data.results ?? data ?? [];
        setMissions(rows.map(mapMission));
      })
      .catch((err) => {
        setError(err?.data?.detail || err?.message || "Failed to load missions.");
        setMissions([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const visibleMissions = useMemo(
    () => missions.filter((m) => m.tab === activeTab),
    [activeTab, missions],
  );

  const handleJoin = async (id) => {
    setActionId(id);
    setError("");
    try {
      await joinMission(id);
      loadMissions();
    } catch (err) {
      setError(err?.data?.detail || err?.message || "Failed to join mission.");
    } finally {
      setActionId(null);
    }
  };

  const handleClaim = async (id) => {
    setActionId(id);
    setError("");
    try {
      await claimMissionReward(id);
      loadMissions();
    } catch (err) {
      setError(err?.data?.detail || err?.message || "Failed to claim reward.");
    } finally {
      setActionId(null);
    }
  };

  const loadHistory = async () => {
    setError("");
    try {
      const data = await getMissionProgressHistory({ page_size: 20 });
      setHistory(data.results ?? data ?? []);
    } catch (err) {
      setError(err?.data?.detail || err?.message || "Failed to load mission history.");
    }
  };

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
          {error && (
            <p className="mb-3 rounded-[8px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-[13px] text-red-200">
              {error}
            </p>
          )}
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
              {loading ? (
                <p
                  className="py-10 text-center leading-[24px]"
                  style={{ fontFamily: SERIF, color: MISSION_COLORS.muted, fontSize: 16 }}
                >
                  Loading missions...
                </p>
              ) : visibleMissions.length > 0 ? (
                visibleMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onJoin={handleJoin}
                    onClaim={handleClaim}
                    actionLoading={actionId === mission.id}
                  />
                ))
              ) : (
                <p
                  className="py-10 text-center leading-[24px]"
                  style={{ fontFamily: SERIF, color: MISSION_COLORS.muted, fontSize: 16 }}
                >
                  No missions available yet - check back soon.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── History button ───────────────────────────────────────── */}
        <div className="flex justify-center pt-4">
          <div className="w-full max-w-[254px]">
            <GoldButton onClick={loadHistory}>
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
        {history && (
          <div className="rounded-[12px] border border-white/10 bg-white/[0.04] p-4">
            <h3 className="mb-3 text-[16px]" style={{ fontFamily: SERIF, color: MISSION_COLORS.title }}>
              Mission Progress History
            </h3>
            {history.length === 0 ? (
              <p className="text-[14px]" style={{ fontFamily: SERIF, color: MISSION_COLORS.muted }}>
                No claimed mission rewards yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((item) => (
                  <div key={item.uuid} className="flex items-center justify-between gap-3 rounded-[8px] bg-black/20 px-3 py-2">
                    <span className="min-w-0 truncate text-[14px]" style={{ fontFamily: SERIF, color: MISSION_COLORS.title }}>
                      {item.mission_name}
                    </span>
                    <span className="shrink-0 text-[14px]" style={{ fontFamily: SERIF, color: MISSION_COLORS.gold }}>
                      {Number(item.token_amount ?? 0).toLocaleString("en-US")} Tokens
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <FooterNav />

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
