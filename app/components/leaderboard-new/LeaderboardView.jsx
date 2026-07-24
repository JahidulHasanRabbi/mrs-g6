"use client";

import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import PodiumCards from "./PodiumCards";
import LeaderboardTable from "./LeaderboardTable";
import TermsConditions from "./TermsConditions";
import LeaderboardSkeleton from "./LeaderboardSkeleton";

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
}) {
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

      {/* Title. Same lesson as the update notes below: text colored to read
          against the backdrop still fights a busy photographic image (castle
          spires, cloud banks, sky gradient) — some patch of it always wins.
          Card it like the countdown/notes/table instead; --lb-card-overlay is
          opaque dark on every theme, so a single light text color works
          everywhere and the per-theme --lb-heading tokens are no longer
          needed here. */}
      <div
        className="flex flex-col items-center gap-2 w-full mt-2 rounded-lg px-6 py-4"
        style={{ backgroundColor: "var(--lb-card-overlay)" }}
      >
        <div className="text-center w-full">
          <p
            className="text-3xl sm:text-4xl font-extrabold leading-10 sm:leading-[48px] text-[#e5e2e1]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            TOP 20
          </p>
          <p
            className="text-2xl sm:text-[32px] font-extrabold leading-10 sm:leading-[48px]"
            style={{
              color: config.color,
              fontFamily: "var(--font-inter)",
            }}
          >
            {config.title}
          </p>
        </div>

        {/* Period label */}
        {periodLabel && (
          <p
            className="text-base text-center text-[#e5e2e1]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {periodLabel}
          </p>
        )}
      </div>

      {loading ? (
        <LeaderboardSkeleton config={config} />
      ) : (
        <>
          {/* Countdown timer (deposit only) */}
          {config.showCountdown && campaignEndDate && (
            <div className="w-full pt-6">
              <CountdownTimer endDate={campaignEndDate} color={config.color} />
            </div>
          )}

          {/* Update notes. Recoloring bare text per-theme wasn't enough —
              this sits over photographic art (castle floor / cosmic scene)
              whose brightness varies by region, so no single text color reads
              reliably everywhere. Give it the same opaque card treatment as
              the countdown/table/podium instead of relying on color alone. */}
          {updateNotes.length > 0 && (
            <div
              className="flex flex-col gap-1.5 items-center w-full mt-6 rounded-lg px-4 py-3"
              style={{ backgroundColor: "var(--lb-card-overlay)" }}
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

          {/* Podium - Top 3 */}
          <PodiumCards top3={top3} config={config} />

          {/* Table - Ranks 4-20 */}
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
