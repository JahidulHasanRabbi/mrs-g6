// Placeholder art until the client ships the real icons — swapping these two
// paths is the whole migration. The National Day chrome is drawn as SVG in
// components/phase4/NationalDayChrome.jsx, so it needs no bitmaps here.
export const PHASE4_ASSETS = Object.freeze({
  token: "/assets/phase4/token-placeholder.webp",
  battlePoint: "/assets/phase4/battle-point-placeholder.webp",
});

export const PHASE4_PREVIEW_ENABLED =
  process.env.NEXT_PUBLIC_PHASE4_PREVIEW === "true";

// Event window from the client deck: 31/8 00:00 – 16/9 23:59 GMT+8. The label
// is the client's approved copy and is kept verbatim rather than derived.
export const PHASE4_EVENT = Object.freeze({
  badge: "EVENT",
  periodLabel: "31 Aug - 16 Sep 2026",
  startsAt: Date.parse("2026-08-31T00:00:00+08:00"),
  endsAt: Date.parse("2026-09-16T23:59:59+08:00"),
});

// Manual override — set false to pull the National Day decoration early.
export const NATIONAL_DAY_CHROME_ENABLED = true;

/**
 * The client confirmed (13/08) the decoration disappears on its own once the
 * event ends, so the chrome is live until PHASE4_EVENT.endsAt and gone after.
 * Callers must evaluate this on the client after mount: the bottom nav is
 * prerendered, and a build-time answer would disagree with the browser's clock
 * on the day it flips.
 */
export function isNationalDayChromeActive(now = Date.now()) {
  return NATIONAL_DAY_CHROME_ENABLED && now <= PHASE4_EVENT.endsAt;
}

// Requirement 6 — Top Turnover gets its own maintenance switch, separate from
// the shared /leaderboard/status one that gates the other three boards. Mocked
// as a constant until the backend endpoint and its admin control exist.
export const TURNOVER_MAINTENANCE = false;
