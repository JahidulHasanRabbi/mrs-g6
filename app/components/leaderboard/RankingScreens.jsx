"use client";

import { useEffect, useState } from "react";
import { LB_COLORS, LB_TABS } from "./constants";
import { DrawBadge, Panel, SectionBadge, Flag, Tabs, GreenButton } from "./primitives";
import { RankingHeader, RankingRow } from "./RankingRow";
import {
  getCountryRankings,
  getGlobalPlayers,
  getPlayersByCountry,
  getMyPredictions,
} from "./worldcupApi";

const SKEL_WIDTHS = ["58%", "72%", "45%", "65%", "52%", "68%"];

const SKEL_BG = "rgba(255,255,255,0.07)";

function SkeletonRow({ index, hasTrail = false }) {
  return (
    <div
      className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3"
      style={{ background: LB_COLORS.panelLight }}
    >
      <div className="h-4 w-7 shrink-0 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      <div className="flex flex-1 items-center gap-2">
        <div className="h-6 w-6 shrink-0 animate-pulse rounded-full" style={{ background: SKEL_BG }} />
        <div
          className="h-3.5 animate-pulse rounded-[4px]"
          style={{ background: SKEL_BG, width: SKEL_WIDTHS[index % SKEL_WIDTHS.length] }}
        />
      </div>
      <div className="h-3.5 w-[60px] shrink-0 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      {hasTrail && (
        <div className="h-3.5 w-[40px] shrink-0 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      )}
    </div>
  );
}

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

const TAB_LABELS = ["All Countries", "Global Top Players", "My Predictions"];

export function LeaderboardTabs({ activeTab, onTabChange }) {
  const index =
    activeTab === LB_TABS.COUNTRIES ? 0 :
    activeTab === LB_TABS.PLAYERS   ? 1 : 2;
  return (
    <Tabs
      tabs={TAB_LABELS}
      activeIndex={index}
      onChange={(i) => {
        onTabChange(
          i === 0 ? LB_TABS.COUNTRIES :
          i === 1 ? LB_TABS.PLAYERS   :
                    LB_TABS.PREDICTIONS,
        );
      }}
    />
  );
}

export function CountriesPanel({ myCountryCode, onCountrySelect, onViewPrize, rows: propRows, loading: propLoading }) {
  const [ownRows, setOwnRows] = useState([]);
  const [ownLoading, setOwnLoading] = useState(true);
  const hasPreload = propRows !== undefined;
  const rows = hasPreload ? propRows : ownRows;
  const loading = hasPreload ? !!propLoading : ownLoading;
  useEffect(() => {
    if (hasPreload) return;
    getCountryRankings().then(setOwnRows).catch(() => {}).finally(() => setOwnLoading(false));
  }, [hasPreload]);

  return (
    <Panel>
      <div className="flex flex-col items-center gap-4">
        <SectionBadge size="lg">World Cup Rankings</SectionBadge>
        <div className="flex w-full flex-col gap-2">
          <RankingHeader
            columns={[
              { label: "RANK", width: "26px" },
              { label: "COUNTRY", flex: "1 0 0" },
              { label: "POINTS", width: "60px", align: "center" },
              { label: "USERS", width: "40px", align: "right" },
            ]}
          />
          {loading
            ? Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} index={i} hasTrail />)
            : rows.map((c, i) => (
              <button key={c.uuid ?? `${c.rank}-${i}`} type="button" onClick={() => onCountrySelect?.(c)} className="w-full text-left">
                <RankingRow rank={c.rank} code={c.code} name={c.name} points={c.points} trail={c.users} highlight={c.code === myCountryCode} />
              </button>
            ))
          }
        </div>
        <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
      </div>
    </Panel>
  );
}

export function GlobalPlayersPanel({ myPlayerName, onViewPrize, rows: propRows, loading: propLoading }) {
  const [ownRows, setOwnRows] = useState([]);
  const [ownLoading, setOwnLoading] = useState(true);
  const hasPreload = propRows !== undefined;
  const rows = hasPreload ? propRows : ownRows;
  const loading = hasPreload ? !!propLoading : ownLoading;
  useEffect(() => {
    if (hasPreload) return;
    getGlobalPlayers().then(setOwnRows).catch(() => {}).finally(() => setOwnLoading(false));
  }, [hasPreload]);
  return (
    <Panel>
      <div className="flex flex-col items-center gap-4">
        <SectionBadge size="lg">World Cup Rankings</SectionBadge>
        <div className="flex w-full flex-col gap-2">
          <RankingHeader
            columns={[
              { label: "RANK", width: "26px" },
              { label: "PLAYERS", flex: "1 0 0", align: "left" },
              { label: "POINTS", width: "60px", align: "center" },
            ]}
          />
          {loading
            ? Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} index={i} />)
            : rows.map((p, i) => (
              <RankingRow key={p.uuid ?? `${p.rank}-${i}`} rank={p.rank} code={p.code} name={p.name} points={p.points} highlight={p.name === myPlayerName} mask />
            ))
          }
        </div>
        <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
      </div>
    </Panel>
  );
}

export function MyCountryPanel({ country, onViewPrize, onChangeCountry }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getPlayersByCountry(country.id).then(setRows).catch(() => {}).finally(() => setLoading(false));
  }, [country.id]);

  return (
    <Panel>
      <div className="flex flex-col items-center gap-4">
        <SectionBadge size="lg">World Cup Rankings</SectionBadge>
        <button
          type="button"
          onClick={onChangeCountry}
          className="flex w-full items-center gap-3 rounded-[8px] p-2"
          style={{ border: `2px solid ${LB_COLORS.borderGreen30}`, background: "transparent" }}
        >
          <span className="grid place-items-center" style={{ color: LB_COLORS.primary, width: 24, height: 24 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </span>
          <div className="flex flex-col items-start">
            <div className="text-[10px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
              Top Players
            </div>
            <div className="flex items-center gap-2">
              <Flag code={country.code} />
              <span className="text-[14px]" style={{ color: "#fff", fontFamily: "'Lexend',sans-serif" }}>
                {country.name}
              </span>
            </div>
          </div>
        </button>

        <div className="flex w-full flex-col gap-2">
          <RankingHeader
            columns={[
              { label: "RANK", width: "26px" },
              { label: "PLAYERS", flex: "1 0 0", align: "left" },
              { label: "POINTS", width: "60px", align: "center" },
            ]}
          />
          {loading
            ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} index={i} />)
            : rows.map((p) => (
              <RankingRow key={p.rank} rank={p.rank} code={p.code} name={p.name} points={p.points} mask />
            ))
          }
        </div>
        <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
      </div>
    </Panel>
  );
}

export function MyPredictionsPanel({ onViewPrize, rows: propRows, loading: propLoading }) {
  const [ownRows, setOwnRows] = useState([]);
  const [ownLoading, setOwnLoading] = useState(true);
  const hasPreload = propRows !== undefined;
  const rows = hasPreload ? propRows : ownRows;
  const loading = hasPreload ? !!propLoading : ownLoading;
  useEffect(() => {
    if (hasPreload) return;
    getMyPredictions().then(setOwnRows).catch(() => {}).finally(() => setOwnLoading(false));
  }, [hasPreload]);

  return (
    <Panel>
      <div className="flex flex-col items-center gap-4">
        <SectionBadge size="lg">World Cup Predictions</SectionBadge>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-3 px-1">
            <div className="w-7 text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>MATCH</div>
            <div className="flex-1 text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>MY PREDICTION</div>
            <div className="w-[51px] text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>RESULT</div>
          </div>

          {loading
            ? Array.from({ length: 4 }, (_, i) => <PredictionSkeletonRow key={i} index={i} />)
            : rows.map((p) => {
            const resultStyle =
              p.result === "win"
                ? { bg: "rgba(84,233,138,0.15)", color: LB_COLORS.primary, label: "Win" }
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
                      <span className="shrink-0">Winner:</span>
                      {p.winnerTeam?.name ? (
                        <>
                          <Flag code={p.winnerTeam.code} size={16} />
                          <span className="truncate">{p.winnerTeam.name}</span>
                        </>
                      ) : (
                        <span style={{ color: LB_COLORS.gold }}>{p.winnerLabel}</span>
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
          })}
        </div>

        <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
      </div>
    </Panel>
  );
}
