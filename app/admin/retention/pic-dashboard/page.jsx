"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PeriodToggle from "../../../components/admin/retention/PeriodToggle";
import Pagination from "../../../components/admin/retention/Pagination";
import KpiBreakdownModal from "../../../components/admin/retention/KpiBreakdownModal";
import LoadingOverlay from "../../../components/admin/ui/LoadingOverlay";
import {
  ASSETS,
  GRAD_DARK,
  GRAD_GOLD,
  GRAD_CARD,
  GRAD_GREEN,
  GRAD_RED,
  ACHIEVEMENT_GREEN,
  ACHIEVEMENT_RED,
} from "../../../components/admin/retention/constants";
import {
  getCrmDashboardSummary,
  getCrmDashboardDetails,
  periodLabelToType,
} from "../../../api/crmApi";

// PIC Dashboard — overview KPIs + paginated PIC performance table.
// KPI tiles come from /crm-admins/dashboard-summary/.
// The table comes from /crm-admins/dashboard-details/ keyed by the selected
// period (Daily/Monthly/Yearly → type=1/2/3).

const PAGE_SIZE = 7;

const KPI_META = [
  { id: "members", label: "Total Members", key: "total_members", icon: `${ASSETS}/kpi-members.svg`, iconSize: 24, type: "number" },
  { id: "active", label: "Active Members", key: "active_members", icon: `${ASSETS}/kpi-active.svg`, iconSize: 24, type: "number" },
  { id: "sales", label: "Total Sales", key: "total_sales", icon: `${ASSETS}/kpi-sales.svg`, iconSize: 24, type: "currency" },
  { id: "winlose", label: "Total Win/Lose", key: "total_win_lose", icon: `${ASSETS}/kpi-winlose.svg`, iconSize: 28, type: "currency" },
  { id: "sales-tickets", label: "Total Sales Ticket", key: "total_sales_tickets", icon: `${ASSETS}/kpi-sales.svg`, iconSize: 24, type: "number" },
  { id: "bonus", label: "Total Bonus Given", key: "total_bonus_given", icon: `${ASSETS}/kpi-sales.svg`, iconSize: 24, type: "currency" },
  { id: "bonus-percent", label: "Total Bonus Given Percentage", key: "total_bonus_given_percentage", icon: `${ASSETS}/kpi-winlose.svg`, iconSize: 28, type: "percent" },
  { id: "win-rate", label: "Total Win Rate", key: "total_win_rate", icon: `${ASSETS}/kpi-winlose.svg`, iconSize: 28, type: "percent" },
];

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  return Number(value).toLocaleString("en-US");
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "0.00";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatRmCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0.00";
  return `RM ${formatCurrency(value)}`;
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "0%";
  if (typeof value === "string" && value.trim().endsWith("%")) return value.trim();
  const num = parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

// The six brands every KPI breaks down into — same station codes the PIC
// Profile cards use. Always rendered in this order so the popup is stable even
// when a brand is missing from the response.
const BRANDS = ["KG", "LV", "EP", "AB", "UB", "N1"];

function formatByType(type, raw) {
  if (type === "currency") return formatRmCurrency(raw);
  if (type === "percent") return formatPercent(raw);
  return formatNumber(raw);
}

function zeroByType(type) {
  return formatByType(type, 0);
}

// Pull the per-brand split for one KPI out of the dashboard summary. The
// overview endpoint currently returns only flat totals, so until the backend
// adds a per-brand split this returns []. It accepts the same station-keyed
// shape the retention-summary endpoint already uses ([{ station, amount }] /
// [{ station, members }]) under a handful of likely keys, so whichever field
// the backend ships, the popup lights up without further frontend changes.
function getBreakdownRows(summary, meta) {
  if (!summary) return [];
  const candidates = [
    summary[`${meta.key}_breakdown`],
    summary[`${meta.key}_per_brand`],
    summary[`${meta.key}_by_brand`],
    summary[`${meta.key}_by_station`],
    summary.breakdown?.[meta.key],
    // future-proof: backend may switch the bare key to a station list (as
    // retention-summary does) and move the scalar to `<key>__total`.
    Array.isArray(summary[meta.key]) ? summary[meta.key] : undefined,
  ];
  const list = candidates.find((c) => Array.isArray(c) && c.length > 0);
  if (!list) return [];
  return list
    .map((entry) => {
      const brand = entry?.station ?? entry?.brand ?? entry?.name ?? entry?.level;
      const raw = entry?.amount ?? entry?.members ?? entry?.value ?? entry?.count ?? entry?.total;
      if (!brand) return null;
      return { brand: String(brand), value: formatByType(meta.type, raw) };
    })
    .filter(Boolean);
}

function buildPeriodParams(period, fromDate, toDate) {
  if (fromDate && toDate) {
    return { type: 4, from_date: fromDate, to_date: toDate };
  }
  return { type: periodLabelToType(period) };
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
  const [activeKpi, setActiveKpi] = useState(null);

  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";
  const periodParams = useMemo(
    () => buildPeriodParams(period, fromDate, toDate),
    [period, fromDate, toDate]
  );

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
      const res = await getCrmDashboardSummary(periodParams);
      setSummary(res || {});
    } catch (err) {
      console.error("[pic-dashboard] summary failed", err);
      setSummary({});
    } finally {
      setSummaryLoading(false);
    }
  }, [periodParams]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <>
      <HeaderRow period={period} onPeriodChange={handlePeriodChange} fromDate={fromDate} toDate={toDate} />
      <div className="relative">
        <KpiGrid summary={summary} loading={summaryLoading} onSelect={setActiveKpi} />
        {summaryLoading && <LoadingOverlay label="Loading..." />}
      </div>
      <PerformanceSummary periodParams={periodParams} />
      <KpiBreakdownModal
        isOpen={!!activeKpi}
        onClose={() => setActiveKpi(null)}
        kpi={activeKpi}
        brands={BRANDS}
        rows={activeKpi ? getBreakdownRows(summary, activeKpi.meta) : []}
      />
    </>
  );
}

function HeaderRow({ period, onPeriodChange, fromDate, toDate }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 px-1 sm:px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">OVERVIEW</span>
        <h1
          className="bg-clip-text text-transparent font-bold whitespace-nowrap"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "clamp(32px, 5vw, 46px)",
            lineHeight: "1.2",
            letterSpacing: "-1px",
          }}
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

function KpiGrid({ summary, loading, onSelect }) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_META.map((meta) => {
        if (loading) return <KpiCardSkeleton key={meta.id} />;
        const raw = summary?.[meta.key];
        let value = "-";
        if (meta.type === "currency") value = formatCurrency(raw);
        else if (meta.type === "percent") value = formatPercent(raw);
        else value = formatNumber(raw);
        const kpi = {
          ...meta,
          value,
          valuePrefix: meta.type === "currency" ? "RM" : undefined,
        };
        return (
          <KpiCard
            key={meta.id}
            kpi={kpi}
            onSelect={() =>
              onSelect?.({
                label: meta.label,
                meta,
                total: formatByType(meta.type, raw),
                zero: zeroByType(meta.type),
              })
            }
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
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-6"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-start gap-3">
        <SkeletonBlock className="h-12 w-12 shrink-0 rounded-[6px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <SkeletonBlock className="h-[16px] w-[72%]" />
          <SkeletonBlock className="h-[32px] w-[58%]" />
        </div>
      </div>
    </div>
  );
}

// This dashboard packs 8 tiles carrying long currency strings
// ("RM 10,677,327.50"), so the grid goes to 4 columns at xl (≥1280px) to fill
// 18-inch displays, and the value scales with the viewport so it stays on one
// line instead of clipping or wrapping mid-number. Sizes are kept compact so
// four big-value tiles fit a row without truncation. The min in the clamp is
// tuned so 17-char strings (RM + 2 decimals) clear the narrowest 4-col width.
const KPI_VALUE_FONT = "clamp(20px, 1.5vw, 32px)";

function KpiCard({ kpi, onSelect }) {
  const isCurrency = !!kpi.valuePrefix;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`View ${kpi.label} brand breakdown`}
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-6 text-left transition hover:border-[#f2cb7a]/40 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2cb7a]/60 cursor-pointer"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] drop-shadow-[0_0_3px_rgba(222,162,32,0.5)]"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <img
            src={kpi.icon}
            alt=""
            className="h-6 w-6"
            style={{ maxWidth: kpi.iconSize + 4, maxHeight: kpi.iconSize + 4 }}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p
            className="text-[13px] font-semibold uppercase leading-[19px] text-[#f6dda6]"
            style={{ letterSpacing: "-0.5px" }}
          >
            {kpi.label}
          </p>
          <p
            className="bg-clip-text font-bold text-transparent"
            style={{
              backgroundImage: GRAD_GOLD,
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
              fontSize: KPI_VALUE_FONT,
              lineHeight: "1.2",
            }}
          >
            {isCurrency ? (
              <span className="flex min-w-0 items-baseline gap-1 tabular-nums whitespace-nowrap">
                <span className="shrink-0 text-[0.7em]">{kpi.valuePrefix}</span>
                <span className="min-w-0 [overflow-wrap:anywhere]">{kpi.value}</span>
              </span>
            ) : (
              <span className="block [overflow-wrap:anywhere] tabular-nums">
                {kpi.value}
              </span>
            )}
          </p>
        </div>
      </div>
    </button>
  );
}

function PerformanceSummary({ periodParams }) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Reset to page 1 when the period or date range changes
  useEffect(() => {
    setPage(1);
  }, [periodParams]);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      Object.assign(params, periodParams);
      const res = await getCrmDashboardDetails(params);
      const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      // Filter "ghost" PICs — rows with no identifying info (no name and no
      // uuid). They render as "—" with zeroed stats and a dead View link,
      // which is just visual noise. If a tenant has 2 real PICs, the table
      // should show 2 rows.
      const realPics = results.filter((r) => (r?.full_name || r?.username) && r?.uuid);
      const ghostCount = results.length - realPics.length;
      setRows(realPics);
      const backendTotal = Number.isFinite(res?.count) ? res.count : results.length;
      // Subtract ghosts from the backend count so pagination reflects what
      // the user actually sees.
      setTotal(Math.max(0, backendTotal - ghostCount));
    } catch (err) {
      console.error("[pic-dashboard] details failed", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, periodParams]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  return (
    <section className="relative flex w-full flex-col overflow-clip rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 w-full">
        <h2
          className="text-white font-bold whitespace-nowrap"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Performance Summary
        </h2>
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
      {loading && <LoadingOverlay label="Loading..." />}
    </section>
  );
}

// Monthly Target / Achievement always reflect the current calendar month
// (backend filters the data); surface the month name so the column is unambiguous.
const CURRENT_MONTH = new Date().toLocaleDateString("en-US", { month: "long" });

function TableHeader() {
  return (
    <div className="flex w-full items-start justify-between" style={{ backgroundImage: GRAD_DARK }}>
      <HeaderCell label="PIC" widthClass="w-[269px]" />
      <HeaderCell label="Total Members" />
      <HeaderCell label="Total Sales" />
      <HeaderCell label="Total Win/Lose" />
      <HeaderCell label={`Monthly Target (${CURRENT_MONTH})`} />
      <HeaderCell label={`Achievement (${CURRENT_MONTH})`} align="center" />
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
  // Below target reads red, at/above target reads green.
  const metTarget = achievementPct >= 100;

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
              className="flex items-center rounded-[12px] px-3 py-1 b-4 font-semibold text-[#05060a] whitespace-nowrap"
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
          <span
            className="b-5 capitalize font-semibold"
            style={{ color: metTarget ? ACHIEVEMENT_GREEN : ACHIEVEMENT_RED }}
          >
            {achievementPct}%
          </span>
          <ProgressBar pct={achievementPct} metTarget={metTarget} />
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

function ProgressBar({ pct, metTarget }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/15">
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${clamped}%`, backgroundImage: metTarget ? GRAD_GREEN : GRAD_RED }}
      />
    </div>
  );
}
