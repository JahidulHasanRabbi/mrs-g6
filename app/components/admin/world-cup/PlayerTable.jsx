"use client";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

function fmt(n) {
  if (n == null) return "";
  return Number(n).toLocaleString("en-US");
}

export default function PlayerTable({ players = [] }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Player Name</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Country</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Total Points</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Country Rank</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Global Rank</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Total Prediction</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Total Win</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Winning Streak</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No dummy player data yet.
                </td>
              </tr>
            ) : (
              players.map((p) => (
                <tr key={p.id} className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] text-white">{p.name}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{p.country}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{fmt(p.totalPoints)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">#{fmt(p.countryRank)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">#{fmt(p.globalRank)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{p.totalPrediction}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{p.totalWin}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{p.winningStreak}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
