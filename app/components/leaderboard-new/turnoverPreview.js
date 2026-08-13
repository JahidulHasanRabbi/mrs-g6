import { formatAmount } from "./format";
import { LEADERBOARD_TYPES } from "./constants";
import { PHASE4_EVENT } from "../../config/phase4";

/**
 * Mock data standing in for the Phase 4 backend (Excel rows 4, 5, 6 and the My
 * Rank rows 9-13). Everything here is fabricated and only reachable while
 * NEXT_PUBLIC_PHASE4_PREVIEW is "true"; every surface that renders it is
 * labelled so mock numbers can't be mistaken for live ranking results.
 *
 * Delete this module once the real endpoints land.
 */

const TURNOVER_VALUES = [
  982450, 913820, 867340, 824700, 790150, 755460, 721900, 689210, 657880, 624540,
  593760, 561330, 529840, 498120, 466950, 435670, 404280, 373510, 342760, 312480,
];

// Ranks are pre-sorted here purely as fixture data. Real ordering — including
// the client's tie rule, where equal totals are settled by whoever reached the
// amount first and then by system record order — is the backend's to apply.
const entries = TURNOVER_VALUES.map((value, index) => ({
  rank: index + 1,
  user: `M********${String(index + 1).padStart(2, "0")}`,
  value: formatAmount(value),
  prize: "",
}));

// Row 5: only turnover inside the event window counts. With no backend to do
// the filtering, the board at least counts down against the real window —
// before 31/8 that's a countdown to the opening, after it a countdown to close.
const eventNotStarted = Date.now() < PHASE4_EVENT.startsAt;

export const TURNOVER_EVENT_COUNTDOWN = Object.freeze({
  endDate: eventNotStarted ? PHASE4_EVENT.startsAt : PHASE4_EVENT.endsAt,
  label: eventNotStarted ? "EVENT STARTS IN" : "EVENT ENDS IN",
});

/**
 * The three My Rank states the client specified on 13/08, so each can be
 * reviewed without editing code: append ?myrank=top or ?myrank=unranked to the
 * leaderboard URL while the preview flag is on. Default is the mid-table case.
 */
export const PREVIEW_MY_RANK_STATES = Object.freeze({
  top: { rank: 1, value: 982450, progressPercent: 100, isMock: true },
  unranked: { rank: 0, value: 0, progressPercent: 0, isMock: true },
});

export const TURNOVER_PREVIEW_BOARD = Object.freeze({
  top3: entries.slice(0, 3),
  table: entries.slice(3),
  endDate: TURNOVER_EVENT_COUNTDOWN.endDate,
  notes: [],
  terms: [],
  infoTerms: [],
  myRank: {
    rank: 186,
    value: 25680,
    amountToNextRank: 1250,
    nextRank: 185,
    progressPercent: 68,
    isMock: true,
  },
});

/**
 * Rows 9-13: the client confirmed My Rank belongs on all four boards, but only
 * Turnover has data to drive it. These stand in for the other three so the
 * section can be reviewed everywhere it will ship — the table above them stays
 * live API data, so the panel tags itself as preview.
 */
export const PREVIEW_MY_RANK = Object.freeze({
  [LEADERBOARD_TYPES.DEPOSIT]: {
    rank: 186,
    value: 25680,
    amountToNextRank: 1250,
    nextRank: 185,
    progressPercent: 68,
    isMock: true,
  },
  [LEADERBOARD_TYPES.WITHDRAWAL]: {
    rank: 92,
    value: 14320,
    amountToNextRank: 780,
    nextRank: 91,
    progressPercent: 45,
    isMock: true,
  },
  [LEADERBOARD_TYPES.REFERRER]: {
    rank: 47,
    value: 12,
    amountToNextRank: 3,
    nextRank: 46,
    progressPercent: 80,
    isMock: true,
  },
});
