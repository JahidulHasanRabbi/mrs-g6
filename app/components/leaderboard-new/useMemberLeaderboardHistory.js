"use client";

import { useEffect, useState } from "react";
import { getMemberLeaderboardHistory } from "../../api/memberApi";
import { LEADERBOARD_TYPES } from "./constants";
export const HISTORY_PAGE_SIZE = 10;

// activeTab -> `type` filter of GET /leaderboard/member/<uuid>/history/.
const HISTORY_TYPE = {
  [LEADERBOARD_TYPES.DEPOSIT]: 1,
  [LEADERBOARD_TYPES.WITHDRAWAL]: 2,
  [LEADERBOARD_TYPES.REFERRER]: 3,
  [LEADERBOARD_TYPES.TURNOVER]: 4,
};

export function formatHistoryDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Paid leaderboard rewards of `memberUuid` for one board. Resets to page 1 when
 * the board changes. Returns { rows, total, loading, failed, page, setPage }.
 */
export default function useMemberLeaderboardHistory(memberUuid, board) {
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ rows: [], total: 0, loading: true, failed: false });

  useEffect(() => {
    setPage(1);
  }, [board, memberUuid]);

  useEffect(() => {
    if (!memberUuid) {
      setState({ rows: [], total: 0, loading: false, failed: false });
      return undefined;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, failed: false }));
    getMemberLeaderboardHistory(memberUuid, {
      type: HISTORY_TYPE[board],
      page,
      page_size: HISTORY_PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res) ? res : res?.results ?? [];
        setState({ rows, total: Number(res?.count ?? rows.length), loading: false, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ rows: [], total: 0, loading: false, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [memberUuid, board, page]);

  return { ...state, page, setPage };
}
