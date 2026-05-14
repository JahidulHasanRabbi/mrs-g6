"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

function nameToSlug(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}
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

// PIC detail view — shows per-PIC breakdown of members + a member list.
// Mock data is hardcoded for the Figma reference; swap to API by slug later.

// VIP-level rows shown inside every KPI card.
const VIP_LEVELS = ["KG", "LV", "EP", "AB", "UB", "N1"];

const KPIS = [
  {
    id: "members",
    label: "Total Members",
    total: "50,654",
    values: ["770", "800", "766", "590", "33", "931"],
  },
  {
    id: "active",
    label: "Active Members",
    total: "1,890",
    values: ["421", "100", "45", "45", "89", "23"],
  },
  {
    id: "sales",
    label: "Total Sales",
    total: "RM 223,766",
    values: ["RM 766", "RM 565", "RM 303", "RM 276", "RM 681", "RM 65"],
  },
  {
    id: "winlose",
    label: "Total Win/Lose",
    total: "RM 2,455",
    values: ["RM 81", "RM 76", "RM 59", "RM 45", "RM 38", "RM 26"],
  },
];

// Members managed by this PIC.  `lastDepositIso` is the canonical ISO date
// used for filtering against ?from / ?to; `lastDeposit` is just the display.
const MEMBERS = [
  { username: "Ah Chong",      phone: "+64164293333", vip: "VIP 2", sales: 3770, salesText: "RM 3,770", winlose: "RM 400",  lastDeposit: "04-05-2026", lastDepositIso: "2026-05-04" },
  { username: "Lily Tran",     phone: "+64167891234", vip: "VIP 1", sales: 250,  salesText: "RM 250",   winlose: "RM 1,500", lastDeposit: "15-06-2026", lastDepositIso: "2026-06-15" },
  { username: "Sophia Lee",    phone: "+64168901234", vip: "VIP 4", sales: 300,  salesText: "RM 300",   winlose: "RM 2,900", lastDeposit: "12-08-2026", lastDepositIso: "2026-08-12" },
  { username: "Marcus Henry",  phone: "+64164293333", vip: "VIP 2", sales: 400,  salesText: "RM 400",   winlose: "RM 3,770", lastDeposit: "04-05-2026", lastDepositIso: "2026-05-04" },
  { username: "Aiden Smith",   phone: "+64161234567", vip: "VIP 3", sales: 550,  salesText: "RM 550",   winlose: "RM 5,500", lastDeposit: "20-07-2026", lastDepositIso: "2026-07-20" },
  { username: "Daniel Kim",    phone: "+64163456789", vip: "VIP 5", sales: 700,  salesText: "RM 700",   winlose: "RM 7,000", lastDeposit: "25-09-2026", lastDepositIso: "2026-09-25" },
  { username: "Nora Park",     phone: "+64162345678", vip: "VIP 2", sales: 450,  salesText: "RM 450",   winlose: "RM 4,200", lastDeposit: "08-06-2026", lastDepositIso: "2026-06-08" },
];

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

const SLUG_DISPLAY = {
  "sarah-jenkins": "Sarah Jenkins",
  "marcus-henry": "Marcus Henry",
  "david-chen": "David Chen",
  "elena-rody": "Elena Rody",
  "adam-ron": "Adam Ron",
  "omar-al-farsi": "Omar Al-Farsi",
  "samantha": "Samantha",
};

function slugToName(slug) {
  if (!slug) return "Unknown PIC";
  if (SLUG_DISPLAY[slug]) return SLUG_DISPLAY[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function PicDetailPage() {
  const params = useParams();
  const slug = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const [period, setPeriod] = useState("Daily");

  return (
    <>
      <PicProfileHeader name={slugToName(slug)} period={period} onPeriodChange={setPeriod} />
      <KpiGrid />
      <MemberListSection />
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

function KpiGrid() {
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {KPIS.map((k) => (
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

function MemberListSection() {
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

  const onApplyDates = useCallback(
    (from, to) => updateParams({ from, to }),
    [updateParams]
  );

  // Filter + sort the member list. useMemo so we only recompute when an input
  // actually changes — typing in unrelated state doesn't trigger this work.
  const filteredMembers = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = MEMBERS.filter((m) => {
      if (level !== "all" && m.vip !== level) return false;
      if (fromDate && m.lastDepositIso < fromDate) return false;
      if (toDate && m.lastDepositIso > toDate) return false;
      if (needle) {
        const haystack = `${m.username} ${m.phone}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    if (sort === "hl") rows = [...rows].sort((a, b) => b.sales - a.sales);
    else if (sort === "lh") rows = [...rows].sort((a, b) => a.sales - b.sales);

    return rows;
  }, [level, fromDate, toDate, q, sort]);

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
            onApply={onApplyDates}
          />
          <FilterDropdown
            value={level}
            options={LEVEL_OPTIONS}
            placeholder="All level"
            onChange={(v) => updateParams({ level: v === "all" ? null : v })}
          />
          <FilterDropdown
            value={sort}
            options={SORT_OPTIONS}
            placeholder="Sales (H-L)"
            onChange={(v) => updateParams({ sort: v })}
          />
          <SearchInput
            value={q}
            placeholder="Enter Name/Phone Number"
            onChange={(v) => updateParams({ q: v })}
          />
        </div>
        <RefreshControl />
      </header>
      <div className="flex w-full flex-col overflow-clip">
        <MemberTableHeader />
        <div className="flex w-full flex-col">
          {filteredMembers.length === 0 ? (
            <div className="px-6 py-10 text-center b-4 text-white/60">
              No members match the current filters.
            </div>
          ) : (
            filteredMembers.map((m, idx) => (
              <MemberTableRow key={`${m.username}-${idx}`} member={m} />
            ))
          )}
        </div>
        <Pagination from={filteredMembers.length === 0 ? 0 : 1} to={filteredMembers.length} total={150} />
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
  return (
    <div className="flex w-full items-center -mb-px border-b border-white/5">
      <div className="flex h-full w-[197px] shrink-0 items-center gap-3 p-6">
        <img src={`${ASSETS}/member-avatar.svg`} alt="" className="h-8 w-8 shrink-0" />
        <span className="b-4 text-white whitespace-nowrap">{member.username}</span>
      </div>
      <DataCell value={member.phone} />
      <div className="flex flex-1 min-w-0 items-center self-stretch">
        <div className="flex h-full flex-1 flex-col justify-center p-6">
          <span
            className="inline-flex w-fit items-center rounded-[12px] px-3 py-1 b-6 text-[#05060a] whitespace-nowrap"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            {member.vip}
          </span>
        </div>
      </div>
      <DataCell value={member.salesText} />
      <DataCell value={member.winlose} />
      <DataCell value={member.lastDeposit} />
      <div className="flex h-full w-[130px] shrink-0 items-center justify-end p-6">
        <Link
          href={`/admin/retention/members/${nameToSlug(member.username)}`}
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
