"use client";

import { useState } from "react";
import RangePicker from "../RangePicker";

const ASSETS = "/assets/admin/world-cup";
const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";
const GOLD_TEXT_BG = "linear-gradient(106deg, #dc9d16 1%, #f2cb7a 98%)";
const CARD_BG = "linear-gradient(178deg, #11320e 0%, #031101 99.749%)";
const ICON_TILE_BG = "linear-gradient(175deg, #141828 0%, #333333 99.749%)";

function CalendarIcon({ size = 14, stroke = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function RefreshIcon({ size = 20, spinning = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={spinning ? { animation: "spin 0.6s linear" } : undefined}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function MetricCard({ icon, iconSize = 24, label, value, currency, trend }) {
  const trendUp = trend === "up";
  return (
    <div
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-6"
      style={{ backgroundImage: CARD_BG }}
    >
      <div className="flex w-full items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px]"
          style={{
            backgroundImage: ICON_TILE_BG,
            filter: "drop-shadow(0 0 3px rgba(222,162,32,0.5))",
          }}
        >
          <img
            src={`${ASSETS}/${icon}`}
            alt=""
            style={{ width: iconSize, height: iconSize }}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className="text-[16px] font-semibold uppercase leading-[24px] tracking-[-1px] text-[#f6dda6]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {label}
          </p>
          <p
            className="bg-clip-text text-transparent"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              backgroundImage: GOLD_TEXT_BG,
            }}
          >
            {currency && (
              <span className="text-[26px] leading-[39px]">{currency} </span>
            )}
            <span className="text-[38px] leading-[44px]">{value}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 pt-3">
        <img
          src={`${ASSETS}/${trendUp ? "trend-up.svg" : "trend-down.svg"}`}
          alt=""
          width={11.667}
          height={7}
          style={trendUp ? undefined : { transform: "scaleY(-1)" }}
        />
        <p className="text-[10px] leading-[15px]" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className={trendUp ? "text-[#84ebb4]" : "text-[#fb3748]"}>12% </span>
          <span className="capitalize text-white">increase from last month</span>
        </p>
      </div>
    </div>
  );
}

const METRICS = [
  { icon: "dollar-circle.svg",  iconSize: 28, label: "Total Sales",                value: "281",   currency: "RM", trend: "up"   },
  { icon: "users-multiple.svg", iconSize: 24, label: "Total Users (Participants)", value: "281",                  trend: "down" },
  { icon: "user-add.svg",       iconSize: 24, label: "New Depositing Users",       value: "81",                   trend: "down" },
  { icon: "user-online.svg",    iconSize: 24, label: "Returning Depositing Users", value: "1,281",                trend: "down" },
  { icon: "football.svg",       iconSize: 24, label: "Prediction Users",           value: "202",                  trend: "down" },
  { icon: "cup.svg",            iconSize: 24, label: "Predicted Matches",          value: "72",                   trend: "up"   },
];

const PERIODS = ["Daily", "Monthly", "Yearly"];

function formatRange(from, to) {
  if (!from || !to) return "Date Range";
  const f = new Date(from);
  const t = new Date(to);
  const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(f)} – ${fmt(t)}`;
}

export default function DashboardMetrics() {
  const [period, setPeriod] = useState("Daily");
  const [range, setRange] = useState({ from: null, to: null });
  const [refreshing, setRefreshing] = useState(false);

  const hasRange = !!range.from && !!range.to;

  const onRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const onApplyRange = (from, to) => {
    if (from && to) {
      setRange({ from, to });
      setPeriod("Date");
    } else {
      setRange({ from: null, to: null });
      setPeriod("Daily");
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex items-center gap-1 rounded-[10px] border border-white/10 bg-[#0c1018] p-1">
          {PERIODS.map((p) => {
            const active = !hasRange && period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  setRange({ from: null, to: null });
                }}
                className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition-opacity ${
                  active ? "text-[#141828]" : "text-white/80 hover:text-white"
                }`}
                style={active ? { backgroundImage: GOLD_BG } : undefined}
              >
                {p}
              </button>
            );
          })}
          <RangePicker
            fromDate={range.from}
            toDate={range.to}
            onApply={onApplyRange}
            align="right"
            trigger={({ open }) => {
              const active = hasRange;
              return (
                <button
                  type="button"
                  onClick={open}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition-opacity ${
                    active ? "text-[#141828]" : "text-white/80 hover:text-white"
                  }`}
                  style={active ? { backgroundImage: GOLD_BG } : undefined}
                >
                  <CalendarIcon size={14} stroke={active ? "#141828" : "#e9af41"} />
                  {hasRange ? formatRange(range.from, range.to) : "Date Range"}
                </button>
              );
            }}
          />
        </div>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh metrics"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-[#0c1018] text-[#e9af41] transition-opacity hover:opacity-80"
        >
          <RefreshIcon size={20} spinning={refreshing} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>
    </section>
  );
}
