"use client";

import { useEffect, useState } from "react";
import { LB_COLORS, LB_TABS } from "./constants";
import { Panel, SectionBadge, Flag, Tabs, GreenButton } from "./primitives";
import { RankingHeader, RankingRow } from "./RankingRow";
import {
  getCountryRankings,
  getGlobalPlayers,
  getPlayersByCountry,
  getMyPredictions,
} from "./mockApi";

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

export function CountriesPanel({ myCountryCode, onCountrySelect, onViewPrize }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { getCountryRankings().then(setRows); }, []);

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
          {rows.map((c) => (
            <button key={c.rank} type="button" onClick={() => onCountrySelect?.(c)} className="w-full text-left">
              <RankingRow rank={c.rank} code={c.code} name={c.name} points={c.points} trail={c.users} highlight={c.code === myCountryCode} />
            </button>
          ))}
        </div>
        <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
      </div>
    </Panel>
  );
}

export function GlobalPlayersPanel({ myPlayerName, onViewPrize }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { getGlobalPlayers().then(setRows); }, []);
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
          {rows.map((p) => (
            <RankingRow key={p.rank} rank={p.rank} code={p.code} name={p.name} points={p.points} highlight={p.name === myPlayerName} mask />
          ))}
        </div>
        <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
      </div>
    </Panel>
  );
}

export function MyCountryPanel({ country, onViewPrize, onChangeCountry }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { getPlayersByCountry(country.code).then(setRows); }, [country.code]);

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
          {rows.map((p) => (
            <RankingRow key={p.rank} rank={p.rank} code={p.code} name={p.name} points={p.points} mask />
          ))}
        </div>
        <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
      </div>
    </Panel>
  );
}

export function MyPredictionsPanel({ onViewPrize }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { getMyPredictions().then(setRows); }, []);

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

          {rows.map((p) => (
            <div
              key={p.match}
              className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3"
              style={{ background: LB_COLORS.panelLight }}
            >
              <div className="w-7 text-[14px]" style={{ color: "#fff", fontFamily: "'Lexend',sans-serif" }}>
                #{p.match}
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Flag code={p.team.code} size={24} />
                <span className="text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
                  {p.team.name}
                </span>
              </div>
              <div
                className="grid h-6 w-[51px] place-items-center rounded-[8px]"
                style={{
                  background: p.result === "win" ? "rgba(84,233,138,0.15)" : "rgba(255,59,48,0.15)",
                  color: p.result === "win" ? LB_COLORS.primary : LB_COLORS.red,
                  fontFamily: "'Lexend',sans-serif",
                  fontSize: 12,
                }}
              >
                {p.result === "win" ? "Win" : "Loss"}
              </div>
            </div>
          ))}
        </div>

        <GreenButton onClick={onViewPrize} size="sm">View Prize Pool</GreenButton>
      </div>
    </Panel>
  );
}
