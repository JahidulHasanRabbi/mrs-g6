// Placeholder art until the client ships the real icons — swapping these two
// paths is the whole migration. The National Day chrome is drawn as SVG in
// components/phase4/NationalDayChrome.jsx, so it needs no bitmaps here.
export const PHASE4_ASSETS = Object.freeze({
  token: "/assets/phase4/token-placeholder.webp",
  battlePoint: "/assets/phase4/battle-point-placeholder.webp",
});

export const PHASE4_PREVIEW_ENABLED =
  process.env.NEXT_PUBLIC_PHASE4_PREVIEW === "true";

// Static for this preview batch. Client-confirmed scheduling is intentionally deferred.
export const NATIONAL_DAY_CHROME_ENABLED = true;

// Event window from the client deck: 31/8 00:00 – 16/9 23:59 GMT+8. The label
// is the client's approved copy and is kept verbatim rather than derived.
export const PHASE4_EVENT = Object.freeze({
  badge: "EVENT",
  periodLabel: "31 Aug - 16 Sep 2026",
  startsAt: Date.parse("2026-08-31T00:00:00+08:00"),
  endsAt: Date.parse("2026-09-16T23:59:59+08:00"),
});

// Requirement 6 — Top Turnover gets its own maintenance switch, separate from
// the shared /leaderboard/status one that gates the other three boards. Mocked
// as a constant until the backend endpoint and its admin control exist.
export const TURNOVER_MAINTENANCE = false;
