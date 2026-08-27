"use client";

import RowActions from "../../world-cup/RowActions";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

function fmt(n) {
  if (n == null) return "";
  return Number(n).toLocaleString("en-US");
}

export default function TurnoverPlayerTable({ players = [], onEdit }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Player Name</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Rank</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Total Turnover</th>
              <th className="px-5 py-4 text-right text-[13px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No player data yet.
                </td>
              </tr>
            ) : (
              players.map((p) => (
                <tr key={p.id} className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] text-white">{p.name}</td>
                  <td className="px-5 py-5 text-[12px] text-white">#{fmt(p.rank)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{fmt(p.totalTurnover)}</td>
                  <td className="px-5 py-5">
                    <RowActions
                      onEdit={() => onEdit?.(p)}
                      showArchive={false}
                    />
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
