"use client";

import { useEffect, useState } from "react";
import { LB_COLORS } from "./constants";
import { Panel, SectionBadge, Flag, GreenButton, Tabs } from "./primitives";
import {
  getCountryPrizes,
  getPlayerPrizes,
  getPredictionPrizes,
} from "./worldcupApi";

const SKEL_BG = "rgba(255,255,255,0.07)";

function CountryPrizeSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-[8px] p-2" style={{ background: LB_COLORS.panelLight }}>
      <div className="h-[160px] w-full animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-7 animate-pulse rounded-full" style={{ background: SKEL_BG }} />
        <div className="h-4 w-20 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 animate-pulse rounded-full" style={{ background: SKEL_BG }} />
        <div className="h-4 w-28 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      </div>
      <div className="h-9 w-full animate-pulse rounded-[8px]" style={{ background: SKEL_BG }} />
    </div>
  );
}

function PlayerPrizeSkeleton({ index }) {
  const widths = ["55%", "70%", "45%", "65%"];
  return (
    <div className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3" style={{ background: LB_COLORS.panelLight }}>
      <div className="h-4 w-7 shrink-0 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      <div className="flex flex-1 items-center gap-2">
        <div className="h-3.5 animate-pulse rounded-[4px]" style={{ background: SKEL_BG, width: widths[index % widths.length] }} />
      </div>
      <div className="h-[44px] w-[71px] shrink-0 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
    </div>
  );
}

function PredictionPrizeSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3" style={{ background: LB_COLORS.panelLight }}>
      <div className="h-4 w-[48px] shrink-0 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      <div className="flex flex-1 justify-center">
        <div className="h-3.5 w-3/4 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      </div>
      <div className="flex w-[75px] flex-col items-center gap-1">
        <div className="h-7 w-7 animate-pulse rounded-full" style={{ background: SKEL_BG }} />
        <div className="h-3 w-14 animate-pulse rounded-[4px]" style={{ background: SKEL_BG }} />
      </div>
    </div>
  );
}

export function PrizeTabs({ active, onChange }) {
  return (
    <Tabs
      tabs={["Top Country", "Global Top Players", "My Predictions"]}
      activeIndex={active === "country" ? 0 : active === "players" ? 1 : 2}
      onChange={(i) => onChange(i === 0 ? "country" : i === 1 ? "players" : "predictions")}
    />
  );
}

function PrizePlaceholder({ name, image }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={name} className="h-[160px] w-full rounded-[4px] object-cover" />
    );
  }
  return (
    <div
      className="grid h-[160px] w-full place-items-center rounded-[4px]"
      style={{
        background: "linear-gradient(135deg,#1a3a25 0%,#2a4d2a 35%,#3d2a1a 65%,#5b3a1a 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span className="text-[14px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif", letterSpacing: 1 }}>
        {name ?? "Prize"}
      </span>
    </div>
  );
}

function placeColor(rank) {
  if (rank === 1) return LB_COLORS.primary;
  if (rank === 2) return LB_COLORS.goldStrong;
  if (rank === 3) return LB_COLORS.cyan;
  return LB_COLORS.textWhite;
}
function placeSuffix(rank) {
  return rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
}

export function CountryPrizesPanel({ onViewLeaderboards, onViewDetails }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getCountryPrizes().then(setRows).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <Panel>
      <div className="flex flex-col items-center gap-4">
        <SectionBadge size="lg">Prize Pool</SectionBadge>

        {loading
          ? Array.from({ length: 3 }, (_, i) => <CountryPrizeSkeleton key={i} />)
          : rows.map((row) => (
          <div key={row.rank} className="flex w-full flex-col items-center gap-3 rounded-[8px] p-2" style={{ background: LB_COLORS.panelLight }}>
            <PrizePlaceholder name={row.name} image={row.image} />
            <div className="flex flex-col items-center gap-2">
              <span aria-hidden="true" style={{ fontSize: 28 }}>🏆</span>
              <span style={{ color: placeColor(row.rank), fontFamily: "'Lexend',sans-serif", fontWeight: 600 }}>
                <span style={{ fontSize: 16 }}>{row.rank}</span>
                <span style={{ fontSize: 14 }}>{placeSuffix(row.rank)}</span>
                <span style={{ fontSize: 16 }}> Place</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Flag code={row.code} src={row.flag} />
              <span className="text-[14px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
                {row.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onViewDetails?.(row)}
              className="w-full rounded-[8px] py-2 text-[14px]"
              style={{ border: `1px solid ${LB_COLORS.primary}`, color: LB_COLORS.primary, fontFamily: "'Lexend',sans-serif" }}
            >
              View Details
            </button>
          </div>
        ))}

        <GreenButton onClick={onViewLeaderboards} size="sm">View Leaderboards</GreenButton>
      </div>
    </Panel>
  );
}

export function PlayerPrizesPanel({ onViewLeaderboards, onViewDetails }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPlayerPrizes().then(setRows).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <Panel>
      <div className="flex flex-col items-center gap-4">
        <SectionBadge size="lg">Prize Pool</SectionBadge>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-3 px-1">
            <div className="w-7 text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>RANK</div>
            <div className="flex-1 text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>PLAYERS</div>
            <div className="w-[70px] text-center text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>PRIZE</div>
          </div>
          {loading
            ? Array.from({ length: 5 }, (_, i) => <PlayerPrizeSkeleton key={i} index={i} />)
            : rows.map((p) => (
            <div
              key={p.rank}
              className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3"
              style={{
                background: LB_COLORS.panelLight,
                border: p.rank === 1 ? `1px solid ${LB_COLORS.borderGreen50}` : "none",
                boxShadow: p.rank === 1 ? "0 0 10px 0 rgba(84,233,138,0.8), 0 0 20px 0 rgba(84,233,138,0.4)" : "none",
              }}
            >
              <div className="w-7 text-[12px]" style={{ color: placeColor(p.rank), fontFamily: "'Lexend',sans-serif" }}>
                #{p.rank}
              </div>
              <div className="flex flex-1 items-center gap-2">
                <span className="truncate text-[14px]" style={{ color: placeColor(p.rank), fontFamily: "'Lexend',sans-serif" }}>
                  {p.name}
                </span>
                {(p.code || p.flag) && <Flag code={p.code} src={p.flag} size={24} />}
              </div>
              <button
                onClick={() => onViewDetails?.(p)}
                className="grid h-[44px] w-[71px] place-items-center rounded-[4px]"
                style={{ background: "linear-gradient(135deg,#1a3a25 0%,#2a4d2a 100%)", color: LB_COLORS.primary, fontFamily: "'Lexend',sans-serif", fontSize: 10 }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        <GreenButton onClick={onViewLeaderboards} size="sm">View Leaderboards</GreenButton>
      </div>
    </Panel>
  );
}

export function PredictionPrizesPanel({ onViewPredictions }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPredictionPrizes().then(setRows).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <Panel>
      <div className="flex flex-col items-center gap-4">
        <SectionBadge size="lg">Prize Pool</SectionBadge>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-3 px-1">
            <div className="w-[48px] text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>POSITION</div>
            <div className="flex-1 text-center text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>CONDITION</div>
            <div className="w-[75px] text-center text-[10px] uppercase" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>PRIZE</div>
          </div>

          {loading
            ? Array.from({ length: 4 }, (_, i) => <PredictionPrizeSkeleton key={i} />)
            : rows.map((r, i) => {
            const rank = i + 1;
            const color = placeColor(rank);
            return (
              <div
                key={r.position}
                className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3"
                style={{
                  background: LB_COLORS.panelLight,
                  border: rank === 1 ? `1px solid ${LB_COLORS.borderGreen50}` : "none",
                  boxShadow: rank === 1 ? "0 0 10px 0 rgba(84,233,138,0.8), 0 0 20px 0 rgba(84,233,138,0.4)" : "none",
                }}
              >
                <div className="w-[48px] text-[12px]" style={{ color, fontFamily: "'Lexend',sans-serif" }}>{r.position}</div>
                <div className="flex-1 text-center text-[12px]" style={{ color, fontFamily: "'Lexend',sans-serif" }}>{r.condition}</div>
                <div className="flex w-[75px] flex-col items-center gap-1">
                  <span aria-hidden="true" style={{ fontSize: 28 }}>{r.type === "phone" ? "📱" : "🪙"}</span>
                  <span className="text-center text-[9px]" style={{ color: LB_COLORS.primary, fontFamily: "'Lexend',sans-serif", lineHeight: "11px" }}>
                    {r.reward}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <GreenButton onClick={onViewPredictions} size="sm">View Predictions</GreenButton>
      </div>
    </Panel>
  );
}

export function PrizeInfo({ prize, onBack }) {
  return (
    <Panel>
      <div className="flex flex-col items-center gap-4">
        <SectionBadge size="lg">Prize Pool</SectionBadge>
        <div className="flex w-full flex-col gap-3 rounded-[8px] p-2" style={{ background: LB_COLORS.panelLight }}>
          <PrizePlaceholder name={prize?.name ?? "Grand Prize"} image={prize?.image} />
          <p className="text-[14px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif", lineHeight: "22px" }}>
            Live leaderboard allows players to get real-time updates on their rankings and see where they stand among others.
          </p>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 22 }}>🏆</span>
              <span className="text-[14px] uppercase" style={{ color: LB_COLORS.primary, fontFamily: "'Lexend',sans-serif", fontWeight: 600, letterSpacing: "0.5px" }}>
                {prize?.rank ? `${prize.rank}${placeSuffix(prize.rank)} Place` : "1st Place"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(prize?.code || prize?.flag) && <Flag code={prize.code} src={prize.flag} />}
              <span className="text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
                {prize?.name ?? ""}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-[8px] py-2 text-[14px]"
            style={{ background: "#2ECC71", color: "#005027", fontFamily: "'Lexend',sans-serif" }}
          >
            Back
          </button>
        </div>
      </div>
    </Panel>
  );
}
