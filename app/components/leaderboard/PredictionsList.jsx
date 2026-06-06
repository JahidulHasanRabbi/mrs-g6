"use client";

import { useEffect, useState } from "react";
import { LB_COLORS } from "./constants";
import { GlowCard, Flag, Tabs } from "./primitives";
import { getFixtures, getMatchPredictionsMap } from "./worldcupApi";
import PredictModal from "./PredictModal";

function OddsBar({ home, away }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex justify-between text-[10px]" style={{ fontFamily: "'Lexend',sans-serif", fontWeight: 800 }}>
        <span style={{ color: LB_COLORS.blue }}>{home}%</span>
        <span style={{ color: LB_COLORS.orange }}>{away}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="flex h-full">
          <div style={{ background: LB_COLORS.blue, width: `${home}%` }} />
          <div style={{ background: LB_COLORS.orange, width: `${away}%` }} />
        </div>
      </div>
    </div>
  );
}

function FixtureCard({ fixture, onPredict, alreadyPredicted }) {
  const isDisabled = fixture.locked || alreadyPredicted;
  return (
    <div
      className="flex w-full flex-col items-center gap-6 rounded-[12px] p-[17px]"
      style={{ background: "#282A2B", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 4px 0 rgba(0,0,0,0.3)" }}
    >
      <div className="flex w-full flex-col items-center gap-2">
        <div className="text-[16px]" style={{ color: LB_COLORS.primary, fontFamily: "'Lexend',sans-serif" }}>
          {fixture.group}
        </div>
        <div className="flex h-[39px] w-full items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Flag code={fixture.home.code} src={fixture.home.flag} />
            <span className="text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
              {fixture.home.name}
            </span>
          </div>
          <div className="text-[14px]" style={{ color: LB_COLORS.primary, fontFamily: "'Anybody','Lexend',sans-serif", fontWeight: 700 }}>
            VS
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <span className="text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
              {fixture.away.name}
            </span>
            <Flag code={fixture.away.code} src={fixture.away.flag} />
          </div>
        </div>
        <div className="text-[12px]" style={{ color: LB_COLORS.blueTier, fontFamily: "'Lexend',sans-serif" }}>
          {fixture.date}
        </div>
      </div>

      <OddsBar home={fixture.homeOdds} away={fixture.awayOdds} />

      <button
        onClick={() => !isDisabled && onPredict?.(fixture)}
        disabled={isDisabled}
        className="h-[44px] w-full rounded-[12px] uppercase"
        style={{
          background: alreadyPredicted ? "transparent" : LB_COLORS.primary,
          border: alreadyPredicted ? `1px solid ${LB_COLORS.primary}` : "none",
          color: alreadyPredicted ? LB_COLORS.primary : LB_COLORS.primaryDeep,
          opacity: fixture.locked && !alreadyPredicted ? 0.5 : 1,
          fontFamily: "'Anybody','Lexend',sans-serif",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: alreadyPredicted ? "none" : "0 4px 0 rgba(0,0,0,0.3)",
        }}
      >
        {alreadyPredicted ? "Predicted" : "Predict"}
      </button>
    </div>
  );
}

function SectionHeader({ color, children }) {
  return (
    <div className="pl-3" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="text-[16px]" style={{ color, fontFamily: "'Lexend',sans-serif" }}>
        {children}
      </div>
    </div>
  );
}

export default function PredictionsList({ onMyPredictions }) {
  const [fixtures, setFixtures] = useState({ upcoming: [], ongoing: [] });
  const [predictedMap, setPredictedMap] = useState({});
  const [loadError, setLoadError] = useState(false);
  // Fixture whose Predict button was tapped — drives the Predict Winner modal.
  const [predictFixture, setPredictFixture] = useState(null);

  useEffect(() => {
    getFixtures().then(setFixtures).catch(() => setLoadError(true));
    getMatchPredictionsMap().then(setPredictedMap).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-8 pt-2">
      <Tabs
        tabs={["World Cup Fixtures", "My Predictions"]}
        activeIndex={0}
        onChange={(i) => i === 1 && onMyPredictions?.()}
      />

      <GlowCard>
        <div className="flex flex-col gap-4">
          {loadError && (
            <p className="text-center text-[13px]" style={{ color: "#ff6b6b", fontFamily: "'Lexend',sans-serif" }}>
              Failed to load fixtures. Please try again later.
            </p>
          )}
          <SectionHeader color={LB_COLORS.gold}>Upcoming Matches</SectionHeader>
          <div className="flex flex-col gap-2">
            {fixtures.upcoming.map((f, i) => (
              <FixtureCard
                key={`u${i}`}
                fixture={f}
                onPredict={setPredictFixture}
                alreadyPredicted={!!predictedMap[f.uuid]}
              />
            ))}
          </div>
          <SectionHeader color={LB_COLORS.primary}>Ongoing Matches</SectionHeader>
          <div className="flex flex-col gap-2">
            {fixtures.ongoing.map((f, i) => (
              <FixtureCard
                key={`o${i}`}
                fixture={f}
                alreadyPredicted={!!predictedMap[f.uuid]}
              />
            ))}
          </div>
        </div>
      </GlowCard>

      {predictFixture && (
        <PredictModal
          fixture={predictFixture}
          onClose={() => setPredictFixture(null)}
          onPredicted={(matchUuid) => {
            setPredictedMap((prev) => ({ ...prev, [matchUuid]: { state: 1 } }));
          }}
        />
      )}
    </div>
  );
}
