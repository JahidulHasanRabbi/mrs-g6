"use client";

import useMemberLeaderboardHistory, {
  HISTORY_PAGE_SIZE,
  formatHistoryDate,
} from "./useMemberLeaderboardHistory";

// "Reward History" card for the default / non-King-Rewards leaderboard themes;
// sits above Terms & Conditions and lists the member's paid rewards for `board`.
export default function MemberRewardHistory({ memberUuid, board, color = "#ff8c00" }) {
  const { rows, total, loading, failed, page, setPage } = useMemberLeaderboardHistory(memberUuid, board);
  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));
  const font = { fontFamily: "var(--font-inter)" };
  const cols = "grid grid-cols-[88px_minmax(0,1fr)] items-start gap-2";

  return (
    <div
      className="w-full rounded-2xl px-6 py-8 flex flex-col gap-4"
      style={{
        backdropFilter: "blur(6px)",
        backgroundColor: "var(--lb-card-overlay)",
        border: "1px solid rgba(255,246,223,0.15)",
      }}
    >
      <h3 className="text-base font-bold text-[#fff6df]" style={font}>
        Reward History
      </h3>

      <div className={`${cols} text-xs font-semibold`} style={{ ...font, color }}>
        <span>Date</span>
        <span className="text-right">Price</span>
      </div>

      {loading ? (
        <p className="py-4 text-center text-sm text-[#ddc1ae]" style={font}>Loading…</p>
      ) : failed ? (
        <p className="py-4 text-center text-sm text-[#ddc1ae]" style={font}>
          Couldn&apos;t load your reward history. Please try again later.
        </p>
      ) : rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#ddc1ae]" style={font}>No rewards yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.uuid} className={`${cols} text-xs text-[#e5e2e1]`} style={font}>
              <span className="whitespace-nowrap">{formatHistoryDate(row.datetime_obtained)}</span>
              <span className="break-words text-right">{row.reward_details}</span>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[#e5e2e1]" style={font}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="cursor-pointer px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color }}
          >
            Prev
          </button>
          <span>{page} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="cursor-pointer px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
