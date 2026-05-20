"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import PeriodToggle from "../../../../components/admin/retention/PeriodToggle";
import RefreshControl from "../../../../components/admin/retention/RefreshControl";
import Pagination from "../../../../components/admin/retention/Pagination";
import DateRangePicker from "../../../../components/admin/retention/DateRangePicker";
import FilterDropdown from "../../../../components/admin/retention/FilterDropdown";
import SearchInput from "../../../../components/admin/retention/SearchInput";
import {
  ASSETS,
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../../components/admin/retention/constants";
import {
  getRetentionMembers,
  getRetentionSummary,
  periodLabelToType,
  refreshCrmMembers,
} from "../../../../api/crmApi";

// PIC detail view — shows per-PIC breakdown of members + a member list.

// VIP-level rows shown inside every KPI card.
const VIP_LEVELS = ["KG", "LV", "EP", "AB", "UB", "N1"];

const KPIS = [
  {
    id: "members",
    label: "Total Members",
  },
  {
    id: "active",
    label: "Active Members",
  },
  {
    id: "sales",
    label: "Total Sales",
  },
  {
    id: "winlose",
    label: "Total Win/Lose",
  },
];

const PAGE_SIZE = 7;

const LEVEL_OPTIONS = [
  { value: "all",   label: "All level" },
  { value: "VIP 1", label: "VIP 1" },
  { value: "VIP 2", label: "VIP 2" },
  { value: "VIP 3", label: "VIP 3" },
  { value: "VIP 4", label: "VIP 4" },
  { value: "VIP 5", label: "VIP 5" },
];

const SORT_OPTIONS = [
  { value: "hl", label: "Sales (H-L)" },
  { value: "lh", label: "Sales (L-H)" },
];

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(value);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function vipLabelToInt(label) {
  const n = parseInt(String(label).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}

function rowsByStation(rows, valueKey) {
  return (Array.isArray(rows) ? rows : []).reduce((acc, row) => {
    acc[row.station] = row[valueKey];
    return acc;
  }, {});
}

function buildKpis(summary) {
  const members = rowsByStation(summary?.total_members, "members");
  const active = rowsByStation(summary?.active_members, "members");
  const sales = rowsByStation(summary?.total_sales, "amount");
  const winlose = rowsByStation(summary?.total_win_lose, "amount");

  return [
    {
      id: "members",
      label: "Total Members",
      total: formatNumber(summary?.total_members__total),
      values: VIP_LEVELS.map((level) => formatNumber(members[level])),
    },
    {
      id: "active",
      label: "Active Members",
      total: formatNumber(summary?.active_members__total),
      values: VIP_LEVELS.map((level) => formatNumber(active[level])),
    },
    {
      id: "sales",
      label: "Total Sales",
      total: formatCurrency(summary?.total_sales__total),
      values: VIP_LEVELS.map((level) => formatCurrency(sales[level])),
    },
    {
      id: "winlose",
      label: "Total Win/Lose",
      total: formatCurrency(summary?.total_win_lose__total),
      values: VIP_LEVELS.map((level) => formatCurrency(winlose[level])),
    },
  ];
}

export default function PicDetailPage() {
  return (
    <Suspense>
      <PicDetailContent />
    </Suspense>
  );
}

function PicDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const picName = searchParams.get("name") || "Unknown PIC";
  const [period, setPeriod] = useState("Daily");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    if (!slug) return;
    setSummaryLoading(true);
    try {
      const res = await getRetentionSummary(slug, { type: periodLabelToType(period) });
      setSummary(res || {});
    } catch (err) {
      console.error("[pic-detail] summary failed", err);
      setSummary({});
    } finally {
      setSummaryLoading(false);
    }
  }, [period, slug]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <>
      <PicProfileHeader name={picName} period={period} onPeriodChange={setPeriod} />
      <KpiGrid summary={summary} loading={summaryLoading} />
      <MemberListSection onRefreshSummary={loadSummary} />
    </>
  );
}

function PicProfileHeader({ name, period, onPeriodChange }) {
  return (
    <div className="flex items-end justify-between gap-2 px-2">
      <div className="flex items-center gap-2">
        <div className="h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[12px]">
          <img src={`${ASSETS}/avatar-1.jpg`} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="b-4 text-white leading-[18px]">PIC PROFILE</span>
          <h1
            className="h-4 bg-clip-text text-transparent whitespace-nowrap"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            {name}
          </h1>
        </div>
      </div>
      <PeriodToggle period={period} onPeriodChange={onPeriodChange} />
    </div>
  );
}

function KpiGrid({ summary, loading }) {
  const items = loading ? KPIS.map((k) => ({ ...k, total: "—", values: VIP_LEVELS.map(() => "—") })) : buildKpis(summary);
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((k) => (
        <DetailKpiCard key={k.id} kpi={k} />
      ))}
    </div>
  );
}

function DetailKpiCard({ kpi }) {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] bg-[rgba(5,6,10,0.4)] p-6 shadow-[0_0_3px_0_#dea220]">
      <div className="flex w-full items-center gap-4">
        <p className="flex-1 b-3 font-semibold text-[#f6dda6]" style={{ letterSpacing: "-1px" }}>
          {kpi.label}
        </p>
        <p
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "14px",
            lineHeight: "21px",
          }}
        >
          {kpi.total}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {VIP_LEVELS.map((level, i) => (
          <VipLevelRow key={level} level={level} value={kpi.values[i]} />
        ))}
      </div>
    </div>
  );
}

function VipLevelRow({ level, value }) {
  return (
    <div className="flex w-full items-center gap-3">
      <img src={`${ASSETS}/shop-icon.svg`} alt="" className="h-6 w-6 shrink-0" />
      <span className="flex-1 b-4 text-white">{level}</span>
      <span className="b-4 text-[#84ebb4] whitespace-nowrap">{value}</span>
    </div>
  );
}

function MemberListSection({ onRefreshSummary }) {
  // URL state ------------------------------------------------------------
  // All filter values live in the query string so the view is shareable and
  // browser-back / forward work as expected.  router.replace (not push) keeps
  // the history clean — typing in a search box shouldn't litter back-stack.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const level = searchParams.get("level") ?? "all";
  const sort = searchParams.get("sort") ?? "";
  const q = searchParams.get("q") ?? "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Single helper for swapping any param while preserving the rest.
  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const apiParams = useMemo(() => ({
    page,
    page_size: PAGE_SIZE,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    vip_level: level !== "all" ? vipLabelToInt(level) : undefined,
    search: q || undefined,
  }), [fromDate, level, page, q, toDate]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRetentionMembers(apiParams);
      let results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      if (sort === "hl") results = [...results].sort((a, b) => parseFloat(b.total_sales || 0) - parseFloat(a.total_sales || 0));
      else if (sort === "lh") results = [...results].sort((a, b) => parseFloat(a.total_sales || 0) - parseFloat(b.total_sales || 0));
      setRows(results);
      setTotal(Number.isFinite(res?.count) ? res.count : results.length);
    } catch (err) {
      console.error("[pic-detail] retention members failed", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [apiParams, sort]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshCrmMembers();
      await Promise.all([fetchMembers(), onRefreshSummary?.()]);
    } catch (err) {
      console.error("[pic-detail] refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchMembers, onRefreshSummary, refreshing]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  return (
    <section className="flex w-full flex-col overflow-clip rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-wrap items-center gap-6 p-6 w-full">
        <h2 className="h-7 text-white" style={{ letterSpacing: "-2px" }}>
          Member List
        </h2>
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onApply={(from, to) => updateParams({ from, to, page: null })}
          />
          <FilterDropdown
            value={level}
            options={LEVEL_OPTIONS}
            placeholder="All level"
            onChange={(v) => updateParams({ level: v === "all" ? null : v, page: null })}
          />
          <FilterDropdown
            value={sort}
            options={SORT_OPTIONS}
            placeholder="Sales (H-L)"
            onChange={(v) => updateParams({ sort: v, page: null })}
          />
          <SearchInput
            value={q}
            placeholder="Enter Name/Phone Number"
            onChange={(v) => updateParams({ q: v, page: null })}
          />
        </div>
        <RefreshControl onRefresh={handleRefresh} disabled={refreshing} />
      </header>
      <div className="flex w-full flex-col overflow-clip">
        <MemberTableHeader />
        <div className="flex w-full flex-col">
          {loading ? (
            <div className="px-6 py-10 text-center b-4 text-white/60">
              Loading...
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-10 text-center b-4 text-white/60">
              No members match the current filters.
            </div>
          ) : (
            rows.map((m, idx) => (
              <MemberTableRow key={`${m.uuid || m.username || "member"}-${idx}`} member={m} />
            ))
          )}
        </div>
        <Pagination
          from={showingFrom}
          to={showingTo}
          total={total}
          currentPage={safePage}
          pageCount={totalPages}
          onPageChange={(nextPage) => updateParams({ page: nextPage > 1 ? nextPage : null })}
        />
      </div>
    </section>
  );
}

function MemberTableHeader() {
  return (
    <div className="flex w-full items-start justify-between" style={{ backgroundImage: GRAD_DARK }}>
      <HeaderCell label="Username" widthClass="w-[197px]" />
      <HeaderCell label="Phone Number" />
      <HeaderCell label="Level" />
      <HeaderCell label="Total Sales" />
      <HeaderCell label="Total Win/Lose" />
      <HeaderCell label="Last Deposit" />
      <HeaderCell label="Action" widthClass="w-[130px]" align="end" />
    </div>
  );
}

function HeaderCell({ label, widthClass = "flex-1 min-w-0", align = "start" }) {
  const alignClass = align === "end" ? "items-end" : "items-start";
  return (
    <div className={`flex flex-col px-6 py-4 ${widthClass} ${alignClass}`}>
      <p className="b-4 font-medium text-[#fbeed2] whitespace-nowrap">{label}</p>
    </div>
  );
}

function MemberTableRow({ member }) {
  const href = member.uuid ? `/admin/retention/members/${member.uuid}` : "#";
  return (
    <div className="flex w-full items-center -mb-px border-b border-white/5">
      <div className="flex h-full w-[197px] shrink-0 items-center gap-3 p-6">
        <img src={`${ASSETS}/member-avatar.svg`} alt="" className="h-8 w-8 shrink-0" />
        <span className="b-4 text-white whitespace-nowrap">{member.username || "—"}</span>
      </div>
      <DataCell value={member.phone_number || "—"} />
      <div className="flex flex-1 min-w-0 items-center self-stretch">
        <div className="flex h-full flex-1 flex-col justify-center p-6">
          <span
            className="inline-flex w-fit items-center rounded-[12px] px-3 py-1 b-6 text-[#05060a] whitespace-nowrap"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            {member.level || "—"}
          </span>
        </div>
      </div>
      <DataCell value={formatCurrency(member.total_sales)} />
      <DataCell value={formatCurrency(member.total_winlose)} />
      <DataCell value={formatDate(member.last_deposit)} />
      <div className="flex h-full w-[130px] shrink-0 items-center justify-end p-6">
        <Link
          href={href}
          className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#eaad2c] transition hover:brightness-110"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <img src={`${ASSETS}/eye.svg`} alt="" className="h-4 w-4" />
          View
        </Link>
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
