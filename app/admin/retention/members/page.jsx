"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCrmMembers } from "../../../api/crmApi";

const A = "/assets/admin/pic-dashboard";

const GRAD_DARK = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";
const PAGE_SIZE = 7;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const VIP_OPTIONS = ["VIP 1", "VIP 2", "VIP 3", "VIP 4", "VIP 5"];
const PIC_OPTIONS = ["Sarah", "John", "Michael", "Emma", "Linda"];

// UI label → API integer.
const PRIORITY_TO_INT = { High: 1, Medium: 2, Low: 3 };
const VIP_TO_INT = (label) => {
  const n = parseInt(String(label).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : "";
};

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

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

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
        const res = await getCrmMembers({
          page,
          page_size: PAGE_SIZE,
          priority: priority ? PRIORITY_TO_INT[priority] : undefined,
          vip_level: vip ? VIP_TO_INT(vip) : undefined,
          // `retention` is an int the backend expects (likely a PIC id). The
          // current filter only knows names; leave unsent until we expose a
          // PIC list endpoint.
          retention: undefined,
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
  }, [page, priority, vip, pic, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
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
          <FilterDropdown label="VIP Level" value={vip} onChange={setVip} options={VIP_OPTIONS} />
          <FilterDropdown label="All PIC" value={pic} onChange={setPic} options={PIC_OPTIONS} />
          <SearchInput value={query} onChange={setQuery} />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/60">Loading...</div>
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

      <PaginationBar
        from={showingFrom}
        to={showingTo}
        total={total}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
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
        <div className="flex items-center gap-3">
          <UserAvatar />
          <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
            {name}
          </span>
        </div>
      </Cell>
      <Cell minW={COLUMNS[1].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.phone_number ?? "—"}</span>
      </Cell>
      <Cell minW={COLUMNS[2].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.vip_level ?? "—"}</span>
      </Cell>
      <Cell minW={COLUMNS[3].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{formatCurrency(row.daily_sales)}</span>
      </Cell>
      <Cell minW={COLUMNS[4].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{formatCurrency(row.daily_win_loss)}</span>
      </Cell>
      <Cell minW={COLUMNS[5].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.priority ?? "—"}</span>
      </Cell>
      <Cell minW={COLUMNS[6].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.retention ?? "—"}</span>
      </Cell>
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

function Cell({ children, minW, align = "start" }) {
  const justify = align === "end" ? "justify-end" : "justify-start";
  return (
    <div
      className={`flex flex-1 items-center p-6 ${justify}`}
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

// Build the page chip list with ellipsis. When there are 7 or fewer pages we
// just list them all. Otherwise we always show the first and last page, and
// a 1-page window around the current page, inserting ellipsis where there's a
// gap so we never render adjacent numbers like "1, 2" with an ellipsis in
// between.
function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) items.push("ellipsis-l");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis-r");
  items.push(totalPages);
  return items;
}

function PaginationBar({ from, to, total, page, totalPages, onPageChange }) {
  const items = buildPageItems(page, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex min-h-[44px] w-full items-center justify-between gap-3 flex-wrap px-6 py-3">
      <span className="text-[8px] text-white leading-[12px]">
        Showing {from} to {to} of {total} Results
      </span>
      <div className="flex items-center gap-[5.5px]">
        <PageButton
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={prevDisabled}
          ariaLabel="Previous page"
        >
          <PageChevron direction="left" />
        </PageButton>
        {items.map((item) =>
          typeof item === "number" ? (
            <PageNumber
              key={item}
              value={item}
              active={item === page}
              onClick={() => onPageChange(item)}
            />
          ) : (
            <span key={item} className="text-[8px] text-white leading-[12px]">....</span>
          )
        )}
        <PageButton
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={nextDisabled}
          ariaLabel="Next page"
        >
          <PageChevron direction="right" />
        </PageButton>
      </div>
    </div>
  );
}

function PageNumber({ value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] text-[8px] text-white leading-[12px] ${
        active ? "bg-[#eaad2c]" : "border border-[#eaad2c] hover:bg-[#eaad2c]/20"
      }`}
    >
      {value}
    </button>
  );
}

function PageButton({ children, onClick, ariaLabel, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#eaad2c] ${
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[#eaad2c]/20"
      }`}
    >
      {children}
    </button>
  );
}

function PageChevron({ direction }) {
  const rotate = direction === "left" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ transform: rotate }}>
      <path d="M1 1l4 4-4 4" stroke="#eaad2c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
