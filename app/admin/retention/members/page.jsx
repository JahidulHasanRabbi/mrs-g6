"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCrmMembers, getCrmUsers, getCrmVipTiers } from "../../../api/crmApi";
import { Pagination } from "../../../components/admin/members/DataTable";
import PriorityBadge from "../../../components/admin/retention/PriorityBadge";

const A = "/assets/admin/pic-dashboard";

const GRAD_DARK = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";
const PAGE_SIZE = 7;

const PRIORITY_OPTIONS = ["High", "Medium", "Low", "Inactive"];

const COLUMNS = [
  { key: "name",     label: "Username",       minW: 180 },
  { key: "phone",    label: "Phone Number",   minW: 140 },
  { key: "vip",      label: "VIP Level",      minW: 100 },
  { key: "sales",    label: "Daily Sales",    minW: 120 },
  { key: "winloss",  label: "Daily Win/Loss", minW: 130 },
  { key: "priority", label: "Priority",       minW: 100 },
  { key: "pic",      label: "Retention",      minW: 110 },
  { key: "action",   label: "Action",         minW: 110, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function RetentionMembersPage() {
  const [priority, setPriority] = useState("");
  const [vip, setVip] = useState("");
  const [pic, setPic] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [pics, setPics] = useState([]);
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
  }, []);

  // Reset to page 1 when any filter changes.
  useEffect(() => {
    setPage(1);
  }, [priority, vip, pic, query]);

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
        const res = await getCrmMembers({
          page,
          page_size: PAGE_SIZE,
          priority: priority ? priority.toLowerCase() : undefined,
          mrs_vip_level: vip || undefined,
          retention: retentionUser?.id ?? retentionUser?.uuid ?? undefined,
          search: debouncedQuery || undefined,
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
  }, [page, priority, vip, pic, pics, debouncedQuery]);

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
      <header className="flex flex-col gap-4 p-6 w-full md:flex-row md:flex-wrap md:items-center">
        <h1
          className="text-white font-bold whitespace-nowrap md:flex-1 md:min-w-0"
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
          <FilterDropdown label="Priority" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} />
          <FilterDropdown label="VIP Level" value={vip} onChange={setVip} options={vipTiers.map((t) => t.name)} />
          <FilterDropdown label="All PIC" value={pic} onChange={setPic} options={pics.map((u) => u.full_name || u.username).filter(Boolean)} />
          <SearchInput value={query} onChange={setQuery} />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              <TableSkeleton rows={PAGE_SIZE} />
            ) : rows.length === 0 ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/40">
                No members found.
              </div>
            ) : (
              rows.map((row, idx) => <TableRow key={`${row.uuid || row.username || "member"}-${idx}`} row={row} />)
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
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar />
          <span className="min-w-0 break-words text-[12px] font-medium text-white leading-[18px]">
            {name}
          </span>
        </div>
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

