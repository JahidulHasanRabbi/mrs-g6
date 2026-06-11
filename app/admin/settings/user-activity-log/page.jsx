"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import DateRangePicker from "../../../components/admin/retention/DateRangePicker";
import Pagination from "../../../components/admin/retention/Pagination";
import { getCrmActivityLog, getCrmUsers } from "../../../api/crmApi";

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

async function fetchAllPages(fetcher, params = {}) {
  const rows = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const res = await fetcher({ ...params, page, page_size: 100 });
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
    date: validDate ? date.toLocaleDateString("en-GB", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "—",
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pic, setPic] = useState("");
  const [picOptions, setPicOptions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getCrmUsers({ page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setPicOptions(results.map((u) => u.username || u.full_name).filter(Boolean).sort());
      })
      .catch(() => {
        if (!cancelled) setPicOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const username = pic || debouncedSearch || undefined;
      const raw = await fetchAllPages(getCrmActivityLog, { username });
      setAllRows(raw.map((row, idx) => mapActivityRow(row, idx + 1)));
    } catch {
      setAllRows([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pic]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const filtered = useMemo(() => {
    return allRows.filter((row) => {
      if (search) {
        const q = search.toLowerCase();
        if (!row.user.toLowerCase().includes(q)) return false;
      }
      if (fromDate && row.rawDate && row.rawDate < fromDate) return false;
      if (toDate && row.rawDate && row.rawDate > toDate) return false;
      if ((fromDate || toDate) && !row.rawDate) return false;
      return true;
    });
  }, [allRows, search, fromDate, toDate]);

  useEffect(() => { setPage(1); }, [search, pic, fromDate, toDate]);

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
          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onApply={(from, to) => {
              setFromDate(from || "");
              setToDate(to || "");
            }}
          />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
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

      <Pagination
        from={showingFrom}
        to={showingTo}
        total={filtered.length}
        currentPage={safePage}
        pageCount={totalPages}
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

function SkeletonRow() {
  return (
    <div className="flex w-full items-stretch border-b border-white/5">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex items-center p-6 ${col.flex ? "flex-1 min-w-0" : "shrink-0"}`}
          style={{ minWidth: col.minW, width: col.flex ? undefined : col.minW }}
        >
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
