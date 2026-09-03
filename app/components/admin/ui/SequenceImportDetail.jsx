"use client";

// Full breakdown of one sequence import run — shared by Smash Egg, Lucky
// Spin and Penalty Kick's "Details" pages. Fetches by uuid, with a
// Saved/Failed row filter and its own pagination (the endpoint paginates
// `rows` independently of the summary fields).

import { useEffect, useState } from "react";
import { StatusBadge, formatSequenceDate } from "./SequenceHistoryTable";
import { Pagination } from "../members/DataTable";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";
const PAGE_SIZE = 20;
const TABS = [
  { key: "all", label: "All" },
  { key: "saved", label: "Saved" },
  { key: "failed", label: "Failed" },
];

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function SummaryStat({ label, value, tone }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-1 text-[20px] font-bold" style={tone ? { color: tone } : { color: "#fff" }}>
        {value}
      </p>
    </div>
  );
}

/**
 * @param {(uuid: string, params: object) => Promise<object>} fetchDetail
 */
export default function SequenceImportDetail({ uuid, backHref, backLabel = "Back", onBack, fetchDetail }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsMeta, setRowsMeta] = useState({ count: 0 });

  useEffect(() => {
    if (!uuid) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = { page, page_size: PAGE_SIZE };
        if (tab !== "all") params.status = tab;
        const data = await fetchDetail(uuid, params);
        if (cancelled) return;
        setDetail(data);
        setRowsMeta(data?.rows || { count: 0, results: [] });
      } catch (err) {
        if (!cancelled) setError(err?.data?.detail || err?.data?.error || err?.message || "Failed to load import.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [uuid, tab, page, fetchDetail]);

  const rows = rowsMeta?.results || [];
  const totalPages = Math.max(1, Math.ceil((rowsMeta?.count || 0) / PAGE_SIZE));

  const handleTab = (key) => {
    setTab(key);
    setPage(1);
  };

  return (
    <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2
          className="bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent"
          style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}
        >
          Sequence Import Details
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition-colors hover:bg-white/5"
        >
          <BackIcon />
          {backLabel}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-[8px] border border-red-400/40 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">{error}</p>
      )}

      {loading && !detail ? (
        <div className="px-6 py-12 text-center text-[13px] text-white/50">Loading import...</div>
      ) : detail ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            <SummaryStat label="Imported" value={formatSequenceDate(detail.created)} />
            <SummaryStat label="Imported By" value={detail.imported_by || "-"} />
            <SummaryStat label="Total Rows" value={detail.total_rows ?? 0} />
            <SummaryStat label="Success" value={detail.success_count ?? 0} tone="#06b800" />
            <SummaryStat label="Failed" value={detail.failed_count ?? 0} tone={detail.failed_count ? "#fb6b6b" : undefined} />
          </div>

          <div className="mb-4 flex items-center justify-between gap-4">
            <StatusBadge status={detail.status} />
            <div className="flex items-center gap-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTab(t.key)}
                  className={`rounded-[8px] border px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                    tab === t.key
                      ? "border-[#f2cb7a] text-[#141828]"
                      : "border-white/15 text-white/60 hover:bg-white/5"
                  }`}
                  style={tab === t.key ? { backgroundImage: GOLD_BG } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[12px] border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-gradient-to-b from-[#141828] to-[#333333] text-left">
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Row</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Position</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Item Name</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Item UUID</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Status</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-white/50">Loading rows...</td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-white/50">No rows to show.</td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-5 text-[12px] text-white/60">{row.row_number}</td>
                        <td className="px-6 py-5 text-[12px] text-white">{row.item_order ?? "-"}</td>
                        <td className="px-6 py-5 text-[12px] text-white">{row.item_name || "-"}</td>
                        <td className="px-6 py-5 text-[12px] text-white/70">{row.item_uuid || "-"}</td>
                        <td className={`px-6 py-5 text-[12px] ${row.status === "FAILED" ? "text-red-300" : "text-[#06b800]"}`}>
                          {row.status}
                        </td>
                        <td className="px-6 py-5 text-[12px] text-white/70">{row.reason || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-3">
            <p className="text-[10px] text-white/80">
              {rowsMeta?.count
                ? `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, rowsMeta.count)} of ${rowsMeta.count} Results`
                : "Showing 0 to 0 of 0 Results"}
            </p>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : null}
    </div>
  );
}
