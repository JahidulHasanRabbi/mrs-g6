"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import { Pagination } from "../../../components/admin/members/DataTable";
import LoadingOverlay from "../../../components/admin/ui/LoadingOverlay";
import ReportRangeBar, { presetRange, formatRangeLabel } from "../../../components/admin/reports/ReportRangeBar";
import {
  getUsageReportGames,
  getUsageReportInsights,
  getUsageReportMembers,
  getUsageReportRetention,
  getUsageReportSummary,
} from "../../../api/adminApi";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";
const CARD_BG = "linear-gradient(178deg, #11320e 0%, #031101 99.749%)";
const PANEL_BG = "linear-gradient(180deg, rgba(28,48,31,0.98) 0%, rgba(24,44,28,0.98) 100%)";

const ALL_GAMES_OPTION = { value: "all", label: "All Games" };

// Labels for ids the API sends without one. The filter itself is built from the
// unfiltered /usage-report/games/ rows (see gameOptions), so a game the backend
// doesn't report on is never offered and can never be sent back as an id the
// API would reject with a 400.
const GAME_LABELS = {
  1: "Lucky Spin",
  2: "Penalty Kick",
  3: "Smash Egg",
  4: "Prediction",
  5: "Avatar",
};

// Only used before the first /games/ response lands, or if that call fails.
const GAME_FALLBACK_OPTIONS = [1, 2, 3, 4].map((id) => ({ value: String(id), label: GAME_LABELS[id] }));

// The all-games view maps to /usage-report/summary/. For a selected game, these
// same cards are populated from that game's /usage-report/games/ row because
// the summary endpoint intentionally ignores the `game` query parameter.
//
// "Total Withdrawal" is a label-only rename of the existing total_tokens_consumed
// figure (per the approved spec, slide 12) — the API has no separate withdrawal
// metric, so this card intentionally reads that field.
const SUMMARY_CARDS = [
  { key: "total_active_users", label: "Active Users", icon: "users", hint: "Distinct members who played in this view" },
  { key: "total_sessions", label: "Total Sessions", icon: "plays", hint: "Total plays in this view" },
  { key: "total_tokens_consumed", label: "Total Withdrawal", icon: "withdraw", hint: "Tokens consumed in this period" },
  { key: "total_rewards_given", label: "Rewards Given", prefix: "RM", icon: "rm", hint: "RM paid out where tracked" },
  { key: "average_session_per_user", label: "Avg Sessions/User", decimals: 2, icon: "avg", hint: "Sessions ÷ active users" },
  { key: "avg_session_duration", label: "Avg. Session Duration", format: "duration", icon: "clock", hint: "Total time in-game ÷ days in this view" },
];

function formatNumber(value, decimals = 0) {
  if (value == null || value === "") return "0";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString("en-MY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// One uniform, viewport-scaled size for every card — same as the PIC
// dashboard's KpiCard — so all values in the row read at the same size.
// Tuned small enough that the longest value ("RM 2,510.50") still clears the
// narrowest 5-col card width; overflow-hidden + ellipsis is the fallback for
// anything longer.
const KPI_VALUE_FONT = "clamp(16px, 1.3vw, 22px)";

function formatMoney(value) {
  if (value == null || value === "") return "N/A";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// avg_session_duration is real now: total seconds spent in-game, summed
// across sessions in range, divided by the number of days in range (confirmed
// live and in doc/usage-report-api-reference.md, fed by the game-session
// ping heartbeat). Render it as a duration, not a raw seconds count.
function formatSessionDuration(value) {
  if (value == null || value === "") return "N/A";
  const totalSeconds = Number(value);
  if (!Number.isFinite(totalSeconds)) return "N/A";
  if (totalSeconds < 60) return `${formatNumber(totalSeconds, 1)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
}

function asPercentRate(value) {
  if (value == null) return "N/A";
  const num = Number(value);
  if (!Number.isFinite(num)) return "N/A";
  return `${(num * 100).toLocaleString("en-MY", { maximumFractionDigits: 1 })}%`;
}

function gameParams(range, game) {
  const params = { from_date: range.from, to_date: range.to };
  if (game !== "all") params.game = game;
  return params;
}

function firstApiMessage(data) {
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.details && typeof data.details === "object") {
    const message = Object.values(data.details).flat().find(Boolean);
    if (message) return message;
  }
  if (data?.error) return data.error;
  if (data && typeof data === "object") {
    return Object.values(data).flat().find(Boolean);
  }
  return null;
}

// The paginated endpoints (/games/, /games/retention/, /insights/) return the
// standard envelope { count, next, previous, results }. Pull the row list out of
// `results`, with fallbacks so the page still works if the response is ever a
// bare array.
function rowsOf(res) {
  if (Array.isArray(res?.results)) return res.results;
  if (Array.isArray(res)) return res;
  return [];
}

// "Total Withdrawal" (really total_tokens_consumed, see SUMMARY_CARDS) is
// scoped to the whole period, not the game, so it always reads from
// /summary/ — unlike Avg. Session Duration, which follows the selection.
// /summary/ already returns its own avg_session_duration for "all games";
// /games/ returns one per game — no client-side derivation needed for either.
function gameSummary(overallSummary, gameRows, game) {
  const totalTokensConsumed = overallSummary?.total_tokens_consumed ?? null;

  if (game === "all") {
    return { ...overallSummary, total_tokens_consumed: totalTokensConsumed };
  }

  const row = gameRows.find((item) => String(item.game) === String(game));
  if (!row) {
    return {
      total_active_users: 0,
      total_sessions: 0,
      total_rewards_given: null,
      average_session_per_user: 0,
      total_tokens_consumed: totalTokensConsumed,
      avg_session_duration: null,
    };
  }

  return {
    total_active_users: row.unique_players,
    total_sessions: row.sessions,
    total_rewards_given: row.credit_rm,
    average_session_per_user: row.avg_sessions_per_player,
    total_tokens_consumed: totalTokensConsumed,
    avg_session_duration: row.avg_session_duration ?? null,
  };
}

// Insights is one row per day and defaults to page_size 20 (max 100). For
// monthly/yearly ranges that would silently truncate the trend + history, so we
// page through with the max page size and concatenate until `next` is null.
async function fetchAllInsights(params) {
  const all = [];
  let page = 1;
  for (let guard = 0; guard < 60; guard += 1) {
    const res = await getUsageReportInsights({ ...params, page, page_size: 100 });
    const rows = rowsOf(res);
    all.push(...rows);
    if (!res?.next || rows.length === 0) break;
    page += 1;
  }
  return all;
}

function TinyIcon({ type, size = 22 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "tokens") return <svg {...common}><circle cx="8" cy="8" r="4" /><circle cx="16" cy="16" r="4" /><path d="M12 8h3a3 3 0 0 1 3 3v1" /></svg>;
  if (type === "rm") return <svg {...common}><path d="M6 18V6h6a4 4 0 0 1 0 8H6" /><path d="M14 14l4 4" /></svg>;
  if (type === "withdraw") return <svg {...common}><rect x="3" y="10" width="18" height="10" rx="2" /><path d="M3 10l9-6 9 6" /><path d="M12 20v-6" /><path d="M9 17l3 3 3-3" /></svg>;
  if (type === "clock") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
  if (type === "avg") return <svg {...common}><path d="M4 19V5" /><path d="M4 19h16" /><path d="M7 15l4-4 3 3 5-7" /></svg>;
  if (type === "plays") return <svg {...common}><path d="M8 5v14l11-7z" /></svg>;
  return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}

function MetricCard({ metric, summary }) {
  const raw = summary?.[metric.key];
  let value;
  if (metric.format === "duration") value = formatSessionDuration(raw);
  else if (metric.prefix === "RM") value = formatMoney(raw);
  else value = formatNumber(raw, metric.decimals || 0);

  // "RM N/A" reads like a bug, so the prefix is dropped when there is no figure.
  const prefix = metric.prefix && value !== "N/A" ? metric.prefix : null;

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border-2 border-[#05060a] p-4" style={{ backgroundImage: CARD_BG }}>
      <div className="flex w-full items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[linear-gradient(175deg,#141828_0%,#333333_100%)] text-[#e9af41] shadow-[0_0_14px_rgba(222,162,32,0.22)]">
          <TinyIcon type={metric.icon} size={18} />
        </div>
        <p className="min-w-0 flex-1 text-[12px] font-semibold uppercase leading-[15px] text-[#f6dda6]" style={{ letterSpacing: "-0.3px" }}>
          {metric.label}
        </p>
      </div>
      <p
        className="block w-full overflow-hidden text-ellipsis whitespace-nowrap bg-clip-text font-bold text-transparent tabular-nums"
        style={{ backgroundImage: GOLD_BG, fontSize: KPI_VALUE_FONT, lineHeight: "1.2" }}
        title={`${prefix ? `${prefix} ` : ""}${value}`}
      >
        {prefix ? <span className="text-[0.7em]">{prefix} </span> : null}{value}
      </p>
      {metric.hint ? <p className="text-[11px] leading-4 text-white/45">{metric.hint}</p> : null}
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Themed single-select dropdown — replaces the native <select> so the control
// matches the gold/green admin theme (button + listbox, click-outside to close)
// instead of the OS default styling.
function Dropdown({ value, options, onChange, minWidth = 180 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="relative" ref={ref} style={{ minWidth }}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex h-10 w-full items-center justify-between gap-3 rounded-[8px] border border-[#f2cb7a] bg-[#0c1018] px-4 text-[13px] font-semibold text-[#fbeed2] transition hover:bg-white/5">
        <span className="truncate">{selected?.label ?? "Select"}</span>
        <span className="text-[#e9af41]"><ChevronIcon open={open} /></span>
      </button>
      {open && (
        <ul role="listbox" className="absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-[8px] border border-[#f2cb7a] bg-[#0c1018] py-1 shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value}>
                <button type="button" onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center justify-between px-4 py-2 text-left text-[13px] transition ${active ? "bg-[#e9af41]/15 text-[#f6dda6]" : "text-[#fbeed2] hover:bg-white/5"}`}>
                  {option.label}
                  {active ? <span className="text-[#e9af41]">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EngagementCard({ summary }) {
  const buckets = [
    { label: "Played exactly 1 game", value: summary?.played_1_game || 0 },
    { label: "Played exactly 2 games", value: summary?.played_2_games || 0 },
    { label: "Played exactly 3 games", value: summary?.played_3_games || 0 },
    { label: "Played 4 or more games", value: summary?.played_4_plus_games || 0 },
  ];
  const total = Math.max(1, buckets.reduce((sum, b) => sum + Number(b.value || 0), 0));

  return (
    <section className="rounded-[16px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ backgroundImage: PANEL_BG }}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-[#f4efe0]">Engagement Breakdown</h2>
        </div>
        <span className="rounded-full border border-[#e9af41]/50 px-3 py-1 text-[11px] font-semibold text-[#e9af41]">{formatNumber(summary?.total_active_users)} users</span>
      </div>
      <div className="flex flex-col gap-4">
        {buckets.map((bucket) => {
          const pct = (Number(bucket.value || 0) / total) * 100;
          return (
            <div key={bucket.label}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="font-semibold text-white/80">{bucket.label}</span>
                <span className="text-[#f6dda6]">{formatNumber(bucket.value)} <span className="text-white/40">({Math.round(pct)}%)</span></span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/40">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundImage: GOLD_BG }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SummaryBreakdownPanel({ summary }) {
  const leaderboard = summary?.leaderboard || {};
  const mission = summary?.mission || {};
  const leaderboardRows = [
    { label: "Total Participants", value: leaderboard.total_participants },
    { label: "Deposit", value: leaderboard.deposit_participants },
    { label: "Withdraw", value: leaderboard.withdraw_participants },
    { label: "Referral", value: leaderboard.referral_participants },
  ];
  const missionRows = [
    { label: "Completions", value: mission.total_completions },
    { label: "Unique Completed", value: mission.unique_members_completed },
    { label: "Claims", value: mission.total_claims },
    { label: "KR Coins Awarded", value: mission.total_tokens_awarded },
    { label: "Unique Claimed", value: mission.unique_members_claimed },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="rounded-[16px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ backgroundImage: PANEL_BG }}>
        <div className="mb-4">
          <h2 className="text-[20px] font-bold text-[#f4efe0]">Leaderboard Participation</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {leaderboardRows.map((row) => (
            <div key={row.label} className="rounded-[12px] border border-white/5 bg-black/20 p-4">
              <p className="text-[11px] font-semibold uppercase text-white/45">{row.label}</p>
              <p className="mt-2 text-[24px] font-bold text-[#f6dda6]">{formatNumber(row.value)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[16px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ backgroundImage: PANEL_BG }}>
        <div className="mb-4">
          <h2 className="text-[20px] font-bold text-[#f4efe0]">Mission Activity</h2>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {missionRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 rounded-[10px] border border-white/5 bg-black/20 px-4 py-3">
              <span className="text-[12px] font-semibold text-white/65">{row.label}</span>
              <span className="text-[16px] font-bold text-[#f6dda6]">{formatNumber(row.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendChart({ rows }) {
  const points = rows.length ? rows : [];
  const width = 640;
  const height = 230;
  const padX = 34;
  const padY = 24;
  const max = Math.max(...points.map((p) => Math.max(Number(p.players || 0), Number(p.sessions || 0), Number(p.tokens_consumed || 0))), 1);

  const pathFor = (key) => points.map((row, index) => {
    const x = points.length === 1 ? width / 2 : padX + (index / (points.length - 1)) * (width - padX * 2);
    const y = height - padY - (Number(row[key] || 0) / max) * (height - padY * 2);
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const labels = points.filter((_, index) => index === 0 || index === points.length - 1 || index === Math.floor(points.length / 2));

  return (
    <section className="rounded-[16px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ backgroundImage: PANEL_BG }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-[#f4efe0]">Daily Usage Trend</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/70">
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#54d7ff]" />Players</span>
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#f2cb7a]" />Sessions</span>
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#a78bfa]" />KR Coins</span>
        </div>
      </div>
      {points.length ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[230px] w-full" preserveAspectRatio="none">
          {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2={width} y1={padY + line * ((height - padY * 2) / 3)} y2={padY + line * ((height - padY * 2) / 3)} stroke="rgba(255,255,255,0.08)" />)}
          <path d={pathFor("players")} fill="none" stroke="#54d7ff" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d={pathFor("sessions")} fill="none" stroke="#f2cb7a" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d={pathFor("tokens_consumed")} fill="none" stroke="#a78bfa" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          {labels.map((row) => {
            const index = points.indexOf(row);
            const x = points.length === 1 ? width / 2 : padX + (index / (points.length - 1)) * (width - padX * 2);
            return <text key={row.date} x={x} y={height - 4} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.55)">{row.date?.slice(5)}</text>;
          })}
        </svg>
      ) : (
        <div className="flex h-[230px] items-center justify-center rounded-[12px] border border-white/5 bg-black/20 text-[13px] text-white/50">No trend data for this range.</div>
      )}
    </section>
  );
}

function GamePerformance({ games }) {
  const sorted = [...games].sort((a, b) => Number(b.unique_players || 0) - Number(a.unique_players || 0));
  return (
    <section className="overflow-hidden rounded-[16px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ backgroundImage: PANEL_BG }}>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#f4efe0]">Game Performance</h2>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[860px] table-fixed border-separate border-spacing-0">
          <thead><tr className="bg-black text-left">
            {["Rank", "Game", "Players", "Sessions", "Avg/Player", "KR Coins Spent", "Credit RM", "New", "Existing"].map((h) => <th key={h} className="px-4 py-3 text-[12px] font-bold uppercase text-white">{h}</th>)}
          </tr></thead>
          <tbody>
            {sorted.length ? sorted.map((game, index) => (
              <tr key={game.game} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-4 text-[13px] font-bold text-[#e9af41]">#{index + 1}</td>
                <td className="px-4 py-4 text-[13px] font-semibold text-white">{game.label}</td>
                <td className="px-4 py-4 text-[13px] text-white/85">{formatNumber(game.unique_players)}</td>
                <td className="px-4 py-4 text-[13px] text-white/85">{formatNumber(game.sessions)}</td>
                <td className="px-4 py-4 text-[13px] text-white/85">{formatNumber(game.avg_sessions_per_player, 2)}</td>
                <td className="px-4 py-4 text-[13px] text-white/85">{formatNumber(game.tokens_consumed)}</td>
                <td className="px-4 py-4 text-[13px] text-[#f6dda6]">{game.credit_rm == null ? "N/A" : `RM ${formatMoney(game.credit_rm)}`}</td>
                <td className="px-4 py-4 text-[13px] text-[#84ebb4]">{formatNumber(game.new_users)}</td>
                <td className="px-4 py-4 text-[13px] text-white/70">{formatNumber(game.existing_users)}</td>
              </tr>
            )) : (
              <tr><td colSpan={9} className="px-5 py-12 text-center text-[13px] text-white/50">No game usage data for this range.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RetentionPanel({ rows }) {
  return (
    <section className="rounded-[16px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ backgroundImage: PANEL_BG }}>
      <div className="mb-4">
        <h2 className="text-[20px] font-bold text-[#f4efe0]">Cohort Retention</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.length ? rows.map((row) => (
          <div key={row.game} className="rounded-[12px] border border-white/5 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[14px] font-bold text-white">{row.label}</span>
              <span className="rounded-full bg-[#e9af41]/15 px-3 py-1 text-[11px] font-semibold text-[#f6dda6]">Cohort {formatNumber(row.cohort)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[8px] bg-[#07190d] p-3"><p className="text-[11px] text-white/50">D1</p><p className="text-[18px] font-bold text-[#84ebb4]">{asPercentRate(row.d1)}</p></div>
              <div className="rounded-[8px] bg-[#07190d] p-3"><p className="text-[11px] text-white/50">D7</p><p className="text-[18px] font-bold text-[#54d7ff]">{asPercentRate(row.d7)}</p></div>
              <div className="rounded-[8px] bg-[#07190d] p-3"><p className="text-[11px] text-white/50">D30</p><p className="text-[18px] font-bold text-[#f2cb7a]">{asPercentRate(row.d30)}</p></div>
            </div>
          </div>
        )) : <div className="rounded-[12px] border border-white/5 bg-black/20 px-5 py-12 text-center text-[13px] text-white/50 sm:col-span-2 lg:col-span-3 xl:col-span-4">No retention data for this range.</div>}
      </div>
    </section>
  );
}

const MEMBER_PAGE_SIZE = 10;

// Sortable keys double as the endpoint's `sort` values — tokens_used,
// battle_point_used, sessions, avg_session_duration, total_credit,
// total_withdrawal. `direction` defaults to High on the backend; there's no
// direction toggle in this UI yet, so it's always omitted (High).
const MEMBER_COLUMNS = [
  { key: "no", label: "No.", className: "w-[56px]" },
  { key: "phone_number", label: "Phone Number", className: "w-[130px]" },
  { key: "username", label: "Username", className: "w-[130px]" },
  { key: "station", label: "Station", className: "w-[110px]" },
  { key: "tokens_used", label: "KR Coins Used", className: "w-[115px]", sortable: true },
  { key: "battle_point_used", label: "Battle Point Used", className: "w-[145px]", sortable: true },
  { key: "avg_session_duration", label: "Avg. Session Duration", className: "w-[165px]", sortable: true },
  { key: "most_played_game", label: "Most Played Game", className: "w-[145px]" },
  { key: "total_credit", label: "Total Credit", className: "w-[125px]", sortable: true },
  { key: "total_withdrawal", label: "Total Withdrawal", className: "w-[135px]", sortable: true },
];

function gameLabel(value) {
  if (value == null || value === "") return "N/A";
  return GAME_LABELS[String(value)] || String(value);
}

function normalizeMemberRow(row, index) {
  return {
    key: row.uuid || row.member_uuid || row.id || `${row.phone_number || ""}-${index}`,
    no: row.no,
    phone_number: row.phone_number,
    username: row.username,
    station: row.station ?? row.station_name,
    tokens_used: row.tokens_used,
    battle_point_used: row.battle_point_used,
    avg_session_duration: row.avg_session_duration,
    most_played_game: row.most_played_game_label ?? row.most_played_game,
    total_credit: row.total_credit,
    total_withdrawal: row.total_withdrawal,
  };
}

// The backend sorts high-to-low only — there is no ascending mode — so this
// just marks which column is active rather than offering a direction toggle.
function SortIcon({ active }) {
  const stroke = active ? "#f2cb7a" : "rgba(255,255,255,0.5)";
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="ml-1 shrink-0">
      <path d="M4 9L7 12L10 9" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One row per member for the selected range/game, paged and ordered by the
// backend so a sort covers every member, not just the visible page.
function MemberUsageHistory({ range, game }) {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("tokens_used");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const fetchPage = useCallback(async (nextPage) => {
    if (!range.from || !range.to) return;
    setLoading(true);
    setError("");
    try {
      const res = await getUsageReportMembers({
        ...gameParams(range, game),
        page: nextPage,
        page_size: MEMBER_PAGE_SIZE,
        sort: sortKey,
      });
      setRows(rowsOf(res).map(normalizeMemberRow));
      setCount(Number(res?.count ?? 0));
      setUnavailable(false);
    } catch (err) {
      console.error(err);
      setRows([]);
      setCount(0);
      setUnavailable(err?.status === 404);
      setError(err?.status === 404 ? "" : firstApiMessage(err?.data) || err?.message || "Failed to load member usage history.");
    } finally {
      setLoading(false);
    }
  }, [range, game, sortKey]);

  useEffect(() => {
    setPage(1);
    fetchPage(1);
  }, [fetchPage]);

  const totalPages = Math.max(1, Math.ceil(count / MEMBER_PAGE_SIZE));
  const startIndex = (page - 1) * MEMBER_PAGE_SIZE;

  const handlePageChange = (next) => {
    setPage(next);
    fetchPage(next);
  };

  const emptyMessage = unavailable
    ? "Member usage history is not available yet — /usage-report/members/ has not been deployed."
    : "No member usage for this range.";

  return (
    <section className="overflow-hidden rounded-[16px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ backgroundImage: PANEL_BG }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#f4efe0]">Member Usage History</h2>
          <p className="mt-1 text-[12px] text-white/45">{formatRangeLabel(range)}</p>
        </div>
        <span className="rounded-full border border-[#e9af41]/50 px-3 py-1 text-[11px] font-semibold text-[#e9af41]">{formatNumber(count)} members</span>
      </div>
      {error ? <div className="mx-5 mb-4 rounded-[10px] border border-red-400/40 bg-red-500/10 px-4 py-2 text-[12px] text-red-100">{error}</div> : null}
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[1395px] table-fixed border-separate border-spacing-0">
          <thead><tr className="bg-black text-left">
            {MEMBER_COLUMNS.map((column) => (
              <th key={column.key} className={`${column.className} px-4 py-3 text-[12px] font-bold uppercase text-white`}>
                {column.sortable ? (
                  <button type="button" onClick={() => setSortKey(column.key)} className="flex w-full items-center text-left uppercase transition hover:text-[#f6dda6]">
                    <span>{column.label}</span>
                    <SortIcon active={sortKey === column.key} />
                  </button>
                ) : column.label}
              </th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={MEMBER_COLUMNS.length} className="px-5 py-12 text-center text-[13px] text-white/50">Loading member usage...</td></tr>
            ) : rows.length ? rows.map((row, index) => (
              <tr key={row.key} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-[13px] text-white/60">{row.no ?? startIndex + index + 1}</td>
                <td className="truncate px-4 py-3 text-[13px] text-white/85" title={row.phone_number || ""}>{row.phone_number || "N/A"}</td>
                <td className="truncate px-4 py-3 text-[13px] font-semibold text-white" title={row.username || ""}>{row.username || "N/A"}</td>
                <td className="truncate px-4 py-3 text-[13px] text-white/70" title={row.station || ""}>{row.station || "N/A"}</td>
                <td className="px-4 py-3 text-[13px] text-[#a78bfa]">{formatNumber(row.tokens_used)}</td>
                <td className="px-4 py-3 text-[13px] text-[#54d7ff]">{formatNumber(row.battle_point_used)}</td>
                <td className="px-4 py-3 text-[13px] text-white/85">{formatSessionDuration(row.avg_session_duration)}</td>
                <td className="truncate px-4 py-3 text-[13px] text-white/85" title={gameLabel(row.most_played_game)}>{gameLabel(row.most_played_game)}</td>
                <td className="px-4 py-3 text-[13px] text-[#f6dda6]">{row.total_credit == null ? "N/A" : `RM ${formatMoney(row.total_credit)}`}</td>
                <td className="px-4 py-3 text-[13px] text-[#84ebb4]">{row.total_withdrawal == null ? "N/A" : `RM ${formatMoney(row.total_withdrawal)}`}</td>
              </tr>
            )) : (
              <tr><td colSpan={MEMBER_COLUMNS.length} className="px-5 py-12 text-center text-[13px] text-white/50">{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="border-t border-white/5 px-3">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      ) : null}
    </section>
  );
}

function UsageReportContent() {
  const [preset, setPreset] = useState("daily");
  const [range, setRange] = useState(() => presetRange("daily"));
  const [game, setGame] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [games, setGames] = useState([]);
  const [retention, setRetention] = useState([]);
  const [trend, setTrend] = useState([]);

  // Built from the games the API actually reports on, so a new game (Avatar)
  // shows up in the filter as soon as the backend includes it — no release here.
  const gameOptions = useMemo(() => {
    const fromApi = games
      .filter((row) => row?.game != null)
      .map((row) => ({ value: String(row.game), label: row.label || GAME_LABELS[String(row.game)] || `Game ${row.game}` }))
      .sort((a, b) => Number(a.value) - Number(b.value));
    return [ALL_GAMES_OPTION, ...(fromApi.length ? fromApi : GAME_FALLBACK_OPTIONS)];
  }, [games]);

  const selectedGameLabel = useMemo(() => gameOptions.find((option) => option.value === game)?.label || "All Games", [gameOptions, game]);
  const metricSummary = useMemo(() => gameSummary(summary, games, game), [summary, games, game]);
  const performanceRows = useMemo(
    () => (game === "all" ? games : games.filter((row) => String(row.game) === String(game))),
    [games, game],
  );

  const handlePreset = useCallback((next) => {
    setPreset(next);
    const computed = presetRange(next);
    if (computed) setRange(computed);
  }, []);

  const handleCustomRange = useCallback((next) => {
    setPreset("custom");
    setRange(next);
  }, []);

  const loadReport = useCallback(async () => {
    if (!range.from || !range.to) return;
    setLoading(true);
    setError("");
    try {
      const params = gameParams(range, game);
      const [summaryRes, gamesRes, retentionRes, insightsRows] = await Promise.all([
        getUsageReportSummary({ from_date: range.from, to_date: range.to }),
        // Deliberately unfiltered: this one response feeds the game filter's
        // options, the per-game KPI lookup, and the table (narrowed locally).
        getUsageReportGames({ from_date: range.from, to_date: range.to, page_size: 100 }),
        getUsageReportRetention({ ...params, page_size: 100 }),
        fetchAllInsights(params),
      ]);
      setSummary(summaryRes || null);
      setGames(rowsOf(gamesRes));
      setRetention(rowsOf(retentionRes));
      setTrend(insightsRows);
    } catch (err) {
      console.error(err);
      setSummary(null);
      setGames([]);
      setRetention([]);
      setTrend([]);
      setError(firstApiMessage(err?.data) || err?.message || "Failed to load usage report.");
    } finally {
      setLoading(false);
    }
  }, [range, game]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:admin-content-pl xl:pr-12">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#e9af41]">MRS System</p>
          <h1 className="text-2xl font-bold leading-[1.05] text-white sm:text-3xl lg:text-4xl">Usage Report</h1>
        </div>
        <div className="rounded-[14px] border border-[#e9af41]/35 bg-[#0c1018] px-4 py-3 text-right">
          <p className="text-[11px] uppercase text-white/45">Current View</p>
          <p className="text-[15px] font-bold text-[#f6dda6]">{selectedGameLabel}</p>
        </div>
      </div>

      <div className="mb-5">
        <ReportRangeBar
          preset={preset}
          range={range}
          onPreset={handlePreset}
          onRangeChange={handleCustomRange}
          rightSlot={<Dropdown value={game} options={gameOptions} onChange={setGame} />}
        />
      </div>

      {error ? <div className="mb-5 rounded-[12px] border border-red-400/40 bg-red-500/10 px-4 py-3 text-[13px] text-red-100">{error}</div> : null}

      <div className="relative">
        {/* Two rows of three, not six across: at 6 columns a value like
            "RM 51,200.00" truncates below ~1900px, including 1440 and 1600. */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUMMARY_CARDS.map((metric) => <MetricCard key={metric.key} metric={metric} summary={metricSummary} />)}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <EngagementCard summary={summary} />
          <TrendChart rows={trend} />
        </div>

        <div className="mt-5">
          <SummaryBreakdownPanel summary={summary} />
        </div>

        <div className="mt-5">
          <GamePerformance games={performanceRows} />
        </div>

        <div className="mt-5">
          <RetentionPanel rows={retention} />
        </div>

        <div className="mt-5">
          <MemberUsageHistory range={range} game={game} />
        </div>

        {loading ? <LoadingOverlay label="Loading usage report..." /> : null}
      </div>
    </main>
  );
}

export default function UsageReportPage() {
  return (
    <AdminRouteGuard>
      <UsageReportContent />
    </AdminRouteGuard>
  );
}
