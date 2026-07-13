"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import PriorityBadge from "../../../components/admin/retention/PriorityBadge";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import {
  assignCrmMemberToPic,
  getRetentionMembers,
  getCrmUsers,
  getCrmRoles,
  getCrmVipTiers,
  getPrioritySummary,
  patchCrmMemberFollowUp,
} from "../../../api/crmApi";
import { getWalletVipTiers } from "../../../api/adminApi";
import { FollowUpCreateModal } from "../../../components/admin/retention/FollowUpComponents";
import Pagination from "../../../components/admin/retention/Pagination";
import LoadingOverlay from "../../../components/admin/ui/LoadingOverlay";
import { uniqueWalletVipTierNames } from "../../../components/admin/retention/walletVipFilterOptions";

// Member Alert page — Figma 69:340. "Overview" KPI strip + Member Follow Up
// list. The list is the same shape as /admin/retention/members but with a
// green "Done" action button instead of a gold View link.

const PAGE_SIZE = 7;

const PRIORITY_OPTIONS = ["High", "Medium", "Low", "Inactive"];
const PRIORITY_SORT_RANK = { high: 0, medium: 1, low: 2, inactive: 3 };
const BRAND_OPTIONS = ["KG", "LV", "EP", "AB", "UB", "N1"];
const SALES_SORT_OPTIONS = ["High to Low", "Low to High"];
const WINLOSS_SORT_OPTIONS = ["High to Low", "Low to High"];
const FOLLOWED_UP_OPTIONS = ["Yes", "No"];

// A role carries the Retention permission if its permissions list includes
// the "access_retention" key (Others > Type, per /admins/permissions/).
function roleHasRetentionAccess(role) {
  const permissions = role?.permissions;
  if (!Array.isArray(permissions)) return false;
  return permissions.some((p) => String(p?.key || p).toLowerCase() === "access_retention");
}

// Whether a PIC carries the Retention role — the "All Retention" filter should
// only list those (spec #10). /admins/users/ only exposes the PIC's role name,
// so membership is resolved by cross-referencing /admins/roles/ for roles that
// have the "access_retention" permission.
function hasRetentionRole(pic, retentionRoleNames) {
  if (!pic) return false;
  const role = String(pic.role || pic.role_name || "").trim().toLowerCase();
  return role ? retentionRoleNames?.has(role) ?? false : false;
}

function memberSalesValue(row) {
  return parseFloat(row?.total_sales ?? row?.daily_sales ?? 0) || 0;
}

function memberWinLossValue(row) {
  return parseFloat(row?.total_win_lose ?? row?.total_winlose ?? row?.daily_win_loss ?? 0) || 0;
}

function memberPriorityRank(row) {
  const priority = String(row?.priority || "").trim().toLowerCase();
  return PRIORITY_SORT_RANK[priority] ?? 99;
}

// Column widths from Figma 69:340 (frame ids 87:6604 etc). Username and
// Action are wider to accommodate the avatar+name and the View + more-menu
// button pair respectively; everything else is uniform at 124px. The three
// follow-up columns (spec #8) sit before Action.
const COLUMNS = [
  { key: "name",        label: "Username",            minW: 197 },
  { key: "brand",       label: "Brand",               minW: 124 },
  { key: "phone",       label: "Phone Number",        minW: 150 },
  { key: "vip",         label: "MRS Level",           minW: 124 },
  { key: "sales",       label: "Total Sales",         minW: 124 },
  { key: "winloss",     label: "Total Win/Loss",      minW: 124 },
  { key: "priority",    label: "Priority",            minW: 124 },
  { key: "pic",         label: "Retention",           minW: 124 },
  { key: "followed_by", label: "Last Followed Up By",   minW: 150 },
  { key: "followed_at", label: "Last Followed Up Date", minW: 160 },
  { key: "follow_stat", label: "Follow Up Status",      minW: 150 },
  // Pinned to the right edge of the scroller so the View/more buttons stay
  // reachable without scrolling horizontally.
  { key: "action",      label: "Action",              minW: 171, align: "end", sticky: true },
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
  if (value === null || value === undefined || value === "") return "RM 0.00";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MemberAlertPage() {
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getPrioritySummary({ date: date || undefined });
      setSummary(res || {});
    } catch (err) {
      console.error("[member-alert] priority-summary failed", err);
      setSummary({});
    } finally {
      setSummaryLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <>
      <OverviewHeader />
      <div className="relative">
        <KpiRow summary={summary} loading={summaryLoading} />
        {summaryLoading && <LoadingOverlay label="Loading..." />}
      </div>
      <FollowUpList date={date} onDateChange={setDate} />
    </>
  );
}

function OverviewHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">MEMBER RETENTION</span>
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
          Overview
        </h1>
      </div>
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

function FollowUpList({ date, onDateChange }) {
  const [walletLevel, setWalletLevel] = useState("");
  const [brand, setBrand] = useState("");
  const [priority, setPriority] = useState("");
  const [vip, setVip] = useState("");
  const [retention, setRetention] = useState("");
  const [query, setQuery] = useState("");
  const [salesSort, setSalesSort] = useState("");
  const [winSort, setWinSort] = useState("");
  const [followedUp, setFollowedUp] = useState("");
  const [page, setPage] = useState(1);

  const pickSalesSort = useCallback((v) => {
    setSalesSort(v);
    setPage(1);
  }, []);
  const pickWinSort = useCallback((v) => {
    setWinSort(v);
    setPage(1);
  }, []);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pics, setPics] = useState([]);
  const [retentionRoleNames, setRetentionRoleNames] = useState(new Set());
  const [walletTiers, setWalletTiers] = useState([]);
  const [vipTiers, setVipTiers] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    getCrmUsers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setPics(results);
      })
      .catch(() => setPics([]));
    getCrmRoles({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        const names = results
          .filter(roleHasRetentionAccess)
          .map((r) => String(r?.name || "").trim().toLowerCase())
          .filter(Boolean);
        setRetentionRoleNames(new Set(names));
      })
      .catch(() => setRetentionRoleNames(new Set()));
    getCrmVipTiers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setVipTiers(results.map((t, i) => ({ name: t.name || t.tier_name || t.level || t.uuid, level: i + 1 })).filter((t) => t.name));
      })
      .catch(() => setVipTiers([]));
    getWalletVipTiers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setWalletTiers(uniqueWalletVipTierNames(results));
      })
      .catch(() => setWalletTiers([]));
  }, []);

  // Only PICs holding the Retention role populate the "All Retention" filter
  // (spec #10). If the backend exposes no role data yet, fall back to all PICs.
  const retentionPics = useMemo(() => {
    return pics.filter((pic) => hasRetentionRole(pic, retentionRoleNames));
  }, [pics, retentionRoleNames]);

  useEffect(() => {
    setPage(1);
  }, [walletLevel, brand, priority, vip, retention, query, date, followedUp]);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const retentionUuid = useMemo(() => {
    if (!retention) return undefined;
    return pics.find((u) => (u.full_name || u.username) === retention)?.uuid;
  }, [retention, pics]);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setLoading(true);
      try {
        const sales = salesSort ? (salesSort === "High to Low" ? "High" : "Low") : undefined;
        const win_lose = winSort ? (winSort === "High to Low" ? "High" : "Low") : undefined;
        const followed_up = followedUp ? followedUp === "Yes" : undefined;
        const res = await getRetentionMembers({
          page,
          page_size: PAGE_SIZE,
          wallet_vip_level: walletLevel || undefined,
          brand: brand || undefined,
          priority: priority ? priority.toLowerCase() : undefined,
          mrs_vip_level: vip || undefined,
          retention: retentionUuid || undefined,
          search: debouncedQuery || undefined,
          // Single-day filter only — no range (spec #7).
          date: date || undefined,
          sales,
          win_lose,
          followed_up,
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
  }, [page, walletLevel, brand, priority, vip, retentionUuid, retention, debouncedQuery, date, salesSort, winSort, followedUp, reloadKey]);

  // Client-side sort of the current page (backend ordering covers cross-page).
  const sortedRows = useMemo(() => {
    const salesDir = salesSort ? (salesSort === "High to Low" ? -1 : 1) : 0;
    const winDir = winSort ? (winSort === "High to Low" ? -1 : 1) : 0;

    if (salesDir || winDir) {
      return [...rows].sort((a, b) => {
        const salesDelta = salesDir ? (memberSalesValue(a) - memberSalesValue(b)) * salesDir : 0;
        if (salesDelta !== 0) return salesDelta;
        return winDir ? (memberWinLossValue(a) - memberWinLossValue(b)) * winDir : 0;
      });
    }
    return rows
      .map((row, idx) => ({ row, idx }))
      .sort((a, b) => memberPriorityRank(a.row) - memberPriorityRank(b.row) || a.idx - b.idx)
      .map(({ row }) => row);
  }, [rows, salesSort, winSort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <section className="relative flex w-full flex-col rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-col gap-4 p-6 w-full">
        <h2
          className="text-white font-bold whitespace-nowrap"
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
          <FilterPill label="Wallet Level" value={walletLevel} onChange={setWalletLevel} options={walletTiers} />
          <FilterPill label="MRS Level" value={vip} onChange={setVip} options={vipTiers.map((t) => t.name)} />
          <FilterPill label="Priority" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} />
          <FilterPill label="Sales" value={salesSort} onChange={pickSalesSort} options={SALES_SORT_OPTIONS} />
          <FilterPill label="Win/Lose" value={winSort} onChange={pickWinSort} options={WINLOSS_SORT_OPTIONS} />
          <FilterPill label="Brand" value={brand} onChange={setBrand} options={BRAND_OPTIONS} />
          <FilterPill label="All Retention" value={retention} onChange={setRetention} options={retentionPics.map((u) => u.full_name || u.username).filter(Boolean)} />
          <FilterPill label="Followed Up" value={followedUp} onChange={setFollowedUp} options={FOLLOWED_UP_OPTIONS} />
          <DayPicker value={date} onChange={onDateChange} />
          <SearchInput value={query} onChange={setQuery} />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
            ) : sortedRows.length === 0 ? (
              <EmptyRow />
            ) : (
              sortedRows.map((row, idx) => (
                <TableRow
                  key={`${row.uuid || row.username || "member"}-${idx}`}
                  row={row}
                  pics={pics}
                  onChanged={() => setReloadKey((k) => k + 1)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Pagination
        from={showingFrom}
        to={showingTo}
        total={total}
        pageCount={totalPages}
        currentPage={safePage}
        onPageChange={setPage}
      />
      {loading && <LoadingOverlay label="Loading..." />}
    </section>
  );
}

function SkeletonBar({ width = "60%" }) {
  return (
    <span
      className="relative block h-3 overflow-hidden rounded bg-white/[0.07] before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.1] before:to-transparent"
      style={{ width }}
    />
  );
}

function SkeletonCircle() {
  return (
    <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/[0.07] before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.1] before:to-transparent" />
  );
}

function SkeletonRow() {
  return (
    <div className="flex w-full items-center border-b border-white/5">
      <div className="flex items-center gap-3 p-6" style={{ minWidth: COLUMNS[0].minW }}>
        <SkeletonCircle />
        <SkeletonBar width="70%" />
      </div>
      {COLUMNS.slice(1, -1).map((col) => (
        <div key={col.key} className="flex flex-1 items-center p-6" style={{ minWidth: col.minW }}>
          <SkeletonBar width="55%" />
        </div>
      ))}
      <div className="sticky right-0 z-[1] flex items-center justify-end bg-[#041502] p-6 shadow-[-12px_0_12px_-8px_rgba(0,0,0,0.55)]" style={{ minWidth: COLUMNS[COLUMNS.length - 1].minW }}>
        <span className="relative block h-8 w-[76px] overflow-hidden rounded-[8px] bg-[#e9af41]/20 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#e9af41]/30 before:to-transparent" />
      </div>
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

// Single-day filter only — no range (spec #7). A native date input keeps it to
// one calendar day and is the lightest control that does the job.
function DayPicker({ value, onChange }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  };

  const formatted = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <div
      className="relative flex items-center gap-2 rounded-[8px] border border-[#f2cb7a] px-3 py-2 cursor-pointer"
      style={{ backgroundImage: GRAD_DARK }}
      onClick={openPicker}
    >
      <span className="pointer-events-none whitespace-nowrap text-[12px] font-medium text-[#f6dda6]">
        {formatted || "dd/mm/yyyy"}
      </span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by day"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
      />
      {value ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          aria-label="Clear date"
          className="relative z-10 text-[12px] leading-none text-[#f6dda6]/70 hover:text-[#f6dda6]"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

// Follow Up Status (spec #8): Completed (done) · Pending (not yet) · Missed
// (not done and the day has rolled past midnight). Derived from the backend
// `follow_up_status` when present; otherwise inferred from last-followed-up.
const FOLLOW_STATUS_COLORS = {
  Completed: { bg: "#003920", color: "#84ebb4" },
  Pending: { bg: "#3d2e00", color: "#eaad2c" },
  Missed: { bg: "#4a0d12", color: "#fb6f7d" },
};

function deriveFollowStatus(row) {
  const raw = row?.follow_up_status || row?.followup_status;
  if (raw) {
    const norm = String(raw).toLowerCase();
    if (norm.startsWith("complet")) return "Completed";
    if (norm.startsWith("miss")) return "Missed";
    if (norm.startsWith("pend")) return "Pending";
  }
  const last = row?.last_followed_up_date || row?.last_followed_up_at || row?.last_follow_up_at || row?.last_action_at;
  return last ? "Completed" : "Pending";
}

function FollowUpStatusBadge({ row }) {
  const status = deriveFollowStatus(row);
  const palette = FOLLOW_STATUS_COLORS[status] || FOLLOW_STATUS_COLORS.Pending;
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2.5 py-1 text-[12px] font-semibold leading-[18px] whitespace-nowrap"
      style={{ backgroundColor: palette.bg, color: palette.color }}
    >
      {status}
    </span>
  );
}

function followedUpBy(row) {
  return row?.last_followed_up_by || row?.last_follow_up_by || row?.last_action_by || "—";
}

function followedUpDate(row) {
  const raw = row?.last_followed_up_date || row?.last_followed_up_at || row?.last_follow_up_at || row?.last_action_at;
  if (!raw) return "—";
  const text = String(raw).replace("T", " ");
  const [d = "", t = ""] = text.split(" ");
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return String(raw);
  const [hourRaw = "0", minuteRaw = "00"] = t.split(":");
  const hour24 = Number(hourRaw);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}, ${String(hour12).padStart(2, "0")}:${String(minuteRaw).padStart(2, "0")} ${ampm}`;
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex flex-1 flex-col px-6 py-4 ${col.align === "end" ? "items-end" : "items-start"}${col.sticky ? " sticky right-0 z-[1]" : ""}`}
          style={{ minWidth: col.minW, ...(col.sticky ? { backgroundImage: GRAD_DARK } : null) }}
        >
          <p className="text-[12px] font-medium text-[#fbeed2] leading-[18px] whitespace-nowrap">
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function TableRow({ row, pics, onChanged }) {
  // Route by the member's real UUID — the [slug] page accepts it transparently.
  const href = `/admin/retention/members/${row.uuid}`;
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <Link href={href} className="flex min-w-0 items-center gap-3 hover:opacity-80">
          <UserAvatar />
          <span className="min-w-0 break-words text-[12px] font-medium text-white leading-[18px]">
            {row.full_name || row.username}
          </span>
        </Link>
      </Cell>
      <DataCell value={row.brand} minW={COLUMNS[1].minW} />
      <DataCell value={row.phone_number} minW={COLUMNS[2].minW} nowrap />
      <DataCell value={row.ns_level || row.vip_level} minW={COLUMNS[3].minW} />
      <DataCell value={formatCurrency(row.total_sales ?? row.daily_sales)} minW={COLUMNS[4].minW} />
      <DataCell value={formatCurrency(row.total_win_lose ?? row.total_winlose ?? row.daily_win_loss)} minW={COLUMNS[5].minW} />
      <Cell minW={COLUMNS[6].minW}>
        <PriorityBadge value={row.priority} />
      </Cell>
      <DataCell value={row.retention} minW={COLUMNS[7].minW} />
      <DataCell value={followedUpBy(row)} minW={COLUMNS[8].minW} />
      <DataCell value={followedUpDate(row)} minW={COLUMNS[9].minW} />
      <Cell minW={COLUMNS[10].minW}>
        <FollowUpStatusBadge row={row} />
      </Cell>
      <Cell minW={COLUMNS[11].minW} align="end" sticky>
        <div className="flex items-center gap-2">
          <ViewButton href={href} />
          <MoreButton
            row={row}
            pics={pics}
            onChanged={onChanged}
            ariaLabel={`More actions for ${row.full_name || row.username}`}
          />
        </div>
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

// Square 34×34 icon button — gold gradient, dark three-dots glyph. Opens a
// cream-colored dropdown with exactly three actions (spec #11):
//   Follow Up  → action picker (TG/WA/Bonus/Event/LiveChat/Others→fill-up)
//   Add Note   → shows the existing note and updates it (was "Remark")
//   Assign PIC → choose which PIC owns the member
const STATUS_OPTIONS = ["Follow Up", "Add Note", "Assign PIC"];

function MoreButton({ row, pics, onChanged, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const buttonRef = useRef(null);

  // Existing note shown when editing via "Add Note".
  const existingNote = row?.note || row?.follow_up_remark || row?.last_remark || row?.remark || "";

  const submitRemark = async (remark) => {
    if (!row?.uuid || saving) return false;
    setSaving(true);
    setError("");
    try {
      await patchCrmMemberFollowUp(row.uuid, { follow_up_remark: remark });
      onChanged?.();
      return true;
    } catch (err) {
      console.error("[member-alert] follow-up action failed", err);
      setError("Action failed.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border-2 border-[#f2cb7a] transition hover:brightness-110"
        style={{ backgroundImage: GRAD_GOLD }}
      >
        <ThreeDotsIcon />
      </button>
      {open && (
        <StatusMenu
          anchorRef={buttonRef}
          status={status}
          onSelect={(next) => {
            setStatus(next);
            setOpen(false);
            if (next === "Assign PIC") setAssignOpen(true);
            else if (next === "Add Note") setNoteOpen(true);
            else if (next === "Follow Up") setFollowUpOpen(true);
          }}
          onClose={() => setOpen(false)}
        />
      )}
      {saving ? (
        <span className="absolute right-0 top-full mt-1 whitespace-nowrap text-[10px] text-white/50">Saving...</span>
      ) : error ? (
        <span className="absolute right-0 top-full mt-1 whitespace-nowrap text-[10px] text-[#fb3748]">{error}</span>
      ) : null}
      {followUpOpen ? (
        <FollowUpCreateModal
          memberName={row?.full_name || row?.username || "Member"}
          title="Follow Up"
          submitting={saving}
          submitError={error}
          onClose={() => setFollowUpOpen(false)}
          onSubmit={async (entry) => {
            const ok = await submitRemark(entry.follow_up_remark || entry.note || "");
            if (ok) setFollowUpOpen(false);
          }}
        />
      ) : null}
      {noteOpen ? (
        <FollowUpCreateModal
          memberName={row?.full_name || row?.username || "Member"}
          title="Add Note"
          fixedActionType="Others"
          initialNote={existingNote}
          submitting={saving}
          submitError={error}
          onClose={() => setNoteOpen(false)}
          onSubmit={async (entry) => {
            const ok = await submitRemark(entry.note || entry.follow_up_remark || "");
            if (ok) setNoteOpen(false);
          }}
        />
      ) : null}
      {assignOpen ? (
        <AssignPicModal
          member={row}
          pics={pics}
          saving={saving}
          error={error}
          onClose={() => setAssignOpen(false)}
          onSubmit={async (picUuid) => {
            if (!row?.uuid || !picUuid || saving) return;
            setSaving(true);
            setError("");
            try {
              await assignCrmMemberToPic(row.uuid, { pic_uuid: picUuid });
              setAssignOpen(false);
              onChanged?.();
            } catch (err) {
              console.error("[member-alert] assign PIC failed", err);
              setError("Assign failed.");
            } finally {
              setSaving(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function AssignPicModal({ member, pics, saving, error, onClose, onSubmit }) {
  const [picUuid, setPicUuid] = useState("");
  const name = member?.full_name || member?.username || "Member";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-[16px] bg-[#05060a] p-6 shadow-[0_0_3px_0_#dea220]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <h3 className="text-[18px] font-bold text-[#f6dda6]">Assign PIC - {name}</h3>
          <button type="button" onClick={onClose} className="text-[20px] leading-none text-white/50 hover:text-white">x</button>
        </div>
        <label className="mt-5 block text-[12px] font-medium text-[#fbeed2]">PIC</label>
        <select
          value={picUuid}
          onChange={(e) => setPicUuid(e.target.value)}
          className="mt-2 w-full rounded-[8px] border border-[#f2cb7a] bg-[#141828] px-3 py-2 text-[13px] text-white outline-none"
        >
          <option value="">Select PIC</option>
          {(pics || []).map((pic) => (
            <option key={pic.uuid} value={pic.uuid}>
              {pic.full_name || pic.username || pic.uuid}
            </option>
          ))}
        </select>
        {error ? <p className="mt-2 text-[12px] text-[#fb3748]">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-[8px] border border-[#d00416] px-5 py-2 text-[12px] font-medium text-[#d00416]">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(picUuid)}
            disabled={saving || !picUuid}
            className="rounded-[8px] border border-[#f2cb7a] px-5 py-2 text-[12px] font-medium text-[#141828] disabled:opacity-50"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            {saving ? "Saving..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Cream popup rendered through a portal so it escapes the table's
// `overflow-hidden` / `overflow-x-auto` ancestors. Positioned with
// `position: fixed` from the anchor button's bounding rect, with a small
// triangular notch pointing up at the button. Backdrop swallows outside
// clicks to dismiss.
function StatusMenu({ anchorRef, status, onSelect, onClose }) {
  const MENU_WIDTH = 180;
  const GAP = 12;
  const [coords, setCoords] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Right-align the menu under the button: button's right edge becomes
      // the menu's right edge, then clamp to viewport with an 8px margin.
      const desiredRight = window.innerWidth - rect.right;
      const right = Math.max(8, desiredRight);
      const top = rect.bottom + GAP;
      // Notch sits below the button's horizontal center, measured from the
      // menu's right edge.
      const buttonCenterX = rect.left + rect.width / 2;
      const menuRightX = window.innerWidth - right;
      const notchRight = Math.max(10, menuRightX - buttonCenterX - 6);
      setCoords({ top, right, notchRight });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  if (!mounted || !coords) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        role="menu"
        className="fixed z-[61] rounded-[16px] bg-[#fbeed2] shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        style={{ top: coords.top, right: coords.right, width: MENU_WIDTH }}
      >
        <span
          aria-hidden="true"
          className="absolute -top-[6px] h-3 w-3 rotate-45 bg-[#fbeed2]"
          style={{ right: coords.notchRight }}
        />
        <ul className="relative flex flex-col py-1">
          {STATUS_OPTIONS.map((opt, idx) => {
            const active = opt === status;
            return (
              <li key={opt}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onSelect(opt)}
                  className={`block w-full px-5 py-3 text-left text-[14px] font-semibold leading-[21px] transition ${
                    active
                      ? "text-[#eaad2c]"
                      : "text-[#141828] hover:bg-[#141828]/5"
                  } ${idx < STATUS_OPTIONS.length - 1 ? "border-b border-[#141828]/10" : ""}`}
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>,
    document.body,
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

function ThreeDotsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="#141828"
      aria-hidden="true"
    >
      <circle cx="3" cy="8" r="1.6" />
      <circle cx="8" cy="8" r="1.6" />
      <circle cx="13" cy="8" r="1.6" />
    </svg>
  );
}

function DataCell({ value, minW, nowrap = false }) {
  return (
    <Cell minW={minW}>
      <span className={`min-w-0 text-[12px] font-medium text-white leading-[18px] ${nowrap ? "whitespace-nowrap" : "break-words"}`}>
        {value ?? "—"}
      </span>
    </Cell>
  );
}

function Cell({ children, minW, align = "start", sticky = false }) {
  const justify = align === "end" ? "justify-end" : "justify-start";
  // Sticky cells need an opaque background (the section's #041502) so the
  // columns scrolling beneath don't show through, plus a soft left shadow to
  // read as a pinned edge. border-t re-draws the row separator the opaque
  // background would otherwise cover (rows overlap 1px via -mb-px).
  const pinned = sticky
    ? " sticky right-0 z-[1] border-t border-white/5 bg-[#041502] shadow-[-12px_0_12px_-8px_rgba(0,0,0,0.55)]"
    : "";
  return (
    <div className={`flex min-w-0 flex-1 items-center overflow-hidden p-6 ${justify}${pinned}`} style={{ minWidth: minW }}>
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

