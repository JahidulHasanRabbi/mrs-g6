"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PeriodToggle from "../../../components/admin/retention/PeriodToggle";
import RefreshControl from "../../../components/admin/retention/RefreshControl";
import Pagination from "../../../components/admin/retention/Pagination";
import {
  ASSETS,
  GRAD_DARK,
  GRAD_GOLD,
  GRAD_CARD,
} from "../../../components/admin/retention/constants";
import {
  getCrmDashboardSummary,
  getCrmDashboardDetails,
  periodLabelToType,
  refreshCrmMembers,
} from "../../../api/crmApi";

// PIC Dashboard — overview KPIs + paginated PIC performance table.
// KPI tiles come from /crm-admins/dashboard-summary/.
// The table comes from /crm-admins/dashboard-details/ keyed by the selected
// period (Daily/Monthly/Yearly → type=1/2/3).

const PAGE_SIZE = 7;

const KPI_META = [
  { id: "members",       label: "Total Members",                key: "total_members",                icon: `${ASSETS}/kpi-members.svg`, iconSize: 24, type: "number" },
  { id: "active",        label: "Active Members",               key: "active_members",               icon: `${ASSETS}/kpi-active.svg`,  iconSize: 24, type: "number" },
  { id: "sales",         label: "Total Sales",                  key: "total_sales",                  icon: `${ASSETS}/kpi-sales.svg`,   iconSize: 24, type: "currency" },
  { id: "winlose",       label: "Total Win/Lose",               key: "total_win_lose",               icon: `${ASSETS}/kpi-winlose.svg`, iconSize: 28, type: "currency" },
  { id: "sales-tickets", label: "Total Sales Ticket",           key: "total_sales_tickets",          icon: `${ASSETS}/kpi-sales.svg`,   iconSize: 24, type: "number" },
  { id: "bonus",         label: "Total Bonus Given",            key: "total_bonus_given",            icon: `${ASSETS}/kpi-sales.svg`,   iconSize: 24, type: "currency" },
  { id: "bonus-percent", label: "Total Bonus Given Percentage", key: "total_bonus_given_percentage", icon: `${ASSETS}/kpi-winlose.svg`, iconSize: 28, type: "percent" },
  { id: "win-rate",      label: "Total Win Rate",               key: "total_win_rate",               icon: `${ASSETS}/kpi-winlose.svg`, iconSize: 28, type: "percent" },
];

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  return Number(value).toLocaleString("en-US");
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "0";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatRmCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0";
  return `RM ${formatCurrency(value)}`;
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "0%";
  if (typeof value === "string" && value.trim().endsWith("%")) return value.trim();
  const num = parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

// Chrome (auth guard, main wrapper, topbar) lives in
// app/admin/retention/layout.jsx — pages here only render their own content.
export default function PicDashboardPage() {
  return (
    <Suspense>
      <PicDashboardContent />
    </Suspense>
  );
}

function PicDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [period, setPeriod] = useState("Daily");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";

  // When a predefined period is selected, clear any active date range
  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("from");
    next.delete("to");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getCrmDashboardSummary();
      setSummary(res || {});
    } catch (err) {
      console.error("[pic-dashboard] summary failed", err);
      setSummary({});
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <>
      <HeaderRow period={period} onPeriodChange={handlePeriodChange} fromDate={fromDate} toDate={toDate} />
      <KpiGrid summary={summary} loading={summaryLoading} />
      <PerformanceSummary period={period} fromDate={fromDate} toDate={toDate} onRefreshSummary={loadSummary} />
    </>
  );
}

function HeaderRow({ period, onPeriodChange, fromDate, toDate }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 px-1 sm:px-2">
      <div className="flex flex-col gap-1">
        <span className="b-4 text-white leading-[18px]">OVERVIEW</span>
        <h1
          className="h-4 bg-clip-text text-transparent"
          style={{ backgroundImage: GRAD_GOLD }}
        >
          Dashboard
        </h1>
      </div>
      <Suspense fallback={null}>
        <PeriodToggle period={period} onPeriodChange={onPeriodChange} />
      </Suspense>
    </div>
  );
}

function KpiGrid({ summary, loading }) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {KPI_META.map((meta) => {
        if (loading) return <KpiCardSkeleton key={meta.id} />;
        const raw = summary?.[meta.key];
        let value = "-";
        if (meta.type === "currency") value = formatCurrency(raw);
        else if (meta.type === "percent") value = formatPercent(raw);
        else value = formatNumber(raw);
        return (
          <KpiCard
            key={meta.id}
            kpi={{
              ...meta,
              value,
              valuePrefix: meta.type === "currency" ? "RM" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-[8px] bg-white/10 ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(242,203,122,0.08)" }}
    />
  );
}

function KpiCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-3 sm:p-5 xl:p-3 2xl:p-5 [@media(min-width:1700px)]:p-6"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-start gap-2 sm:gap-4 xl:gap-2 2xl:gap-4">
        <SkeletonBlock className="h-9 w-9 shrink-0 rounded-[4px] sm:h-12 sm:w-12 xl:h-9 xl:w-9 2xl:h-11 2xl:w-11 [@media(min-width:1700px)]:h-12 [@media(min-width:1700px)]:w-12" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <SkeletonBlock className="h-[14px] w-[72%]" />
          <SkeletonBlock className="h-[32px] w-[58%]" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ kpi }) {
  const isCurrency = !!kpi.valuePrefix;
  return (
    <div
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-3 sm:p-5 xl:p-3 2xl:p-5 [@media(min-width:1700px)]:p-6"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-start gap-2 sm:gap-4 xl:gap-2 2xl:gap-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] drop-shadow-[0_0_3px_rgba(222,162,32,0.5)] sm:h-12 sm:w-12 xl:h-9 xl:w-9 2xl:h-11 2xl:w-11 [@media(min-width:1700px)]:h-12 [@media(min-width:1700px)]:w-12"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <img
            src={kpi.icon}
            alt=""
            className="h-5 w-5 sm:h-6 sm:w-6 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6"
            style={{ maxWidth: kpi.iconSize, maxHeight: kpi.iconSize }}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className="b-2 text-[11px] sm:text-[13px] xl:text-[11px] 2xl:text-[13px] font-semibold uppercase leading-[1.15] text-[#f6dda6]"
            style={{ letterSpacing: "-0.5px" }}
          >
            {kpi.label}
          </p>
          <p
            className="bg-clip-text font-bold text-transparent leading-[1.2]"
            style={{
              backgroundImage: GRAD_GOLD,
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            }}
          >
            {isCurrency ? (
              <span className="flex items-baseline gap-1 whitespace-nowrap tabular-nums">
                <span className="text-[14px] sm:text-[20px] xl:text-[14px] 2xl:text-[20px] [@media(min-width:1700px)]:text-[26px]">
                  {kpi.valuePrefix}
                </span>
                <span className="text-[20px] sm:text-[28px] xl:text-[20px] 2xl:text-[26px] [@media(min-width:1700px)]:text-[34px]">
                  {kpi.value}
                </span>
              </span>
            ) : (
              <span className="block text-[26px] sm:text-[34px] xl:text-[26px] 2xl:text-[32px] [@media(min-width:1700px)]:text-[38px] tabular-nums">
                {kpi.value}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function PerformanceSummary({ period, fromDate, toDate, onRefreshSummary }) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const hasDateRange = !!fromDate && !!toDate;

  // Reset to page 1 when the period or date range changes
  useEffect(() => {
    setPage(1);
  }, [period, fromDate, toDate]);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (hasDateRange) {
        params.type = 4;
        params.from_date = fromDate;
        params.to_date = toDate;
      } else {
        params.type = periodLabelToType(period);
      }
      const res = await getCrmDashboardDetails(params);
      const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setRows(results);
      setTotal(Number.isFinite(res?.count) ? res.count : results.length);
    } catch (err) {
      console.error("[pic-dashboard] details failed", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, period, fromDate, toDate, hasDateRange]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshCrmMembers();
      await Promise.all([fetchDetails(), onRefreshSummary?.()]);
    } catch (err) {
      console.error("[pic-dashboard] refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, fetchDetails, onRefreshSummary]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  return (
    <section className="flex w-full flex-col overflow-clip rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 w-full">
        <h2 className="h-7 text-white" style={{ letterSpacing: "-2px" }}>
          Performance Summary
        </h2>
        <RefreshControl onRefresh={handleRefresh} />
      </header>
      <div className="w-full overflow-x-auto">
        <div className="flex min-w-[960px] w-full flex-col">
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
            ) : rows.length === 0 ? (
              <div className="px-6 py-10 text-center b-4 text-white/60">No data available.</div>
            ) : (
              rows.map((row, idx) => <TableRow key={`${row.uuid || "pic"}-${idx}`} row={row} />)
            )}
          </div>
        </div>
      </div>
      <Pagination
        from={showingFrom}
        to={showingTo}
        total={total}
        currentPage={safePage}
        pageCount={totalPages}
        onPageChange={setPage}
      />
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
  const target = row.monthly_target;
  const achievementRaw = row.achievements;
  // Backend returns `achievements` as a decimal; the design renders it as a
  // percentage (0–100). Coerce safely so a string like "40.5" still works.
  const achievementNum = parseFloat(achievementRaw);
  const achievementPct = Number.isFinite(achievementNum) ? achievementNum : 0;

  return (
    <div className="flex w-full items-center -mb-px border-b border-white/5">
      <div className="flex h-full w-[269px] shrink-0 items-center gap-3 p-6">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#3a4255]">
          {row.profile_picture ? (
            <img src={row.profile_picture} alt="" className="h-full w-full object-cover" />
          ) : (
            <PicFallbackIcon />
          )}
        </div>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span className="b-4 text-white whitespace-nowrap">{row.full_name || "—"}</span>
          {row.vip_level ? (
            <span
              className="flex items-center rounded-[12px] px-3 py-1 b-6 text-[#05060a] whitespace-nowrap"
              style={{ backgroundImage: GRAD_GOLD }}
            >
              {row.vip_level}
            </span>
          ) : null}
        </div>
      </div>
      <DataCell value={formatNumber(row.total_members)} />
      <DataCell value={formatRmCurrency(row.total_sales)} />
      <DataCell value={formatRmCurrency(row.total_win_lose)} />
      <DataCell value={formatRmCurrency(target)} />
      <div className="flex flex-1 min-w-0 items-center self-stretch">
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 p-6">
          <span className="b-5 capitalize text-white">{achievementPct}%</span>
          <ProgressBar pct={achievementPct} />
        </div>
      </div>
      <div className="flex flex-1 min-w-0 items-center self-stretch justify-end">
        <div className="flex h-full flex-col items-end justify-center p-6">
          <Link
            href={`/admin/retention/pic-dashboard/${row.uuid}?name=${encodeURIComponent(row.full_name || "")}`}
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

function PicFallbackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="flex w-full items-center border-b border-white/5">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={`flex ${i === 0 ? "w-[269px] shrink-0" : "flex-1 min-w-0"} items-center p-6`}>
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
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
