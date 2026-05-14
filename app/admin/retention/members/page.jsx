"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const A = "/assets/admin/pic-dashboard";

function nameToSlug(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

const GRAD_DARK = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";
const PAGE_SIZE = 7;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const VIP_OPTIONS = ["VIP 1", "VIP 2", "VIP 3", "VIP 4", "VIP 5"];
const PIC_OPTIONS = ["Sarah", "John", "Michael", "Emma", "Linda"];

// Seed rows from the Figma. Cycled below to generate 150 mock entries so the
// pagination has something to paginate over until the real API is wired.
const SEED_ROWS = [
  { name: "Ah Chong",     phone: "+64164293333", vip: "VIP 2", sales: "RM 3,770", winloss: "RM 400",  priority: "High",   pic: "Sarah" },
  { name: "Lily Tran",    phone: "+64167891234", vip: "VIP 1", sales: "RM 3,770", winloss: "RM 250",  priority: "Low",    pic: "John" },
  { name: "Sophia Lee",   phone: "+64168901234", vip: "VIP 4", sales: "RM 3,770", winloss: "RM 300",  priority: "Medium", pic: "Michael" },
  { name: "Marcus Henry", phone: "+64164293333", vip: "VIP 2", sales: "RM 3,770", winloss: "RM 400",  priority: "High",   pic: "Sarah" },
  { name: "Aiden Smith",  phone: "+64161234567", vip: "VIP 3", sales: "RM 5,500", winloss: "RM 550",  priority: "Medium", pic: "Emma" },
  { name: "Daniel Kim",   phone: "+64163456789", vip: "VIP 5", sales: "RM 7,000", winloss: "RM 700",  priority: "High",   pic: "Linda" },
  { name: "Nora Park",    phone: "+64162345678", vip: "VIP 2", sales: "RM 4,200", winloss: "RM 450",  priority: "Medium", pic: "Sarah" },
];

const ROWS = Array.from({ length: 150 }, (_, i) => {
  const seed = SEED_ROWS[i % SEED_ROWS.length];
  return { ...seed, id: i + 1 };
});

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

export default function RetentionMembersPage() {
  const [priority, setPriority] = useState("");
  const [vip, setVip] = useState("");
  const [pic, setPic] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return ROWS.filter((r) => {
      if (priority && r.priority !== priority) return false;
      if (vip && r.vip !== vip) return false;
      if (pic && r.pic !== pic) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.phone.includes(query)) return false;
      }
      return true;
    });
  }, [priority, vip, pic, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [priority, vip, pic, query]);

  // Clamp page when totalPages shrinks below the current page (e.g. heavy
  // filter trims results). Prevents an empty page if the user paged deep
  // before filtering.
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + PAGE_SIZE, filtered.length);

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

      <div className="overflow-x-auto scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {visibleRows.length === 0 ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/40">
                No members found.
              </div>
            ) : (
              visibleRows.map((row) => <TableRow key={row.id} row={row} />)
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
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <div className="flex items-center gap-3">
          <UserAvatar />
          <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
            {row.name}
          </span>
        </div>
      </Cell>
      <Cell minW={COLUMNS[1].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.phone}</span>
      </Cell>
      <Cell minW={COLUMNS[2].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.vip}</span>
      </Cell>
      <Cell minW={COLUMNS[3].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.sales}</span>
      </Cell>
      <Cell minW={COLUMNS[4].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.winloss}</span>
      </Cell>
      <Cell minW={COLUMNS[5].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.priority}</span>
      </Cell>
      <Cell minW={COLUMNS[6].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.pic}</span>
      </Cell>
      <Cell minW={COLUMNS[7].minW} align="end">
        <Link
          href={`/admin/retention/members/${nameToSlug(row.name)}`}
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
