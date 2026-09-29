"use client";

import { formatKrCoins } from "../../../api/apiOptions";
import { MISSION_ACTION_LABELS, MISSION_RESET_TYPE_LABELS } from "../../../config/missionOptions";
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

const MUTED_BUTTON = {
  color: "rgba(255,246,223,0.7)",
  background: "rgba(74,120,196,0.45)",
  border: "1px solid rgba(165,196,255,0.45)",
};

const STATUS_CHIP = {
  "not-joined": { label: "Not Joined", color: "#bbcbbb", background: "rgba(255,255,255,0.1)" },
  "in-progress": { label: "In Progress", color: "#a5c4ff", background: "rgba(74,142,255,0.2)" },
  completed: { label: "Ready to Claim", color: KR_COLORS.onGold, background: KR_COLORS.goldBright },
  claimed: { label: "Claimed", color: "#8ff0b4", background: "rgba(31,174,91,0.25)" },
};

/** dd/mm/yyyy HH:MM AM|PM (project format). */
function formatDeadline(value) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date} ${time}`;
}

/** Condition / reset / deadline lines, only from fields the mission row actually carries. */
function missionFacts(mission) {
  const raw = mission._raw || {};
  const action = MISSION_ACTION_LABELS[raw.condition_action];
  const reset = MISSION_RESET_TYPE_LABELS[raw.reset_type];
  const ends = formatDeadline(raw.end_date);
  const target = Number(mission.progress.total) || 0;
  return [
    action && `Condition: ${action}${target ? ` · target ${target.toLocaleString("en-US")}` : ""}`,
    reset && reset !== "None" && `Resets ${reset.toLowerCase()}`,
    ends && `Ends ${ends}`,
  ].filter(Boolean);
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

function ActionButton({ variant, onClick, disabled, children }) {
  const style =
    variant === "gold"
      ? { color: KR_COLORS.onGold, backgroundImage: `url(${KR_ASSETS.ui.btnGold})`, backgroundSize: "100% 100%" }
      : variant === "outline"
        ? { color: KR_COLORS.gold, background: "rgba(255,255,255,0.05)", border: `1.5px solid ${KR_COLORS.goldBright}`, borderRadius: 6 }
        : { ...MUTED_BUTTON, borderRadius: 6 };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative flex min-h-[48px] w-full items-center justify-center overflow-hidden px-4 py-3 text-[16px] font-semibold transition-transform enabled:cursor-pointer enabled:active:scale-[0.98] disabled:cursor-not-allowed"
      style={{ fontFamily: KR_FONT, ...style }}
    >
      {children}
    </button>
  );
}

function MissionCard({ mission, actionLoading, onJoin, onClaim }) {
  const { title, reward, badge, progress, status, description } = mission;
  const ready = status === "completed";
  const pct = progress.total > 0 ? Math.min(100, (progress.current / progress.total) * 100) : 0;
  const remaining = Math.max(0, (Number(progress.total) || 0) - (Number(progress.current) || 0));
  const chip = STATUS_CHIP[status] || STATUS_CHIP["in-progress"];
  const facts = missionFacts(mission);

  let button;
  if (status === "claimed") {
    button = <ActionButton disabled>Claimed ✓</ActionButton>;
  } else if (status === "not-joined") {
    button = (
      <ActionButton variant="outline" onClick={() => onJoin(mission.id)} disabled={actionLoading}>
        {actionLoading ? "Joining…" : "Join Mission"}
      </ActionButton>
    );
  } else if (ready) {
    button = (
      <ActionButton variant="gold" onClick={() => onClaim(mission.id)} disabled={actionLoading}>
        {actionLoading ? "Claiming…" : "Claim"}
      </ActionButton>
    );
  } else {
    button = <ActionButton disabled>Claim</ActionButton>;
  }

  return (
    <div
      className="flex w-full flex-col gap-4 overflow-hidden rounded-[12px] p-[clamp(12px,4vw,17px)]"
      style={{
        background: "rgba(255,255,255,0.1)",
        border: `1px solid ${ready ? KR_COLORS.goldBright : "rgba(255,240,102,0.45)"}`,
        boxShadow: ready ? `${KR_INNER_SHADOW}, 0 0 12px rgba(255,214,64,0.45)` : KR_INNER_SHADOW,
        fontFamily: KR_FONT,
      }}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[8px]" style={{ background: CHIP_FILL, boxShadow: KR_INNER_SHADOW }}>
            <img src={rewardIcon(mission)} alt="" aria-hidden="true" className="size-8 object-cover" draggable={false} />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <GoldText as="h3" className="block text-[18px] font-semibold uppercase [overflow-wrap:anywhere]" style={{ lineHeight: "24px" }}>
              {title}
            </GoldText>
            <p className="text-[13px] font-semibold leading-[1.3]" style={{ color: KR_COLORS.goldText }}>Reward: {reward}</p>
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

      {(description?.trim() || facts.length > 0) && (
        <div className="flex flex-col gap-1 text-[12px] leading-[1.4]" style={{ color: MUTED }}>
          {description?.trim() && <p className="text-[#e2e2e2]">{description}</p>}
          {facts.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-[14px] leading-5">
          <span className="flex items-center gap-2" style={{ color: MUTED }}>
            Progress
            <span className="rounded-[4px] px-[6px] text-[10px] font-bold uppercase leading-4" style={{ color: chip.color, background: chip.background }}>
              {chip.label}
            </span>
          </span>
          <GoldText style={{ lineHeight: "20px" }}>{progress.current} / {progress.total}</GoldText>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "#333535", border: `1px solid ${KR_COLORS.goldText}` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          {pct > 0 && <div className="h-full rounded-full" style={{ width: `${pct}%`, background: KR_GRADIENTS.goldBar }} />}
        </div>
        {status === "in-progress" && remaining > 0 && (
          <p className="text-[11px] leading-4" style={{ color: MUTED }}>
            {remaining.toLocaleString("en-US")} more to unlock the reward
          </p>
        )}
      </div>

      {button}
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

/** The "CLAIMED!" confirmation after a successful claim. */
function MissionNotice({ mission, onClose }) {
  return (
    <KingRewardsDialog open={!!mission} onClose={onClose}>
      <div className="flex w-full flex-col gap-8" style={{ fontFamily: KR_FONT }}>
        <DialogTitle>Claimed!</DialogTitle>
        <div className="flex flex-col items-center gap-4 px-2 text-center">
          <p className="text-[18px] font-medium leading-[27px]" style={{ color: DIALOG_TEXT }}>Congratulations!</p>
          <div className="flex items-center gap-4">
            <KrImage src={rewardIcon(mission)} aria-hidden="true" className="size-16 object-cover" />
            <span className="text-[16px] font-medium leading-6" style={{ color: PRIZE_TEXT }}>{mission?.reward}</span>
          </div>
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
      Number(item.attack_point_amount ?? 0) > 0 ? `${Number(item.attack_point_amount).toLocaleString("en-US")} AP` : null,
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
  onRetry,
  onHistory,
  history,
  claimed,
  onClaimedClose,
  terms,
  onTermsClose,
  isMaintenance,
}) {

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4 pt-8" style={{ fontFamily: KR_FONT }}>
      <PageTitle>Missions</PageTitle>

      <div className="flex w-full flex-col gap-[10px]">
        <GlassCard variant="solid" className="flex w-full flex-col gap-6 px-2 py-4">
          <KrTabs tabs={tabs} active={activeTab} onChange={onTabChange} size={14} />

          {error && (
            <div className="flex flex-col items-center gap-2 rounded-[8px] border border-red-400/40 bg-red-500/15 px-3 py-2 text-center" role="alert">
              <p className="text-[13px] text-red-100">{error}</p>
              {onRetry && !loading && missions.length === 0 && (
                <button type="button" onClick={onRetry} className="text-[13px] font-semibold underline" style={{ color: KR_COLORS.goldText }}>
                  Try again
                </button>
              )}
            </div>
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
                    />
                  ))
                ) : error ? null : (
                  <p className="py-10 text-center text-[16px]" style={{ color: KR_COLORS.creamMuted }}>
                    No {tabs.find((t) => t.id === activeTab)?.label.toLowerCase() || ""} missions right now - check back soon.
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

      <MissionNotice mission={claimed} onClose={onClaimedClose} />
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
