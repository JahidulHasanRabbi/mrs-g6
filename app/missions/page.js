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
import { useTheme } from "../contexts/ThemeContext";
import ThemedPageShell from "../components/themes/shared/ThemedPageShell";
import ThemedActionButton from "../components/themes/shared/ThemedActionButton";
import { HOME_ASSETS } from "../components/home/homeAssets";
import {
  claimMissionReward,
  getMissionProgressHistory,
  getMyMissions,
  joinMission,
  getFeatureStatus,
  getPublicTermsAndConditions,
} from "../api/memberApi";
import {
  MISSION_CATEGORY_BY_TAB,
  MISSION_TAB_BY_CATEGORY,
} from "../config/missionOptions";

const TOKEN_ICON = "/assets/penalty-kick/missions/token-icon.svg";
const HISTORY_ICON = "/assets/penalty-kick/missions/icon-history.svg";
const TAB_FRAME = "/assets/penalty-kick/missions/tab-active.png";

const SERIF = '"Times New Roman", serif';
const MISSION_TERMS_CATEGORY = 10;

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
      total: row.accumulate_target ?? row.target_value ?? 0,
    },
    status: missionStatus(row),
    joined: !!row.joined,
    claimed: row.status === 3,
    description: row.description,
    _raw: row,
  };
}

function MissionCardSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-4 rounded-[12px] p-[17px] animate-pulse"
      style={{
        backgroundColor: MISSION_COLORS.cardFill,
        border: `1px solid ${MISSION_COLORS.cardBorder}`,
      }}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex items-start gap-4">
          <div className="size-12 shrink-0 rounded-[8px]" style={{ backgroundColor: MISSION_COLORS.iconChip }} />
          <div className="flex flex-col gap-2 pt-1">
            <div className="h-4 w-36 rounded" style={{ backgroundColor: MISSION_COLORS.iconChip }} />
            <div className="h-3 w-24 rounded" style={{ backgroundColor: MISSION_COLORS.iconChip }} />
          </div>
        </div>
        <div className="h-5 w-14 rounded" style={{ backgroundColor: MISSION_COLORS.iconChip }} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="h-3 w-16 rounded" style={{ backgroundColor: MISSION_COLORS.iconChip }} />
          <div className="h-3 w-12 rounded" style={{ backgroundColor: MISSION_COLORS.iconChip }} />
        </div>
        <div className="h-2 w-full rounded-full" style={{ backgroundColor: MISSION_COLORS.track }} />
      </div>
      <div className="h-10 w-full rounded-[8px]" style={{ backgroundColor: MISSION_COLORS.iconChip }} />
    </div>
  );
}

function MissionTermsDialog({ loading, termsText, error, onClose }) {
  const lines = String(termsText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-5 backdrop-blur-[6px]" onClick={onClose}>
      <div
        className="w-full max-w-[360px] rounded-[16px] border px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.5)]"
        style={{
          backgroundColor: "rgba(7,25,13,0.96)",
          borderColor: "rgba(233,175,65,0.45)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mb-4 rounded-[8px] px-4 py-2 text-center text-[15px] font-bold uppercase"
          style={{
            backgroundColor: "rgba(233,175,65,0.14)",
            color: MISSION_COLORS.gold,
            fontFamily: SERIF,
          }}
        >
          Terms & Conditions
        </div>

        {loading ? (
          <p className="py-8 text-center text-[14px]" style={{ color: MISSION_COLORS.muted, fontFamily: SERIF }}>
            Loading terms...
          </p>
        ) : error ? (
          <p className="py-8 text-center text-[14px] text-red-200" style={{ fontFamily: SERIF }}>
            {error}
          </p>
        ) : lines.length === 0 ? (
          <p className="py-8 text-center text-[14px]" style={{ color: MISSION_COLORS.muted, fontFamily: SERIF }}>
            No terms and conditions available.
          </p>
        ) : (
          <ol className="max-h-[52dvh] list-decimal space-y-2 overflow-y-auto pl-5 pr-1 text-[14px] leading-6" style={{ color: MISSION_COLORS.muted, fontFamily: SERIF }}>
            {lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        )}

        <div className="mt-5 flex w-full justify-center">
          <ThemedActionButton
            textSize={15}
            onClick={onClose}
            fallback={
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[10px] py-3 text-[15px] font-bold uppercase text-black"
                style={{
                  backgroundImage: "linear-gradient(90deg, #ffe77a 0%, #e9af41 100%)",
                  fontFamily: SERIF,
                }}
              >
                Close
              </button>
            }
          >
            Close
          </ThemedActionButton>
        </div>
      </div>
    </div>
  );
}

export default function MissionsPage() {
  const { userData, refreshUserData } = useUser();
  // On a theme, the whole page is wrapped in the themed shell (themed header +
  // lucky-spin background + themed bottom nav), so its own header/bg/footer are
  // suppressed below.
  const { isThemed } = useTheme();
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
  const [maintenance, setMaintenance] = useState(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [termsError, setTermsError] = useState("");
  const isMaintenance = maintenance === true;

  const changeTab = (id) => {
    if (id === activeTab) return;
    setDirection(Math.sign(TAB_IDS.indexOf(id) - TAB_IDS.indexOf(activeTab)));
    setActiveTab(id);
  };

  const balance = formatTokens(userData?.balance);

  const loadMissions = () => {
    if (maintenance !== false) return;
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
    getFeatureStatus()
      .then((s) => setMaintenance(Number(s?.mission) === 2))
      .catch(() => setMaintenance(false));
  }, []);

  useEffect(() => {
    if (maintenance !== false) return;
    loadMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, maintenance]);

  useEffect(() => {
    if (!isMaintenance || typeof document === "undefined") return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo({ top: 0, left: 0 });
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isMaintenance]);

  const visibleMissions = useMemo(
    () => missions.filter((m) => m.tab === activeTab),
    [activeTab, missions],
  );

  const handleJoin = async (id) => {
    if (isMaintenance) return;
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
    if (isMaintenance) return;
    setActionId(id);
    setError("");
    try {
      await claimMissionReward(id);
      loadMissions();
      refreshUserData?.().catch(() => {});
    } catch (err) {
      setError(err?.data?.detail || err?.message || "Failed to claim reward.");
    } finally {
      setActionId(null);
    }
  };

  const loadHistory = async () => {
    if (isMaintenance) return;
    setError("");
    try {
      const data = await getMissionProgressHistory({ page_size: 20 });
      setHistory(data.results ?? data ?? []);
    } catch (err) {
      setError(err?.data?.detail || err?.message || "Failed to load mission history.");
    }
  };

  const openTerms = async () => {
    setTermsOpen(true);
    if (termsText || termsLoading) return;
    setTermsLoading(true);
    setTermsError("");
    try {
      const data = await getPublicTermsAndConditions(MISSION_TERMS_CATEGORY);
      setTermsText(data?.terms_and_conditions || "");
    } catch (err) {
      setTermsError(err?.data?.detail || err?.message || "Failed to load terms and conditions.");
    } finally {
      setTermsLoading(false);
    }
  };

  const page = (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col"
      style={
        isThemed
          ? undefined
          : {
              // Deep-green base + the shared VIP floral pattern, matching the
              // Figma backdrop. Same asset the rest of the member portal uses,
              // fixed so it stays put while the mission list scrolls.
              backgroundColor: MISSION_COLORS.bg,
              backgroundImage: `url(${HOME_ASSETS.backgroundPattern})`,
              backgroundSize: "cover",
              backgroundPosition: "top center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }
      }
    >
      {/* Top HUD bar (gold "Missions" + info / menu chips) from the Figma
          "Missions Hub" frame. The hamburger opens the shared member nav. */}
      {!isThemed && (
        <MissionsHeader
          onInfoClick={openTerms}
          onMenuClick={() => setIsMenuOpen(true)}
        />
      )}

      {/* pb clears the fixed 100px FooterNav. */}
      <div className="flex flex-col gap-6 px-5 pb-32 pt-2">
        {/* ── Section header ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <h2
                className="font-bold leading-[28.8px]"
                style={{ fontFamily: SERIF, color: "var(--lb-heading)", fontSize: 24, textShadow: "var(--lb-heading-shadow, none)" }}
              >
                Missions
              </h2>
              <p
                className="leading-[24px]"
                style={{ fontFamily: SERIF, color: "var(--lb-heading-muted)", fontSize: 16, textShadow: "var(--lb-heading-shadow, none)" }}
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
                      fontSize: "clamp(11px, 3.4vw, 16px)",
                      color: isActive ? "var(--lb-tab-active)" : "var(--lb-tab-inactive, #BBCBBB)",
                      textShadow: isActive ? "none" : "var(--lb-heading-shadow, none)",
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
                Array.from({ length: 3 }).map((_, i) => <MissionCardSkeleton key={i} />)
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
                  style={{ fontFamily: SERIF, color: "var(--lb-heading-muted)", fontSize: 16, textShadow: "var(--lb-heading-shadow, none)" }}
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
            <ThemedActionButton
              textSize={14}
              onClick={loadHistory}
              fallback={
                <GoldButton onClick={loadHistory}>
                  <img
                    src={HISTORY_ICON}
                    alt=""
                    aria-hidden="true"
                    style={{ width: 15, height: 15 }}
                  />
                  Mission Progress History
                </GoldButton>
              }
            >
              Mission Progress History
            </ThemedActionButton>
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

      {!isThemed && <FooterNav />}

      {!isThemed && (
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}

      {termsOpen && (
        <MissionTermsDialog
          loading={termsLoading}
          termsText={termsText}
          error={termsError}
          onClose={() => setTermsOpen(false)}
        />
      )}

      {isMaintenance && (
        <div className="fixed inset-x-0 top-[56px] bottom-[100px] z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div
            className="w-full max-w-[360px] rounded-[16px] border border-white/15 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
            style={{ backgroundColor: "rgba(7,25,13,0.95)" }}
          >
            <p
              className="text-[20px] font-bold"
              style={{ color: MISSION_COLORS.goldDeep, fontFamily: "'Lexend', sans-serif" }}
            >
              Missions are under maintenance
            </p>
            <p
              className="mt-3 text-[12px] leading-5"
              style={{ color: MISSION_COLORS.muted, fontFamily: "'Lexend', sans-serif" }}
            >
              Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // The info chip lives in the themed header; wire it to the same terms dialog.
  if (isThemed) {
    return (
      <ThemedPageShell onInfoClick={openTerms} balance={userData?.balance}>
        {page}
      </ThemedPageShell>
    );
  }
  return page;
}
