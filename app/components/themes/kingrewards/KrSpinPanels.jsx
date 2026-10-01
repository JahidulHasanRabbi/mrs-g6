"use client";

import { useEffect, useMemo, useState } from "react";
import KingRewardsDialog from "./KingRewardsDialog";
import KingRewardsButton from "./KingRewardsButton";
import { CardTitle, GlassCard, GoldText, KrImage, formatKrAmount } from "./KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_GRADIENTS } from "./assets";
import { formatKrCoins } from "../../../api/apiOptions";
import KrPagination from "./KrPagination";

// Sections shared by the King Rewards Lucky Spin and Smash Egg pages
// (Figma 706:1061 / 707:4251): reward list, winners table, terms, result dialog.

const ACME = "var(--font-acme), 'Acme', sans-serif";
const RUBIK = "var(--font-rubik), 'Rubik', sans-serif";
const INNER_SHADOW = "inset -2px 8px 8px rgba(165,196,255,0.25)";

export function formatKrDate(value) {
  if (!value) return "";
  // Bare yyyy-mm-dd is parsed as a calendar date, not a UTC instant.
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export { formatKrAmount };

/** UserContext keeps the balance as a formatted string ("1,234.00"). */
export function parseKrAmount(value) {
  const amount = Number(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

/** "1 KR Coin" / "N KR Coins" for any raw or formatted amount. */
export function krCoins(value) {
  return formatKrCoins(parseKrAmount(value));
}

/** Warning-dialog props for a draw the member can't pay for; no cost = only the server knew. */
export function insufficientDialogProps({ balance, cost, onGetCoins, onBack }) {
  const text = cost ? `You have ${krCoins(balance)}. This costs ${krCoins(cost)}.` : `${krCoins(balance)} left`;
  return {
    tone: "warning",
    title: "Warning!",
    subtitle: "Not enough KR Coins",
    items: [{ key: "left", text }],
    primary: { label: "Get KR Coins?", onClick: onGetCoins },
    secondary: { label: "Back", onClick: onBack },
  };
}

/** Inline low-balance note shown under the draw buttons. */
export function KrLowBalanceNote({ children }) {
  return (
    <p
      role="status"
      className="flex w-full items-center justify-center gap-1.5 rounded-[8px] px-3 py-2 text-center text-[13px] font-medium leading-[1.3]"
      style={{
        fontFamily: KR_FONT,
        color: "#ffd6de",
        background: "rgba(217,6,20,0.18)",
        border: "1px solid rgba(255,102,138,0.45)",
      }}
    >
      <img src={KR_ASSETS.ui.iconWarning} alt="" className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RankMedal({ rank }) {
  return (
    <div className="relative h-6 w-6 shrink-0" aria-hidden>
      <div className="absolute left-[7px] top-[2px] h-5 w-[10px]">
        <img src={KR_ASSETS.ui.iconRankMedal} alt="" className="absolute inset-0 h-full w-full" />
        <span
          className="absolute left-[3px] top-[5.5px] leading-[7px] text-black"
          style={{ fontFamily: ACME, fontSize: rank === 1 ? 10 : rank < 10 ? 8 : 6 }}
        >
          {rank}
        </span>
      </div>
    </div>
  );
}

/** "REWARD LIST" panel. rows: [{ key, rankLabel?, rank?, name, image }] */
export function KrRewardList({ rows = [], loading = false, error = null, rowShadow = false, compact = false }) {
  return (
    <GlassCard className="flex w-full flex-col items-center gap-6 px-2 py-4">
      <CardTitle className="w-full pb-2">Reward List</CardTitle>
      <div className="flex w-full flex-col gap-3">
        {rows.length === 0 ? (
          <p className="py-2 text-center text-[14px]" style={{ fontFamily: KR_FONT, color: KR_COLORS.cream }}>
            {loading ? "Loading rewards…" : error ? "Couldn't load rewards. Please try again later." : "No rewards available."}
          </p>
        ) : (
          rows.map((row, i) => (
            <div
              key={row.key ?? i}
              className={`flex items-center gap-3 rounded-[8px] pl-4 pr-3 ${compact ? "py-2" : "py-3"}`}
              style={{
                background: "rgba(255,255,255,0.1)",
                borderLeft: `4px solid ${KR_COLORS.goldBright}`,
                boxShadow: rowShadow ? INNER_SHADOW : undefined,
              }}
            >
              <div
                className={`${compact ? "h-10 w-10" : "h-12 w-12"} shrink-0 overflow-hidden rounded-[6px] border border-[rgba(77,71,50,0.4)] bg-[#231f14] p-px`}
              >
                {row.image ? (
                  <KrImage src={row.image} className="h-full w-full rounded-[5px] object-cover" />
                ) : (
                  <img src={KR_ASSETS.ui.iconCoins} alt="" className="h-full w-full object-contain p-1.5" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                {row.rankLabel && (
                  <GoldText className="text-[10px] uppercase" style={{ fontFamily: ACME, lineHeight: "15px" }}>
                    {row.rankLabel}
                  </GoldText>
                )}
                <p
                  className={`break-words leading-6 ${compact ? "text-[14px]" : "text-[16px]"}`}
                  style={{ fontFamily: RUBIK, color: i === 0 ? KR_COLORS.cream : "#eae2cf" }}
                >
                  {row.name}
                </p>
              </div>
              {row.rank ? <RankMedal rank={row.rank} /> : null}
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

/**
 * Winner List / Win Record panel. rows: [{ date, user, amount, icon? }].
 * Pages client-side unless the caller drives it (page/total/onPage).
 */
export function KrWinnersPanel({
  tabs,
  active,
  onTab,
  heading,
  rows = [],
  loading = false,
  emptyText = "No records yet",
  bordered = true,
  footer = null,
  pageSize = 10,
  page: controlledPage,
  total,
  onPage,
}) {
  const [localPage, setLocalPage] = useState(1);
  const controlled = typeof onPage === "function";
  const page = controlled ? controlledPage : localPage;
  const totalPages = Math.max(1, Math.ceil((controlled ? total : rows.length) / pageSize));
  const visible = controlled ? rows : rows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (!controlled) setLocalPage(1);
  }, [active, controlled]);
  useEffect(() => {
    if (!controlled && localPage > totalPages) setLocalPage(totalPages);
  }, [controlled, localPage, totalPages]);

  const hairline = bordered ? `1px solid ${KR_COLORS.goldBright}` : undefined;
  // Date is a fixed-width "dd/mm/yyyy" and the masked user is short, so both get a
  // narrow fixed column — the prize name gets the rest and wraps instead of the
  // old equal-thirds split, which clipped long prize names with no way to read
  // the rest on a touch device (no hover for the `title` fallback).
  const cols = "grid grid-cols-[62px_56px_minmax(0,1fr)] items-start gap-2";

  return (
    <GlassCard radius={12} className="flex w-full flex-col gap-2 p-1">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTab(tab.id)}
            className="flex-1 cursor-pointer rounded-[8px] px-1 py-2 text-center text-[10px] font-semibold"
            style={{
              fontFamily: KR_FONT,
              color: KR_COLORS.goldText,
              border: hairline,
              background: tab.id === active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="flex flex-col gap-4 rounded-[8px] p-2"
        style={{ background: "rgba(255,255,255,0.15)", border: hairline, boxShadow: bordered ? INNER_SHADOW : undefined }}
      >
        <GoldText as="h3" className="block text-[14px] font-bold uppercase">
          {heading}
        </GoldText>
        <div className="flex flex-col gap-3" style={{ fontFamily: KR_FONT }}>
          <div className={`${cols} text-[12px] font-light leading-[1.3]`} style={{ color: "#f5c154" }}>
            <span>Date/time</span>
            <span>User</span>
            <span className="text-right">Price</span>
          </div>
          {loading ? (
            <p className="py-4 text-center text-[12px] text-white/80">Loading…</p>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-4 text-white/80">
              <ClockIcon />
              <p className="text-center text-[12px]">{emptyText}</p>
            </div>
          ) : (
            visible.map((row, i) => (
              <div key={`${row.date}-${row.user}-${row.amount}-${i}`} className={`${cols} text-[10px] leading-[1.3] text-white`}>
                <span className="whitespace-nowrap">{row.date}</span>
                <span className="truncate">{row.user}</span>
                <span className="flex min-w-0 items-start justify-end gap-1 text-right" title={row.amount}>
                  {row.icon && <img src={row.icon} alt="" className="h-3 w-3 shrink-0 object-contain mt-[1px]" />}
                  <span className="break-words">{row.amount}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && <KrPagination page={page} totalPages={totalPages} onPage={controlled ? onPage : setLocalPage} />}
      {footer}
    </GlassCard>
  );
}

function useTermLines(termsText) {
  return useMemo(
    () => String(termsText || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
    [termsText]
  );
}

function TermsList({ terms, bordered }) {
  if (terms.length === 0) {
    return (
      <p className="p-3 text-[14px]" style={{ fontFamily: RUBIK, color: KR_COLORS.cream }}>
        No terms and conditions available.
      </p>
    );
  }
  return (
    <div className="flex flex-col">
      {terms.map((term, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 rounded-r-[8px] p-3"
          style={i > 0 ? { borderTop: `1px solid ${bordered ? KR_COLORS.gold : KR_COLORS.goldBright}` } : undefined}
        >
          <GoldText className="text-[10px]" style={{ fontFamily: ACME, lineHeight: "15px" }}>
            {String(i + 1).padStart(2, "0")}
          </GoldText>
          <p className="break-words text-[16px] leading-6" style={{ fontFamily: RUBIK, color: KR_COLORS.cream }}>
            {term}
          </p>
        </div>
      ))}
    </div>
  );
}

/** The game's own rules, opened from the header "!"; Back returns to the game. */
export function KrRulesDialog({ open, onClose, title, termsText = "" }) {
  const terms = useTermLines(termsText);
  return (
    <KingRewardsDialog open={open} onClose={onClose}>
      <GoldText as="h2" className="block px-2 text-center text-[24px] font-bold uppercase" style={{ letterSpacing: 1 }}>
        {title}
      </GoldText>
      <div
        className="max-h-[55vh] w-full overflow-y-auto rounded-[12px] p-2"
        style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${KR_COLORS.goldBright}`, boxShadow: INNER_SHADOW }}
      >
        <TermsList terms={terms} bordered />
      </div>
      <KingRewardsButton onClick={onClose}>Back</KingRewardsButton>
    </KingRewardsDialog>
  );
}

/** "TERM & CONDITION" panel; one numbered item per non-empty line of termsText. */
export function KrTermsPanel({ termsText = "", bordered = true }) {
  const terms = useTermLines(termsText);
  return (
    <GlassCard className="flex w-full flex-col gap-6 px-2 py-4">
      <CardTitle className="w-full pb-2">Term &amp; Condition</CardTitle>
      <div
        className={`rounded-[12px] ${bordered ? "p-[17px]" : "p-4"}`}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: bordered ? `1px solid ${KR_COLORS.goldBright}` : undefined,
          boxShadow: bordered ? INNER_SHADOW : undefined,
        }}
      >
        <TermsList terms={terms} bordered={bordered} />
      </div>
    </GlassCard>
  );
}

const HEADING_SHADOW = "drop-shadow(0 4px 1.5px rgba(0,0,0,0.1)) drop-shadow(0 10px 4px rgba(0,0,0,0.04))";

/** Result / warning dialog (Figma 843:7526, 843:8277); items: [{ key, image, text }]. */
export function KrResultDialog({ open, onClose, tone = "win", title, subtitle, items = [], primary, secondary }) {
  const warning = tone === "warning";
  return (
    <KingRewardsDialog open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex min-h-9 items-center justify-center gap-1 px-2 text-center" style={{ filter: HEADING_SHADOW }}>
          {warning && <img src={KR_ASSETS.ui.iconWarning} alt="" className="h-8 w-8 shrink-0" />}
          <GoldText
            as="h2"
            className="text-[32px] font-bold uppercase"
            style={{ letterSpacing: 1.4, ...(warning ? { backgroundImage: KR_GRADIENTS.red } : null) }}
          >
            {title}
          </GoldText>
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          {subtitle && (
            <p className="px-2 text-center text-[18px] font-medium leading-[27px]" style={{ fontFamily: KR_FONT, color: "#e2e2e2" }}>
              {subtitle}
            </p>
          )}
          {items.length > 0 && (
            <div className={`flex w-full flex-col items-center gap-3 px-2 ${items.length > 2 ? "max-h-[180px] overflow-y-auto" : ""}`}>
              {items.map((item, i) => (
                <div key={item.key ?? i} className="flex max-w-full items-center gap-4">
                  <KrImage
                    src={item.image}
                    className={`${items.length > 1 ? "h-10 w-10" : "h-16 w-16"} shrink-0 object-contain`}
                  />
                  <p className="min-w-0 break-words text-[16px] font-medium leading-6" style={{ fontFamily: KR_FONT, color: "#f2ba33" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        {primary && (
          <KingRewardsButton variant="gold" onClick={primary.onClick}>
            {primary.label}
          </KingRewardsButton>
        )}
        {secondary && <KingRewardsButton onClick={secondary.onClick}>{secondary.label}</KingRewardsButton>}
      </div>
    </KingRewardsDialog>
  );
}
