"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import RangePicker from "../../../components/admin/RangePicker";
import { Pagination } from "../../../components/admin/members/DataTable";
import {
  getUsageReportGames,
  getUsageReportInsights,
  getUsageReportRetention,
  getUsageReportSummary,
} from "../../../api/adminApi";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";
const CARD_BG = "linear-gradient(178deg, #11320e 0%, #031101 99.749%)";
const PANEL_BG = "linear-gradient(180deg, rgba(28,48,31,0.98) 0%, rgba(24,44,28,0.98) 100%)";

const GAME_OPTIONS = [
  { value: "all", label: "All Games" },
  { value: "1", label: "Lucky Spin" },
  { value: "2", label: "Penalty Kick" },
  { value: "3", label: "Smash Egg" },
  { value: "4", label: "Prediction" },
];

// Summary KPIs map 1:1 to the flat /usage-report/summary/ response. The endpoint
// returns only these scalar fields — there are no change/percent-vs-previous
// fields in the spec, so the cards show the raw value only.
const SUMMARY_CARDS = [
  { key: "total_active_users", label: "Active Users", icon: "users", hint: "Distinct members who played any game" },
  { key: "total_sessions", label: "Total Sessions", icon: "plays", hint: "Total plays across all games" },
  { key: "total_tokens_consumed", label: "Tokens Consumed", icon: "tokens", hint: "Tokens spent across all games" },
  { key: "total_rewards_given", label: "Rewards Given", prefix: "RM", icon: "rm", hint: "Penalty Kick + Smash Egg only" },
  { key: "average_session_per_user", label: "Avg Sessions/User", decimals: 2, icon: "avg", hint: "Sessions ÷ active users" },
];

function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const QUICK_FILTERS = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Range presets used by the quick-filter buttons. Each returns an inclusive
// { from, to } window ending today; "custom" returns null (handled by the
// RangePicker). Changing the preset re-drives every endpoint via the shared
// `range` state, so all cards/charts/tables update together.
function presetRange(preset) {
  const today = new Date();
  if (preset === "daily") {
    const iso = toIso(today);
    return { from: iso, to: iso };
  }
  if (preset === "monthly") {
    return { from: toIso(new Date(today.getFullYear(), today.getMonth(), 1)), to: toIso(today) };
  }
  if (preset === "yearly") {
    return { from: toIso(new Date(today.getFullYear(), 0, 1)), to: toIso(today) };
  }
  return null;
}

function formatRangeLabel(range) {
  if (!range?.from || !range?.to) return "Select range";
  const fmt = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };
  return range.from === range.to ? fmt(range.from) : `${fmt(range.from)} – ${fmt(range.to)}`;
}

function formatNumber(value, decimals = 0) {
  if (value == null || value === "") return "0";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString("en-MY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatDate(iso) {
  if (!iso) return "N/A";
  const [y, m, d] = iso.split("-");
  if (!d) return iso;
  return `${d}/${m}/${y}`;
}

function formatMoney(value) {
  if (value == null || value === "") return "N/A";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

// The paginated endpoints (/games/, /games/retention/, /insights/) return the
// standard envelope { count, next, previous, results }. Pull the row list out of
// `results`, with fallbacks so the page still works if the response is ever a
// bare array.
function rowsOf(res) {
  if (Array.isArray(res?.results)) return res.results;
  if (Array.isArray(res)) return res;
  return [];
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

function TinyIcon({ type }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "tokens") return <svg {...common}><circle cx="8" cy="8" r="4" /><circle cx="16" cy="16" r="4" /><path d="M12 8h3a3 3 0 0 1 3 3v1" /></svg>;
  if (type === "rm") return <svg {...common}><path d="M6 18V6h6a4 4 0 0 1 0 8H6" /><path d="M14 14l4 4" /></svg>;
  if (type === "avg") return <svg {...common}><path d="M4 19V5" /><path d="M4 19h16" /><path d="M7 15l4-4 3 3 5-7" /></svg>;
  if (type === "plays") return <svg {...common}><path d="M8 5v14l11-7z" /></svg>;
  return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}

function RefreshIcon({ spinning }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={spinning ? { animation: "usage-spin 0.7s linear infinite" } : undefined}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function MetricCard({ metric, summary }) {
  const raw = summary?.[metric.key];
  const value = metric.prefix === "RM" ? formatMoney(raw) : formatNumber(raw, metric.decimals || 0);

  return (
    <div className="min-h-[140px] rounded-[16px] border-2 border-[#05060a] p-5" style={{ backgroundImage: CARD_BG }}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-[linear-gradient(175deg,#141828_0%,#333333_100%)] text-[#e9af41] shadow-[0_0_14px_rgba(222,162,32,0.22)]">
          <TinyIcon type={metric.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase leading-5 text-[#f6dda6]">{metric.label}</p>
          <p className="mt-1 truncate bg-clip-text text-[28px] font-bold leading-tight text-transparent" style={{ backgroundImage: GOLD_BG }} title={`${metric.prefix ? `${metric.prefix} ` : ""}${value}`}>
            {metric.prefix ? <span className="text-[18px]">{metric.prefix} </span> : null}{value}
          </p>
        </div>
      </div>
      {metric.hint ? <p className="mt-4 text-[11px] leading-4 text-white/45">{metric.hint}</p> : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
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

function PresetButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-semibold transition ${active ? "border-[#f2cb7a] text-[#141828] shadow-[0_2px_10px_rgba(222,162,32,0.25)]" : "border-[#f2cb7a]/40 text-[#fbeed2] hover:bg-white/5"}`}
      style={active ? { backgroundImage: GOLD_BG } : undefined}
    >
      {children}
    </button>
  );
}

function FilterBar({ preset, range, game, loading, onPreset, onRangeChange, onGameChange, onRefresh }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-black/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_FILTERS.map((filter) => (
          <PresetButton key={filter.value} active={preset === filter.value} onClick={() => onPreset(filter.value)}>
            <CalendarIcon />
            {filter.label}
          </PresetButton>
        ))}
        <RangePicker
          fromDate={range.from}
          toDate={range.to}
          onApply={(from, to) => {
            if (from && to) onRangeChange({ from, to });
          }}
          align="left"
          trigger={({ open }) => (
            <button
              type="button"
              onClick={open}
              className={`inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-semibold transition ${preset === "custom" ? "border-[#f2cb7a] text-[#141828]" : "border-[#f2cb7a]/40 text-[#fbeed2] hover:bg-white/5"}`}
              style={preset === "custom" ? { backgroundImage: GOLD_BG } : undefined}
            >
              <CalendarIcon />
              {preset === "custom" ? formatRangeLabel(range) : "Custom"}
            </button>
          )}
        />
        {preset !== "custom" ? <span className="ml-1 hidden text-[12px] text-white/45 lg:inline">{formatRangeLabel(range)}</span> : null}
      </div>
      <div className="flex items-center gap-2">
        <Dropdown value={game} options={GAME_OPTIONS} onChange={onGameChange} />
        <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#f2cb7a]/60 px-4 text-[13px] font-semibold text-[#fbeed2] transition hover:bg-white/5 disabled:opacity-60">
          <RefreshIcon spinning={loading} />
          Refresh
        </button>
      </div>
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
          <p className="mt-1 text-[12px] text-white/50">Each active user is counted once, grouped by how many different games they played. The rows add up to total active users.</p>
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
          <p className="mt-1 text-[12px] text-white/50">Players, sessions, and tokens from the insights endpoint.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/70">
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#54d7ff]" />Players</span>
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#f2cb7a]" />Sessions</span>
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#a78bfa]" />Tokens</span>
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
          <p className="mt-1 text-[12px] text-white/50">Usage and full reward breakdown per game, sorted by unique players (top mini-game ranking). Credit RM shows N/A for games that track no recoverable RM (Lucky Spin, Prediction).</p>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0">
          <thead><tr className="bg-black text-left">
            {["Rank", "Game", "Players", "Sessions", "Avg/Player", "Tokens Spent", "Rewards", "Credit RM", "Tokens Won", "Prizes", "WC Pts", "New", "Existing"].map((h) => <th key={h} className="px-4 py-3 text-[12px] font-bold uppercase text-white">{h}</th>)}
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
                <td className="px-4 py-4 text-[13px] text-white/85">{formatNumber(game.rewards_given)}</td>
                <td className="px-4 py-4 text-[13px] text-[#f6dda6]">{game.credit_rm == null ? "N/A" : `RM ${formatMoney(game.credit_rm)}`}</td>
                <td className="px-4 py-4 text-[13px] text-white/85">{formatNumber(game.tokens_awarded)}</td>
                <td className="px-4 py-4 text-[13px] text-white/85">{formatNumber(game.prizes_awarded)}</td>
                <td className="px-4 py-4 text-[13px] text-white/85">{game.wc_score_awarded == null ? "N/A" : formatNumber(game.wc_score_awarded)}</td>
                <td className="px-4 py-4 text-[13px] text-[#84ebb4]">{formatNumber(game.new_users)}</td>
                <td className="px-4 py-4 text-[13px] text-white/70">{formatNumber(game.existing_users)}</td>
              </tr>
            )) : (
              <tr><td colSpan={13} className="px-5 py-12 text-center text-[13px] text-white/50">No game usage data for this range.</td></tr>
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
        <p className="mt-1 text-[12px] text-white/50">Of players whose first-ever play of a game falls in this range (the cohort), the share who came back to play it again. Cumulative: D1 ≤ D7 ≤ D30. Same-day replays don't count.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
        )) : <div className="rounded-[12px] border border-white/5 bg-black/20 px-5 py-12 text-center text-[13px] text-white/50 sm:col-span-2 xl:col-span-4">No retention data for this range.</div>}
      </div>
    </section>
  );
}

const HISTORY_PAGE_SIZE = 10;

// Full daily-history table built from the insights `trend` series. Same data as
// the trend chart but as a paginated, totalled list (newest day first). Players
// is daily-distinct so it is not summed in the footer; sessions/tokens are
// additive and totalled.
function HistoryTable({ rows }) {
  const [page, setPage] = useState(1);
  const ordered = useMemo(() => [...rows].reverse(), [rows]);
  const totalPages = Math.max(1, Math.ceil(ordered.length / HISTORY_PAGE_SIZE));

  useEffect(() => { setPage(1); }, [rows]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const pageRows = ordered.slice((page - 1) * HISTORY_PAGE_SIZE, page * HISTORY_PAGE_SIZE);
  const totals = ordered.reduce(
    (acc, row) => {
      acc.sessions += Number(row.sessions || 0);
      acc.tokens += Number(row.tokens_consumed || 0);
      return acc;
    },
    { sessions: 0, tokens: 0 }
  );

  return (
    <section className="overflow-hidden rounded-[16px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ backgroundImage: PANEL_BG }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#f4efe0]">Daily Activity History</h2>
          <p className="mt-1 text-[12px] text-white/50">Day-by-day players, sessions, and tokens for the selected range (newest first).</p>
        </div>
        <span className="rounded-full border border-[#e9af41]/50 px-3 py-1 text-[11px] font-semibold text-[#e9af41]">{formatNumber(ordered.length)} days</span>
      </div>
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-0">
          <thead><tr className="bg-black text-left">
            {["No", "Date", "Players", "Sessions", "Tokens"].map((h) => <th key={h} className="px-4 py-3 text-[12px] font-bold uppercase text-white">{h}</th>)}
          </tr></thead>
          <tbody>
            {pageRows.length ? pageRows.map((row, index) => (
              <tr key={row.date} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-[13px] text-white/60">{(page - 1) * HISTORY_PAGE_SIZE + index + 1}</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-white">{formatDate(row.date)}</td>
                <td className="px-4 py-3 text-[13px] text-[#54d7ff]">{formatNumber(row.players)}</td>
                <td className="px-4 py-3 text-[13px] text-[#f6dda6]">{formatNumber(row.sessions)}</td>
                <td className="px-4 py-3 text-[13px] text-[#a78bfa]">{formatNumber(row.tokens_consumed)}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-[13px] text-white/50">No daily activity for this range.</td></tr>
            )}
          </tbody>
          {ordered.length ? (
            <tfoot><tr className="bg-black/40">
              <td className="px-4 py-3 text-[12px] font-bold uppercase text-white/70" colSpan={2}>Total</td>
              <td className="px-4 py-3 text-[13px] font-bold text-white/40">—</td>
              <td className="px-4 py-3 text-[13px] font-bold text-[#f6dda6]">{formatNumber(totals.sessions)}</td>
              <td className="px-4 py-3 text-[13px] font-bold text-[#a78bfa]">{formatNumber(totals.tokens)}</td>
            </tr></tfoot>
          ) : null}
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="border-t border-white/5 px-3">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </section>
  );
}

function UsageReportContent() {
  const [preset, setPreset] = useState("monthly");
  const [range, setRange] = useState(() => presetRange("monthly"));
  const [game, setGame] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState(null);
  const [games, setGames] = useState([]);
  const [retention, setRetention] = useState([]);
  const [trend, setTrend] = useState([]);

  const selectedGameLabel = useMemo(() => GAME_OPTIONS.find((option) => option.value === game)?.label || "All Games", [game]);

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
        getUsageReportGames(params),
        getUsageReportRetention(params),
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
      setError(err?.data?.detail || err?.data?.details || err?.data?.error || err?.message || "Failed to load usage report.");
    } finally {
      setLoading(false);
    }
  }, [range, game]);

  useEffect(() => {
    loadReport();
  }, [loadReport, refreshKey]);

  return (
    <main className="min-h-screen xl:admin-content-pl pr-10 pt-8 pb-10">
      <style>{`@keyframes usage-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#e9af41]">MRS System</p>
          <h1 className="text-4xl font-bold leading-[1.05] text-white">Usage Report</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-white/55">Read-only mini-game analytics for sessions, tokens, rewards, engagement, retention, and daily activity.</p>
        </div>
        <div className="rounded-[14px] border border-[#e9af41]/35 bg-[#0c1018] px-4 py-3 text-right">
          <p className="text-[11px] uppercase text-white/45">Current View</p>
          <p className="text-[15px] font-bold text-[#f6dda6]">{selectedGameLabel}</p>
        </div>
      </div>

      <div className="mb-5">
        <FilterBar preset={preset} range={range} game={game} loading={loading} onPreset={handlePreset} onRangeChange={handleCustomRange} onGameChange={setGame} onRefresh={() => setRefreshKey((key) => key + 1)} />
      </div>

      {error ? <div className="mb-5 rounded-[12px] border border-red-400/40 bg-red-500/10 px-4 py-3 text-[13px] text-red-100">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {SUMMARY_CARDS.map((metric) => <MetricCard key={metric.key} metric={metric} summary={summary} />)}
      </div>
      <p className="mb-5 mt-2 text-[11px] leading-4 text-white/40">Rewards Given covers Penalty Kick + Smash Egg only — Lucky Spin pays RM but the amount isn&apos;t attributable in this read-only report, so it is excluded.</p>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <EngagementCard summary={summary} />
        <TrendChart rows={trend} />
      </div>

      <div className="mt-5">
        <GamePerformance games={games} />
      </div>

      <div className="mt-5">
        <RetentionPanel rows={retention} />
      </div>

      <div className="mt-5">
        <HistoryTable rows={trend} />
      </div>

      {loading ? <div className="fixed bottom-6 right-6 rounded-full border border-[#e9af41]/40 bg-[#0c1018] px-4 py-2 text-[12px] font-semibold text-[#f6dda6] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">Loading usage report...</div> : null}
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