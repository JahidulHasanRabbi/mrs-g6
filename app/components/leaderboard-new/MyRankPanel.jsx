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
  memberName = "Member",
  profilePicture = "",
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

  let statusCopy = `earn ${gapCopy} to next level`;
  if (isTopRank) statusCopy = "Highest Rank Reached";
  else if (isUnranked) statusCopy = emptyHint || "No ranking activity yet";

  const rankLabel = isUnranked ? "Unranked" : `#${data.rank}`;
  const nextRankLabel = isTopRank
    ? "#1"
    : data.nextRank
      ? `#${data.nextRank}`
      : "—";
  const displayName = String(memberName || "Member").trim() || "Member";
  const avatarSrc = profilePicture || "/assets/personal-data/profile-placeholder.webp";

  return (
    <section
      className="relative w-full rounded-[10px] border px-6 pb-5 pt-5"
      style={{
        backgroundColor: "var(--lb-card-overlay)",
        borderColor: color,
        boxShadow: `0 8px 24px ${color}24`,
        fontFamily: "var(--font-inter)",
      }}
      aria-label="My Rank"
    >
      {data.isMock && (
        <span
          className="absolute right-3 top-3 rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-[0.7px]"
          style={{ backgroundColor: `${color}20`, color }}
        >
          PREVIEW
        </span>
      )}

      <h2 className="text-center text-base font-bold" style={{ color }}>
        My Rank
      </h2>
      <div className="mt-2 h-px w-full" style={{ backgroundColor: color }} />

      <div className="mt-4 flex flex-col items-center text-center">
        <img
          src={avatarSrc}
          alt={`${displayName} profile`}
          className="h-12 w-12 rounded-full border-2 object-cover"
          style={{ borderColor: color, boxShadow: `0 0 10px ${color}8F` }}
        />
        <p className="mt-2 max-w-full truncate text-lg font-bold" style={{ color }}>
          {displayName}
        </p>
        <p className="mt-0.5 flex max-w-full items-center justify-center gap-1 text-[10px] font-semibold" style={{ color }}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="truncate">
            {metricLabel}: {formatMetric(isUnranked ? 0 : data.value, metricKind)}
          </span>
        </p>
      </div>

      <p className="mt-3 text-center text-base text-white/75">
        Current Rank:{" "}
        <strong className="font-bold text-white">{rankLabel}</strong>
      </p>

      <div className="mt-3">
        <div className="flex items-end justify-between gap-2 text-[10px] font-semibold text-white/75">
          <span className="shrink-0">{rankLabel}</span>
          <span className="min-w-0 flex-1 text-center text-[9px] font-medium leading-3">
            {statusCopy}
          </span>
          <span className="shrink-0">{nextRankLabel}</span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="Progress to the next rank"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </section>
  );
}
