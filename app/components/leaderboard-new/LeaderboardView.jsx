"use client";

import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import PodiumCards from "./PodiumCards";
import LeaderboardTable from "./LeaderboardTable";
import TermsConditions from "./TermsConditions";
import LeaderboardSkeleton from "./LeaderboardSkeleton";
import { useTheme } from "../../contexts/ThemeContext";
import KgameSectionHeading from "../themes/kgame99/KgameSectionHeading";
import { KGAME99_COLORS } from "../themes/kgame99/assets";
import Lv918SectionHeading from "../themes/lv918/Lv918SectionHeading";
import { LV918_COLORS } from "../themes/lv918/assets";
import MyRankPanel from "./MyRankPanel";

export default function LeaderboardView({
  config,
  top3 = [],
  tableEntries = [],
  currentUserRank,
  campaignEndDate,
  periodLabel = "",
  updateNotes = [],
  terms = [],
  loading = false,
  myRank = null,
  memberName = "Member",
  countdownLabel = undefined,
}) {
  const { isKgame99, isLv918 } = useTheme();

  return (
    <motion.div
      key={config.label}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 items-center w-full px-4"
    >
      {/* Header icon */}
      <div className="flex justify-center w-full">
        <img
          src={config.icon}
          alt={config.label}
          className="w-12 h-12 sm:w-16 sm:h-16"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
        />
      </div>

      {/* Title. On the bright themes (kgame99 sky, lv918 pink) this keeps the
          theme's own full-bleed art but renders the title with that theme's
          SectionHeading — the same gold-gradient-on-shadow treatment used
          for every other on-backdrop heading in those skins — so it reads as
          native, not a recolored generic. Other themes float the title on the
          backdrop via --lb-heading-shadow (plain shadow on the dark default,
          themed shadow elsewhere). */}
      {isKgame99 ? (
        <div className="flex flex-col items-center gap-1 w-full pt-2">
          <KgameSectionHeading className="!text-[30px] sm:!text-[36px]">MY RANK</KgameSectionHeading>
          <KgameSectionHeading className="!text-[24px] sm:!text-[28px]">{config.title}</KgameSectionHeading>
          {periodLabel && (
            <p className="text-base text-center mt-1" style={{ fontFamily: "var(--font-inter)", color: KGAME99_COLORS.dark }}>
              {periodLabel}
            </p>
          )}
        </div>
      ) : isLv918 ? (
        <div className="flex flex-col items-center gap-1 w-full pt-2">
          <Lv918SectionHeading className="!text-[30px] sm:!text-[36px]">MY RANK</Lv918SectionHeading>
          <Lv918SectionHeading className="!text-[24px] sm:!text-[28px]">{config.title}</Lv918SectionHeading>
          {periodLabel && (
            <p className="text-base text-center mt-1" style={{ fontFamily: "var(--font-inter)", color: LV918_COLORS.inkStrong }}>
              {periodLabel}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full pt-2">
          <div className="text-center w-full">
            <p
              className="text-3xl sm:text-4xl font-extrabold leading-10 sm:leading-[48px]"
              style={{
                fontFamily: "var(--font-inter)",
                color: "var(--lb-heading)",
                textShadow: "var(--lb-heading-shadow, 0 1px 4px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.3))",
              }}
            >
              MY RANK
            </p>
            <p
              className="text-2xl sm:text-[32px] font-extrabold leading-10 sm:leading-[48px]"
              style={{
                color: config.color,
                fontFamily: "var(--font-inter)",
                textShadow: "var(--lb-heading-shadow, 0 1px 4px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.3))",
              }}
            >
              {config.title}
            </p>
          </div>

          {/* Period label */}
          {periodLabel && (
            <p
              className="text-base text-center font-semibold"
              style={{
                fontFamily: "var(--font-inter)",
                color: "var(--lb-heading-muted)",
                textShadow: "var(--lb-heading-shadow, 0 1px 4px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.3))",
              }}
            >
              {periodLabel}
            </p>
          )}
        </div>
      )}

      {config.eventBadge && (
        <span
          className="-mt-3 rounded-full px-3 py-1 text-[10px] font-extrabold tracking-[1.4px] text-[#07190d]"
          style={{ backgroundColor: config.color }}
        >
          {config.eventBadge}
        </span>
      )}

      {loading ? (
        <LeaderboardSkeleton config={config} />
      ) : (
        <>
          {config.previewNotice && (
            <div
              // Opaque card fill (same token as the podium/table cards) — a
              // translucent tint let the station artwork through and the copy
              // became unreadable on the busier themes.
              className="w-full rounded-lg border px-4 py-3 text-center text-xs font-semibold"
              style={{
                borderColor: config.color,
                backgroundColor: "var(--lb-card-overlay)",
                boxShadow: `0 3px 6px 0 ${config.color}4D`,
                color: config.colorLight,
              }}
              role="status"
            >
              {config.previewNotice}
            </div>
          )}

          <MyRankPanel
            data={myRank}
            color={config.color}
            metricLabel={config.myRankMetricLabel}
            metricKind={config.myRankMetricKind}
            gapUnit={config.myRankGapUnit}
            emptyHint={config.myRankEmptyHint}
            memberName={memberName}
          />

          {/* Countdown timer (deposit campaign / turnover event window) */}
          {config.showCountdown && campaignEndDate && (
            <div className="w-full pt-6">
              <CountdownTimer
                endDate={campaignEndDate}
                color={config.color}
                label={countdownLabel}
              />
            </div>
          )}

          {/* Update notes. Rendered in the same full-width dark themed card
              (var(--lb-card-overlay) — opaque navy on kgame99, dark rose on
              lv918, dark grey on the default/dark themes) as the countdown,
              podium and table above/below it, so the section reads as one of
              "the rest" instead of floating text on the art or an odd-sized
              ornate panel. Light text since the card is dark on every theme. */}
          {updateNotes.length > 0 && (
            <div
              className="w-full rounded-lg px-4 py-4 flex flex-col gap-1.5 items-center"
              style={{
                backgroundColor: "var(--lb-card-overlay)",
                border: `1px solid ${config.color}`,
                boxShadow: `0 3px 6px 0 ${config.color}4D`,
              }}
            >
              {updateNotes.map((note, i) => (
                <p
                  key={i}
                  className="text-sm text-center text-[#e5e2e1]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {note}
                </p>
              ))}
            </div>
          )}

          {/* Top 20 podium + table, shown together with My Rank above. */}
          <PodiumCards top3={top3} config={config} currentUserRank={currentUserRank} />
          <LeaderboardTable
            entries={tableEntries}
            config={config}
            currentUserRank={currentUserRank}
          />
        </>
      )}

      {/* Terms & Conditions */}
      <TermsConditions terms={terms} color={config.color} />
    </motion.div>
  );
}
