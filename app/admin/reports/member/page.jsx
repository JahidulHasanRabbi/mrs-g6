"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";

const PAGE_SIZE = 9;

function buildRow(no, dateTime, timestamp, newMembers, totalMembers, activeMembers, tokenIssued) {
  return {
    no,
    dateTime,
    timestamp,
    newMembers,
    totalMembers,
    activeMembers,
    tokenIssued,
  };
}

// TODO (Backend): replace with real daily/monthly/yearly member report APIs.
// Source confirmed from PDFs + Figma: date/time, new member, total member,
// active members, token issued.
const MOCK_MEMBER_REPORT = [
  buildRow(1, "30.04.2026 8:00 PM", "2026-04-30T20:00:00", 300, 5000, 12000, 45646),
  buildRow(2, "01.05.2026 9:00 AM", "2026-05-01T09:00:00", 250, 6000, 15000, 45646),
  buildRow(3, "02.05.2026 10:30 AM", "2026-05-02T10:30:00", 400, 7000, 18000, 45646),
  buildRow(4, "03.05.2026 11:00 AM", "2026-05-03T11:00:00", 350, 8000, 14000, 45646),
  buildRow(5, "04.05.2026 3:00 PM", "2026-05-04T15:00:00", 500, 9000, 16000, 45646),
  buildRow(6, "05.05.2026 4:30 PM", "2026-05-05T16:30:00", 450, 4000, 17000, 45646),
  buildRow(7, "06.05.2026 5:45 PM", "2026-05-06T17:45:00", 600, 10000, 19000, 45646),
  buildRow(8, "07.05.2026 6:15 PM", "2026-05-07T18:15:00", 700, 11000, 20000, 45646),
  buildRow(9, "08.05.2026 7:00 PM", "2026-05-08T19:00:00", 820, 11800, 21000, 50120),
  buildRow(10, "09.05.2026 10:10 AM", "2026-05-09T10:10:00", 410, 12200, 19800, 48720),
  buildRow(11, "10.05.2026 1:20 PM", "2026-05-10T13:20:00", 360, 12800, 20500, 49800),
  buildRow(12, "11.05.2026 9:40 AM", "2026-05-11T09:40:00", 520, 13500, 22300, 51260),
  buildRow(13, "12.05.2026 8:30 PM", "2026-05-12T20:30:00", 610, 14200, 23100, 52040),
  buildRow(14, "13.05.2026 6:50 PM", "2026-05-13T18:50:00", 480, 14950, 24400, 53480),
  buildRow(15, "14.05.2026 2:15 PM", "2026-05-14T14:15:00", 560, 15600, 25750, 54920),
  buildRow(16, "15.05.2026 11:35 AM", "2026-05-15T11:35:00", 640, 16420, 26810, 55880),
  buildRow(17, "16.05.2026 5:05 PM", "2026-05-16T17:05:00", 715, 17230, 28140, 57240),
  buildRow(18, "17.05.2026 7:25 PM", "2026-05-17T19:25:00", 780, 18010, 29550, 58760),
  buildRow(19, "18.05.2026 10:05 AM", "2026-05-18T10:05:00", 835, 18900, 30920, 60340),
  buildRow(20, "19.05.2026 4:45 PM", "2026-05-19T16:45:00", 890, 19780, 32680, 64520),
  buildRow(21, "20.05.2026 8:45 PM", "2026-05-20T20:45:00", 930, 20500, 34800, 68950),
];

const TABLE_COLUMNS = [
  { key: "no", label: "No", className: "w-[88px]" },
  { key: "dateTime", label: "Date/Time", className: "w-[300px]" },
  { key: "newMembers", label: "New Member", className: "w-[220px]" },
  { key: "totalMembers", label: "Total Member", className: "w-[260px]" },
  { key: "activeMembers", label: "Active Members", className: "w-[260px]" },
  { key: "tokenIssued", label: "Token Issued", className: "w-[260px] text-right" },
];

const DATE_OPTIONS = [
  { value: "all", label: "Select Date" },
  { value: "latest-7", label: "Latest 7 Days" },
  { value: "this-month", label: "This Month" },
  { value: "this-year", label: "This Year" },
];

function SortIcon({ active, direction }) {
  const stroke = active ? "#ffffff" : "rgba(255,255,255,0.55)";

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1 shrink-0">
      <path
        d="M4 5L7 2L10 5"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={!active || direction === "asc" ? 1 : 0.35}
      />
      <path
        d="M4 9L7 12L10 9"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={!active || direction === "desc" ? 1 : 0.35}
      />
    </svg>
  );
}

function DateFilter({ value, onChange }) {
  return (
    <div className="relative h-9 shrink-0 overflow-hidden rounded-[4px] border border-[#d69324] bg-[linear-gradient(180deg,#f6c65c_0%,#dd9526_100%)]">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full appearance-none bg-transparent pl-9 pr-9 font-['Times_New_Roman'] text-[14px] text-black outline-none"
      >
        {DATE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const visiblePages = Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1);

  return (
    <div className="flex items-center justify-end gap-[16px] px-4 pb-3 pt-1 font-['Times_New_Roman'] text-[11px] text-white/80">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="transition hover:text-white disabled:cursor-not-allowed disabled:text-white/35"
      >
        Previous
      </button>

      <div className="flex items-center gap-[16px]">
        {visiblePages.map((page) => {
          const active = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={active ? "font-bold text-[#f4bf55]" : "transition hover:text-white"}
            >
              {page}
            </button>
          );
        })}

        {totalPages > 3 ? <span className="text-white/45">...</span> : null}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="transition hover:text-white disabled:cursor-not-allowed disabled:text-white/35"
      >
        Next
      </button>
    </div>
  );
}

function compareRows(a, b, sortConfig) {
  const { key, direction } = sortConfig;
  const multiplier = direction === "asc" ? 1 : -1;

  if (key === "dateTime") {
    return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * multiplier;
  }

  return (a[key] - b[key]) * multiplier;
}

function formatNumber(value) {
  return value.toLocaleString("en-MY");
}

function MemberReportContent() {
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "no", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  const latestTime = useMemo(() => {
    return Math.max(...MOCK_MEMBER_REPORT.map((item) => new Date(item.timestamp).getTime()));
  }, []);

  const filteredRows = useMemo(() => {
    return MOCK_MEMBER_REPORT.filter((row) => {
      if (dateFilter === "all") {
        return true;
      }

      const rowDate = new Date(row.timestamp);
      const latestDate = new Date(latestTime);

      if (dateFilter === "latest-7") {
        const sevenDaysAgo = new Date(latestDate);
        sevenDaysAgo.setDate(latestDate.getDate() - 6);
        return rowDate >= sevenDaysAgo;
      }

      if (dateFilter === "this-month") {
        return rowDate.getMonth() === latestDate.getMonth() && rowDate.getFullYear() === latestDate.getFullYear();
      }

      if (dateFilter === "this-year") {
        return rowDate.getFullYear() === latestDate.getFullYear();
      }

      return true;
    });
  }, [dateFilter, latestTime]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => compareRows(a, b, sortConfig));
  }, [filteredRows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, sortedRows]);

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: key === "no" ? "asc" : "desc",
      };
    });
  };

  return (
    <main className="min-h-screen pl-[388px] pr-10 pt-8 pb-10">
        <section className="overflow-hidden rounded-[12px] border border-[rgba(255,255,132,0.18)] bg-[linear-gradient(180deg,rgba(28,48,31,0.98)_0%,rgba(24,44,28,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between gap-4 px-4 pb-4 pt-4">
            <h1 className="font-['Times_New_Roman'] text-[30px] font-bold leading-none text-[#f4efe0]">
              Member Report
            </h1>

            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap font-['Times_New_Roman'] text-[13px] text-[#d6d6d6]">
                Filter By:
              </span>
              <DateFilter value={dateFilter} onChange={setDateFilter} />
            </div>
          </div>

          <div className="overflow-x-auto border-t border-white/5">
            <table className="min-w-[1472px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-black">
                  {TABLE_COLUMNS.map((column) => {
                    const active = sortConfig.key === column.key;

                    return (
                      <th key={column.key} className={`${column.className} px-4 py-[14px] first:pl-5 last:pr-5`}>
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          className={`flex w-full items-center ${column.key === "tokenIssued" ? "justify-end" : "justify-start"}`}
                        >
                          <span className="whitespace-nowrap font-['Times_New_Roman'] text-[14px] font-bold text-white">
                            {column.label}
                          </span>
                          <SortIcon active={active} direction={sortConfig.direction} />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <tr key={row.no} className="border-b border-[rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-[14px] first:pl-5 font-['Times_New_Roman'] text-[13px] text-[#f1f1f1] whitespace-nowrap">
                        {row.no}
                      </td>
                      <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#f1f1f1] whitespace-nowrap">
                        {row.dateTime}
                      </td>
                      <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#ece9dc] whitespace-nowrap">
                        {formatNumber(row.newMembers)}
                      </td>
                      <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#ece9dc] whitespace-nowrap">
                        {formatNumber(row.totalMembers)}
                      </td>
                      <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#ece9dc] whitespace-nowrap">
                        {formatNumber(row.activeMembers)}
                      </td>
                      <td className="px-4 py-[14px] pr-5 text-right font-['Times_New_Roman'] text-[13px] text-[#f1f1f1] whitespace-nowrap">
                        {formatNumber(row.tokenIssued)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-5 py-12 text-center font-['Times_New_Roman'] text-[14px] text-white/60"
                    >
                      No member report rows match the selected date filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </section>
    </main>
  );
}

export default function MemberReportPage() {
  return (
    <AdminRouteGuard>
      <MemberReportContent />
    </AdminRouteGuard>
  );
}
