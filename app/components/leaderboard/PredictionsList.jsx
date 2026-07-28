"use client";

import { useEffect, useState } from "react";
import { LB_COLORS } from "./constants";
import { DrawBadge, GlowCard, Flag, GreenButton, Tabs } from "./primitives";
import { getFixtures, getMatchPredictionsMap, getMyPredictions } from "./worldcupApi";
import PredictModal from "./PredictModal";

const SKEL_BG = "rgba(255,255,255,0.07)";
const SKEL_WIDTHS = ["58%", "72%", "45%", "65%", "52%", "68%"];

function PredictionSkeletonRow({ index }) {
  return (
    <div
      className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3"
      style={{ background: LB_COLORS.panelLight }}
    >
      <div className="h-4 w-7 shrink-0 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      <div className="flex flex-1 flex-col gap-[5px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 shrink-0 animate-pulse rounded-full" style={{ background: SKEL_BG }} />
          <div
            className="h-3.5 animate-pulse rounded-[4px]"
            style={{ background: SKEL_BG, width: SKEL_WIDTHS[index % SKEL_WIDTHS.length] }}
          />
        </div>
        <div className="h-3 animate-pulse rounded-[4px]" style={{ background: "rgba(255,255,255,0.04)", width: "65%" }} />
      </div>
      <div className="h-6 w-[51px] shrink-0 animate-pulse rounded-[8px]" style={{ background: SKEL_BG }} />
    </div>
  );
}

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

function FixtureCard({ fixture, onPredict, prediction }) {
  const alreadyPredicted = !!prediction;
  const predictedTeam = prediction?.team;
  const winnerTeam = fixture.winnerTeam;
  const showWinner = fixture.status === 3;
  const isDisabled = fixture.locked || alreadyPredicted;
  const actionLabel = alreadyPredicted
    ? "Predicted"
    : fixture.status === 3
    ? "Ended"
    : fixture.locked
    ? "Closed"
    : "Predict";
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

      {predictedTeam?.name && (
        <div
          className="flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2"
          style={{ background: "rgba(var(--lb-accent-rgb), 0.08)", border: `1px solid ${LB_COLORS.borderGreen30}` }}
        >
          <span className="text-[11px] uppercase" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
            My Prediction
          </span>
          <span className="flex min-w-0 items-center gap-2">
            {Number(predictedTeam.id) === 0 ? (
              <DrawBadge size={22} />
            ) : (
              <Flag code={predictedTeam.code} src={predictedTeam.flag} size={22} />
            )}
            <span className="truncate text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
              {predictedTeam.name}
            </span>
          </span>
        </div>
      )}

      {showWinner && (
        <div
          className="flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${LB_COLORS.borderSoft}` }}
        >
          <span className="text-[11px] uppercase" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
            Winner
          </span>
          {fixture.isDraw ? (
            <span className="text-[12px]" style={{ color: LB_COLORS.gold, fontFamily: "'Lexend',sans-serif" }}>
              Draw
            </span>
          ) : winnerTeam?.name ? (
            <span className="flex min-w-0 items-center gap-2">
              <Flag code={winnerTeam.code} size={22} />
              <span className="truncate text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
                {winnerTeam.name}
              </span>
            </span>
          ) : (
            <span className="text-[12px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
              -
            </span>
          )}
        </div>
      )}

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
        {actionLabel}
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

export default function PredictionsList({ predictions: propPredictions, onViewPrize }) {
  const [activeTab, setActiveTab] = useState(0);
  const [fixtures, setFixtures] = useState({ upcoming: [], ongoing: [], settled: [] });
  const [predictedMap, setPredictedMap] = useState({});
  const [loadError, setLoadError] = useState(false);
  const [predictFixture, setPredictFixture] = useState(null);

  const hasPropPredictions = propPredictions !== undefined;
  const [ownRows, setOwnRows] = useState([]);
  const [ownLoading, setOwnLoading] = useState(false);
  const myRows = hasPropPredictions ? (propPredictions.rows ?? []) : ownRows;
  const myLoading = hasPropPredictions ? !!propPredictions.loading : ownLoading;

  useEffect(() => {
    getFixtures().then(setFixtures).catch(() => setLoadError(true));
    getMatchPredictionsMap().then(setPredictedMap).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab !== 1 || hasPropPredictions) return;
    setOwnLoading(true);
    getMyPredictions().then(setOwnRows).catch(() => {}).finally(() => setOwnLoading(false));
  }, [activeTab, hasPropPredictions]);

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-8 pt-2">
      <Tabs
        tabs={["World Cup Fixtures", "My Predictions"]}
        activeIndex={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 0 ? (
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
                  prediction={predictedMap[f.uuid]}
                />
              ))}
            </div>
            <SectionHeader color={LB_COLORS.primary}>Ongoing Matches</SectionHeader>
            <div className="flex flex-col gap-2">
              {fixtures.ongoing.map((f, i) => (
                <FixtureCard
                  key={`o${i}`}
                  fixture={f}
                  prediction={predictedMap[f.uuid]}
                />
              ))}
            </div>
            {fixtures.settled.length > 0 && (
              <>
                <SectionHeader color={LB_COLORS.textMuted}>Ended Matches</SectionHeader>
                <div className="flex flex-col gap-2">
                  {fixtures.settled.map((f, i) => (
                    <FixtureCard
                      key={`s${i}`}
                      fixture={f}
                      prediction={predictedMap[f.uuid]}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </GlowCard>
      ) : (
        <GlowCard>
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-3 px-1">
              <div className="w-7 text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>MATCH</div>
              <div className="flex-1 text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>MY PREDICTION</div>
              <div className="w-[51px] text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>RESULT</div>
            </div>
            {myLoading
              ? Array.from({ length: 4 }, (_, i) => <PredictionSkeletonRow key={i} index={i} />)
              : myRows.map((p) => {
                const resultStyle =
                  p.result === "win"
                    ? { bg: "rgba(var(--lb-accent-rgb), 0.15)", color: LB_COLORS.primary, label: "Win" }
                    : p.result === "loss"
                    ? { bg: "rgba(255,59,48,0.15)", color: LB_COLORS.red, label: "Loss" }
                    : p.result === "draw"
                    ? { bg: "rgba(233,175,65,0.16)", color: LB_COLORS.gold, label: "Draw" }
                    : { bg: "rgba(255,255,255,0.08)", color: LB_COLORS.textMuted, label: "Pending" };
                return (
                  <div
                    key={p.uuid ?? p.match}
                    className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3"
                    style={{ background: LB_COLORS.panelLight }}
                  >
                    <div className="w-7 text-[14px]" style={{ color: "#fff", fontFamily: "'Lexend',sans-serif" }}>
                      #{p.match}
                    </div>
                    <div className="flex flex-1 flex-col gap-[2px]">
                      <div className="flex items-center gap-2">
                        {Number(p.team.id) === 0 ? (
                          <DrawBadge size={24} />
                        ) : (
                          <Flag code={p.team.code} size={24} />
                        )}
                        <span className="text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
                          {p.team.name}
                        </span>
                      </div>
                      {p.homeName && p.awayName && (
                        <span className="text-[10px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
                          {p.homeName} vs {p.awayName}
                        </span>
                      )}
                      {(p.winnerTeam?.name || p.winnerLabel) && (
                        <span className="flex min-w-0 items-center gap-1 text-[10px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
                          {p.winnerLabel === "Draw" ? (
                            <span style={{ color: LB_COLORS.gold }}>Match is Draw</span>
                          ) : p.winnerTeam?.name ? (
                            <>
                              <span className="shrink-0">Winner:</span>
                              <Flag code={p.winnerTeam.code} size={16} />
                              <span className="truncate">{p.winnerTeam.name}</span>
                            </>
                          ) : (
                            <>
                              <span className="shrink-0">Winner:</span>
                              <span style={{ color: LB_COLORS.gold }}>{p.winnerLabel}</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <div
                      className="grid h-6 w-[51px] place-items-center rounded-[8px]"
                      style={{
                        background: resultStyle.bg,
                        color: resultStyle.color,
                        fontFamily: "'Lexend',sans-serif",
                        fontSize: 12,
                      }}
                    >
                      {resultStyle.label}
                    </div>
                  </div>
                );
              })
            }
            <div className="pt-3">
              <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
            </div>
          </div>
        </GlowCard>
      )}

      {predictFixture && (
        <PredictModal
          fixture={predictFixture}
          onClose={() => setPredictFixture(null)}
          onPredicted={(matchUuid, team) => {
            setPredictedMap((prev) => ({ ...prev, [matchUuid]: { state: 1, team } }));
          }}
        />
      )}
    </div>
  );
}
