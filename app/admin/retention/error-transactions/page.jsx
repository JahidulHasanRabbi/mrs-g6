"use client";

import { useEffect, useMemo, useState } from "react";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import { getErrorTransactions, deleteErrorTransaction } from "../../../api/crmApi";
import Pagination from "../../../components/admin/retention/Pagination";
import LoadingOverlay from "../../../components/admin/ui/LoadingOverlay";
import ConfirmDialog from "../../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../../components/admin/ui/Toast";

// Error Transaction Management — tsv item 15 / slide 14. Lists failed
// deposit/withdraw/bonus transactions (backend flags them via `is_error`),
// lets Admin review and delete them after checking. Follows the same
// list-page shape as Member Alert / Member List (filter row + table +
// shared Pagination), and reuses ConfirmDialog for the delete confirmation.

const PAGE_SIZE = 10;

const TYPE_OPTIONS = ["Deposit", "Withdraw", "Bonus"];

const COLUMNS = [
  { key: "transaction_id", label: "Transaction ID", minW: 160 },
  { key: "member",         label: "Member",         minW: 200 },
  { key: "type",           label: "Transaction Type", minW: 130 },
  { key: "amount",         label: "Amount",         minW: 120 },
  { key: "date",           label: "Date & Time",    minW: 170 },
  { key: "status",         label: "Status",         minW: 110 },
  { key: "action",         label: "Action",         minW: 100, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0.00";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(raw) {
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

function typeLabel(sourceType) {
  const key = String(sourceType || "").toLowerCase();
  if (key === "deposit") return "Deposit";
  if (key === "withdraw") return "Withdraw";
  if (key === "bonus") return "Bonus";
  return sourceType || "—";
}

export default function ErrorTransactionsPage() {
  const toast = useToast();
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [type, debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setLoading(true);
      try {
        const res = await getErrorTransactions({
          page,
          page_size: PAGE_SIZE,
          source_type: type ? type.toLowerCase() : undefined,
          search: debouncedQuery || undefined,
        });
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setRows(results);
        setTotal(Number.isFinite(res?.count) ? res.count : results.length);
      } catch (err) {
        if (cancelled) return;
        console.error("[error-transactions] fetch failed", err);
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
  }, [page, type, debouncedQuery, reloadKey]);

  // Client-side filter as a stopgap — the backend list endpoint doesn't wire
  // `source_type`/`search` yet, so filter what's on the current page until it
  // does. Once backend supports the params server-side, this becomes a no-op.
  const visibleRows = useMemo(() => {
    let next = rows;
    if (type) {
      next = next.filter((r) => typeLabel(r.source_type).toLowerCase() === type.toLowerCase());
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      next = next.filter((r) =>
        String(r.transaction_id || "").toLowerCase().includes(q) ||
        String(r.phone_number || "").toLowerCase().includes(q)
      );
    }
    return next;
  }, [rows, type, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  useEffect(() => {
    if (loading) return;
    if (total === 0) return;
    if (page > totalPages) setPage(totalPages);
  }, [loading, total, totalPages, page]);

  const [pendingDelete, setPendingDelete] = useState(null); // row being confirmed for delete
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteErrorTransaction({
        source_type: pendingDelete.source_type,
        uuid: pendingDelete.uuid,
      });
      toast.success("Error transaction deleted");
      setPendingDelete(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("[error-transactions] delete failed", err);
      toast.error("Failed to delete error transaction");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <OverviewHeader />
      <section className="relative flex w-full flex-col rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
        <header className="flex flex-col gap-4 p-6 w-full 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <h2
            className="text-white font-bold whitespace-nowrap"
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "26px",
              lineHeight: "39px",
              letterSpacing: "-2px",
            }}
          >
            Error Transactions
          </h2>
          <div className="flex flex-wrap items-center gap-3 2xl:justify-end">
            <FilterPill label="Transaction Type" value={type} onChange={setType} options={TYPE_OPTIONS} />
            <SearchInput value={query} onChange={setQuery} />
          </div>
        </header>

        <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
          <div style={{ minWidth: TABLE_MIN_WIDTH }}>
            <TableHeader />
            <div className="flex w-full flex-col">
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
              ) : visibleRows.length === 0 ? (
                <EmptyRow />
              ) : (
                visibleRows.map((row, idx) => (
                  <TableRow
                    key={`${row.uuid || row.transaction_id || "error-txn"}-${idx}`}
                    row={row}
                    onDelete={() => setPendingDelete(row)}
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete error transaction?"
        message={
          pendingDelete
            ? `This will permanently remove transaction ${pendingDelete.transaction_id || pendingDelete.uuid} from the error list. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        tone="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

function OverviewHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">RETENTION SYSTEM</span>
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
          Error Transactions
        </h1>
      </div>
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
      placeholder="Enter Transaction ID/Phone Number"
      className="w-[220px] bg-[#141828] border border-[#f2cb7a] rounded-[8px] px-3 py-2 text-[10px] italic text-[#f6dda6] placeholder:text-[#f6dda6] placeholder:capitalize focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
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

const STATUS_COLORS = {
  Error: { bg: "#4a0d12", color: "#fb6f7d" },
};

function TableRow({ row, onDelete }) {
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <DataCell value={row.transaction_id} minW={COLUMNS[0].minW} />
      <Cell minW={COLUMNS[1].minW}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="min-w-0 truncate text-[12px] font-medium text-white leading-[18px]">
            {row.member_name || row.full_name || "—"}
          </span>
          <span className="min-w-0 truncate text-[11px] text-white/50 leading-[16px]">
            {row.phone_number || "—"}
          </span>
        </div>
      </Cell>
      <DataCell value={typeLabel(row.source_type)} minW={COLUMNS[2].minW} />
      <DataCell value={formatCurrency(row.amount)} minW={COLUMNS[3].minW} />
      <DataCell value={formatDateTime(row.transaction_date)} minW={COLUMNS[4].minW} nowrap />
      <Cell minW={COLUMNS[5].minW}>
        <span
          className="inline-flex items-center rounded-[4px] px-2.5 py-1 text-[12px] font-semibold leading-[18px] whitespace-nowrap"
          style={{ backgroundColor: STATUS_COLORS.Error.bg, color: STATUS_COLORS.Error.color }}
        >
          Error
        </span>
      </Cell>
      <Cell minW={COLUMNS[6].minW} align="end">
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-1 rounded-[8px] border border-[#d00416] px-4 py-2 transition hover:bg-[#d00416]/10"
        >
          <TrashIcon />
          <span className="text-[12px] font-medium text-[#fb6f7d] leading-[18px]">Delete</span>
        </button>
      </Cell>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fb6f7d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function EmptyRow() {
  return (
    <div className="px-6 py-12 text-center text-[12px] text-white/40">
      No error transactions found.
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

function SkeletonRow() {
  return (
    <div className="flex w-full items-stretch border-b border-white/5">
      {COLUMNS.map((col) => (
        <Cell key={col.key} minW={col.minW} align={col.align === "end" ? "end" : "start"}>
          <SkeletonBar width="55%" />
        </Cell>
      ))}
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

function Cell({ children, minW, align = "start" }) {
  const justify = align === "end" ? "justify-end" : "justify-start";
  return (
    <div className={`flex min-w-0 flex-1 items-center overflow-hidden p-6 ${justify}`} style={{ minWidth: minW }}>
      {children}
    </div>
  );
}
