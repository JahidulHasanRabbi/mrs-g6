"use client";

import { formatKrCoins } from "../../../api/apiOptions";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import KingRewardsButton from "./KingRewardsButton";
import KingRewardsDialog from "./KingRewardsDialog";
import { CardTitle, GlassCard, GoldText, KrImage, KrTabs, PageTitle } from "./KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_GRADIENTS } from "./assets";

// Figma 715:8380 + dialog states 857:4703 / 857:4923 / 857:5230.
const MUTED = "#bbcbbb";
const DIALOG_TEXT = "#e2e2e2";
const PRIZE_TEXT = "#f2ba33";
const KR_INNER_SHADOW = "inset -2px 8px 8px rgba(165,196,255,0.25)";
const CHIP_FILL = "rgba(255,221,116,0.2)";

const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir >= 0 ? -32 : 32, opacity: 0 }),
};

function GoldPlaqueButton({ children, onClick, disabled, dim }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden px-4 py-3 transition-transform active:scale-[0.98] disabled:cursor-wait"
      style={{ opacity: dim ? 0.5 : 1 }}
    >
      <img
        src={KR_ASSETS.ui.btnGold}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
      <span className="relative text-[16px] font-semibold" style={{ fontFamily: KR_FONT, color: KR_COLORS.onGold }}>
        {children}
      </span>
    </button>
  );
}

function OutlineBlock({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer rounded-[6px] p-4 text-center text-[16px] font-semibold transition-transform active:scale-[0.98]"
      style={{ fontFamily: KR_FONT, color: KR_COLORS.gold, background: "rgba(255,255,255,0.05)", border: `1.5px solid ${KR_COLORS.goldBright}` }}
    >
      {children}
    </button>
  );
}

function MissionCard({ mission, actionLoading, onJoin, onClaim, onNotice }) {
  const { title, reward, badge, progress, status, description, joined, claimed } = mission;
  const completed = status === "completed";
  const pct = progress.total > 0 ? Math.min(100, (progress.current / progress.total) * 100) : 0;

  // KR keeps the button live on claimed / incomplete missions so the Figma warning dialogs can explain why.
  const label = actionLoading ? "Loading..." : claimed ? "Claimed" : !joined ? "Join" : "Claim";
  const onClick = () => {
    if (claimed) onNotice("already", mission);
    else if (!joined) onJoin(mission.id);
    else if (completed) onClaim(mission.id);
    else onNotice("incomplete", mission);
  };

  return (
    <div
      className="flex w-full flex-col gap-6 overflow-hidden rounded-[12px] p-[clamp(12px,4vw,17px)]"
      style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${KR_COLORS.goldBright}`, boxShadow: KR_INNER_SHADOW, fontFamily: KR_FONT }}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[8px]" style={{ background: CHIP_FILL, boxShadow: KR_INNER_SHADOW }}>
            <img src={KR_ASSETS.ui.iconCoins} alt="" aria-hidden="true" className="size-8 object-cover" draggable={false} />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <GoldText as="h3" className="block text-[18px] font-semibold uppercase [overflow-wrap:anywhere]" style={{ lineHeight: "27px" }}>
              {title}
            </GoldText>
            <p className="text-[12px] font-medium leading-[1.25]" style={{ color: MUTED }}>Reward: {reward}</p>
            {description?.trim() && <p className="text-[12px] leading-[1.35]" style={{ color: MUTED }}>{description}</p>}
          </div>
        </div>
        {badge && (
          <span
            className="shrink-0 rounded-[4px] px-2 py-1 text-[10px] font-semibold capitalize leading-[15px] tracking-[0.5px]"
            style={{ background: CHIP_FILL, color: KR_COLORS.goldText }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[14px] leading-5">
            <span style={{ color: MUTED }}>Progress</span>
            <GoldText style={{ lineHeight: "20px" }}>{progress.current} / {progress.total}</GoldText>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#333535", border: `1px solid ${KR_COLORS.goldText}` }}>
            {pct > 0 && <div className="h-full rounded-full" style={{ width: `${pct}%`, background: KR_GRADIENTS.goldBar }} />}
          </div>
        </div>
        <GoldPlaqueButton onClick={onClick} disabled={actionLoading} dim={claimed}>
          {label}
        </GoldPlaqueButton>
      </div>
    </div>
  );
}

function MissionCardSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse flex-col gap-6 rounded-[12px] p-[17px]"
      style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${KR_COLORS.goldBright}`, boxShadow: KR_INNER_SHADOW }}
    >
      <div className="flex items-start gap-2">
        <div className="size-12 rounded-[8px] bg-white/15" />
        <div className="flex flex-col gap-2 pt-1">
          <div className="h-4 w-36 rounded bg-white/15" />
          <div className="h-3 w-24 rounded bg-white/15" />
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-white/15" />
      <div className="h-[51px] w-full rounded-[24px] bg-white/15" />
    </div>
  );
}

function DialogTitle({ warning, children }) {
  return (
    <div
      className="flex h-9 items-center justify-center gap-1"
      style={{ filter: "drop-shadow(0 4px 1.5px rgba(0,0,0,0.1)) drop-shadow(0 10px 4px rgba(0,0,0,0.04))" }}
    >
      {warning && <img src={KR_ASSETS.ui.iconWarning} alt="" aria-hidden="true" className="size-8" />}
      <GoldText
        as="h2"
        className="block text-[32px] font-bold uppercase tracking-[1.4px]"
        style={{ lineHeight: "36px", ...(warning ? { backgroundImage: KR_GRADIENTS.red } : null) }}
      >
        {children}
      </GoldText>
    </div>
  );
}

function rewardIcon(mission) {
  const raw = mission?._raw || {};
  const tokens = Number(raw.reward_token_quantity ?? 0);
  const bp = Number(raw.reward_battle_point_quantity ?? 0);
  return tokens <= 0 && bp > 0 ? KR_ASSETS.ui.iconBp : KR_ASSETS.ui.iconCoins;
}

/** One card for the three mission states: claimed, already claimed, not complete. */
function MissionNotice({ notice, onClose }) {
  const { kind, mission } = notice || {};
  return (
    <KingRewardsDialog open={!!notice} onClose={onClose}>
      <div className="flex w-full flex-col gap-8" style={{ fontFamily: KR_FONT }}>
        <DialogTitle warning={kind !== "claimed"}>{kind === "claimed" ? "Claimed!" : "Warning!"}</DialogTitle>
        <div className="flex flex-col items-center gap-4 px-2 text-center">
          {kind === "claimed" && (
            <>
              <p className="text-[18px] font-medium leading-[27px]" style={{ color: DIALOG_TEXT }}>Congratulations!</p>
              <div className="flex items-center gap-4">
                <KrImage src={rewardIcon(mission)} aria-hidden="true" className="size-16 object-cover" />
                <span className="text-[16px] font-medium leading-6" style={{ color: PRIZE_TEXT }}>{mission?.reward}</span>
              </div>
            </>
          )}
          {kind === "already" && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <GoldText className="text-[20px] font-bold uppercase">{mission?.title}</GoldText>
              <span className="text-[18px] font-medium leading-[27px]" style={{ color: DIALOG_TEXT }}>Already Claimed!</span>
            </div>
          )}
          {kind === "incomplete" && (
            <p className="text-[18px] font-medium leading-[27px]" style={{ color: DIALOG_TEXT }}>Progression not complete!</p>
          )}
        </div>
      </div>
      <KingRewardsButton variant="dark" onClick={onClose}>Back</KingRewardsButton>
    </KingRewardsDialog>
  );
}

function TermsDialog({ open, loading, termsText, error, onClose }) {
  const lines = String(termsText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <KingRewardsDialog open={open} onClose={onClose}>
      <CardTitle align="center">Terms &amp; Conditions</CardTitle>
      <div className="max-h-[52dvh] w-full overflow-y-auto px-2 text-[14px] leading-[22px]" style={{ fontFamily: KR_FONT }}>
        {loading ? (
          <p className="py-6 text-center" style={{ color: KR_COLORS.creamMuted }}>Loading terms...</p>
        ) : error ? (
          <p className="py-6 text-center text-red-200">{error}</p>
        ) : lines.length === 0 ? (
          <p className="py-6 text-center" style={{ color: KR_COLORS.creamMuted }}>No terms and conditions available.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lines.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="shrink-0 font-semibold" style={{ color: KR_COLORS.gold }}>{String(i + 1).padStart(2, "0")}.</span>
                <p style={{ color: KR_COLORS.cream }}>{line}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <KingRewardsButton variant="dark" onClick={onClose}>Back</KingRewardsButton>
    </KingRewardsDialog>
  );
}

function historyReward(item) {
  return (
    [
      Number(item.token_amount ?? 0) > 0 ? formatKrCoins(Number(item.token_amount)) : null,
      Number(item.battle_point_amount ?? 0) > 0 ? `${Number(item.battle_point_amount).toLocaleString("en-US")} BP` : null,
    ]
      .filter(Boolean)
      .join(" + ") || "No reward"
  );
}

/** King Rewards missions page body. State and API calls stay in app/missions/page.js. */
export default function KrMissionsView({
  tabs,
  activeTab,
  onTabChange,
  direction,
  loading,
  error,
  missions,
  actionId,
  onJoin,
  onClaim,
  onHistory,
  history,
  claimed,
  onClaimedClose,
  terms,
  onTermsClose,
  isMaintenance,
}) {
  const [warning, setWarning] = useState(null);
  const notice = claimed ? { kind: "claimed", mission: claimed } : warning;
  const closeNotice = () => (claimed ? onClaimedClose() : setWarning(null));

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4 pt-8" style={{ fontFamily: KR_FONT }}>
      <PageTitle>Missions</PageTitle>

      <div className="flex w-full flex-col gap-[10px]">
        <GlassCard variant="solid" className="flex w-full flex-col gap-6 px-2 py-4">
          <KrTabs tabs={tabs} active={activeTab} onChange={onTabChange} size={14} />

          {error && (
            <p className="rounded-[8px] border border-red-400/40 bg-red-500/15 px-3 py-2 text-center text-[13px] text-red-100">{error}</p>
          )}

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
                className="flex flex-col gap-6"
              >
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <MissionCardSkeleton key={i} />)
                ) : missions.length > 0 ? (
                  missions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      actionLoading={actionId === mission.id}
                      onJoin={onJoin}
                      onClaim={onClaim}
                      onNotice={(kind, m) => setWarning({ kind, mission: m })}
                    />
                  ))
                ) : (
                  <p className="py-10 text-center text-[16px]" style={{ color: KR_COLORS.creamMuted }}>
                    No missions available yet - check back soon.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </GlassCard>

        <OutlineBlock onClick={onHistory}>Mission History</OutlineBlock>

        {history && (
          <GlassCard variant="solid" className="flex w-full flex-col gap-3 p-4">
            <CardTitle size={16}>Mission Progress History</CardTitle>
            {history.length === 0 ? (
              <p className="text-[14px]" style={{ color: KR_COLORS.creamMuted }}>No claimed mission rewards yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((item) => (
                  <div key={item.uuid} className="flex items-center justify-between gap-3 rounded-[8px] px-3 py-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <span className="min-w-0 truncate text-[14px]" style={{ color: KR_COLORS.cream }}>{item.mission_name}</span>
                    <span className="shrink-0 text-[14px] font-semibold" style={{ color: KR_COLORS.goldText }}>{historyReward(item)}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}
      </div>

      <MissionNotice notice={notice} onClose={closeNotice} />
      <TermsDialog {...terms} onClose={onTermsClose} />

      {isMaintenance && (
        <div className="fixed inset-x-0 top-[56px] bottom-[100px] z-30 grid place-items-center bg-black/60 px-6 backdrop-blur-md">
          <GlassCard variant="solid" className="w-full max-w-[360px] px-6 py-7 text-center">
            <CardTitle align="center">Missions are under maintenance</CardTitle>
            <p className="mt-3 text-[12px] leading-5" style={{ color: KR_COLORS.creamMuted }}>Please check back later.</p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
