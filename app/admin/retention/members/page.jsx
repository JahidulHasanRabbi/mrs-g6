"use client";

import { useMemo, useState } from "react";

const A = "/assets/admin/pic-dashboard";

const GRAD_DARK = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const VIP_OPTIONS = ["VIP 1", "VIP 2", "VIP 3", "VIP 4", "VIP 5"];
const PIC_OPTIONS = ["Sarah", "John", "Michael", "Emma", "Linda"];

const ROWS = [
  { name: "Ah Chong",     phone: "+64164293333", vip: "VIP 2", sales: "RM 3,770", winloss: "RM 400",  priority: "High",   pic: "Sarah" },
  { name: "Lily Tran",    phone: "+64167891234", vip: "VIP 1", sales: "RM 3,770", winloss: "RM 250",  priority: "Low",    pic: "John" },
  { name: "Sophia Lee",   phone: "+64168901234", vip: "VIP 4", sales: "RM 3,770", winloss: "RM 300",  priority: "Medium", pic: "Michael" },
  { name: "Marcus Henry", phone: "+64164293333", vip: "VIP 2", sales: "RM 3,770", winloss: "RM 400",  priority: "High",   pic: "Sarah" },
  { name: "Aiden Smith",  phone: "+64161234567", vip: "VIP 3", sales: "RM 5,500", winloss: "RM 550",  priority: "Medium", pic: "Emma" },
  { name: "Daniel Kim",   phone: "+64163456789", vip: "VIP 5", sales: "RM 7,000", winloss: "RM 700",  priority: "High",   pic: "Linda" },
  { name: "Daniel Kim",   phone: "+64163456789", vip: "VIP 5", sales: "RM 7,000", winloss: "RM 700",  priority: "High",   pic: "Linda" },
];

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
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/40">
                No members found.
              </div>
            ) : (
              filtered.map((row, idx) => <TableRow key={`${row.name}-${idx}`} row={row} />)
            )}
          </div>
        </div>
      </div>

      <PaginationBar shown={filtered.length} total={150} page={page} onPageChange={setPage} />
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
        <button
          type="button"
          className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2 transition hover:brightness-110"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <img src={`${A}/eye.svg`} alt="" className="h-4 w-4" />
          <span className="text-[12px] font-medium text-[#eaad2c] leading-[18px]">View</span>
        </button>
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

function PaginationBar({ shown, total, page, onPageChange }) {
  const totalPages = 7;
  const visible = [1, 2, 3];

  return (
    <div className="flex h-[44px] w-full items-center justify-between gap-3 flex-wrap px-6 py-3">
      <span className="text-[8px] text-white leading-[12px]">
        Showing 1 to {shown} of {total} Results
      </span>
      <div className="flex items-center gap-[5.5px]">
        <PageButton onClick={() => onPageChange(Math.max(1, page - 1))} ariaLabel="Previous page">
          <PageChevron direction="left" />
        </PageButton>
        {visible.map((p) => (
          <PageNumber key={p} value={p} active={p === page} onClick={() => onPageChange(p)} />
        ))}
        <span className="text-[8px] text-white leading-[12px]">....</span>
        <PageNumber value={totalPages} active={totalPages === page} onClick={() => onPageChange(totalPages)} />
        <PageButton onClick={() => onPageChange(Math.min(totalPages, page + 1))} ariaLabel="Next page">
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
        active ? "bg-[#eaad2c]" : "border border-[#eaad2c]"
      }`}
    >
      {value}
    </button>
  );
}

function PageButton({ children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#eaad2c]"
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
