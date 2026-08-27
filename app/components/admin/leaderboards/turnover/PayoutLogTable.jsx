"use client";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

// postman/turnover.md TurnoverPayoutLog.status
const STATUS_LABELS = { 1: "Paid", 2: "Skipped - Fake Rank", 3: "Failed" };
const STATUS_COLORS = { 1: "#4ade80", 2: "#9ca3af", 3: "#f87171" };

function fmt(n) {
  if (n == null || n === "") return "";
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(n);
}

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

export default function PayoutLogTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Rank</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Member</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Total Turnover</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Reward</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Status</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Notes</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No payout attempts yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.uuid ?? row.id} className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] text-white">#{fmt(row.rank)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">
                    {row.display_name || (row.member_id != null ? `#${row.member_id}` : "-")}
                  </td>
                  <td className="px-5 py-5 text-[12px] text-white">{fmt(row.total_turnover)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{row.reward_name || "-"}</td>
                  <td className="px-5 py-5 text-[12px] font-semibold" style={{ color: STATUS_COLORS[row.status] || "#fff" }}>
                    {STATUS_LABELS[row.status] || row.status}
                  </td>
                  <td className="px-5 py-5 text-[12px] text-white/70">{row.notes || "-"}</td>
                  <td className="px-5 py-5 text-[12px] text-white/70">{fmtDate(row.created)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
