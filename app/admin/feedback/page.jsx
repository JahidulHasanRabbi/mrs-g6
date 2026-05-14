"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import { LoadingState } from "../../components/ui/LoadingState";
import * as adminApi from "../../api/adminApi";

const PAGE_SIZE = 10;

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const SortIcon = ({ active, direction }) => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" className="ml-1 inline-block">
    <path d="M5 0L9 5H1L5 0Z" fill="currentColor" opacity={active && direction === "asc" ? "1" : "0.4"} />
    <path d="M5 14L1 9H9L5 14Z" fill="currentColor" opacity={active && direction === "desc" ? "1" : "0.4"} />
  </svg>
);

export default function FeedbackPage() {
  return (
    <AdminRouteGuard>
      <FeedbackContent />
    </AdminRouteGuard>
  );
}

function FeedbackContent() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState("created");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getMemberFeedback();
      setFeedbackList(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error('Failed to load feedback:', err);
      setFeedbackList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedRows = useMemo(() => {
    const list = [...feedbackList];
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortKey === "created") {
          return (new Date(va) - new Date(vb)) * mul;
        }
        return String(va).localeCompare(String(vb)) * mul;
      });
    }
    return list;
  }, [feedbackList, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const pageRows = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  };

  return (
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:pl-[388px] xl:pr-10 xl:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className=" font-bold text-[22px] sm:text-[28px] text-white">
          Member Feedback
        </h1>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e9af41"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>

      <LoadingState isLoading={isLoading}>
        {/* Table card */}
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-4">
          {/* Title */}
          <p className=" font-bold text-[18px] sm:text-[20px] text-white capitalize">
            All Member Feedback
          </p>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-admin rounded-lg">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-black rounded-t-[6px]">
                  <th
                    className="min-w-[60px] px-3 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors"
                    onClick={() => handleSort("rowNum")}
                  >
                    <div className="flex items-center">
                      <span className=" font-bold text-[14px] sm:text-[16px] text-white whitespace-nowrap">
                        No
                      </span>
                    </div>
                  </th>
                  <th
                    className="min-w-[150px] px-3 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors"
                    onClick={() => handleSort("phone_number")}
                  >
                    <div className="flex items-center">
                      <span className=" font-bold text-[14px] sm:text-[16px] text-white whitespace-nowrap">
                        Phone Number
                      </span>
                      <SortIcon active={sortKey === "phone_number"} direction={sortDir} />
                    </div>
                  </th>
                  <th
                    className="min-w-[180px] px-3 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors"
                    onClick={() => handleSort("created")}
                  >
                    <div className="flex items-center">
                      <span className=" font-bold text-[14px] sm:text-[16px] text-white whitespace-nowrap">
                        Date & Time
                      </span>
                      <SortIcon active={sortKey === "created"} direction={sortDir} />
                    </div>
                  </th>
                  <th className="min-w-[400px] px-3 py-3 text-left">
                    <span className=" font-bold text-[14px] sm:text-[16px] text-white">
                      Feedback
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-white/40"
                    >
                      No feedback received yet.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, idx) => (
                    <tr
                      key={row.uuid}
                      className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Row number */}
                      <td className="px-3 py-3 text-[14px] text-white whitespace-nowrap">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      {/* Phone Number */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {row.phone_number}
                      </td>
                      {/* Date & Time */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {formatDateTime(row.created)}
                      </td>
                      {/* Feedback */}
                      <td className="px-3 py-3 text-[14px] text-white/80">
                        <div className="max-w-[400px] whitespace-pre-wrap break-words">
                          {row.feedback}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-[14px]"
            >
              Previous
            </button>
            <span className="px-4 text-[14px] text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-[14px]"
            >
              Next
            </button>
          </div>
        </div>
      </LoadingState>
    </main>
  );
}
