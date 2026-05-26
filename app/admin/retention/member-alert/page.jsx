"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RefreshControl from "../../../components/admin/retention/RefreshControl";
import PriorityBadge from "../../../components/admin/retention/PriorityBadge";
import Pagination from "../../../components/admin/retention/Pagination";
import { ASSETS, GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import {
  getCrmMembers,
  getCrmUsers,
  getPrioritySummary,
  refreshCrmMembers,
} from "../../../api/crmApi";
import { getVipTierList } from "../../../api/adminApi";

// Member Alert page — Figma 69:340. "Overview" KPI strip + Member Follow Up
// list. The list is the same shape as /admin/retention/members but with a
// green "Done" action button instead of a gold View link.

const PAGE_SIZE = 7;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

const PRIORITY_TO_INT = { High: 1, Medium: 2, Low: 3 };

// Column widths from Figma 69:340 (frame ids 87:6604 etc). Username and
const COLUMNS = [
  { key: "name",     label: "Username",       minW: 220 },
  { key: "phone",    label: "Phone Number",   minW: 160 },
  { key: "vip",      label: "VIP Level",      minW: 110 },
  { key: "sales",    label: "Daily Sales",    minW: 130 },
  { key: "winloss",  label: "Daily Win/Loss", minW: 140 },
  { key: "priority", label: "Priority",       minW: 110 },
  { key: "pic",      label: "Retention",      minW: 130 },
  { key: "action",   label: "Action",         minW: 120, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

// KPI tiles — all render with the gold gradient. Each tile pairs the label
// with a dark icon-tile whose glyph is tinted per priority (red → white →
// green → blue) so the row scans left-to-right from most to least urgent.
const KPI_META = [
  { id: "high",     label: "High Priority",    key: "high_priority",    icon: "user-times", iconColor: "#fb3748" },
  { id: "medium",   label: "Medium Priority",  key: "medium_priority",  icon: "user-minus", iconColor: "#fbeed2" },
  { id: "low",      label: "Low Priority",     key: "low_priority",     icon: "user-check", iconColor: "#84ebb4" },
  { id: "inactive", label: "Inactive Members", key: "inactive_members", icon: "user-clock", iconColor: "#4188ff" },
];

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  return Number(value).toLocaleString("en-US");
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function MemberAlertPage() {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getPrioritySummary();
      setSummary(res || {});
    } catch (err) {
      console.error("[member-alert] priority-summary failed", err);
      setSummary({});
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // POST refresh-members, then refresh the summary so KPIs reflect new state.
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshCrmMembers();
      await loadSummary();
    } catch (err) {
      console.error("[member-alert] refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loadSummary]);

  return (
    <>
      <OverviewHeader onRefresh={handleRefresh} />
      <KpiRow summary={summary} loading={summaryLoading} />
      <FollowUpList onRefresh={handleRefresh} />
    </>
  );
}

function OverviewHeader({ onRefresh }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">MEMBER RETENTION</span>
        <h1
          className="bg-clip-text text-transparent font-bold whitespace-nowrap"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Overview
        </h1>
      </div>
      <RefreshControl onRefresh={onRefresh} />
    </div>
  );
}

function KpiRow({ summary, loading }) {
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_META.map((kpi) => (
        <KpiCard
          key={kpi.id}
          kpi={kpi}
          value={loading ? "—" : formatNumber(summary?.[kpi.key])}
        />
      ))}
    </div>
  );
}

// Gold-gradient card with a dark icon-tile + per-priority colored glyph.
// Matches Figma 69:340.
function KpiCard({ kpi, value }) {
  return (
    <div
      className="flex items-center gap-4 rounded-[16px] border-[3px] border-[#f2cb7a] p-6"
      style={{ backgroundImage: GRAD_GOLD }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]"
        style={{ backgroundImage: GRAD_DARK, color: kpi.iconColor }}
      >
        <KpiIcon name={kpi.icon} />
      </div>
      <div className="flex flex-1 min-w-0 flex-col gap-1">
        <p
          className="text-[16px] font-semibold uppercase leading-[24px] text-[#141828]"
          style={{ letterSpacing: "-1px" }}
        >
          {kpi.label}
        </p>
        <p
          className="font-bold text-[#141828] whitespace-nowrap"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "38px",
            lineHeight: "44px",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// FA-style user glyphs. Use currentColor so the wrapping icon-tile controls
// the fill via inline `color`. Sized at 24px; viewBox tuned to keep the
// person centered.
function KpiIcon({ name }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "currentColor" };
  if (name === "user-times") {
    return (
      <svg {...common}>
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0v1H2v-1zm14.3-9.7l1.4-1.4 1.8 1.8 1.8-1.8 1.4 1.4-1.8 1.8 1.8 1.8-1.4 1.4-1.8-1.8-1.8 1.8-1.4-1.4 1.8-1.8-1.8-1.8z" />
      </svg>
    );
  }
  if (name === "user-minus") {
    return (
      <svg {...common}>
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0v1H2v-1zm14-9h7v2h-7v-2z" />
      </svg>
    );
  }
  if (name === "user-check") {
    return (
      <svg {...common}>
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0v1H2v-1zm15.5-2.5L15 15l-1.4 1.4 3.9 3.9 5.5-5.5L21.6 13.4l-4.1 4.1z" />
      </svg>
    );
  }
  // user-clock
  return (
    <svg {...common}>
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 12.5-4.3 6 6 0 0 0 .5 9.3H2v-5zm15-3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm.5 2v3l2.1 1.3-.7 1.2L16 18v-4h1.5z" />
    </svg>
  );
}

function FollowUpList() {
  const [priority, setPriority] = useState("");
  const [vip, setVip] = useState("");
  const [retention, setRetention] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pics, setPics] = useState([]);
  const [vipTiers, setVipTiers] = useState([]);

  useEffect(() => {
    getCrmUsers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setPics(results);
      })
      .catch(() => setPics([]));
    getVipTierList()
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setVipTiers(results.map((t) => ({ name: t.name, level: t.id ?? t.uuid })));
      })
      .catch(() => setVipTiers([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [priority, vip, retention, query]);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setLoading(true);
      try {
        const retentionUuid = retention
          ? pics.find((u) => (u.full_name || u.username) === retention)?.uuid
          : undefined;
        const res = await getCrmMembers({
          page,
          page_size: PAGE_SIZE,
          priority: priority ? PRIORITY_TO_INT[priority] : undefined,
          vip_level: vip ? (vipTiers.find((t) => t.name === vip)?.level ?? undefined) : undefined,
          retention: retentionUuid || undefined,
          search: debouncedQuery || undefined,
        });
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setRows(results);
        setTotal(Number.isFinite(res?.count) ? res.count : results.length);
      } catch (err) {
        if (cancelled) return;
        console.error("[member-alert] members fetch failed", err);
        setRows([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRows();
    return () => {
      cancelled = true;
    };
  }, [page, priority, vip, retention, pics, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-col gap-4 p-6 w-full md:flex-row md:flex-wrap md:items-center">
        <h2
          className="text-white font-bold whitespace-nowrap md:flex-1 md:min-w-0"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Member Follow Up List
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <FilterPill label="Priority" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} />
          <FilterPill label="VIP Level" value={vip} onChange={setVip} options={vipTiers.map((t) => t.name)} />
          <FilterPill label="All Retention" value={retention} onChange={setRetention} options={pics.map((u) => u.full_name || u.username).filter(Boolean)} />
          <SearchInput value={query} onChange={setQuery} />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
            ) : rows.length === 0 ? (
              <EmptyRow />
            ) : (
              rows.map((row, idx) => (
                <TableRow key={`${row.uuid || row.username || "member"}-${idx}`} row={row} />
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
        onPageChange={setPage}
      />
    </section>
  );
}

function SkeletonRow() {
  return (
    <div className="flex w-full items-stretch border-b border-white/5">
      {COLUMNS.map((col) => (
        <div key={col.key} className="flex flex-1 items-center px-4 py-4" style={{ minWidth: col.minW }}>
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="px-6 py-12 text-center text-[12px] text-white/40">
      No members found.
    </div>
  );
}

function FilterPill({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2"
        style={{ backgroundImage: GRAD_DARK }}
      >
        <span className="text-[12px] font-medium text-[#f6dda6] leading-[18px] whitespace-nowrap">
          {value || label}
        </span>
        <Chevron up={open} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 min-w-full rounded-[8px] border border-[#f2cb7a] overflow-hidden"
            style={{ backgroundImage: GRAD_DARK }}
          >
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-[12px] text-[#f6dda6] hover:bg-white/5 whitespace-nowrap"
            >
              All
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="block w-full text-left px-4 py-2 text-[12px] text-[#f6dda6] hover:bg-white/5 whitespace-nowrap"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Chevron({ up }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f6dda6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: up ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}
    >
      <polyline points="6 15 12 9 18 15" />
    </svg>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter Name/Phone Number"
      className="w-[180px] bg-[#141828] border border-[#f2cb7a] rounded-[8px] px-3 py-2 text-[10px] italic text-[#f6dda6] placeholder:text-[#f6dda6] placeholder:capitalize focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
      style={{ fontFamily: "Inter, sans-serif", lineHeight: "15px" }}
    />
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex flex-1 flex-col px-4 py-4 ${col.align === "end" ? "items-end" : "items-start"}`}
          style={{ minWidth: col.minW }}
        >
          <p className="text-[12px] font-medium text-[#fbeed2] leading-[18px] whitespace-nowrap">
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function TableRow({ row }) {
  // Route by the member's real UUID — the [slug] page accepts it transparently.
  const href = `/admin/retention/members/${row.uuid}`;
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <Link href={href} className="flex items-start gap-3 hover:opacity-80">
          <div className="shrink-0 pt-0.5"><UserAvatar /></div>
          <span className="text-[12px] font-medium text-white leading-[18px] break-words">
            {row.full_name || row.username}
          </span>
        </Link>
      </Cell>
      <DataCell value={row.phone_number} minW={COLUMNS[1].minW} />
      <DataCell value={row.vip_level} minW={COLUMNS[2].minW} />
      <DataCell value={formatCurrency(row.daily_sales)} minW={COLUMNS[3].minW} />
      <DataCell value={formatCurrency(row.daily_win_loss)} minW={COLUMNS[4].minW} />
      <Cell minW={COLUMNS[5].minW}>
        <PriorityBadge value={row.priority} />
      </Cell>
      <DataCell value={row.retention} minW={COLUMNS[6].minW} />
      <Cell minW={COLUMNS[7].minW} align="end">
        <ViewButton href={href} />
      </Cell>
    </div>
  );
}

// View link — dark gradient pill with gold border and gold text/eye icon.
// Matches Figma 20:1735 (the shared "button" component used across the table).
function ViewButton({ href }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2 transition hover:brightness-110"
      style={{ backgroundImage: GRAD_DARK }}
    >
      <EyeIcon />
      <span className="text-[12px] font-medium text-[#eaad2c] leading-[18px]">View</span>
    </Link>
  );
}


function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#eaad2c"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DataCell({ value, minW }) {
  return (
    <Cell minW={minW}>
      <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
        {value ?? "—"}
      </span>
    </Cell>
  );
}

function Cell({ children, minW, align = "start" }) {
  const justify = align === "end" ? "justify-end" : "justify-start";
  return (
    <div className={`flex flex-1 items-center overflow-hidden px-4 py-4 ${justify}`} style={{ minWidth: minW }}>
      {children}
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{ background: "#3a4255" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

