"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";

const PAGE_SIZE = 8;

// TODO (Backend): replace with real token report API response.
// Source confirmed from PDFs + Figma: phone number, username, station,
// date/time, category, token details, amount +/-.
const MOCK_TOKEN_REPORT = [
  {
    id: 1,
    phoneNumber: "+60123456789",
    username: "John88",
    station: "Station A",
    dateTime: "30.04.2026 8:00 PM",
    timestamp: "2026-04-30T20:00:00",
    category: "Deposit Bonus",
    tokenDetails: "Here are the details",
    amount: 10000,
  },
  {
    id: 2,
    phoneNumber: "+60123456789",
    username: "John88",
    station: "Station A",
    dateTime: "30.04.2026 7:35 PM",
    timestamp: "2026-04-30T19:35:00",
    category: "Check-In",
    tokenDetails: "Daily attendance reward",
    amount: 300,
  },
  {
    id: 3,
    phoneNumber: "+60129877654",
    username: "AceKing99",
    station: "Station B",
    dateTime: "30.04.2026 6:55 PM",
    timestamp: "2026-04-30T18:55:00",
    category: "Spin Reward",
    tokenDetails: "Lucky spin tier reward",
    amount: 2500,
  },
  {
    id: 4,
    phoneNumber: "+60125678901",
    username: "LuckyDraw01",
    station: "Station C",
    dateTime: "30.04.2026 5:20 PM",
    timestamp: "2026-04-30T17:20:00",
    category: "Adjustment",
    tokenDetails: "Manual token reconciliation",
    amount: -1200,
  },
  {
    id: 5,
    phoneNumber: "+60126789012",
    username: "SpinMaster",
    station: "Station A",
    dateTime: "29.04.2026 10:15 PM",
    timestamp: "2026-04-29T22:15:00",
    category: "Deposit Bonus",
    tokenDetails: "Weekend reload bonus",
    amount: 5000,
  },
  {
    id: 6,
    phoneNumber: "+60127890123",
    username: "QueenBee",
    station: "Station D",
    dateTime: "29.04.2026 8:00 PM",
    timestamp: "2026-04-29T20:00:00",
    category: "Birthday Token",
    tokenDetails: "Birthday free token pack",
    amount: 888,
  },
  {
    id: 7,
    phoneNumber: "+60128901234",
    username: "RoyalFlush",
    station: "Station A",
    dateTime: "29.04.2026 6:42 PM",
    timestamp: "2026-04-29T18:42:00",
    category: "Redemption",
    tokenDetails: "Mart item exchange",
    amount: -1800,
  },
  {
    id: 8,
    phoneNumber: "+60129012345",
    username: "Dragon777",
    station: "Station B",
    dateTime: "29.04.2026 3:50 PM",
    timestamp: "2026-04-29T15:50:00",
    category: "Upgrade Bonus",
    tokenDetails: "VIP tier upgrade reward",
    amount: 3200,
  },
  {
    id: 9,
    phoneNumber: "+60120123456",
    username: "BetBoss",
    station: "Station E",
    dateTime: "28.04.2026 9:00 PM",
    timestamp: "2026-04-28T21:00:00",
    category: "Check-In",
    tokenDetails: "Daily attendance reward",
    amount: 300,
  },
  {
    id: 10,
    phoneNumber: "+60121234567",
    username: "MightyFox",
    station: "Station C",
    dateTime: "28.04.2026 4:18 PM",
    timestamp: "2026-04-28T16:18:00",
    category: "Spin Reward",
    tokenDetails: "Special reel completion",
    amount: 1450,
  },
  {
    id: 11,
    phoneNumber: "+60122345678",
    username: "Nova88",
    station: "Station D",
    dateTime: "28.04.2026 2:30 PM",
    timestamp: "2026-04-28T14:30:00",
    category: "Adjustment",
    tokenDetails: "Expired bonus reversal",
    amount: -500,
  },
  {
    id: 12,
    phoneNumber: "+60123451234",
    username: "SilverAce",
    station: "Station A",
    dateTime: "27.04.2026 11:10 AM",
    timestamp: "2026-04-27T11:10:00",
    category: "Deposit Bonus",
    tokenDetails: "First deposit campaign",
    amount: 2200,
  },
];

const TABLE_COLUMNS = [
  { key: "phoneNumber", label: "Phone Number", className: "w-[170px]" },
  { key: "username", label: "Username", className: "w-[180px]" },
  { key: "station", label: "Station", className: "w-[180px]" },
  { key: "dateTime", label: "Date/Time", className: "w-[255px]" },
  { key: "category", label: "Category", className: "w-[220px]" },
  { key: "tokenDetails", label: "Token Details", className: "w-[260px]" },
  { key: "amount", label: "Amount +/-", className: "w-[160px] text-right" },
];

const DATE_OPTIONS = [
  { value: "all", label: "Date/Time" },
  { value: "today", label: "Today" },
  { value: "last-2-days", label: "Last 2 Days" },
  { value: "positive", label: "Positive Only" },
  { value: "negative", label: "Negative Only" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "Category" },
  { value: "Deposit Bonus", label: "Deposit Bonus" },
  { value: "Check-In", label: "Check-In" },
  { value: "Spin Reward", label: "Spin Reward" },
  { value: "Adjustment", label: "Adjustment" },
  { value: "Birthday Token", label: "Birthday Token" },
  { value: "Upgrade Bonus", label: "Upgrade Bonus" },
  { value: "Redemption", label: "Redemption" },
];

const TOKEN_DETAIL_OPTIONS = [
  { value: "all", label: "Token Details" },
  { value: "reward", label: "Reward Related" },
  { value: "bonus", label: "Bonus Related" },
  { value: "adjustment", label: "Adjustment Related" },
];

const STATION_OPTIONS = [
  { value: "all", label: "Station" },
  { value: "Station A", label: "Station A" },
  { value: "Station B", label: "Station B" },
  { value: "Station C", label: "Station C" },
  { value: "Station D", label: "Station D" },
  { value: "Station E", label: "Station E" },
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

function FilterSelect({ value, onChange, options, leadingIcon = false }) {
  return (
    <div className="relative h-9 shrink-0 overflow-hidden rounded-[4px] border border-[#d69324] bg-[linear-gradient(180deg,#f6c65c_0%,#dd9526_100%)]">
      {leadingIcon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      )}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-full appearance-none bg-transparent pr-9 text-[14px] text-black outline-none font-['Times_New_Roman'] ${leadingIcon ? "pl-9" : "pl-3"}`}
      >
        {options.map((option) => (
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

function FilterInput({ value, onChange, placeholder, className = "w-[154px]" }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${className} h-9 rounded-[4px] border border-[#d69324] bg-[linear-gradient(180deg,#f6c65c_0%,#dd9526_100%)] px-3 text-[14px] italic text-[#1d1d1d] placeholder:text-[#5f4214] outline-none font-['Times_New_Roman']`}
    />
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = [];

  if (totalPages <= 4) {
    for (let page = 1; page <= totalPages; page += 1) {
      pageNumbers.push(page);
    }
  } else {
    pageNumbers.push(1);
    const middleStart = Math.max(2, currentPage - 1);
    const middleEnd = Math.min(totalPages - 1, currentPage + 1);

    if (middleStart > 2) {
      pageNumbers.push("ellipsis-left");
    }

    for (let page = middleStart; page <= middleEnd; page += 1) {
      pageNumbers.push(page);
    }

    if (middleEnd < totalPages - 1) {
      pageNumbers.push("ellipsis-right");
    }

    pageNumbers.push(totalPages);
  }

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
        {pageNumbers.map((item) => {
          if (typeof item === "string") {
            return (
              <span key={item} className="text-white/45">
                ...
              </span>
            );
          }

          const active = item === currentPage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={active ? "font-bold text-[#f4bf55]" : "transition hover:text-white"}
            >
              {item}
            </button>
          );
        })}
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

function formatAmount(amount) {
  const formattedNumber = Math.abs(amount).toLocaleString("en-MY");

  if (amount === 0) {
    return "0";
  }

  return `${amount > 0 ? "+" : "-"}${formattedNumber}`;
}

function compareRows(a, b, sortConfig) {
  const { key, direction } = sortConfig;
  const multiplier = direction === "asc" ? 1 : -1;

  if (key === "amount") {
    return (a.amount - b.amount) * multiplier;
  }

  if (key === "dateTime") {
    return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * multiplier;
  }

  return a[key].localeCompare(b[key]) * multiplier;
}

function TokenReportContent() {
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [detailFilter, setDetailFilter] = useState("all");
  const [usernameQuery, setUsernameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "dateTime", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);

  const latestTime = useMemo(() => {
    return Math.max(...MOCK_TOKEN_REPORT.map((item) => new Date(item.timestamp).getTime()));
  }, []);

  const filteredRows = useMemo(() => {
    return MOCK_TOKEN_REPORT.filter((row) => {
      const matchesCategory = categoryFilter === "all" || row.category === categoryFilter;
      const matchesStation = stationFilter === "all" || row.station === stationFilter;
      const matchesUsername = row.username.toLowerCase().includes(usernameQuery.trim().toLowerCase());
      const matchesPhone = row.phoneNumber.toLowerCase().includes(phoneQuery.trim().toLowerCase());

      const detailText = row.tokenDetails.toLowerCase();
      const matchesDetail =
        detailFilter === "all" ||
        (detailFilter === "reward" && detailText.includes("reward")) ||
        (detailFilter === "bonus" && detailText.includes("bonus")) ||
        (detailFilter === "adjustment" && (detailText.includes("adjustment") || detailText.includes("reversal") || detailText.includes("reconciliation")));

      const rowDate = new Date(row.timestamp);
      const latestDate = new Date(latestTime);
      const oneDayAgo = new Date(latestDate);
      oneDayAgo.setDate(latestDate.getDate() - 1);

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && rowDate.toDateString() === latestDate.toDateString()) ||
        (dateFilter === "last-2-days" && rowDate >= oneDayAgo) ||
        (dateFilter === "positive" && row.amount > 0) ||
        (dateFilter === "negative" && row.amount < 0);

      return matchesCategory && matchesStation && matchesUsername && matchesPhone && matchesDetail && matchesDate;
    });
  }, [categoryFilter, dateFilter, detailFilter, latestTime, phoneQuery, stationFilter, usernameQuery]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => compareRows(a, b, sortConfig));
  }, [filteredRows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, categoryFilter, detailFilter, usernameQuery, phoneQuery, stationFilter]);

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
        direction: key === "amount" ? "desc" : "asc",
      };
    });
  };

  return (
    <main className="min-h-screen pl-[388px] pr-10 pt-8 pb-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-['Times_New_Roman'] text-[30px] font-bold leading-none text-white">
              Token Report
            </h1>
            <p className="mt-2 font-['Times_New_Roman'] text-[14px] text-white/55">
              Frontend-only report layout based on the approved Phase 1 enhancement spec.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0a744] bg-[rgba(233,175,65,0.08)] text-[#e9af41] shadow-[0_0_24px_rgba(233,175,65,0.18)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>

        <section className="overflow-hidden rounded-[12px] border border-[rgba(255,255,132,0.18)] bg-[linear-gradient(180deg,rgba(28,48,31,0.98)_0%,rgba(24,44,28,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="border-b border-white/5 px-4 pt-4 pb-3">
            <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap xl:gap-4">
              <h2 className="mr-auto whitespace-nowrap font-['Times_New_Roman'] text-[15px] font-bold text-[#f4efe0] sm:text-[16px] lg:text-[17px]">
                The Token Reports Are Given
              </h2>

              <span className="whitespace-nowrap font-['Times_New_Roman'] text-[13px] text-[#d6d6d6]">
                Filter By:
              </span>

              <FilterSelect value={dateFilter} onChange={setDateFilter} options={DATE_OPTIONS} leadingIcon />
              <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={CATEGORY_OPTIONS} />
              <FilterSelect value={detailFilter} onChange={setDetailFilter} options={TOKEN_DETAIL_OPTIONS} />
              <FilterInput value={usernameQuery} onChange={setUsernameQuery} placeholder="Enter Username" />
              <FilterInput value={phoneQuery} onChange={setPhoneQuery} placeholder="Enter Phone Number" className="w-[188px]" />
              <FilterSelect value={stationFilter} onChange={setStationFilter} options={STATION_OPTIONS} />
            </div>
          </div>

          <div className="overflow-x-auto">
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
                          className={`flex w-full items-center ${column.key === "amount" ? "justify-end" : "justify-start"}`}
                        >
                          <span className="font-['Times_New_Roman'] text-[14px] font-bold text-white whitespace-nowrap">
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
                  paginatedRows.map((row) => {
                    const amountTone = row.amount >= 0 ? "text-[#f0f0f0]" : "text-[#ffb0a0]";

                    return (
                      <tr key={row.id} className="border-b border-[rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.03]">
                        <td className="px-4 py-[14px] first:pl-5 font-['Times_New_Roman'] text-[13px] text-[#f1f1f1] whitespace-nowrap">
                          {row.phoneNumber}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#f1f1f1] whitespace-nowrap">
                          {row.username}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#e8e8e8] whitespace-nowrap">
                          {row.station}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#e8e8e8] whitespace-nowrap">
                          {row.dateTime}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#ece9dc] whitespace-nowrap">
                          {row.category}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#dadada]">
                          {row.tokenDetails}
                        </td>
                        <td className={`px-4 py-[14px] pr-5 text-right font-['Times_New_Roman'] text-[13px] font-semibold whitespace-nowrap ${amountTone}`}>
                          {formatAmount(row.amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-5 py-12 text-center font-['Times_New_Roman'] text-[14px] text-white/60"
                    >
                      No token report rows match the current filters.
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

export default function TokenReportPage() {
  return (
    <AdminRouteGuard>
      <TokenReportContent />
    </AdminRouteGuard>
  );
}
