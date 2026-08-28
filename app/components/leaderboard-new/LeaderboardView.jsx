"use client";

import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import PodiumCards from "./PodiumCards";
import LeaderboardTable from "./LeaderboardTable";
import TermsConditions from "./TermsConditions";
import LeaderboardSkeleton from "./LeaderboardSkeleton";
import { useTheme } from "../../contexts/ThemeContext";
import { KGAME99_COLORS } from "../themes/kgame99/assets";
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
      {/* Period label. The board icon, the "TOP 20" line and the board title
          were removed at the client's request (28/08); the tab bar above
          already names the board. */}
      {periodLabel && (
        <p
          className={`text-base text-center pt-2 ${isKgame99 || isLv918 ? "" : "font-semibold"}`}
          style={{
            fontFamily: "var(--font-inter)",
            color: isKgame99
              ? KGAME99_COLORS.dark
              : isLv918
                ? LV918_COLORS.inkStrong
                : "var(--lb-heading-muted)",
            textShadow:
              isKgame99 || isLv918
                ? undefined
                : "var(--lb-heading-shadow, 0 1px 4px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.3))",
          }}
        >
          {periodLabel}
        </p>
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
