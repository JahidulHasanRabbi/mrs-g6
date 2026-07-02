"use client";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

function fmt(n) {
  if (n == null || n === "") return "";
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(n);
}

export default function RankingTable({ rows = [], type = "deposit" }) {
  const isReferral = type === "referral";
  const amountLabel = isReferral ? "Referral Deposit" : type === "withdrawal" ? "Total Withdraw" : "Total Deposit";
  const countLabel = isReferral ? "New Member" : "Count";

  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Rank</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Member ID</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Full Name</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">{amountLabel}</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">{countLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No ranking data yet.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.id ?? row.memberId ?? `${row.rank}-${index}`}
                  className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-5 text-[12px] text-white">#{fmt(row.rank)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{fmt(row.memberId)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{row.fullName}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{fmt(row.amount)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{fmt(row.count)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
