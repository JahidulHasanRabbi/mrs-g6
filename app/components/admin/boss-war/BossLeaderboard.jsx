"use client";

// Top 20 by total damage, straight from the boss ranking endpoint. The API
// masks display names, so they are shown exactly as returned.

const RANK_COLOR = {
  1: "text-[#f2cb7a]",
  2: "text-white/80",
  3: "text-[#dc9d16]",
};

export default function BossLeaderboard({ rows = [], loading }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr className="text-left" style={{ backgroundImage: "linear-gradient(180deg, #141828 0%, #333333 99.75%)" }}>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]" style={{ width: 90 }}>Rank</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#fbeed2]">Player</th>
              <th className="px-6 py-4 text-right text-[14px] font-semibold text-[#fbeed2]">Total Damage</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-[13px] text-white/50">
                  Loading leaderboard...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-[13px] text-white/50">
                  No attacks on this boss yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={`${r.rank}-${r.display_name}`} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className={`px-6 py-4 text-[13px] font-bold ${RANK_COLOR[r.rank] || "text-white/60"}`}>
                    #{r.rank}
                  </td>
                  <td className="px-6 py-4 text-[12px] text-white">{r.display_name}</td>
                  <td className="px-6 py-4 text-right text-[12px] text-white">
                    {Number(r.amount ?? 0).toLocaleString("en-US")}
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
