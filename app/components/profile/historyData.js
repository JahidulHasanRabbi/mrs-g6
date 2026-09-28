"use client";

import { useCallback, useEffect, useState } from "react";
import { getMemberTokenHistory, getMemberRewardHistory } from "../../api/memberApi";
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
export function useHistoryPage(type, pageSize = HISTORY_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (page) => {
    const uuid = tokenStorage.getMemberUuid();
    if (!uuid) return;

    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      const res = type === "token"
        ? await getMemberTokenHistory(uuid, params)
        : await getMemberRewardHistory(uuid, params);
      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error("Failed to load history:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [type, pageSize]);

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
    currentPage,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    goToPage,
  };
}
