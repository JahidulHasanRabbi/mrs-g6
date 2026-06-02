"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  kickMock,
  getKickHistoryMock,
  getGameConfigMock,
} from "../components/penalty-kick/mockApi";

import { tokenStorage } from "../api/tokenStorage";
import { useUser } from "../contexts/UserContext";

export default function PenaltyKickPage() {
  const { userData, refreshUserData } = useUser();
  // muted/toggleMuted destructured but unused — the Figma header dropped the
  // mute toggle. Audio still works (and respects the persisted-mute flag the
  // hook owns); the toggle can be reintroduced from a sub-menu later if needed.
  const { play } = useAudio();

  const [phase, setPhase] = useState(PHASES.LOADING);
  const [dialog, setDialog] = useState(null);
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({
    tokensBalance: 24.0,
    tokenPerShot: 10.0,
    difficulty: "easy",
  });
  const [swipeData, setSwipeData] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [reward, setReward] = useState(null);
  const pendingKickRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getGameConfigMock(), getKickHistoryMock()]).then(([cfg, hist]) => {
      if (cancelled) return;
      setConfig((prev) => ({ ...prev, ...cfg }));
      setHistory(hist);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // If the auth-context user is loaded, prefer its balance over the mock.
  useEffect(() => {
    if (typeof userData?.balance === "number") {
      setConfig((prev) => ({ ...prev, tokensBalance: userData.balance }));
    }
  }, [userData?.balance]);

  const handleSwipeComplete = useCallback(
    async (path) => {
      if (pendingKickRef.current) return;
      const resolved = resolveSwipe(path);
      if (!resolved.valid) return;
      pendingKickRef.current = true;

      setSwipeData(resolved);
      setPhase(PHASES.KICKING);
      play("kick");

      try {
        const memberUuid = tokenStorage.getMemberUuid();
        const res = await kickMock(memberUuid, resolved, {
          difficulty: config.difficulty,
        });
        setOutcome(res);
        setReward(res.reward);
      } catch (err) {
        console.error("kick failed", err);
        setOutcome({ outcome: "save", saveDelayMs: 200 });
        setReward(null);
      }
    },
    [config.difficulty, play],
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
    const isMiss = outcome.outcome === "miss";
    play(isGoal ? "goal" : "save");
    setHistory((prev) => [
      isGoal
        ? {
            id: `live-${Date.now()}`,
            outcome: "goal",
            amount: outcome.reward?.credit_amount ?? 2,
            claimed: false,
            label: "Scored a goal",
            sub: "Tap to claim!",
          }
        : {
            id: `live-${Date.now()}`,
            outcome: "miss",
            amount: -config.tokenPerShot,
            claimed: false,
            label: isMiss ? "Shot went wide" : "Keeper saved it",
            sub: "Token deducted",
          },
      ...prev,
    ]);
    setTimeout(() => {
      setDialog(isGoal ? DIALOGS.GOAL : DIALOGS.FAIL);
    }, 550);

    refreshUserData?.().catch(() => {});
  }, [outcome, play, refreshUserData, config.tokenPerShot]);

  const { setSurface, surfaceHandlers } = useSwipeGesture({
    enabled: phase === PHASES.READY,
    onComplete: handleSwipeComplete,
  });

  const handleStart = useCallback(() => {
    play("whistle");
    setPhase(PHASES.READY);
  }, [play]);

  const handleKickAgain = useCallback(() => {
    setDialog(null);
    setSwipeData(null);
    setOutcome(null);
    setReward(null);
    setPhase(PHASES.READY);
  }, []);

  const handleReturnToWebsite = useCallback(() => {
    const savedO = tokenStorage.getRedirectO?.();
    if (!savedO) {
      window.location.href = "/promotion";
      return;
    }
    const base = savedO.startsWith("http") ? savedO : `https://${savedO}`;
    window.location.href = `${base.replace(/\/$/, "")}/promotion`;
  }, []);

  const handleRedeemAll = useCallback(() => {
    play("tap");
    setHistory((prev) => prev.map((r) => (r.outcome === "goal" ? { ...r, claimed: true } : r)));
  }, [play]);

  const pitchVariant = phase === PHASES.LOADING || phase === PHASES.LAUNCH ? "wide" : "close";

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
      style={{ backgroundColor: COLORS.bg }}
    >
      <PitchBackground variant={pitchVariant} />

      <div className="relative z-10 flex w-full flex-col">
        <TopHud
          onInfoClick={() => {
            play("tap");
            setDialog(DIALOGS.INFO);
          }}
          onMenuClick={() => {
            play("tap");
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
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              <ReadyPhase setSurface={setSurface} surfaceHandlers={surfaceHandlers} />
            </motion.div>
          )}
          {phase === PHASES.KICKING && swipeData && outcome && (
            <motion.div
              key="kicking"
              initial={{ opacity: 0 }}
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
          scene exactly where the old ArcadeFooter sat. */}
      <FooterNav />

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
                onReturn={handleReturnToWebsite}
              />
            )}
            {dialog === DIALOGS.FAIL && (
              <FailDialog
                // "miss" → off-target subline ("Ball went wide..."),
                // "save" (or anything else) → keeper-read subline.
                reason={outcome?.outcome === "miss" ? "miss" : "save"}
                onKickAgain={() => {
                  play("tap");
                  handleKickAgain();
                }}
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
                onClose={() => {
                  play("tap");
                  setDialog(null);
                }}
              />
            )}
            {dialog === DIALOGS.HISTORY && (
              <HistoryDialog
                rows={history}
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
