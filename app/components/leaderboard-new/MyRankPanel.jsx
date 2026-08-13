import { formatAmount } from "./format";

function formatMetric(value, kind) {
  const formatted = formatAmount(value ?? 0);
  return kind === "currency" ? `RM${formatted}` : formatted;
}

/**
 * My Rank (requirement rows 9-13). Three states, per the client's 13/08 answer:
 *
 * - Rank #1      — "Highest Rank Reached", bar at 100%, no next-rank line.
 * - No activity  — "Unranked", metric at zero, bar at 0%, hint copy instead of
 *                  the next-rank line.
 * - Otherwise    — rank, metric, and how much more reaches the next rank.
 *
 * Tie-breaking (equal totals settled by who reached the amount first, then by
 * system record order) is a backend ranking rule; this panel only renders the
 * rank it is handed.
 */
export default function MyRankPanel({
  data,
  color,
  metricLabel,
  metricKind = "currency",
  gapUnit = "",
  emptyHint = "",
}) {
  if (!data) return null;

  const isUnranked = data.rank == null || Number(data.rank) === 0;
  const isTopRank = Number(data.rank) === 1;

  const progress = isUnranked
    ? 0
    : isTopRank
      ? 100
      : Math.max(0, Math.min(100, Number(data.progressPercent) || 0));

  const gapValue = formatMetric(data.amountToNextRank, metricKind);
  const gapCopy = gapUnit ? `${gapValue} ${gapUnit}` : gapValue;

  let statusCopy = `${gapCopy} more to reach Rank #${data.nextRank}`;
  if (isTopRank) statusCopy = "Highest Rank Reached";
  else if (isUnranked) statusCopy = emptyHint;

  return (
    <section
      className="w-full rounded-xl border p-4"
      style={{
        backgroundColor: "var(--lb-card-overlay)",
        borderColor: color,
        boxShadow: `0 8px 24px ${color}24`,
      }}
      aria-label="My Rank"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.4px] text-white/60">
            My Rank
            {data.isMock && (
              <span
                className="rounded-full px-1.5 py-px text-[9px] font-bold tracking-[0.8px]"
                style={{ backgroundColor: `${color}26`, color }}
              >
                PREVIEW
              </span>
            )}
          </p>
          <p
            className={`mt-1 font-extrabold ${isUnranked ? "text-2xl" : "text-3xl"}`}
            style={{ color }}
          >
            {isUnranked ? "Unranked" : `#${data.rank}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60">{metricLabel}</p>
          <p className="mt-1 text-xl font-bold text-white">
            {formatMetric(isUnranked ? 0 : data.value, metricKind)}
          </p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" aria-label={`${progress}% progress`}>
        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[11px]">
        <p className="text-white/70">{statusCopy}</p>
        <span className="font-bold" style={{ color }}>{progress}%</span>
      </div>
    </section>
  );
}
