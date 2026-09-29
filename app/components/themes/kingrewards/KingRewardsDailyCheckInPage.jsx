"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatKrCoins } from "../../../api/apiOptions";
import { useThemedCheckIn } from "../shared/useThemedCheckIn";
import KrCheckinStreakMeter, { streakWeek } from "./KrCheckinStreakMeter";
import KrCheckinMartDialog, { KrDialogLine, KrDialogPrize } from "./KrCheckinMartDialog";
import KingRewardsButton from "./KingRewardsButton";
import { GoldText, PageTitle } from "./KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT } from "./assets";

const CARD_BASE = {
  background:
    "linear-gradient(to top, rgba(255,174,0,0.4) 0%, rgba(128,108,64,0.4) 51.925%, rgba(255,255,255,0.23) 100%)",
  boxShadow: "inset 0 12px 12px 0 rgba(241,247,255,0.25)",
};
const CARD_STYLE = {
  claimed: { ...CARD_BASE, border: `2px solid ${KR_COLORS.goldBright}`, opacity: 0.55 },
  today: {
    ...CARD_BASE,
    border: `2px solid ${KR_COLORS.goldBright}`,
    boxShadow: `${CARD_BASE.boxShadow}, 0 0 14px rgba(255,214,64,0.75)`,
  },
  locked: {
    background: "rgba(0,61,137,0.35)",
    border: "1.5px solid rgba(249,208,99,0.35)",
    boxShadow: "inset -2px 8px 8px rgba(165,196,255,0.15)",
  },
};

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const range = (min, max) => (num(min) === num(max) ? `+${num(max).toLocaleString("en-US")}` : `+${num(min)}-${num(max)}`);

/** Which currencies a day pays, from the admin check-in settings (KR Coins and/or BP). */
function rewardOf(day) {
  const e = day.rewardEntry;
  const kr = !e || num(e.reward_maximum) > 0;
  const bp = !!e && num(e.battle_point_maximum) > 0;
  const parts = [];
  if (e && kr) parts.push(range(e.reward_minimum, e.reward_maximum));
  if (bp) parts.push(`${range(e.battle_point_minimum, e.battle_point_maximum)} BP`);
  return { kr, bp, caption: day.reward || parts.join(" · ") };
}

/** "2026-09-29" (date-only, read as the local day) or a full timestamp, against today's local date. */
function isToday(value) {
  if (!value) return false;
  const now = new Date();
  const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return value === local;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toDateString() === now.toDateString();
}

function RewardIcons({ kr, bp, wide }) {
  const both = kr && bp;
  // Both rewards sit side by side at a smaller size so neither covers the other.
  const size = wide
    ? (both ? "size-[clamp(30px,9.5vw,44px)]" : "size-[clamp(40px,13vw,58px)]")
    : (both ? "size-[clamp(18px,5.8vw,26px)]" : "size-[clamp(28px,9vw,40px)]");
  return (
    <span className={`flex items-center justify-center gap-[2px] ${wide ? "h-[clamp(40px,13vw,58px)]" : "h-[clamp(28px,9vw,40px)]"}`}>
      {kr && <img src={KR_ASSETS.ui.iconCoins} alt="KR Coins" className={`shrink-0 object-contain ${size}`} />}
      {bp && <img src={KR_ASSETS.ui.iconBp} alt="BP" className={`shrink-0 object-contain ${size}`} />}
    </span>
  );
}

function DayCard({ day, state, index, onCheckIn, disabled }) {
  const wide = day.isSpecial;
  const { kr, bp, caption } = rewardOf(day);
  const isTodayCard = state === "today";
  const Tag = isTodayCard ? motion.button : motion.div;
  return (
    <Tag
      {...(isTodayCard ? { type: "button", onClick: onCheckIn, disabled, "aria-label": `Check in for ${day.label}` } : {})}
      className={`relative flex min-w-0 flex-col items-center justify-between gap-1 rounded-[14px] px-1 pb-2 pt-[6px] ${wide ? "col-span-2" : ""}`}
      style={{ ...CARD_STYLE[state], cursor: isTodayCard ? "pointer" : "default" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: CARD_STYLE[state].opacity ?? 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.04 + 0.1 }}
      whileTap={isTodayCard && !disabled ? { scale: 0.96 } : undefined}
    >
      <GoldText className="whitespace-nowrap text-[12px] font-bold uppercase" style={{ lineHeight: "15px" }}>
        {day.label}
      </GoldText>
      <RewardIcons kr={kr} bp={bp} wide={wide} />
      <span className="max-w-full truncate px-1 text-[11px] font-semibold leading-[1.2] text-white" title={caption}>
        {caption || " "}
      </span>
      {state === "claimed" && (
        <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[#1fae5b] text-[10px] font-bold leading-none text-white" aria-label="Claimed">
          ✓
        </span>
      )}
      {state === "locked" && (
        <img src={KR_ASSETS.mart.iconLock} alt="Locked" className="absolute right-1 top-1 size-3.5 opacity-70" />
      )}
      {isTodayCard && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 text-[9px] font-bold uppercase leading-[14px]"
          style={{ background: KR_COLORS.goldBright, color: KR_COLORS.onGold }}
        >
          Today
        </span>
      )}
    </Tag>
  );
}

function dialogTitle(kind) {
  return kind === "success" ? "Claimed!" : "Warning!";
}

/** King Rewards Daily Check-in (Figma 854:2867 + 23 Sep feedback); behaviour is useThemedCheckIn. */
export default function KingRewardsDailyCheckInPage() {
  const { streak, lastCheckInDate, days, isLoading, isCheckingIn, dialog, closeDialog, checkInToday } =
    useThemedCheckIn();
  // The server can reject a check-in we thought was open; trust it for the rest of the visit.
  const [serverSaysDone, setServerSaysDone] = useState(false);
  useEffect(() => {
    if (dialog?.kind === "error" && /already checked in/i.test(dialog.message || "")) setServerSaysDone(true);
  }, [dialog]);

  const checkedToday = serverSaysDone || isToday(lastCheckInDate);
  const { week, inWeek } = streakWeek(streak);
  // A finished 7-day run rolls over to Day 1 of the next week once a new day starts.
  const rollover = inWeek === 7 && !checkedToday;
  const claimedCount = rollover ? 0 : inWeek;
  const shownWeek = rollover ? week + 1 : week;
  const todayDay = checkedToday || isLoading ? null : claimedCount + 1;

  const stateOf = (d) => (d <= claimedCount ? "claimed" : d === todayDay ? "today" : "locked");
  const retry = () => {
    closeDialog();
    checkInToday();
  };

  return (
    <div className="relative flex w-full flex-col gap-4 px-4 pt-4" style={{ fontFamily: KR_FONT }}>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
      >
        <PageTitle>Daily Check-In</PageTitle>
      </motion.div>

      <KrCheckinStreakMeter streak={streak} />

      <section
        className="relative flex w-full flex-col gap-4 rounded-[16px] px-2 pb-4 pt-5"
        style={{
          border: `1px solid ${KR_COLORS.goldBright}`,
          background: "rgba(0,61,137,0.2)",
          boxShadow: "inset -2px 8px 8px rgba(165,196,255,0.25)",
        }}
        aria-busy={isLoading}
      >
        <p className="text-center text-[11px] font-bold uppercase tracking-[1px]" style={{ color: KR_COLORS.goldText }}>
          Week {shownWeek}
        </p>
        <div className={`grid grid-cols-4 gap-x-[6px] gap-y-4 ${isLoading ? "opacity-40" : ""}`}>
          {days.map((d, i) => (
            <DayCard
              key={d.day}
              day={d}
              state={stateOf(d.day)}
              index={i}
              onCheckIn={checkInToday}
              disabled={isCheckingIn}
            />
          ))}
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div
              className="size-9 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: KR_COLORS.goldText, borderRightColor: KR_COLORS.goldText }}
            />
          </div>
        )}
      </section>

      <div className="flex w-full flex-col items-center gap-2">
        {checkedToday ? (
          <>
            <KingRewardsButton variant="dark" disabled>
              Checked In Today
            </KingRewardsButton>
            <p className="text-center text-[12px] text-[rgba(165,196,255,0.8)]">Come back tomorrow for your next reward.</p>
          </>
        ) : (
          <KingRewardsButton variant="gold" onClick={checkInToday} disabled={isLoading || isCheckingIn || !todayDay}>
            {isCheckingIn ? "Checking In…" : "Check In"}
          </KingRewardsButton>
        )}
      </div>

      <KrCheckinMartDialog
        open={!!dialog}
        onClose={closeDialog}
        tone={dialog?.kind === "success" ? "success" : "warning"}
        title={dialog ? dialogTitle(dialog.kind) : null}
        actions={
          dialog?.retryable ? (
            <>
              <KingRewardsButton variant="gold" onClick={retry}>
                Try Again
              </KingRewardsButton>
              <KingRewardsButton variant="dark" onClick={closeDialog}>
                Back
              </KingRewardsButton>
            </>
          ) : undefined
        }
      >
        <KrDialogLine>{dialog?.message}</KrDialogLine>
        {dialog?.kind === "success" && num(dialog.tokens) > 0 && (
          <KrDialogPrize image={KR_ASSETS.ui.iconCoins}>{formatKrCoins(num(dialog.tokens))}</KrDialogPrize>
        )}
        {dialog?.kind === "success" && num(dialog.battlePoints) > 0 && (
          <KrDialogPrize image={KR_ASSETS.ui.iconBp}>{num(dialog.battlePoints).toLocaleString("en-US")} BP</KrDialogPrize>
        )}
      </KrCheckinMartDialog>
    </div>
  );
}
