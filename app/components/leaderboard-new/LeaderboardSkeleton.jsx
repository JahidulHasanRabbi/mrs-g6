"use client";

// Loading placeholders for the 3 data-driven sections: countdown, podium
// (top 3) and the table (ranks 4-20). Shown while a tab's data is fetching.
function Shimmer({ className = "", style }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/10 ${className}`}
      style={style}
    />
  );
}

export default function LeaderboardSkeleton({ config }) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Countdown */}
      {config.showCountdown && (
        <div className="flex w-full justify-center gap-2 pt-6">
          {[0, 1, 2, 3].map((i) => (
            <Shimmer key={i} className="h-16 w-16" />
          ))}
        </div>
      )}

      {/* Podium - Top 3 */}
      <div className="flex w-full flex-col gap-1">
        {[1, 2, 3].map((rank) => (
          <div
            key={rank}
            className="flex w-full flex-col items-center gap-2 rounded-lg p-6"
            style={{
              backgroundColor: "var(--lb-card-overlay)",
              border: `1px solid ${config.rowBorder}`,
            }}
          >
            <Shimmer className="mb-3 h-16 w-16 rounded-xl" />
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-5 w-36" />
          </div>
        ))}
      </div>

      {/* Table - Ranks 4-20 */}
      <div
        className="w-full overflow-hidden rounded-lg p-px"
        style={{
          backgroundColor: "var(--lb-card-overlay)",
          border: `1px solid ${config.tableBorder}`,
        }}
      >
        <div
          className="px-3 py-4 sm:px-4"
          style={{ backgroundColor: config.headerBg }}
        >
          <Shimmer className="h-3 w-24" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-3 sm:px-4"
            style={{ borderBottom: `1px solid ${config.rowBorder}` }}
          >
            <Shimmer className="h-8 w-8 rounded-xl" />
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
