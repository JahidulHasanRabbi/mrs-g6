"use client";

import { useState } from "react";
import Link from "next/link";
import PeriodToggle from "../../../components/admin/retention/PeriodToggle";
import RefreshControl from "../../../components/admin/retention/RefreshControl";
import Pagination from "../../../components/admin/retention/Pagination";
import {
  ASSETS,
  GRAD_DARK,
  GRAD_GOLD,
  GRAD_CARD,
} from "../../../components/admin/retention/constants";

// Static data mirroring the Figma mock. Replace with backend data when the
// API is wired in — shape is intentionally close to what an endpoint would return.
const KPIS = [
  {
    id: "members",
    label: "Total Members",
    value: "1,281",
    icon: `${ASSETS}/kpi-members.svg`,
    iconSize: 24,
    delta: { pct: "12%", text: "increase from last month", direction: "down", color: "#fb3748" },
  },
  {
    id: "active",
    label: "Active Members",
    value: "281",
    icon: `${ASSETS}/kpi-active.svg`,
    iconSize: 24,
    delta: { pct: "12%", text: " increase from last month", direction: "down", color: "#fb3748" },
  },
  {
    id: "sales",
    label: "Total Sales",
    value: "4,281",
    valuePrefix: "RM",
    icon: `${ASSETS}/kpi-sales.svg`,
    iconSize: 24,
    delta: { pct: "12%", text: " increase from last month", direction: "up", color: "#84ebb4" },
  },
  {
    id: "winlose",
    label: "Total Win/Lose",
    value: "281",
    valuePrefix: "RM",
    icon: `${ASSETS}/kpi-winlose.svg`,
    iconSize: 28,
    delta: { pct: "12%", text: " increase from last month", direction: "up", color: "#84ebb4" },
  },
];

// PIC rows. Each row's `slug` drives the View → /admin/retention/pic-dashboard/[slug] route.
const ROWS = [
  { slug: "sarah-jenkins", name: "Sarah Jenkins",  vip: "VIP 1", avatar: `${ASSETS}/avatar-1.jpg`, members: 400, sales: "RM 400", winlose: "3,770", target: "RM 8,900", achievement: 40 },
  { slug: "marcus-henry",  name: "Marcus Henry",   vip: "VIP 2", avatar: `${ASSETS}/avatar-2.jpg`, members: 400, sales: "RM 400", winlose: "3,770", target: "RM 8,900", achievement: 40 },
  { slug: "david-chen",    name: "David Chen",     vip: "VIP 3", avatar: `${ASSETS}/avatar-3.jpg`, members: 400, sales: "RM 400", winlose: "3,770", target: "RM 8,900", achievement: 40 },
  { slug: "elena-rody",    name: "Elena Rody",     vip: "VIP 2", avatar: `${ASSETS}/avatar-3.jpg`, members: 400, sales: "RM 400", winlose: "3,770", target: "RM 8,900", achievement: 40 },
  { slug: "adam-ron",      name: "Adam Ron",       vip: "VIP 3", avatar: `${ASSETS}/avatar-4.jpg`, members: 400, sales: "RM 400", winlose: "3,770", target: "RM 8,900", achievement: 40 },
  { slug: "omar-al-farsi", name: "Omar Al-Farsi",  vip: "VIP 1", avatar: `${ASSETS}/avatar-4.jpg`, members: 400, sales: "RM 400", winlose: "3,770", target: "RM 8,900", achievement: 40 },
  { slug: "samantha",      name: "Samantha",       vip: "VIP 1", avatar: `${ASSETS}/avatar-5.jpg`, members: 400, sales: "RM 400", winlose: "3,770", target: "RM 8,900", achievement: 40 },
];

// Chrome (auth guard, main wrapper, topbar) lives in
// app/admin/retention/layout.jsx — pages here only render their own content.
export default function PicDashboardPage() {
  const [period, setPeriod] = useState("Daily");

  return (
    <>
      <HeaderRow period={period} onPeriodChange={setPeriod} />
      <KpiGrid />
      <PerformanceSummary />
    </>
  );
}

function HeaderRow({ period, onPeriodChange }) {
  return (
    <div className="flex items-end justify-between gap-2 px-2">
      <div className="flex flex-col gap-1">
        <span className="b-4 text-white leading-[18px]">OVERVIEW</span>
        <h1
          className="h-4 bg-clip-text text-transparent"
          style={{ backgroundImage: GRAD_GOLD }}
        >
          Dashboard
        </h1>
      </div>
      <PeriodToggle period={period} onPeriodChange={onPeriodChange} />
    </div>
  );
}

function KpiGrid() {
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {KPIS.map((k) => (
        <KpiCard key={k.id} kpi={k} />
      ))}
    </div>
  );
}

function KpiCard({ kpi }) {
  const isCurrency = !!kpi.valuePrefix;
  return (
    <div
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-6"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] drop-shadow-[0_0_3px_rgba(222,162,32,0.5)]"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <img src={kpi.icon} alt="" style={{ width: kpi.iconSize, height: kpi.iconSize }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className="b-2 font-semibold uppercase text-[#f6dda6]"
            style={{ letterSpacing: "-1px" }}
          >
            {kpi.label}
          </p>
          <p
            className="bg-clip-text text-transparent font-bold"
            style={{
              backgroundImage: GRAD_GOLD,
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
              fontSize: isCurrency ? "26px" : "38px",
              lineHeight: isCurrency ? "44px" : "57px",
            }}
          >
            {isCurrency ? (
              <>
                <span style={{ fontSize: "26px", lineHeight: "39px" }}>{kpi.valuePrefix}</span>
                <span style={{ fontSize: "38px", lineHeight: "44px" }}> {kpi.value}</span>
              </>
            ) : (
              kpi.value
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 pt-3 w-full">
        <img
          src={kpi.delta.direction === "down" ? `${ASSETS}/arrow-decrease.svg` : `${ASSETS}/arrow-increase.svg`}
          alt=""
          className="h-[7px] w-[11.667px]"
          style={kpi.delta.direction === "down" ? { transform: "scaleY(-1)" } : undefined}
        />
        <p className="b-5 capitalize whitespace-nowrap">
          <span style={{ color: kpi.delta.color }}>{kpi.delta.pct}</span>
          <span className="text-white">{kpi.delta.text}</span>
        </p>
      </div>
    </div>
  );
}

function PerformanceSummary() {
  return (
    <section className="flex w-full flex-col overflow-clip rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex items-center justify-between p-6 w-full">
        <h2 className="h-7 text-white" style={{ letterSpacing: "-2px" }}>
          Performance Summary
        </h2>
        <RefreshControl />
      </header>
      <div className="flex w-full flex-col overflow-clip">
        <TableHeader />
        <div className="flex w-full flex-col">
          {ROWS.map((row) => (
            <TableRow key={row.slug} row={row} />
          ))}
        </div>
        <Pagination from={1} to={ROWS.length} total={150} />
      </div>
    </section>
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-start justify-between" style={{ backgroundImage: GRAD_DARK }}>
      <HeaderCell label="PIC" widthClass="w-[269px]" />
      <HeaderCell label="Total Members" />
      <HeaderCell label="Total Sales" />
      <HeaderCell label="Total Win/Lose" />
      <HeaderCell label="Monthly Target" />
      <HeaderCell label="Achievement" align="center" />
      <HeaderCell label="Action" align="end" />
    </div>
  );
}

function HeaderCell({ label, widthClass = "flex-1 min-w-0", align = "start" }) {
  const alignClass =
    align === "center" ? "items-center" : align === "end" ? "items-end" : "items-start";
  return (
    <div className={`flex flex-col px-6 py-4 ${widthClass} ${alignClass}`}>
      <p className="b-3 font-semibold text-[#fbeed2] whitespace-nowrap" style={{ letterSpacing: "-1px" }}>
        {label}
      </p>
    </div>
  );
}

function TableRow({ row }) {
  return (
    <div className="flex w-full items-center -mb-px border-b border-white/5">
      {/* PIC */}
      <div className="flex h-full w-[269px] shrink-0 items-center gap-3 p-6">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#f1f5f9]">
          <img src={row.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span className="b-4 text-white whitespace-nowrap">{row.name}</span>
          <span
            className="flex items-center rounded-[12px] px-3 py-1 b-6 text-[#05060a] whitespace-nowrap"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            {row.vip}
          </span>
        </div>
      </div>
      <DataCell value={row.members} />
      <DataCell value={row.sales} />
      <DataCell value={row.winlose} />
      <DataCell value={row.target} />
      <div className="flex flex-1 min-w-0 items-center self-stretch">
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 p-6">
          <span className="b-5 capitalize text-white">{row.achievement}%</span>
          <ProgressBar pct={row.achievement} />
        </div>
      </div>
      <div className="flex flex-1 min-w-0 items-center self-stretch justify-end">
        <div className="flex h-full flex-col items-end justify-center p-6">
          <Link
            href={`/admin/retention/pic-dashboard/${row.slug}`}
            className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#eaad2c] transition hover:brightness-110"
            style={{ backgroundImage: GRAD_DARK }}
          >
            <img src={`${ASSETS}/eye.svg`} alt="" className="h-4 w-4" />
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

function DataCell({ value }) {
  return (
    <div className="flex flex-1 min-w-0 items-center self-stretch">
      <div className="flex h-full flex-1 flex-col justify-center p-6">
        <span className="b-4 text-white whitespace-nowrap">{value}</span>
      </div>
    </div>
  );
}

function ProgressBar({ pct }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/15">
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${clamped}%`, backgroundImage: GRAD_GOLD }}
      />
    </div>
  );
}
