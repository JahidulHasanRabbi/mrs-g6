"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import PeriodToggle from "../../../../components/admin/retention/PeriodToggle";
import Pagination from "../../../../components/admin/retention/Pagination";
import FilterDropdown from "../../../../components/admin/retention/FilterDropdown";
import SearchInput from "../../../../components/admin/retention/SearchInput";
import LoadingOverlay from "../../../../components/admin/ui/LoadingOverlay";
import {
  ASSETS,
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../../components/admin/retention/constants";
import {
  getAdminMembers,
  getCrmVipTiers,
  getCrmUserSingle,
  getRetentionSummary,
} from "../../../../api/crmApi";
import { getWalletVipTiers } from "../../../../api/adminApi";
import { uniqueWalletVipTierOptions } from "../../../../components/admin/retention/walletVipFilterOptions";

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
  {
    id: "sales-tickets",
    label: "Total Sales Ticket",
  },
];

const PAGE_SIZE = 7;

// Standardised Member List filters: Wallet Level · MRS Level · Sales · Brand ·
// Name/Phone. Wallet and MRS level options are sourced from their own tier
// endpoints; Brand uses the same six-brand set the Member Alert list uses.
const DEFAULT_WALLET_LEVEL_OPTIONS = [{ value: "all", label: "All Wallet Level" }];
const DEFAULT_MRS_LEVEL_OPTIONS = [{ value: "all", label: "All MRS Level" }];

const BRAND_CODES = ["KG", "LV", "EP", "AB", "UB", "N1"];
const BRAND_FILTER_OPTIONS = [
  { value: "all", label: "All Brand" },
  ...BRAND_CODES.map((code) => ({ value: code, label: code })),
];

const SORT_OPTIONS = [
  { value: "", label: "Sales" },
  { value: "hl", label: "Sales (H-L)" },
  { value: "lh", label: "Sales (L-H)" },
];

function tierToOption(tier) {
  const name = tier?.name || tier?.tier_name || tier?.level || tier?.vip_level || tier?.title || tier?.uuid;
  return name ? { value: name, label: name } : null;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(value);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0.00";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB");
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
  const salesTickets = rowsByStation(summary?.total_sales_tickets, "amount");

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
    {
      id: "sales-tickets",
      label: "Total Sales Ticket",
      total: formatNumber(summary?.total_sales_tickets_total ?? summary?.total_sales_tickets__total),
      values: VIP_LEVELS.map((level) => formatNumber(salesTickets[level])),
    },
  ];
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildMemberDateParams(period, fromDate, toDate) {
  if (fromDate && toDate) {
    return { from_date: fromDate, to_date: toDate };
  }

  const today = new Date();
  if (period === "Daily") {
    const value = toDateInput(today);
    return { from_date: value, to_date: value };
  }
  // Monthly / Yearly span the *entire* current month or year per product spec
  // (15 May → 1–31 May; 1 June → 1–30 June; 1 Jan 2027 → 1 Jan – 31 Dec 2027),
  // not month-to-date or year-to-date.
  if (period === "Monthly") {
    return {
      from_date: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
      to_date: toDateInput(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
    };
  }
  if (period === "Yearly") {
    return {
      from_date: toDateInput(new Date(today.getFullYear(), 0, 1)),
      to_date: toDateInput(new Date(today.getFullYear(), 11, 31)),
    };
  }
  return {};
}

function buildSummaryParams(period, fromDate, toDate) {
  return buildMemberDateParams(period, fromDate, toDate);
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const picName = searchParams.get("name") || "Unknown PIC";
  const [picProfile, setPicProfile] = useState(null);
  const [period, setPeriod] = useState("Daily");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";
  const summaryParams = useMemo(
    () => buildSummaryParams(period, fromDate, toDate),
    [period, fromDate, toDate]
  );

  // Switching to a predefined period clears any active date range from the URL.
  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("from");
    next.delete("to");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const loadSummary = useCallback(async () => {
    if (!slug) return;
    setSummaryLoading(true);
    try {
      const res = await getRetentionSummary(slug, summaryParams);
      setSummary(res || {});
    } catch (err) {
      console.error("[pic-detail] summary failed", err);
      setSummary({});
    } finally {
      setSummaryLoading(false);
    }
  }, [slug, summaryParams]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    getCrmUserSingle(slug)
      .then((res) => {
        if (!cancelled) setPicProfile(res || null);
      })
      .catch((err) => {
        console.error("[pic-detail] profile failed", err);
        if (!cancelled) setPicProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      <PicProfileHeader
        name={picProfile?.full_name || picProfile?.username || picName}
        image={picProfile?.profile_picture}
        period={period}
        onPeriodChange={handlePeriodChange}
        fromDate={fromDate}
        toDate={toDate}
      />
      <div className="relative">
        <KpiGrid summary={summary} loading={summaryLoading} />
        {summaryLoading && <LoadingOverlay label="Loading..." />}
      </div>
      <MemberListSection
        adminUuid={slug}
        period={period}
        fromDate={fromDate}
        toDate={toDate}
      />
    </>
  );
}

function PicProfileHeader({ name, image, period, onPeriodChange, fromDate, toDate }) {
  return (
    <div className="flex items-end justify-between gap-2 px-2">
      <div className="flex items-center gap-2">
        <div className="h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[12px]">
          <img src={image || `${ASSETS}/member-avatar.svg`} alt="" className="h-full w-full object-cover" />
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
      <PeriodToggle period={period} onPeriodChange={onPeriodChange} fromDate={fromDate} toDate={toDate} />
    </div>
  );
}

function KpiGrid({ summary, loading }) {
  const items = buildKpis(summary);
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {items.map((k) => (
        loading ? <DetailKpiCardSkeleton key={k.id} /> : <DetailKpiCard key={k.id} kpi={k} />
      ))}
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

function DetailKpiCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-[16px] bg-[rgba(5,6,10,0.4)] p-5 shadow-[0_0_3px_0_#dea220] 2xl:p-4 [@media(min-width:1700px)]:p-6">
      <div className="flex w-full items-start gap-3">
        <SkeletonBlock className="h-[18px] flex-1" />
        <SkeletonBlock className="h-[18px] w-[58px]" />
      </div>
      <div className="flex flex-col gap-4">
        {VIP_LEVELS.map((level) => (
          <div key={level} className="flex w-full items-center gap-3">
            <SkeletonBlock className="h-6 w-6 shrink-0 rounded-[4px]" />
            <SkeletonBlock className="h-[16px] flex-1" />
            <SkeletonBlock className="h-[16px] w-[58px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailKpiCard({ kpi }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-[16px] bg-[rgba(5,6,10,0.4)] p-5 shadow-[0_0_3px_0_#dea220] 2xl:p-4 [@media(min-width:1700px)]:p-6">
      <div className="flex w-full items-start gap-3">
        <p className="min-w-0 flex-1 b-3 font-semibold text-[#f6dda6]" style={{ letterSpacing: "-1px" }}>
          {kpi.label}
        </p>
        <p
          className="shrink-0 whitespace-nowrap bg-clip-text text-transparent tabular-nums"
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
      <span className="min-w-0 flex-1 b-4 text-white">{level}</span>
      <span className="shrink-0 b-4 text-[#84ebb4] whitespace-nowrap tabular-nums">{value}</span>
    </div>
  );
}

function MemberListSection({ adminUuid, period, fromDate, toDate }) {
  // URL state ------------------------------------------------------------
  // All filter values live in the query string so the view is shareable and
  // browser-back / forward work as expected.  router.replace (not push) keeps
  // the history clean — typing in a search box shouldn't litter back-stack.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const walletLevel = searchParams.get("wallet") ?? "all";
  const level = searchParams.get("level") ?? "all";
  const brand = searchParams.get("brand") ?? "all";
  const sort = searchParams.get("sort") ?? "";
  const q = searchParams.get("q") ?? "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [walletTierOptions, setWalletTierOptions] = useState([]);
  const [mrsTierOptions, setMrsTierOptions] = useState([]);

  const walletOptions = useMemo(() => [...DEFAULT_WALLET_LEVEL_OPTIONS, ...walletTierOptions], [walletTierOptions]);
  const mrsOptions = useMemo(() => [...DEFAULT_MRS_LEVEL_OPTIONS, ...mrsTierOptions], [mrsTierOptions]);

  useEffect(() => {
    let cancelled = false;
    getWalletVipTiers({ page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setWalletTierOptions(uniqueWalletVipTierOptions(results));
      })
      .catch(() => {
        if (!cancelled) setWalletTierOptions([]);
      });
    getCrmVipTiers({ page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setMrsTierOptions(results.map(tierToOption).filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) setMrsTierOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const memberDateParams = useMemo(
    () => buildMemberDateParams(period, fromDate, toDate),
    [period, fromDate, toDate]
  );

  const apiParams = useMemo(() => ({
    page,
    page_size: PAGE_SIZE,
    ...memberDateParams,
    wallet_vip_level: walletLevel !== "all" ? walletLevel : undefined,
    mrs_vip_level: level !== "all" ? level : undefined,
    brand: brand !== "all" ? brand : undefined,
    search: q || undefined,
    sales: sort === "hl" ? "High" : sort === "lh" ? "Low" : undefined,
  }), [memberDateParams, walletLevel, level, brand, page, q, sort]);

  const fetchMembers = useCallback(async () => {
    if (!adminUuid) return;
    setLoading(true);
    try {
      const res = await getAdminMembers(adminUuid, apiParams);
      let results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      if (sort === "hl") results = [...results].sort((a, b) => parseFloat(memberSales(b) || 0) - parseFloat(memberSales(a) || 0));
      else if (sort === "lh") results = [...results].sort((a, b) => parseFloat(memberSales(a) || 0) - parseFloat(memberSales(b) || 0));
      setRows(results);
      setTotal(Number.isFinite(res?.count) ? res.count : results.length);
    } catch (err) {
      console.error("[pic-detail] retention members failed", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [adminUuid, apiParams, sort]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  return (
    <section className="relative flex w-full flex-col rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-wrap items-center gap-6 p-6 w-full">
        <h2 className="h-7 text-white" style={{ letterSpacing: "-2px" }}>
          Member List
        </h2>
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <FilterDropdown
            value={walletLevel}
            options={walletOptions}
            placeholder="All Wallet Level"
            onChange={(v) => updateParams({ wallet: v === "all" ? null : v, page: null })}
          />
          <FilterDropdown
            value={level}
            options={mrsOptions}
            placeholder="All MRS Level"
            onChange={(v) => updateParams({ level: v === "all" ? null : v, page: null })}
          />
          <FilterDropdown
            value={sort}
            options={SORT_OPTIONS}
            placeholder="Sales"
            onChange={(v) => updateParams({ sort: v, page: null })}
          />
          <FilterDropdown
            value={brand}
            options={BRAND_FILTER_OPTIONS}
            placeholder="All Brand"
            onChange={(v) => updateParams({ brand: v === "all" ? null : v, page: null })}
          />
          <SearchInput
            value={q}
            placeholder="Enter Name/Phone Number"
            onChange={(v) => updateParams({ q: v, page: null })}
          />
        </div>
      </header>
      <div className="flex w-full flex-col overflow-hidden rounded-b-[16px]">
        <div className="w-full overflow-x-auto scrollbar-admin">
          <div className="min-w-[1100px]">
            <MemberTableHeader />
            <div className="flex w-full flex-col">
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <MemberSkeletonRow key={i} />)
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
          </div>
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
      {loading && <LoadingOverlay label="Loading..." />}
    </section>
  );
}

function MemberSkeletonRow() {
  return (
    <div className="flex w-full items-center -mb-px border-b border-white/5">
      <div className="flex h-full w-[197px] shrink-0 items-center gap-3 p-6">
        <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
        <SkeletonBlock className="h-[18px] w-[120px]" />
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex flex-1 min-w-0 items-center self-stretch">
          <div className="flex h-full flex-1 flex-col justify-center p-6">
            <SkeletonBlock className="h-[18px] w-[78px]" />
          </div>
        </div>
      ))}
      <div className="flex h-full w-[130px] shrink-0 items-center justify-end p-6">
        <SkeletonBlock className="h-[34px] w-[82px]" />
      </div>
    </div>
  );
}

function MemberTableHeader() {
  return (
    <div className="flex w-full items-start justify-between" style={{ backgroundImage: GRAD_DARK }}>
      <HeaderCell label="Username" widthClass="w-[197px]" />
      <HeaderCell label="Brand" />
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
        <span className="min-w-0 break-words b-4 text-white leading-[18px]">
          {member.full_name || member.username || "—"}
        </span>
      </div>
      <DataCell value={formatBrand(member)} />
      <DataCell value={member.phone_number || "—"} />
      <div className="flex flex-1 min-w-0 items-center self-stretch">
        <div className="flex h-full flex-1 flex-col justify-center p-6">
          <span
            className="inline-flex w-fit items-center rounded-[12px] px-3 py-1 b-4 font-semibold text-[#05060a] whitespace-nowrap"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            {member.level || member.vip_level || "—"}
          </span>
        </div>
      </div>
      <DataCell value={formatCurrency(memberSales(member))} />
      <DataCell value={formatCurrency(memberWinLose(member))} />
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

function memberSales(member) {
  return member?.total_sales ?? member?.daily_sales;
}

function memberWinLose(member) {
  return member?.total_winlose ?? member?.total_win_lose ?? member?.daily_win_loss;
}

function formatBrand(member) {
  const direct =
    member?.brand ||
    member?.brand_name ||
    member?.station ||
    member?.station_name ||
    member?.site ||
    member?.platform;
  if (direct) return String(direct);

  const brands = member?.brands || member?.stations;
  if (Array.isArray(brands) && brands.length > 0) {
    return brands
      .map((item) => item?.station || item?.name || item?.brand || item)
      .filter(Boolean)
      .join(", ");
  }

  const walletLevels = member?.wallet_levels || member?.customer_data?.wallet_levels || member?.customer_data?.wallet_level;
  if (Array.isArray(walletLevels) && walletLevels.length > 0) {
    return walletLevels
      .map((item) => item?.station || item?.Station)
      .filter(Boolean)
      .join(", ");
  }

  return "—";
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
