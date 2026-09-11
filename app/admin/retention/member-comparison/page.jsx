"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getCrmUsers, getCrmVipTiers, getMemberComparison } from "../../../api/crmApi";
import LoadingOverlay from "../../../components/admin/ui/LoadingOverlay";
import Pagination from "../../../components/admin/retention/Pagination";
import { usePhoneVisibility } from "../../../components/admin/retention/phoneVisibility";

// Member Monthly Comparison — retention team's ranked list of previous
// month's top-value members, alongside how each member's current month is
// tracking so far. Same visual language as the sibling Member List / Member
// Follow Up List pages (gold-on-dark retention shell, same table primitives).
//
// The backend (`GET /crm-members/member-comparison/?month=YYYY-MM`) already
// returns rows sorted by last month's deposit descending — Rank is just the
// row's position in that order, no separate ranking field needed. Defaulting
// the month filter to the current calendar month means "last month" rolls
// forward automatically at midnight on the 1st, satisfying the "auto
// generate previous month's Top Sales" requirement with no scheduling logic.

const PAGE_SIZE = 10;
const GRAD_DARK = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";
const BRAND_OPTIONS = ["KG", "LV", "EP", "AB", "UB", "N1"];

const COLUMNS = [
  { key: "rank",         label: "Rank",                   minW: 80 },
  { key: "name",         label: "Username",                minW: 190 },
  { key: "brand",        label: "Brand",                   minW: 100 },
  { key: "phone",        label: "Phone Number",            minW: 150 },
  { key: "vip",          label: "VIP Level",                minW: 110 },
  { key: "last_active",  label: "Last Active",             minW: 130 },
  { key: "prev_sales",   label: "Previous Month Sales",    minW: 160 },
  { key: "prev_wl",      label: "Previous Month W/L",      minW: 160 },
  { key: "cur_sales",    label: "Current Month Sales",     minW: 160 },
  { key: "cur_wl",       label: "Current Month W/L",       minW: 160 },
  { key: "followed_by",  label: "Last Followed Up By",     minW: 150 },
  { key: "followed_at",  label: "Last Followed Up Date",   minW: 160 },
  { key: "follow_stat",  label: "Follow Up Status",        minW: 150 },
  { key: "action",       label: "Action",                  minW: 110, align: "end", sticky: true },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

function currentMonthInput() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0.00";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(raw) {
  if (!raw) return "—";
  const text = String(raw).replace("T", " ");
  const [d = "", t = ""] = text.split(" ");
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return String(raw);
  if (!t) return `${pad(day)}/${pad(m)}/${y}`;
  const [hourRaw = "0", minuteRaw = "00"] = t.split(":");
  const hour24 = Number(hourRaw);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${pad(day)}/${pad(m)}/${y}, ${pad(hour12)}:${pad(minuteRaw)} ${ampm}`;
}

// Follow Up Status for this endpoint uses its own vocabulary
// ("FOLLOWED_UP" | "NOT_FOLLOWED_UP" | "N/A") — different from the
// Completed/Pending/Missed used by the daily follow-up lists, so it gets its
// own small badge rather than reusing FollowUpStatusBadge.
const FOLLOW_STATUS_META = {
  FOLLOWED_UP: { label: "Followed Up", bg: "#003920", color: "#84ebb4" },
  NOT_FOLLOWED_UP: { label: "Not Followed Up", bg: "#3d2e00", color: "#eaad2c" },
  "N/A": { label: "N/A", bg: "#232323", color: "#9aa0ab" },
};

function FollowUpStatusBadge({ status }) {
  const meta = FOLLOW_STATUS_META[status] || FOLLOW_STATUS_META["N/A"];
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2.5 py-1 text-[12px] font-semibold leading-[18px] whitespace-nowrap"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

export default function MemberComparisonPage() {
  const { displayPhoneNumber } = usePhoneVisibility();

  const [month, setMonth] = useState(currentMonthInput);
  const [brand, setBrand] = useState("");
  const [vip, setVip] = useState("");
  const [pic, setPic] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [pics, setPics] = useState([]);
  const [vipTiers, setVipTiers] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCrmUsers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setPics(results);
      })
      .catch(() => setPics([]));
    getCrmVipTiers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setVipTiers(results.map((t) => t.name || t.tier_name || t.level || t.uuid).filter(Boolean));
      })
      .catch(() => setVipTiers([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [month, brand, vip, pic, query]);

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
        const res = await getMemberComparison({
          month: month || undefined,
          brand: brand || undefined,
          vip_level: vip || undefined,
          pic: pic || undefined,
          search: debouncedQuery || undefined,
          page,
          page_size: PAGE_SIZE,
        });
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setRows(results);
        setTotal(Number.isFinite(res?.count) ? res.count : results.length);
      } catch (err) {
        if (cancelled) return;
        console.error("[member-comparison] fetch failed", err);
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
  }, [month, brand, vip, pic, debouncedQuery, page]);

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1
            className="text-white font-bold shrink-0"
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "26px",
              lineHeight: "39px",
              letterSpacing: "-2px",
            }}
          >
            Member Monthly Comparison
          </h1>
          <MonthPicker value={month} onChange={setMonth} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown label="Brand" value={brand} onChange={setBrand} options={BRAND_OPTIONS} />
          <FilterDropdown label="VIP Level" value={vip} onChange={setVip} options={vipTiers} />
          <FilterDropdown label="All PIC" value={pic} onChange={setPic} options={pics.map((u) => u.full_name || u.username).filter(Boolean)} />
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
              <div className="px-6 py-12 text-center text-[12px] text-white/40">
                No members found.
              </div>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={row.uuid || `${row.username}-${idx}`}
                  row={row}
                  rank={startIdx + idx + 1}
                  displayPhoneNumber={displayPhoneNumber}
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

function FilterDropdown({ label, value, onChange, options }) {
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

// Single month filter — mirrors the DayPicker used on Member Alert, but
// type="month" since this endpoint ranks by calendar month, not a day.
function MonthPicker({ value, onChange }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  };

  const formatted = value
    ? new Date(`${value}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "";

  return (
    <div
      className="relative flex items-center gap-2 rounded-[8px] border border-[#f2cb7a] px-3 py-2 cursor-pointer"
      style={{ backgroundImage: GRAD_DARK }}
      onClick={openPicker}
    >
      <span className="pointer-events-none whitespace-nowrap text-[12px] font-medium text-[#f6dda6]">
        {formatted || "Select month"}
      </span>
      <input
        ref={inputRef}
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by month"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
      />
    </div>
  );
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

function TableRow({ row, rank, displayPhoneNumber }) {
  const href = `/admin/retention/members/${row.uuid}`;
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <DataCell value={rank} minW={COLUMNS[0].minW} nowrap />
      <Cell minW={COLUMNS[1].minW}>
        <Link href={href} className="flex min-w-0 items-center gap-3 hover:opacity-80">
          <UserAvatar />
          <span className="min-w-0 break-words text-[12px] font-medium text-white leading-[18px]">
            {row.username || "—"}
          </span>
        </Link>
      </Cell>
      <DataCell value={row.brand} minW={COLUMNS[2].minW} />
      <DataCell value={displayPhoneNumber(row)} minW={COLUMNS[3].minW} nowrap />
      <DataCell value={row.vip_level} minW={COLUMNS[4].minW} />
      <DataCell value={formatDate(row.last_active)} minW={COLUMNS[5].minW} nowrap />
      <DataCell value={formatCurrency(row.last_month_deposit)} minW={COLUMNS[6].minW} nowrap />
      <DataCell value={formatCurrency(row.last_month_win_loss)} minW={COLUMNS[7].minW} nowrap />
      <DataCell value={formatCurrency(row.this_month_deposit)} minW={COLUMNS[8].minW} nowrap />
      <DataCell value={formatCurrency(row.this_month_win_loss)} minW={COLUMNS[9].minW} nowrap />
      <DataCell value={row.last_followed_up_by} minW={COLUMNS[10].minW} />
      <DataCell value={formatDate(row.last_followed_up_date)} minW={COLUMNS[11].minW} nowrap />
      <Cell minW={COLUMNS[12].minW}>
        <FollowUpStatusBadge status={row.follow_up_status} />
      </Cell>
      <Cell minW={COLUMNS[13].minW} align="end" sticky>
        <Link
          href={href}
          className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2 transition hover:brightness-110"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <EyeIcon />
          <span className="text-[12px] font-medium text-[#eaad2c] leading-[18px]">View</span>
        </Link>
      </Cell>
    </div>
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
      <div className="flex items-center p-6" style={{ minWidth: COLUMNS[0].minW }}>
        <SkeletonBar width="40%" />
      </div>
      <div className="flex items-center gap-3 p-6" style={{ minWidth: COLUMNS[1].minW }}>
        <SkeletonCircle />
        <SkeletonBar width="70%" />
      </div>
      {COLUMNS.slice(2, -1).map((col) => (
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
