"use client";

import { motion } from "framer-motion";
import { useThemedCheckIn } from "../shared/useThemedCheckIn";
import KrCheckinStreakMeter, { streakWeek } from "./KrCheckinStreakMeter";
import KrCheckinMartDialog, { KrDialogLine, KrDialogPrize } from "./KrCheckinMartDialog";
import { GoldText, PageTitle } from "./KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT } from "./assets";

const DAY_CARD = {
  border: `2px solid ${KR_COLORS.goldBright}`,
  background:
    "linear-gradient(to top, rgba(255,174,0,0.4) 0%, rgba(128,108,64,0.4) 51.925%, rgba(255,255,255,0.23) 100%)",
  boxShadow: "inset 0 12px 12px 0 rgba(241,247,255,0.25)",
};

function DayCell({ day, label, claimed, disabled, onClick, index }) {
  const wide = day.isSpecial;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Check in ${day.label}`}
      className={`flex min-w-0 flex-col items-center gap-1 ${wide ? "col-span-3" : ""}`}
      style={{ cursor: claimed ? "default" : "pointer" }}
      initial={{ opacity: 0, scale: 0.6, y: -30 }}
      animate={{ opacity: claimed ? 0.5 : 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 18, delay: index * 0.07 + 0.2 }}
      whileTap={claimed ? undefined : { scale: 0.95 }}
    >
      <span
        className={`flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-[24px] ${wide ? "flex-1" : "aspect-[115/116]"}`}
        style={DAY_CARD}
      >
        <img
          src={KR_ASSETS.ui.iconCoins}
          alt=""
          className={`shrink-0 object-contain ${wide ? "size-[clamp(48px,17vw,70px)]" : "size-[clamp(32px,10.7vw,44px)]"}`}
        />
        <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-[1.2] text-white">{day.reward}</span>
      </span>
      <GoldText className="whitespace-nowrap text-[16px] font-bold uppercase">{label}</GoldText>
    </motion.button>
  );
}

function dialogTitle(kind) {
  return kind === "success" ? "Claimed!" : "Warning!";
}

/** King Rewards Daily Check-in (Figma 854:2867); behaviour is useThemedCheckIn. */
export default function KingRewardsDailyCheckInPage() {
  const { checkedDays, streak, days, isLoading, isCheckingIn, dialog, closeDialog, onDayClick } =
    useThemedCheckIn();
  const { week } = streakWeek(streak);

  return (
    <div className="relative flex w-full flex-col gap-4 px-4 pt-4" style={{ fontFamily: KR_FONT }}>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
      >
        <PageTitle>Daily Check In</PageTitle>
      </motion.div>

      <KrCheckinStreakMeter streak={streak} />

      <section
        className="relative w-full rounded-[16px] px-2 py-4"
        style={{
          border: `1px solid ${KR_COLORS.goldBright}`,
          background: "rgba(0,61,137,0.2)",
          boxShadow: "inset -2px 8px 8px rgba(165,196,255,0.25)",
        }}
      >
        <div className="grid auto-rows-fr grid-cols-3 gap-x-2 gap-y-4">
          {days.map((d, i) => {
            const claimed = checkedDays.includes(d.day);
            const label = claimed ? "Claimed" : d.isSpecial ? `Week ${week}` : d.label;
            return (
              <DayCell
                key={d.day}
                day={d}
                label={label}
                claimed={claimed}
                disabled={isCheckingIn}
                onClick={() => onDayClick(d)}
                index={i}
              />
            );
          })}
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

      <KrCheckinMartDialog
        open={!!dialog}
        onClose={closeDialog}
        tone={dialog?.kind === "success" ? "success" : "warning"}
        title={dialog ? dialogTitle(dialog.kind) : null}
      >
        {dialog?.kind === "claimed" ? (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <GoldText className="text-[20px] font-bold uppercase">Day {dialog.day}</GoldText>
            <KrDialogLine>{dialog.message}</KrDialogLine>
          </div>
        ) : (
          <KrDialogLine>{dialog?.message}</KrDialogLine>
        )}
        {dialog?.kind === "success" && dialog.tokens != null && (
          <KrDialogPrize image={KR_ASSETS.ui.iconCoins}>
            {dialog.tokens} KR Coin{dialog.tokens !== 1 ? "s" : ""}
          </KrDialogPrize>
        )}
      </KrCheckinMartDialog>
    </div>
  );
}
