"use client";

import { AnimatePresence, motion } from "framer-motion";
import KingRewardsButton from "./KingRewardsButton";
import KingRewardsDialog from "./KingRewardsDialog";
import { CardTitle, GlassCard, GoldText, KrTabs, PageTitle } from "./KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_GRADIENTS } from "./assets";
import { ENABLED_LEADERBOARD_TYPES, LEADERBOARD_CONFIG } from "../../leaderboard-new/constants";
import { shortenMaskedName } from "../../leaderboard-new/format";
import { deriveMyRank } from "../../leaderboard-new/MyRankPanel";
import { useCountdown } from "../../leaderboard-new/CountdownTimer";

const MONO = "var(--font-jetbrains-mono), monospace";

// Figma "KR Default" inner card (843:9469 / 843:9476).
const INNER = {
  background: "rgba(255,255,255,0.1)",
  boxShadow: "inset -2px 8px 8px rgba(165,196,255,0.25)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};
const INNER_BORDERED = { ...INNER, border: `1px solid ${KR_COLORS.goldBright}` };

// The table palette is warm/brown in the Figma (carried over from another template) — kept as drawn.
const TABLE = {
  headerBg: "rgba(255,140,0,0.2)",
  headerRule: "#564334",
  rowRule: "#715029",
  chipBorder: "#a48c7a",
  text: "#e5e2e1",
  onGold: "#001d42",
  youChip: "#ff8c00",
};

const RANK_TILES = {
  1: {
    background: KR_GRADIENTS.gold,
    border: `1px solid ${KR_COLORS.gold}`,
    filter: "drop-shadow(0 0 10px rgba(255,140,0,0.5))",
  },
  2: {
    background: "#4a8eff",
    border: `1px solid ${KR_COLORS.goldBright}`,
    boxShadow: "inset 0 8px 8px rgba(255,249,188,0.25)",
    color: "#00285b",
  },
  3: {
    background: "#ff8494",
    border: `1px solid ${KR_COLORS.goldBright}`,
    boxShadow: "inset 0 8px 8px rgba(255,249,188,0.25)",
    color: "#810029",
  },
};

const TABS = ENABLED_LEADERBOARD_TYPES.map((type) => ({ id: type, label: LEADERBOARD_CONFIG[type].label }));

const titleCase = (text) => String(text || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** dd/mm/yyyy, plus HH:MM AM|PM when `withTime` (project format). */
function formatWhen(ms, withTime = false) {
  const d = ms ? new Date(ms) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (!withTime) return date;
  return `${date} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
}

const metricText = (config, value) => (config.myRankMetricKind === "currency" ? `RM ${value}` : value);

function Shimmer({ className = "" }) {
  return <div className={`animate-pulse rounded bg-white/15 ${className}`} />;
}

function RankTile({ rank }) {
  const tile = RANK_TILES[Math.min(Math.max(Number(rank) || 3, 1), 3)];
  return (
    <div
      className="flex aspect-square w-[clamp(48px,14vw,60px)] shrink-0 items-center justify-center rounded-[12px]"
      style={tile}
    >
      {Number(rank) === 1 ? (
        <img src={KR_ASSETS.leaderboard.iconStar} alt="1st" className="h-6 w-[26px]" draggable={false} />
      ) : (
        <span className="text-[22px] font-extrabold leading-8" style={{ fontFamily: MONO, color: tile.color }}>
          {rank}
        </span>
      )}
    </div>
  );
}

function YouChip() {
  return (
    <span className="shrink-0 rounded-[4px] px-[6px] text-[10px] font-bold uppercase leading-4" style={{ background: KR_COLORS.goldBright, color: KR_COLORS.onGold }}>
      You
    </span>
  );
}

function PodiumRow({ entry, rank, config, isCurrentUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06 }}
      className="flex w-full items-center gap-[clamp(10px,4vw,16px)] rounded-[12px] p-[clamp(10px,3.5vw,14px)]"
      style={{
        ...INNER,
        border: isCurrentUser ? `2px solid ${KR_COLORS.goldBright}` : `1px solid rgba(255,240,102,${rank === 1 ? 0.9 : 0.5})`,
      }}
    >
      <RankTile rank={rank} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 border-l pl-[clamp(10px,4vw,16px)]" style={{ fontFamily: KR_FONT, borderColor: "rgba(255,240,102,0.35)" }}>
        <p className="flex min-w-0 items-center gap-2 text-[12px] leading-4" style={{ color: KR_COLORS.creamMuted }}>
          <span className="truncate">User: {isCurrentUser ? "You" : shortenMaskedName(entry.user)}</span>
          {isCurrentUser && <YouChip />}
        </p>
        <p className="truncate text-[clamp(15px,4.6vw,18px)] font-bold leading-6 text-white">
          {config.valueLabel}: {metricText(config, entry.value)}
        </p>
        {entry.prize && (
          <p className="flex min-w-0 items-baseline gap-1 text-[12px] font-bold uppercase leading-4 tracking-[0.8px]">
            <span style={{ color: KR_COLORS.creamMuted }}>Prize:</span>
            <span className="truncate normal-case tracking-normal" style={{ color: KR_COLORS.goldText }}>{entry.prize}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}

function RankingTable({ entries, config, currentUserRank }) {
  const withPrize = config.showPrizeColumn;
  const columns = withPrize ? "32px minmax(0,1fr) minmax(0,1fr) auto" : "32px minmax(0,1fr) auto";
  const cellPad = "px-[clamp(10px,4vw,16px)]";
  const gap = "clamp(8px,3vw,16px)";
  const valueHeader = config.tableValueHeader.replace(" ", "\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full overflow-hidden rounded-[12px] p-px"
      style={INNER_BORDERED}
    >
      <div
        className={`grid items-start pb-[17px] pt-4 text-[clamp(10px,3.2vw,12px)] font-bold uppercase leading-4 tracking-[1.2px] text-white ${cellPad}`}
        style={{ gridTemplateColumns: columns, columnGap: gap, background: TABLE.headerBg, borderBottom: `1px solid ${TABLE.headerRule}`, fontFamily: MONO }}
      >
        <span>Rank</span>
        <span>User</span>
        {withPrize ? (
          <>
            <span className="whitespace-pre-line px-1 text-center">{valueHeader}</span>
            <span className="min-w-[50px] text-right">Prize</span>
          </>
        ) : (
          <span className="whitespace-pre-line text-right">{valueHeader}</span>
        )}
      </div>

      {entries.map((entry, i) => {
        const you = entry.rank === currentUserRank || entry.isCurrentUser;
        const ink = you ? TABLE.onGold : TABLE.text;
        return (
          <div
            key={entry.rank || i}
            className={`grid items-center py-3 text-[clamp(13px,3.9vw,16px)] leading-6 ${cellPad}`}
            style={{
              gridTemplateColumns: columns,
              columnGap: gap,
              fontFamily: KR_FONT,
              background: you ? KR_GRADIENTS.gold : undefined,
              borderBottom: i < entries.length - 1 ? `1px solid ${TABLE.rowRule}` : undefined,
            }}
          >
            <span
              className="flex size-8 items-center justify-center rounded-[12px] text-[14px] font-bold leading-5"
              style={{
                fontFamily: MONO,
                border: `1px solid ${you ? "#d7d7d7" : TABLE.chipBorder}`,
                background: you ? "#fff" : undefined,
                color: you ? TABLE.youChip : TABLE.text,
              }}
            >
              {entry.rank}
            </span>
            <span className="min-w-0 truncate" style={{ color: ink }} title={entry.user}>
              {you ? "You" : shortenMaskedName(entry.user)}
            </span>
            {withPrize ? (
              <>
                <span className="min-w-0 truncate text-center font-semibold tabular-nums" style={{ color: ink }}>
                  {entry.value}
                </span>
                <span className="min-w-[50px] whitespace-nowrap text-right tabular-nums" style={{ color: you ? ink : KR_COLORS.gold }}>
                  {entry.prize || "-"}
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap text-right font-semibold tabular-nums" style={{ color: ink }}>
                {entry.value}
              </span>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

function TermsFooter({ terms }) {
  const rows = Array.isArray(terms) ? terms.filter(Boolean) : [];
  return (
    <div className="flex w-full flex-col gap-2 rounded-[12px] p-[17px]" style={{ ...INNER_BORDERED, fontFamily: KR_FONT }}>
      <h3 className="text-[16px] font-bold leading-6" style={{ color: KR_COLORS.cream }}>
        Terms &amp; Conditions
      </h3>
      <div className="flex flex-col gap-4 text-[14px] leading-[22.75px]">
        {rows.length ? (
          rows.map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0" style={{ color: "#ff8c00" }}>{String(i + 1).padStart(2, "0")}.</span>
              <p className="flex-1" style={{ color: "#ddc1ae" }}>{text}</p>
            </div>
          ))
        ) : (
          <p style={{ color: "#ddc1ae" }}>No terms and conditions available.</p>
        )}
      </div>
    </div>
  );
}

/** Category, ranking metric, period and last update: only what the API or config actually provides. */
function BoardInfo({ config, periodLabel, periodStart, periodEnd, updatedAt, notes }) {
  const period =
    periodStart && periodEnd
      ? `${formatWhen(periodStart)} - ${formatWhen(periodEnd)}`
      : periodEnd
        ? `Ends ${formatWhen(periodEnd, true)}`
        : periodLabel;
  const rows = [
    ["Category", config.label],
    ["Ranked by", titleCase(config.tableValueHeader)],
    period && ["Period", period],
    updatedAt && ["Last updated", formatWhen(updatedAt, true)],
  ].filter(Boolean);

  return (
    <div className="flex w-full items-start gap-3 rounded-[12px] p-4" style={{ ...INNER_BORDERED, fontFamily: KR_FONT }}>
      <img src={KR_ASSETS.ui.info} alt="" aria-hidden="true" className="mt-[2px] size-6 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 border-l pl-3" style={{ borderColor: "rgba(255,240,102,0.35)" }}>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-[12px] leading-[1.35]">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt style={{ color: KR_COLORS.creamMuted }}>{label}</dt>
              <dd className="font-semibold text-white [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
        {notes.length > 0 && (
          <div className="flex flex-col gap-1 text-[12px] leading-[1.45]" style={{ color: "#e2e2e2" }}>
            {notes.map((note, i) => (
              <p key={i}>{note}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BoardMessage({ title, children }) {
  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-[12px] px-4 py-8 text-center" style={{ ...INNER_BORDERED, fontFamily: KR_FONT }} role="status">
      <GoldText as="p" className="block text-[18px] font-bold uppercase">{title}</GoldText>
      <p className="text-[13px] leading-5" style={{ color: KR_COLORS.creamMuted }}>{children}</p>
    </div>
  );
}

function MyRankCard({ data, config, memberName, unavailable, inTop }) {
  const { isUnranked, progress, statusCopy, rankLabel, nextRankLabel, displayName, metricValue } = deriveMyRank(data, {
    metricKind: config.myRankMetricKind,
    gapUnit: config.myRankGapUnit,
    emptyHint: config.myRankEmptyHint,
    memberName,
  });

  return (
    <section className="flex w-full flex-col gap-3 rounded-[12px] p-4" style={{ ...INNER_BORDERED, fontFamily: KR_FONT }} aria-label="My Rank">
      <CardTitle align="center" size={16}>My Rank</CardTitle>
      <div className="flex flex-col items-center text-center">
        <p className="max-w-full truncate text-[16px] font-medium" style={{ color: KR_COLORS.goldText }}>{displayName}</p>
        <p className="max-w-full truncate text-[12px] font-semibold" style={{ color: KR_COLORS.gold }}>
          {config.myRankMetricLabel}: {metricValue}
        </p>
      </div>

      {unavailable && !data ? (
        <div className="rounded-[8px] border border-dashed px-4 py-3 text-center" style={{ borderColor: "rgba(255,240,102,0.5)" }}>
          <p className="text-[14px] font-semibold text-white">Your rank isn&apos;t available right now</p>
          <p className="mt-1 text-[12px]" style={{ color: KR_COLORS.creamMuted }}>Please check back later.</p>
        </div>
      ) : isUnranked ? (
        <div className="rounded-[8px] border border-dashed px-4 py-3 text-center" style={{ borderColor: "rgba(255,240,102,0.5)" }}>
          <p className="text-[14px] font-semibold text-white">Not ranked yet</p>
          <p className="mt-1 text-[12px]" style={{ color: KR_COLORS.creamMuted }}>
            {config.myRankEmptyHint || "Get started to appear on the leaderboard."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-center text-[14px]" style={{ color: KR_COLORS.creamMuted }}>
            Current Rank: <strong className="font-bold text-white">{rankLabel}</strong>
          </p>
          {inTop && (
            <p className="text-center text-[12px] font-semibold" style={{ color: KR_COLORS.goldText }}>
              Your row is highlighted on the board below.
            </p>
          )}
          <div>
            <div className="flex items-end justify-between gap-2 text-[11px] font-semibold" style={{ color: KR_COLORS.creamMuted }}>
              <span className="shrink-0">{rankLabel}</span>
              <span className="min-w-0 flex-1 text-center text-[10px] font-medium leading-3">{statusCopy}</span>
              <span className="shrink-0">{nextRankLabel}</span>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full"
              style={{ background: "#333535", border: `1px solid ${KR_COLORS.goldText}` }}
              role="progressbar"
              aria-label="Progress to the next rank"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: KR_GRADIENTS.goldBar }} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Countdown({ endDate, label = "CAMPAIGN ENDS IN" }) {
  const time = useCountdown(endDate);
  const units = [
    [time.days, "DAYS"],
    [time.hours, "HOURS"],
    [time.mins, "MINS"],
    [time.secs, "SECS"],
  ];
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-[12px] p-4" style={{ ...INNER_BORDERED, fontFamily: KR_FONT }}>
      <GoldText as="p" className="block text-[12px] font-bold tracking-[1.2px]">{label}</GoldText>
      <div className="flex items-start justify-center gap-2 min-[390px]:gap-3">
        {units.map(([value, unit], i) => (
          <div key={unit} className="flex items-start gap-2 min-[390px]:gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[28px] font-bold leading-8" style={{ color: KR_COLORS.cream }}>{value}</span>
              <span className="text-[10px] font-semibold tracking-[1.2px]" style={{ color: KR_COLORS.goldText }}>{unit}</span>
            </div>
            {i < units.length - 1 && <span className="text-[28px] font-bold leading-8" style={{ color: KR_COLORS.goldText }}>:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <>
      <p className="text-center text-[12px] font-semibold" style={{ color: KR_COLORS.creamMuted }} role="status">
        Updating ranking…
      </p>
      <div className="flex w-full flex-col gap-1">
        {[1, 2, 3].map((rank) => (
          <div key={rank} className="flex items-center gap-6 rounded-[12px] p-[17px]" style={INNER_BORDERED}>
            <Shimmer className="size-[clamp(60px,20vw,84px)] rounded-[12px]" />
            <div className="flex flex-1 flex-col gap-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-5 w-20" />
              <Shimmer className="h-4 w-14" />
            </div>
          </div>
        ))}
      </div>
      <div className="w-full overflow-hidden rounded-[12px]" style={INNER_BORDERED}>
        <div className="px-4 py-5" style={{ background: TABLE.headerBg }}>
          <Shimmer className="h-3 w-28" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${TABLE.rowRule}` }}>
            <Shimmer className="size-8 rounded-[12px]" />
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 w-14" />
          </div>
        ))}
      </div>
    </>
  );
}

/** King Rewards leaderboard (Figma 720:16286). Data comes from _Top20Leaderboard unchanged. */
export default function KrLeaderboardView({
  activeTab,
  onTabChange,
  config,
  top3 = [],
  tableEntries = [],
  currentUserRank,
  campaignEndDate,
  countdownLabel,
  periodLabel = "",
  periodStart = null,
  periodEnd = null,
  updatedAt = null,
  rankingFailed = false,
  updateNotes = [],
  terms = [],
  loading = false,
  myRank = null,
  myRankUnavailable = false,
  memberName,
  infoOpen = false,
  infoTerms = [],
  onInfoClose,
  isMaintenance = false,
}) {
  const infoRows = Array.isArray(infoTerms) ? infoTerms.filter(Boolean) : [];
  const isEmpty = top3.length === 0 && tableEntries.length === 0;
  const inTop = currentUserRank != null && [...top3, ...tableEntries].some((e) => Number(e.rank) === Number(currentUserRank));

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4 pt-8" style={{ fontFamily: KR_FONT }}>
      <PageTitle>Leaderboards</PageTitle>

      <div className="flex w-full flex-col gap-[10px]">
        <div
          className="w-full rounded-[16px] p-[clamp(10px,4vw,16px)]"
          style={{ background: KR_COLORS.navy, boxShadow: "inset -2px 8px 8px rgba(165,196,255,0.25)" }}
        >
          <KrTabs tabs={TABS} active={activeTab} onChange={onTabChange} size="clamp(10px,3.4vw,14px)" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex w-full flex-col gap-[10px]"
          >
            {config.eventBadge && (
              <span
                className="self-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase leading-[1.2] tracking-[1.4px]"
                style={{ background: KR_GRADIENTS.gold, color: KR_COLORS.onGold, fontFamily: KR_FONT }}
              >
                {config.eventBadge}
              </span>
            )}

            {!loading && config.previewNotice && (
              <div className="rounded-[12px] px-4 py-3 text-center text-[12px] font-semibold" style={{ ...INNER_BORDERED, color: "#ffb965" }} role="status">
                {config.previewNotice}
              </div>
            )}

            <BoardInfo
              config={config}
              periodLabel={periodLabel}
              periodStart={periodStart}
              periodEnd={periodEnd}
              updatedAt={loading ? null : updatedAt}
              notes={loading ? [] : updateNotes}
            />

            {!loading && (
              <MyRankCard data={myRank} config={config} memberName={memberName} unavailable={myRankUnavailable} inTop={inTop} />
            )}

            {!loading && config.showCountdown && campaignEndDate && (
              <Countdown endDate={campaignEndDate} label={countdownLabel} />
            )}

            <GlassCard variant="solid" className="flex w-full flex-col gap-6 px-2 py-4">
              <div className="pb-2">
                <CardTitle>{`${config.label} Leaderboards`}</CardTitle>
              </div>
              {loading ? (
                <BoardSkeleton />
              ) : rankingFailed ? (
                <BoardMessage title="Ranking unavailable">
                  We couldn&apos;t load this ranking. Please try again later.
                </BoardMessage>
              ) : isEmpty ? (
                <BoardMessage title="No rankings yet">
                  Rankings appear here once the first results for this period are published.
                </BoardMessage>
              ) : (
                <>
                  {top3.length > 0 && (
                    <div className="flex w-full flex-col gap-1">
                      {top3.map((entry, i) => {
                        const rank = entry.rank || i + 1;
                        return (
                          <PodiumRow key={rank} rank={rank} entry={entry} config={config} isCurrentUser={rank === currentUserRank} />
                        );
                      })}
                    </div>
                  )}
                  {tableEntries.length > 0 && (
                    <RankingTable entries={tableEntries} config={config} currentUserRank={currentUserRank} />
                  )}
                </>
              )}
              <TermsFooter terms={terms} />
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>

      <KingRewardsDialog open={infoOpen} onClose={onInfoClose}>
        <CardTitle align="center">Terms &amp; Conditions</CardTitle>
        <div className="flex max-h-[55vh] w-full flex-col gap-3 overflow-y-auto px-2 text-[14px] leading-[22px]">
          {infoRows.length ? (
            infoRows.map((term, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="shrink-0 font-semibold" style={{ color: KR_COLORS.gold }}>{String(i + 1).padStart(2, "0")}.</span>
                <p style={{ color: KR_COLORS.cream }}>{term}</p>
              </div>
            ))
          ) : (
            <p className="text-center" style={{ color: KR_COLORS.creamMuted }}>No terms and conditions available.</p>
          )}
        </div>
        <KingRewardsButton variant="dark" onClick={onInfoClose}>Back</KingRewardsButton>
      </KingRewardsDialog>

      {isMaintenance && (
        <div className="fixed inset-x-0 top-[68px] bottom-[100px] z-30 grid place-items-center bg-black/60 px-6 backdrop-blur-md">
          <GlassCard variant="solid" className="w-full max-w-[360px] px-6 py-7 text-center">
            <CardTitle align="center">Leaderboard is under maintenance</CardTitle>
            <p className="mt-3 text-[12px] leading-5" style={{ color: KR_COLORS.creamMuted }}>Please check back later.</p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
