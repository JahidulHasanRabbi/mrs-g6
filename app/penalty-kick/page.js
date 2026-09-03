"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import PitchBackground from "../components/penalty-kick/PitchBackground";
import TopHud from "../components/penalty-kick/TopHud";
import TokenPills from "../components/penalty-kick/TokenPills";
// Use the global FooterNav so the bottom strip matches every other member
// page (Lucky Spin / Smash Egg / Home / Leaderboard / Livechat icons + the
// real routes + livechat handler). The earlier custom ArcadeFooter has
// been retired — keeping the same chrome avoids icon drift and gives users
// a working "back to Home" tap.
import { FooterNav } from "../components/footer";
import LoadingPhase from "../components/penalty-kick/LoadingPhase";
import LaunchPhase from "../components/penalty-kick/LaunchPhase";
import ReadyPhase from "../components/penalty-kick/ReadyPhase";
import KickingPhase from "../components/penalty-kick/KickingPhase";
import GoalDialog from "../components/penalty-kick/GoalDialog";
import FailDialog from "../components/penalty-kick/FailDialog";
import InfoDialog from "../components/penalty-kick/InfoDialog";
import TermsDialog from "../components/penalty-kick/TermsDialog";
import HistoryDialog from "../components/penalty-kick/HistoryDialog";

import { useSwipeGesture } from "../components/penalty-kick/useSwipeGesture";
import { useAudio } from "../components/penalty-kick/useAudio";
import { resolveSwipe } from "../components/penalty-kick/physics";
import { PHASES, DIALOGS, COLORS } from "../components/penalty-kick/constants";
import {
  getPublicTermsAndConditions,
  getPenaltyKickGameStatus,
  getPenaltyKickSettings,
  getKickHistory,
  getWorldCupProfile,
  kick,
  redeemAllKickRewards,
} from "../api/memberApi";
import { confirmNation } from "../components/leaderboard/worldcupApi";
import NationSelect from "../components/leaderboard/NationSelect";

import { tokenStorage } from "../api/tokenStorage";
import { useUser } from "../contexts/UserContext";
import { HamburgerMenu } from "../components/hamburger";
import { preloadGameAssets } from "../components/penalty-kick/assets";
import { usePkColors } from "../components/penalty-kick/usePkColors";
import { THEME_IDS } from "../config/themes";
import { lazySkins } from "../components/themes/skinRoute";
import { useGameSessionPing, GAME_SESSION_IDS } from "../hooks/useGameSessionPing";

// One chunk per skin, warmed at module scope — see lazySkins.
const NAVS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../components/themes/acebet77/AcebetBottomNav"),
  [THEME_IDS.UBETCLUB]: () => import("../components/themes/ubetclub/UbetclubBottomNav"),
  [THEME_IDS.EP369]: () => import("../components/themes/ep369/Ep369BottomNav"),
  [THEME_IDS.KGAME99]: () => import("../components/themes/kgame99/KgameBottomNav"),
  [THEME_IDS.LV918]: () => import("../components/themes/lv918/Lv918BottomNav"),
  [THEME_IDS.N1GANG]: () => import("../components/themes/n1gang/N1gangBottomNav"),
});

const HISTORY_PAGE_SIZE = 10;
const ITEM_TYPE_LABELS = {
  1: "FREE CREDIT",
  2: "KR COINS",
  3: "PRIZE",
  4: "WORLD CUP SCORE",
  5: "BATTLE POINT",
};

function itemTypeLabel(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return ITEM_TYPE_LABELS[Number(raw)] || raw.toUpperCase();
}

function hashString(value = "") {
  return String(value)
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

function isVisualOffTarget(resolved = {}) {
  const rawAim = Number(resolved.rawAim ?? resolved.aim ?? 0);
  const aim = Math.abs(Number(resolved.aim ?? 0));
  const power = Number(resolved.power ?? 0);
  const curl = Math.abs(Number(resolved.curl ?? 0));

  return Math.abs(rawAim) > 1.08 || (aim > 0.92 && power > 0.78 && curl > 0.35);
}

function parseTokenBalance(value) {
  if (typeof value === "number") return value;
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function aimToDirection(aim = 0) {
  if (aim < -0.33) return 1;
  if (aim > 0.33) return 3;
  return 2;
}

function directionToDive(direction) {
  if (Number(direction) === 1) return -1;
  if (Number(direction) === 3) return 1;
  return 0;
}

function mapKickResponse(response, resolved) {
  const result = response?.result;
  const isGoal = Number(result) === 1 || String(result || "").toLowerCase() === "goal";
  const offTarget = !isGoal && isVisualOffTarget(resolved);
  const direction = Number(response?.direction || aimToDirection(resolved?.aim));
  const ballZone = directionToDive(direction);
  const seed = hashString(response?.item_uuid || response?.reward_name || `${Date.now()}`);
  const keeperDive = isGoal
    ? ballZone === 0
      ? seed % 2 === 0 ? -1 : 1
      : -ballZone
    : offTarget
      ? 0
      : ballZone;
  const saveDelayMs = 160 + (seed % 140);
  const item = isGoal
    ? {
        uuid: response?.item_uuid,
        reward_name: response?.reward_name,
        item_type: itemTypeLabel(response?.item_type),
        image: response?.image,
        amount: response?.amount,
        credit_amount: response?.amount,
        battle_point_amount: response?.battle_point_amount ?? (itemTypeLabel(response?.item_type) === "BATTLE POINT" ? response?.amount : null),
      }
    : null;

  return {
    outcome: isGoal ? "goal" : offTarget ? "miss" : "save",
    reward: item,
    saveDelayMs,
    keeperDive,
    ballZone,
    offTarget,
    cost: response?.cost,
    myTokens: response?.my_tokens,
  };
}

function mapHistoryRow(row) {
  const amount = Number(row.amount ?? 0);
  return {
    id: row.uuid,
    outcome: "goal",
    amount: Number.isFinite(amount) ? amount : 0,
    claimed: false,
    label: row.reward_name || "Scored a goal",
    sub: itemTypeLabel(row.item_type) || "Tap to claim!",
  };
}

export default function PenaltyKickPage() {
  const router = useRouter();
  const { userData, refreshUserData } = useUser();
  const { colors: themeColors, themeId } = usePkColors();
  const ThemedNav = NAVS[themeId];
  // muted/toggleMuted destructured but unused — the Figma header dropped the
  // mute toggle. Audio still works (and respects the persisted-mute flag the
  // hook owns); the toggle can be reintroduced from a sub-menu later if needed.
  const { play, stop } = useAudio();
  useGameSessionPing(GAME_SESSION_IDS.PENALTY_KICK);

  const [phase, setPhase] = useState(PHASES.LOADING);
  const [dialog, setDialog] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [termsText, setTermsText] = useState(null);
  const [config, setConfig] = useState({
    tokensBalance: 24.0,
    tokenPerShot: 10.0,
    difficulty: "easy",
    enabled: true,
    maintenanceMode: false,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [swipeData, setSwipeData] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [reward, setReward] = useState(null);
  const [kickError, setKickError] = useState(null);
  const [kickErrorNeedsCountry, setKickErrorNeedsCountry] = useState(false);
  const [needsCountry, setNeedsCountry] = useState(false);
  const [countryConfirmError, setCountryConfirmError] = useState(null);
  const needsCountryRef = useRef(false);
  const pendingKickRef = useRef(false);

  // Reset the kick gate on unmount so re-mounting the page after
  // navigating away mid-animation never leaves it permanently locked.
  useEffect(() => () => { pendingKickRef.current = false; }, []);

  // Warm the keeper flipbook + ball into cache while the loading/launch
  // screens are up, so the first dive's per-frame <img> swaps are cache hits
  // instead of on-demand fetches that can't finish inside the 130ms frame
  // window on slow 4G (the cause of the keeper freezing / skipping frames).
  useEffect(() => {
    preloadGameAssets();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInitialData() {
      const memberUuid = tokenStorage.getMemberUuid();
      if (memberUuid) {
        try {
          const status = await getPenaltyKickGameStatus();
          if (!cancelled) {
            setConfig((prev) => ({
              ...prev,
              enabled: Number(status?.game_status ?? 1) === 1 && !status?.maintenance_mode,
              maintenanceMode: Boolean(status?.maintenance_mode),
              gameStatus: Number(status?.game_status ?? 1),
            }));
          }
        } catch (err) {
          console.warn("penalty kick game status unavailable", err);
        }

        // Check if user has a World Cup country. If not, show country selection
        // before the game starts so the first kick never fails with a country error.
        try {
          const wcProfile = await getWorldCupProfile(memberUuid);
          if (!cancelled && (wcProfile.country === null || wcProfile.country === undefined)) {
            needsCountryRef.current = true;
            setNeedsCountry(true);
          }
        } catch {
          // Don't block the game if this check fails
        }
      }

      if (memberUuid) {
        try {
          const settings = await getPenaltyKickSettings();
          if (!cancelled) {
            setConfig((prev) => ({
              ...prev,
              tokenPerShot: Number(settings?.cost_per_kick ?? prev.tokenPerShot),
              difficulty: String(settings?.goalkeeper_difficulty_display || prev.difficulty).toLowerCase(),
            }));
          }
        } catch (err) {
          console.warn("penalty kick settings unavailable for token display", err);
        }
      }

      if (memberUuid) {
        try {
          const hist = await getKickHistory(memberUuid, { page: 1, page_size: HISTORY_PAGE_SIZE });
          if (!cancelled) {
            setHistory((hist?.results || []).map(mapHistoryRow));
            setHistoryTotal(Number(hist?.count ?? 0));
          }
        } catch (err) {
          console.warn("kick history unavailable", err);
        }
      }

      try {
        const terms = await getPublicTermsAndConditions(7);
        if (!cancelled) setTermsText(terms?.terms_and_conditions ?? "");
      } catch (err) {
        console.warn("penalty kick terms unavailable", err);
      }
    }
    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadHistoryPage = useCallback(async (page) => {
    const memberUuid = tokenStorage.getMemberUuid();
    if (!memberUuid) return;
    try {
      const hist = await getKickHistory(memberUuid, { page, page_size: HISTORY_PAGE_SIZE });
      setHistory((hist?.results || []).map(mapHistoryRow));
      setHistoryTotal(Number(hist?.count ?? 0));
      setHistoryPage(page);
    } catch (err) {
      console.error("kick history failed", err);
    }
  }, []);

  // If the auth-context user is loaded, prefer its balance over the mock.
  useEffect(() => {
    const parsedBalance = parseTokenBalance(userData?.balance);
    if (parsedBalance !== null) {
      setConfig((prev) => ({ ...prev, tokensBalance: parsedBalance }));
    }
  }, [userData?.balance]);

  const handleSwipeComplete = useCallback(
    async (path) => {
      if (pendingKickRef.current) return;
      const resolved = resolveSwipe(path);
      if (!resolved.valid) return;
      pendingKickRef.current = true;

      // Resolve the outcome BEFORE switching to the kicking scene. The ball's
      // flight path depends on whether the shot is off-target (a server
      // decision), so the animation can't start until the result is in.
      // Switching to KICKING first — as this used to — left AnimatePresence
      // with no renderable KICKING child during the request window (the
      // child is gated on `outcome`), so the goal + keeper blinked out for a
      // moment: the flicker seen on swipe. The resting ball keeps pulsing in
      // READY while we wait, then all four state writes below land in one
      // batched commit so KICKING mounts fully-formed.
      let res;
      try {
        const memberUuid = tokenStorage.getMemberUuid();
        const direction = aimToDirection(resolved.aim);
        const response = await kick(memberUuid, direction);
        res = mapKickResponse(response, resolved);
        if (typeof response?.my_tokens === "number") {
          setConfig((prev) => ({ ...prev, tokensBalance: response.my_tokens }));
        }
      } catch (err) {
        console.error("kick failed", err);
        const rawDetail = err?.data?.details || err?.data?.detail || err?.message || "Unable to complete this kick.";
        const detail = String(rawDetail).toLowerCase();
        if (err?.status === 400 && (detail.includes("maintenance") || detail.includes("close") || detail.includes("status"))) {
          setConfig((prev) => ({ ...prev, enabled: false, maintenanceMode: detail.includes("maintenance") }));
        }
        pendingKickRef.current = false;
        setKickError(String(rawDetail));
        setKickErrorNeedsCountry(detail.includes("country"));
        setDialog(DIALOGS.FAIL);
        return;
      }

      setKickError(null);
      setSwipeData(resolved);
      setOutcome(res);
      setReward(res.reward ?? null);
      setPhase(PHASES.KICKING);
      play("kick");
    },
    [play],
  );

  const handleKickLanded = useCallback(() => {
    pendingKickRef.current = false;
    if (!outcome) return;

    // The audio cue fires immediately so the impact lands with the visual,
    // but the result modal waits ~550 ms so the player sees the ball at
    // rest (or in the keeper's hands) before the screen is taken over.
    // Three outcomes now: "goal" (reward), "save" (keeper grabbed it),
    // "miss" (off-target — keeper didn't even need to dive). Save and
    // miss both surface FailDialog, but with different sublines.
    const isGoal = outcome.outcome === "goal";
    play(isGoal ? "goal" : "save");
    if (isGoal) {
      loadHistoryPage(1);
    }
    setTimeout(() => {
      setDialog(isGoal ? DIALOGS.GOAL : DIALOGS.FAIL);
    }, 550);

    refreshUserData?.().catch(() => {});
  }, [outcome, play, refreshUserData, loadHistoryPage]);

  const { setSurface, surfaceHandlers } = useSwipeGesture({
    enabled: phase === PHASES.READY,
    onComplete: handleSwipeComplete,
  });

  const handleStart = useCallback(() => {
    if (!config.enabled) return;
    play("whistle");
    setPhase(PHASES.READY);
    // Surface the swipe guidance the moment the game starts, so the player
    // sees how to shoot before their first swipe. Closing it reveals the
    // READY pitch underneath, ready for the kick.
    setDialog(DIALOGS.INFO);
  }, [config.enabled, play]);

  const handleCountryConfirmed = useCallback(async (country) => {
    setCountryConfirmError(null);
    try {
      await confirmNation(country.id);
      needsCountryRef.current = false;
      setNeedsCountry(false);
      // Clear the kick-error country flag too — user has now selected a country
      setKickErrorNeedsCountry(false);
      setKickError(null);
    } catch (err) {
      setCountryConfirmError(err?.data?.detail || err?.data?.details || err?.message || "Failed to save country. Please try again.");
    }
  }, []);

  const handleKickAgain = useCallback(() => {
    // Cut the goal celebration short — it's a multi-second cheer and would
    // otherwise keep playing over the next shot.
    stop("goal");
    setDialog(null);
    setKickError(null);
    setKickErrorNeedsCountry(false);
    setSwipeData(null);
    setOutcome(null);
    setReward(null);
    setPhase(PHASES.READY);
  }, [stop]);

  const handleReturnToWebsite = useCallback(() => {
    const savedO = tokenStorage.getRedirectO?.();
    if (!savedO) {
      window.location.href = "/promotion";
      return;
    }
    const base = String(savedO).startsWith("http") ? savedO : `https://${savedO}`;
    window.location.href = `${base.replace(/\/$/, "")}/promotion`;
  }, []);

  const handleRedeemAll = useCallback(async () => {
    play("tap");
    const memberUuid = tokenStorage.getMemberUuid();
    if (!memberUuid) return;
    try {
      const result = await redeemAllKickRewards(memberUuid);
      await loadHistoryPage(1);
      refreshUserData?.().catch(() => {});
      return result;
    } catch (err) {
      console.error("redeem all failed", err);
      throw err;
    }
  }, [loadHistoryPage, play, refreshUserData]);

  const pitchVariant = phase === PHASES.LOADING || phase === PHASES.LAUNCH ? "wide" : "close";
  const unavailableMessage = config.maintenanceMode
    ? "Penalty Kick is under maintenance"
    : "Penalty Kick is currently closed";

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
      style={{ backgroundColor: COLORS.bg }}
    >
      <PitchBackground variant={pitchVariant} />

      <div className="relative z-10 flex w-full flex-col">
        <TopHud
          onNavMenuClick={() => {
            play("tap");
            setIsMenuOpen(true);
          }}
          onInfoClick={() => {
            play("tap");
            setDialog(DIALOGS.INFO);
          }}
          onMenuClick={() => {
            play("tap");
            loadHistoryPage(1);
            setDialog(DIALOGS.HISTORY);
          }}
        />
      </div>

      {/* Phase content. Loading + Launch reserve 196 px at the bottom so the
          CTA button clears the floating pills + arcade footer. Gameplay
          phases (Ready / Kicking) extend full-height instead — the goal
          post and ball anchor to the pitch backdrop's grass line, which
          only lines up when the phase wrapper spans the same vertical
          range as the background. Pills + footer overlay the bottom of
          the scene, which is fine: the penalty spot sits just above them
          and the swipe surface still grabs all the empty pitch above. */}
      <div
        className="relative z-10 flex flex-1 flex-col"
        style={{
          paddingBottom:
            phase === PHASES.LOADING || phase === PHASES.LAUNCH ? 196 : 0,
        }}
      >
        <AnimatePresence mode="wait">
          {phase === PHASES.LOADING && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              <LoadingPhase onComplete={() => setPhase(PHASES.LAUNCH)} />
            </motion.div>
          )}
          {phase === PHASES.LAUNCH && (
            <motion.div
              key="launch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              <LaunchPhase onStart={handleStart} />
            </motion.div>
          )}
          {phase === PHASES.READY && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // Exit instantly (no fade) so the swap to KICKING is a hard cut.
              // READY and KICKING render the identical goal + keeper at the
              // same anchors, and the resting ball sits exactly where the
              // kicking ball starts — so an un-faded cut is seamless, whereas
              // a fade-out-then-fade-in (the default with mode="wait") made
              // the goal/keeper visibly blink.
              exit={{ opacity: 1, transition: { duration: 0 } }}
              className="flex flex-1 flex-col"
            >
              <ReadyPhase setSurface={setSurface} surfaceHandlers={surfaceHandlers} />
            </motion.div>
          )}
          {phase === PHASES.KICKING && swipeData && outcome && (
            <motion.div
              key="kicking"
              // Mount at full opacity (no fade-in) so it takes over from READY
              // in a single frame — see the READY exit note above.
              initial={false}
              animate={{ opacity: 1 }}
              className="flex flex-1 flex-col"
            >
              <KickingPhase
                swipe={swipeData}
                outcome={outcome}
                onLanded={handleKickLanded}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Token pills float just above the arcade footer in every phase
          (bottom: 130 px). Keeping them at the bottom clears the goal +
          "Swipe To Kick" banner at the top of the gameplay scene — at the
          top they overlapped both. The whole overlay is pointer-events-none
          (the pills have nothing to tap) so it never intercepts the swipe
          gesture that drives the kick. */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-20"
        style={{ bottom: 130 }}
      >
        <TokenPills tokens={config.tokensBalance} perShot={config.tokenPerShot} />
      </div>

      {/* Same FooterNav the rest of the member pages use. It pins itself
          fixed bottom: 0 at max-w-475, so it overlays the bottom of the
          scene exactly where the old ArcadeFooter sat. Themed skins swap in
          their ornate bar (Acebet77 gold 59:665 / Ubetclub red 77:*). */}
      {ThemedNav ? <Suspense fallback={null}><ThemedNav /></Suspense> : <FooterNav />}

      {!config.enabled && (
        <div className="absolute inset-x-0 top-[68px] bottom-[100px] z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div className="w-full max-w-[360px] rounded-[16px] border border-white/15 bg-[#071906]/95 px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
            <p
              className="text-[20px] font-bold"
              style={{ color: themeColors.primary, fontFamily: "'Lexend', sans-serif" }}
            >
              {unavailableMessage}
            </p>
            <p
              className="mt-3 text-[12px] leading-5"
              style={{ color: themeColors.textMuted, fontFamily: "'Lexend', sans-serif" }}
            >
              Please check back later.
            </p>
          </div>
        </div>
      )}

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Country selection overlay — shown when user has no World Cup country */}
      {needsCountry && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.92)" }}
        >
          <NationSelect onConfirm={handleCountryConfirmed} error={countryConfirmError} />
        </div>
      )}

      <AnimatePresence>
        {dialog && (
          <motion.div
            key={dialog}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center px-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            // Backdrop click dismisses INFO/TERMS/HISTORY (which lack
            // dedicated close buttons in the Figma). GOAL and FAIL are
            // gameplay outcomes — they must be acknowledged via Kick
            // Again or Return, so we don't auto-dismiss them.
            onClick={(e) => {
              if (e.target !== e.currentTarget) return;
              if (
                dialog === DIALOGS.INFO ||
                dialog === DIALOGS.TERMS ||
                dialog === DIALOGS.HISTORY
              ) {
                play("tap");
                setDialog(null);
              }
            }}
          >
            {dialog === DIALOGS.GOAL && (
              <GoalDialog
                reward={reward}
                onKickAgain={() => {
                  play("tap");
                  handleKickAgain();
                }}
                onRedeemAll={handleRedeemAll}
                onReturn={handleReturnToWebsite}
              />
            )}
            {dialog === DIALOGS.FAIL && (
              <FailDialog
                reason={kickError ? "error" : outcome?.outcome === "miss" ? "miss" : "save"}
                title={kickErrorNeedsCountry ? "Country required" : kickError ? "Kick failed" : undefined}
                message={kickError || undefined}
                kickAgainLabel={kickErrorNeedsCountry ? "Choose Country" : "Kick Again?"}
                onKickAgain={() => {
                  play("tap");
                  if (kickErrorNeedsCountry) {
                    // Open the in-page NationSelect overlay rather than routing
                    // to /leaderboard — that route now serves the Top 20 boards
                    // and no longer carries the country picker.
                    setDialog(null);
                    needsCountryRef.current = true;
                    setNeedsCountry(true);
                  } else {
                    handleKickAgain();
                  }
                }}
                onRedeemAll={handleRedeemAll}
                onReturn={handleReturnToWebsite}
              />
            )}
            {dialog === DIALOGS.INFO && (
              <InfoDialog
                onClose={() => {
                  play("tap");
                  setDialog(null);
                }}
                onOpenTerms={() => {
                  play("tap");
                  setDialog(DIALOGS.TERMS);
                }}
              />
            )}
            {dialog === DIALOGS.TERMS && (
              <TermsDialog
                termsText={termsText}
                onClose={() => {
                  play("tap");
                  setDialog(null);
                }}
              />
            )}
            {dialog === DIALOGS.HISTORY && (
              <HistoryDialog
                rows={history}
                total={historyTotal}
                currentPage={historyPage}
                totalPages={Math.max(1, Math.ceil(historyTotal / HISTORY_PAGE_SIZE))}
                onPageChange={loadHistoryPage}
                onRedeemAll={handleRedeemAll}
                onClose={() => {
                  play("tap");
                  setDialog(null);
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
