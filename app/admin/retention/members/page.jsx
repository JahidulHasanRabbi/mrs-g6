"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCrmMembers, getCrmUsers, getCrmVipTiers } from "../../../api/crmApi";
import { getWalletVipTiers } from "../../../api/adminApi";
import { Pagination } from "../../../components/admin/members/DataTable";
import PriorityBadge from "../../../components/admin/retention/PriorityBadge";
import LoadingOverlay from "../../../components/admin/ui/LoadingOverlay";

const A = "/assets/admin/pic-dashboard";

const GRAD_DARK = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";
const PAGE_SIZE = 7;

const PRIORITY_OPTIONS = ["High", "Medium", "Low", "Inactive"];
const BRAND_OPTIONS = ["KG", "LV", "EP", "AB", "UB", "N1"];
const SALES_SORT_OPTIONS = ["High to Low", "Low to High"];
const WINLOSS_SORT_OPTIONS = ["High to Low", "Low to High"];

const COLUMNS = [
  { key: "name",        label: "Username",            minW: 180 },
  { key: "brand",       label: "Brand",               minW: 100 },
  { key: "phone",       label: "Phone Number",        minW: 140 },
  { key: "vip",         label: "VIP Level",           minW: 100 },
  { key: "sales",       label: "Daily Sales",         minW: 120 },
  { key: "winloss",     label: "Daily Win/Loss",      minW: 130 },
  { key: "priority",    label: "Priority",            minW: 100 },
  { key: "pic",         label: "Retention",           minW: 110 },
  { key: "followed_by", label: "Last Followed Up By",   minW: 150 },
  { key: "followed_at", label: "Last Followed Up Date", minW: 160 },
  { key: "follow_stat", label: "Follow Up Status",      minW: 150 },
  { key: "action",      label: "Action",              minW: 110, align: "end" },
];

// Follow Up Status (Member List - GET): Completed (done) · Pending (not yet) ·
// Missed (not done and the day has rolled past midnight). Derived from the
// backend `follow_up_status` when present; otherwise inferred from
// last-followed-up. Same logic as the Member Follow Up List.
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

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0.00";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function memberSalesValue(row) {
  return parseFloat(row?.daily_sales ?? 0) || 0;
}

function memberWinLossValue(row) {
  return parseFloat(row?.daily_win_loss ?? row?.daily_win_lose ?? 0) || 0;
}

export default function RetentionMembersPage() {
  return (
    <Suspense>
      <RetentionMembersContent />
    </Suspense>
  );
}

function RetentionMembersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Page lives in the URL — drilling into a member and returning (browser
  // back / clicking the member's name) lands on the same page. Filter
  // changes still reset to page 1 via setPage(1). No local state for page,
  // so nothing can race with the URL.
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const [priority, setPriority] = useState("");
  const [walletLevel, setWalletLevel] = useState("");
  const [vip, setVip] = useState("");
  const [pic, setPic] = useState("");
  const [brand, setBrand] = useState("");
  const [salesSort, setSalesSort] = useState("");
  const [winSort, setWinSort] = useState("");
  const [query, setQuery] = useState("");

  const setPage = (next) => {
    const value = typeof next === "function" ? next(page) : next;
    const params = new URLSearchParams(searchParams.toString());
    if (value > 1) params.set("page", String(value));
    else params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Filter changes must also reset to page 1. Inline this into the onChange
  // handlers — a useEffect-based reset gets double-fired by React Strict Mode
  // in dev and would clobber the URL's page param on mount.
  const resetToPage1 = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const handlePriority = (v) => { setPriority(v); resetToPage1(); };
  const handleWalletLevel = (v) => { setWalletLevel(v); resetToPage1(); };
  const handleVip = (v) => { setVip(v); resetToPage1(); };
  const handlePic = (v) => { setPic(v); resetToPage1(); };
  const handleBrand = (v) => { setBrand(v); resetToPage1(); };
  const handleSalesSort = (v) => { setSalesSort(v); setWinSort(""); resetToPage1(); };
  const handleWinSort = (v) => { setWinSort(v); setSalesSort(""); resetToPage1(); };
  const handleQuery = (v) => { setQuery(v); resetToPage1(); };

  const [pics, setPics] = useState([]);
  const [walletTiers, setWalletTiers] = useState([]);
  const [vipTiers, setVipTiers] = useState([]); // [{ name, level }]
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
        setVipTiers(results.map((t, i) => ({ name: t.name || t.tier_name || t.level || t.uuid, level: i + 1 })).filter((t) => t.name));
      })
      .catch(() => setVipTiers([]));
    getWalletVipTiers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setWalletTiers(results.map((t) => t.name || t.tier_name || t.level || t.uuid).filter(Boolean));
      })
      .catch(() => setWalletTiers([]));
  }, []);

  // Debounce search to avoid hammering the API on every keystroke.
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
        const retentionUser = pic
          ? pics.find((u) => (u.full_name || u.username) === pic)
          : undefined;
        const sales = salesSort ? (salesSort === "High to Low" ? "High" : "Low") : undefined;
        const win_lose = winSort ? (winSort === "High to Low" ? "High" : "Low") : undefined;
        const res = await getCrmMembers({
          page,
          page_size: PAGE_SIZE,
          priority: priority ? priority.toLowerCase() : undefined,
          wallet_vip_level: walletLevel || undefined,
          mrs_vip_level: vip || undefined,
          retention: retentionUser?.id ?? retentionUser?.uuid ?? undefined,
          brand: brand || undefined,
          search: debouncedQuery || undefined,
          sales,
          win_lose,
        });
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setRows(results);
        setTotal(Number.isFinite(res?.count) ? res.count : results.length);
      } catch (err) {
        if (cancelled) return;
        console.error("[retention-members] fetch failed", err);
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
  }, [page, priority, walletLevel, vip, pic, brand, salesSort, winSort, pics, debouncedQuery]);

  // Client-side fallback sort for the visible page; backend filters/sorts
  // across the full result set.
  const sortedRows = useMemo(() => {
    if (salesSort) {
      const dir = salesSort === "High to Low" ? -1 : 1;
      return [...rows].sort((a, b) => (memberSalesValue(a) - memberSalesValue(b)) * dir);
    }
    if (winSort) {
      const dir = winSort === "High to Low" ? -1 : 1;
      return [...rows].sort((a, b) => (memberWinLossValue(a) - memberWinLossValue(b)) * dir);
    }
    return rows;
  }, [rows, salesSort, winSort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  // Clamp page to range, but only AFTER a fetch has completed — otherwise
  // the initial render (total=0 → totalPages=1) would clobber a URL like
  // `?page=4` before the data arrives, dropping the user back to page 1.
  useEffect(() => {
    if (loading) return;
    if (total === 0) return;
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, total, totalPages]);

  return (
    <section className="relative flex w-full flex-col rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-col gap-4 p-6 w-full xl:flex-row xl:flex-wrap xl:items-center">
        <h1
          className="text-white font-bold xl:flex-1 xl:min-w-0"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Member List
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown label="Priority" value={priority} onChange={handlePriority} options={PRIORITY_OPTIONS} />
          <FilterDropdown label="Wallet Level" value={walletLevel} onChange={handleWalletLevel} options={walletTiers} />
          <FilterDropdown label="MRS Level" value={vip} onChange={handleVip} options={vipTiers.map((t) => t.name)} />
          <FilterDropdown label="Sales (H-L)" value={salesSort} onChange={handleSalesSort} options={SALES_SORT_OPTIONS} />
          <FilterDropdown label="Win/Lose (H-L)" value={winSort} onChange={handleWinSort} options={WINLOSS_SORT_OPTIONS} />
          <FilterDropdown label="Brand" value={brand} onChange={handleBrand} options={BRAND_OPTIONS} />
          <FilterDropdown label="All PIC" value={pic} onChange={handlePic} options={pics.map((u) => u.full_name || u.username).filter(Boolean)} />
          <SearchInput value={query} onChange={handleQuery} />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              <TableSkeleton rows={PAGE_SIZE} />
            ) : sortedRows.length === 0 ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/40">
                No members found.
              </div>
            ) : (
              sortedRows.map((row, idx) => <TableRow key={`${row.uuid || row.username || "member"}-${idx}`} row={row} />)
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-2 pt-4 text-[13px] text-white/70">
            Showing {showingFrom} to {showingTo} of {total} Results
          </span>
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
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
        <ChevronUp open={open} />
      </button>
      {open && (
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
      )}
    </div>
  );
}

function ChevronUp({ open }) {
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
      style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}
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
          className={`flex flex-1 flex-col px-6 py-4 ${col.align === "end" ? "items-end" : "items-start"}`}
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
  const href = `/admin/retention/members/${row.uuid}`;
  const name = row.full_name || row.username || "—";
  const alerted = Boolean(row.alert);
  return (
    <div
      className={`flex w-full items-stretch -mb-px border-b ${
        alerted ? "border-[#fb3748]/35 bg-[#fb3748]/5 ring-1 ring-inset ring-[#fb3748]/45" : "border-white/5"
      }`}
    >
      <Cell minW={COLUMNS[0].minW}>
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar alerted={alerted} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className={`min-w-0 break-words text-[12px] font-medium leading-[18px] ${alerted ? "text-[#fb6f7d]" : "text-white"}`}>
              {name}
            </span>
            {alerted ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-[10px] border border-[#fb3748] bg-[#fb3748]/15 px-2 py-0.5 text-[10px] font-semibold leading-[15px] text-[#fb6f7d]">
                <span aria-hidden="true" className="text-[9px] leading-none">!</span>
                Alerted
              </span>
            ) : null}
          </div>
        </div>
      </Cell>
      <DataCell value={row.brand} minW={COLUMNS[1].minW} />
      <DataCell value={row.phone_number} minW={COLUMNS[2].minW} />
      <DataCell value={row.vip_level} minW={COLUMNS[3].minW} />
      <DataCell value={formatCurrency(row.daily_sales)} minW={COLUMNS[4].minW} />
      <DataCell value={formatCurrency(row.daily_win_loss)} minW={COLUMNS[5].minW} />
      <Cell minW={COLUMNS[6].minW}>
        <PriorityBadge value={row.priority} />
      </Cell>
      <DataCell value={row.retention} minW={COLUMNS[7].minW} />
      <DataCell value={followedUpBy(row)} minW={COLUMNS[8].minW} />
      <DataCell value={followedUpDate(row)} minW={COLUMNS[9].minW} />
      <Cell minW={COLUMNS[10].minW}>
        <FollowUpStatusBadge row={row} />
      </Cell>
      <Cell minW={COLUMNS[11].minW} align="end">
        <Link
          href={href}
          className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2 transition hover:brightness-110"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <img src={`${A}/eye.svg`} alt="" className="h-4 w-4" />
          <span className="text-[12px] font-medium text-[#eaad2c] leading-[18px]">View</span>
        </Link>
      </Cell>
    </div>
  );
}

function TableSkeleton({ rows = 7 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <div key={`member-skeleton-${rowIndex}`} className="flex w-full items-stretch -mb-px border-b border-white/5">
      {COLUMNS.map((col, colIndex) => (
        <Cell key={col.key} minW={col.minW} align={col.align === "end" ? "end" : "start"}>
          {col.key === "name" ? (
            <div className="flex w-full min-w-0 items-center gap-3">
              <SkeletonCircle />
              <SkeletonBar width={skeletonWidth(rowIndex, colIndex, ["68%", "82%", "74%"])} />
            </div>
          ) : col.key === "priority" ? (
            <SkeletonPill />
          ) : col.key === "action" ? (
            <SkeletonButton />
          ) : (
            <SkeletonBar width={skeletonWidth(rowIndex, colIndex)} />
          )}
        </Cell>
      ))}
    </div>
  ));
}

function skeletonWidth(row, col, widths = ["48%", "62%", "72%", "56%", "66%"]) {
  return widths[(row * 3 + col * 2) % widths.length];
}

function SkeletonBar({ width }) {
  return (
    <span
      className="block h-3 min-w-0 rounded bg-white/[0.07] before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.1] before:to-transparent relative overflow-hidden"
      style={{ width }}
    />
  );
}

function SkeletonCircle() {
  return (
    <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/[0.07] before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.1] before:to-transparent" />
  );
}

function SkeletonPill() {
  return (
    <span className="relative block h-6 w-20 overflow-hidden rounded-full bg-white/[0.07] before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.1] before:to-transparent" />
  );
}

function SkeletonButton() {
  return (
    <span className="relative block h-9 w-[78px] overflow-hidden rounded-[8px] bg-[#e9af41]/20 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#e9af41]/30 before:to-transparent" />
  );
}

function DataCell({ value, minW }) {
  return (
    <Cell minW={minW}>
      <span className="min-w-0 break-words text-[12px] font-medium text-white leading-[18px]">
        {value ?? "—"}
      </span>
    </Cell>
  );
}

function Cell({ children, minW, align = "start" }) {
  const justify = align === "end" ? "justify-end" : "justify-start";
  return (
    <div
      className={`flex min-w-0 flex-1 items-center overflow-hidden p-6 ${justify}`}
      style={{ minWidth: minW }}
    >
      {children}
    </div>
  );
}

function UserAvatar({ alerted = false }) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${alerted ? "ring-1 ring-[#fb3748]" : ""}`}
      style={{ background: alerted ? "rgba(251,55,72,0.15)" : "#3a4255" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={alerted ? "#fb6f7d" : "#f6dda6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

