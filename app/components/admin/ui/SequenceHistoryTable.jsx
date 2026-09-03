"use client";

// Sequence import history — shared by Smash Egg, Lucky Spin and Penalty Kick.
// Lists every past "Import Sequence" run, latest first, with a Details link
// into the full row-by-row breakdown.

const STATUS_STYLE = {
  SUCCESS: { label: "Success", fg: "#84ebb4", bg: "rgba(6,184,0,0.12)", border: "rgba(6,184,0,0.4)" },
  PARTIAL: { label: "Partial", fg: "#ffd27a", bg: "rgba(233,175,65,0.12)", border: "rgba(233,175,65,0.4)" },
  FAILED: { label: "Failed", fg: "#fb6b6b", bg: "rgba(240,74,74,0.12)", border: "rgba(240,74,74,0.4)" },
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] || { label: status || "-", fg: "#fbeed2", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.2)" };
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: style.fg, backgroundColor: style.bg, borderColor: style.border }}
    >
      {style.label}
    </span>
  );
}

export function formatSequenceDate(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function SequenceHistoryTable({ rows = [], loading = false, onViewDetails }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="bg-gradient-to-b from-[#141828] to-[#333333] text-left">
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Imported</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Imported By</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Total Rows</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Success</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Failed</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Status</th>
              <th className="px-6 py-4 text-right text-[14px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-white/50">
                  Loading import history...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-white/50">
                  No sequence imports yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] text-white">{formatSequenceDate(row.created)}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{row.imported_by || "-"}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{row.total_rows ?? 0}</td>
                  <td className="px-6 py-5 text-[12px] text-[#06b800]">{row.success_count ?? 0}</td>
                  <td className="px-6 py-5 text-[12px] text-red-300">{row.failed_count ?? 0}</td>
                  <td className="px-6 py-5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onViewDetails?.(row.uuid)}
                        className="rounded-[8px] border border-[#f2cb7a] px-3 py-2 text-[12px] text-[#eaad2c] transition-colors hover:bg-white/5"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
