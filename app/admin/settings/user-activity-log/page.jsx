"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import { getCrmActivityLog } from "../../../api/crmApi";

const PAGE_SIZE = 7;

const COLUMNS = [
  { key: "id",       label: "#",        minW: 70,  flex: false },
  { key: "date",     label: "Date",     minW: 130, flex: true  },
  { key: "time",     label: "Time",     minW: 130, flex: true  },
  { key: "user",     label: "User",     minW: 180, flex: true  },
  { key: "activity", label: "Activity", minW: 360, flex: false, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

export default function UserActivityLogPage() {
  return (
    <>
      <PageHeader />
      <ActivityListSection />
    </>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">
          ADMIN DASHBOARD
        </span>
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
          Activity Log
        </h1>
      </div>
    </div>
  );
}

async function fetchAllPages(fetcher) {
  const rows = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const res = await fetcher({ page, page_size: 100 });
    const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
    rows.push(...results);
    hasNext = Boolean(res?.next) && results.length > 0;
    page += 1;
  }
  return rows;
}

function mapActivityRow(row, id) {
  const date = row.datetime ? new Date(row.datetime) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  return {
    id,
    uuid: row.uuid,
    rawDate: validDate ? date.toISOString().split("T")[0] : null,
    date: validDate ? date.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "—",
    time: validDate ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
    user: row.user || "—",
    activity: row.activity || "—",
  };
}

function ActivityListSection() {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [pic, setPic] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const raw = await fetchAllPages(getCrmActivityLog);
      setAllRows(raw.map((row, idx) => mapActivityRow(row, idx + 1)));
    } catch {
      setAllRows([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const picOptions = useMemo(
    () => [...new Set(allRows.map((r) => r.user).filter((u) => u && u !== "—"))].sort(),
    [allRows]
  );

  const filtered = useMemo(() => {
    return allRows.filter((row) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !row.user.toLowerCase().includes(q) &&
          !row.activity.toLowerCase().includes(q)
        ) return false;
      }
      if (pic && row.user !== pic) return false;
      if (date && row.rawDate !== date) return false;
      return true;
    });
  }, [allRows, search, pic, date]);

  useEffect(() => { setPage(1); }, [search, pic, date]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + visibleRows.length, filtered.length);

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
          Activity List
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Enter Username"
          />
          <FilterDropdown
            label="Select PIC"
            value={pic}
            onChange={setPic}
            options={picOptions}
          />
          <DateFilter value={date} onChange={setDate} />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/40">Loading...</div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-[12px] text-red-400">Failed to load activity log.</div>
            ) : visibleRows.length === 0 ? (
              <EmptyRow />
            ) : (
              visibleRows.map((row) => <ActivityRow key={row.uuid || row.id} row={row} />)
            )}
          </div>
        </div>
      </div>

      <PaginationBar
        from={showingFrom}
        to={showingTo}
        total={filtered.length}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </section>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-[160px] bg-[#141828] border border-[#f2cb7a] rounded-[8px] px-3 py-2 text-[10px] italic text-[#f6dda6] placeholder:text-[#f6dda6] focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
      style={{ fontFamily: "Inter, sans-serif", lineHeight: "15px" }}
    />
  );
}

function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2"
        style={{ backgroundImage: GRAD_DARK }}
      >
        <span className="text-[12px] font-medium text-[#f6dda6] leading-[18px] whitespace-nowrap">
          {value || label}
        </span>
        <ChevronIcon up={open} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 min-w-full max-h-48 overflow-y-auto rounded-[8px] border border-[#f2cb7a] overflow-hidden"
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

function DateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2"
        style={{ backgroundImage: GRAD_DARK }}
      >
        <CalendarIcon />
        <span className="text-[12px] font-medium text-[#f6dda6] leading-[18px] whitespace-nowrap">
          {value || "Select Date"}
        </span>
        <ChevronIcon up={open} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 rounded-[8px] border border-[#f2cb7a] p-3"
            style={{ backgroundImage: GRAD_DARK }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="date"
              value={value}
              onChange={(e) => { onChange(e.target.value); setOpen(false); }}
              className="rounded-[6px] border border-[#fbeed2] bg-transparent px-3 py-2 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
              style={{ colorScheme: "dark" }}
            />
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="mt-2 block w-full text-center text-[11px] text-[#f6dda6] hover:text-white"
              >
                Clear date
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex flex-col px-6 py-4 ${col.flex ? "flex-1 min-w-0" : "shrink-0"} ${
            col.align === "end" ? "items-end" : "items-start"
          }`}
          style={{ minWidth: col.minW, width: col.flex ? undefined : col.minW }}
        >
          <p className="text-[14px] font-semibold text-[#fbeed2] leading-[21px] whitespace-nowrap" style={{ letterSpacing: "-1px" }}>
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ActivityRow({ row }) {
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell col={COLUMNS[0]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.id}</span>
      </Cell>
      <Cell col={COLUMNS[1]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.date}</span>
      </Cell>
      <Cell col={COLUMNS[2]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.time}</span>
      </Cell>
      <Cell col={COLUMNS[3]}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar />
          <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.user}</span>
        </div>
      </Cell>
      <Cell col={COLUMNS[4]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.activity}</span>
      </Cell>
    </div>
  );
}

function Cell({ col, children }) {
  const justify = col.align === "end" ? "justify-end" : "justify-start";
  return (
    <div
      className={`flex items-center p-6 ${col.flex ? "flex-1 min-w-0" : "shrink-0"} ${justify}`}
      style={{ minWidth: col.minW, width: col.flex ? undefined : col.minW }}
    >
      {children}
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3a4255]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function EmptyRow() {
  return <div className="px-6 py-12 text-center text-[12px] text-white/40">No activity found.</div>;
}

function ChevronIcon({ up }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: up ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
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
        <PageButton onClick={() => onPageChange(Math.max(1, page - 1))} disabled={prevDisabled} ariaLabel="Previous page">
          <PageChevron direction="left" />
        </PageButton>
        {items.map((item) =>
          typeof item === "number" ? (
            <PageNumber key={item} value={item} active={item === page} onClick={() => onPageChange(item)} />
          ) : (
            <span key={item} className="text-[8px] text-white leading-[12px]">....</span>
          )
        )}
        <PageButton onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={nextDisabled} ariaLabel="Next page">
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
