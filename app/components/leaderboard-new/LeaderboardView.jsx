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
        />
      </div>

      {/* Title */}
      <div className="flex flex-col items-center gap-2 w-full pt-2">
        <div className="text-center w-full">
          <p
            className="text-3xl sm:text-4xl font-extrabold leading-10 sm:leading-[48px]"
            style={{ fontFamily: "var(--font-inter)", color: "var(--lb-heading)" }}
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
            className="text-base text-center"
            style={{ fontFamily: "var(--font-inter)", color: "var(--lb-heading-muted)" }}
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

          {/* Update notes */}
          {updateNotes.length > 0 && (
            <div className="flex flex-col gap-1 items-center pt-6 w-full">
              {updateNotes.map((note, i) => (
                <p
                  key={i}
                  className="text-sm text-center"
                  style={{
                    color: config.colorLight,
                    fontFamily: "var(--font-inter)",
                  }}
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