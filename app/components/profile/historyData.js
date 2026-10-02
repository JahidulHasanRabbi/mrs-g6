"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMemberTokenHistory, getMemberRewardHistory, getAvatarBattlePointHistory, getBossWarPointHistory } from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";

export const HISTORY_PAGE_SIZE = 6;

export function formatHistoryDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// The three balances live behind three endpoints, none of which can page across the others.
const ACTIVITY_LABELS = {
  LUCKYSPIN: "Lucky Spin",
  "LUCKY-SPIN": "Lucky Spin",
  "TOP-UP": "Top-up",
  "CHECK-IN": "Check-in",
  "PENALTY-KICK": "Penalty Kick",
  "SMASH-EGG": "Smash Egg",
  "BOSS-BATTLE": "Boss War",
};

export function formatActivity(raw) {
  const key = String(raw ?? "").trim().toUpperCase();
  if (!key) return "—";
  if (ACTIVITY_LABELS[key]) return ACTIVITY_LABELS[key];
  return key.toLowerCase().replace(/(^|[-_\s])(\w)/g, (_, sep, ch) => (sep ? " " : "") + ch.toUpperCase());
}

// Each source's rows arrive newest-first. amount is normalised to signed.
const POINT_SOURCES = [
  {
    pointType: "KR Coins",
    fetch: (uuid, params) => getMemberTokenHistory(uuid, params),
    activity: (r) => r.category,
    amount: (r) => Number(r.amount),
  },
  {
    pointType: "Battle Point",
    fetch: (_uuid, params) => getAvatarBattlePointHistory(params),
    activity: (r) => r.category,
    // The API already negates REDEEM (2) and LOSS (5), same as the coin ledger.
    amount: (r) => Number(r.amount),
  },
  {
    pointType: "Attack Point",
    fetch: (uuid, params) => getBossWarPointHistory(uuid, params),
    activity: (r) => r.reason_type,
    // Unlike the other two ledgers this one returns the raw amount: REDEEM and LOSS subtract,
    // EARN and ADJUST add (SET resets the balance and is shown as stored).
    amount: (r) => (r.type === "REDEEM" || r.type === "LOSS" ? -Number(r.amount) : Number(r.amount)),
  },
];

/**
 * One date-ordered "KR Coins & Points" feed. Each source is read forward only as far as the
 * requested page needs (every source's first N rows contain the merged first N), then merged.
 * Returns fetchPage(uuid, page, pageSize) -> { results, count }; page 1 starts fresh.
 */
export function createCoinsPointsHistory() {
  let state = [];
  const reset = () => {
    state = POINT_SOURCES.map(() => ({ rows: [], next: 1, count: 0, done: false }));
  };
  reset();

  async function fill(uuid, i, needed) {
    const s = state[i];
    const src = POINT_SOURCES[i];
    while (!s.done && s.rows.length < needed) {
      let res;
      try {
        res = await src.fetch(uuid, { page: s.next, page_size: 100 });
      } catch (err) {
        // Coins are the baseline; points sources fail soft so one 404 doesn't blank the table.
        if (i === 0) throw err;
        s.done = true;
        break;
      }
      const results = res?.results || [];
      s.rows.push(
        ...results.map((r) => ({
          id: `${src.pointType}-${r.uuid || r.id}`,
          created: r.created,
          activity: formatActivity(src.activity(r)),
          pointType: src.pointType,
          amount: src.amount(r),
        }))
      );
      s.count = res?.count ?? s.rows.length;
      s.next += 1;
      if (!res?.next || results.length === 0) s.done = true;
    }
  }

  return async function fetchPage(uuid, page, pageSize) {
    if (page === 1) reset();
    const current = state;
    await Promise.all(current.map((_, i) => fill(uuid, i, page * pageSize)));
    const merged = current.flatMap((s) => s.rows).sort((a, b) => new Date(b.created) - new Date(a.created));
    return {
      results: merged.slice((page - 1) * pageSize, page * pageSize),
      count: current.reduce((n, s) => n + s.count, 0),
    };
  };
}

/** Page list with "ellipsis-n" markers, at most 7 slots. */
export function getHistoryPageNumbers(currentPage, totalPages) {
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("ellipsis-1", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1, "ellipsis-1");
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, "ellipsis-1", currentPage - 1, currentPage, currentPage + 1, "ellipsis-2", totalPages);
  }
  return pages;
}

/** Paged KR Coin ("token") or reward history for the signed-in member. */
export function useHistoryPage(type, pageSize = HISTORY_PAGE_SIZE, fetchTokenPage) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  // Only the latest request may write state; a slow earlier tab/page must not win.
  const requestId = useRef(0);

  const fetchHistory = useCallback(async (page) => {
    const uuid = tokenStorage.getMemberUuid();
    if (!uuid) return;

    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: pageSize };
      const res = type === "token"
        ? await (fetchTokenPage ? fetchTokenPage(uuid, page, pageSize) : getMemberTokenHistory(uuid, params))
        : await getMemberRewardHistory(uuid, params);
      if (id !== requestId.current) return;
      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      if (id !== requestId.current) return;
      console.error("Failed to load history:", err);
      setRows([]);
      setError(err?.message || "Failed to load history");
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  }, [type, pageSize, fetchTokenPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchHistory(1);
  }, [type, fetchHistory]);

  const goToPage = (page) => {
    setCurrentPage(page);
    fetchHistory(page);
  };

  return {
    rows,
    loading,
    hasLoaded,
    error,
    retry: () => fetchHistory(currentPage),
    currentPage,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    goToPage,
  };
}
