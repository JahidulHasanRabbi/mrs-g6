"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import Image from "next/image";

// ── Mock data ──────────────────────────────────────────────────────────
// TODO (Backend): Replace MOCK_MEMBERS with real API call to adminApi.getMembers()
// API endpoint: GET /member/members/
// Response fields: id, uuid, phone_number, username, tier, current_tokens,
//   last_check_in_date, last_login_datetime
// Additional fields from member info: registered_date, station
const TIER_OPTIONS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const STATION_OPTIONS = [
  "KGAME99",
  "LV918",
  "Acebet77",
  "Ubetclub",
  "n1gang",
  "ep369",
];

const MOCK_MEMBERS = [
  {
    id: 1,
    uuid: "uuid-1",
    username: "John88",
    phone_number: "+6012345567",
    tier: "Bronze",
    current_tokens: 1200,
    station: "KGAME99",
    registered_date: "2026-04-30T20:00:00",
    last_check_in_date: "2026-04-30T20:00:00",
    last_login_datetime: "2026-04-30T20:00:00",
  },
  {
    id: 2,
    uuid: "uuid-2",
    username: "AceKing99",
    phone_number: "+60198765432",
    tier: "Silver",
    current_tokens: 3500,
    station: "LV918",
    registered_date: "2026-04-28T15:00:00",
    last_check_in_date: "2026-04-29T10:00:00",
    last_login_datetime: "2026-04-30T18:00:00",
  },
  {
    id: 3,
    uuid: "uuid-3",
    username: "LuckyDraw01",
    phone_number: "+60112223344",
    tier: "Gold",
    current_tokens: 8200,
    station: "Acebet77",
    registered_date: "2026-03-15T09:00:00",
    last_check_in_date: "2026-04-30T19:00:00",
    last_login_datetime: "2026-04-30T21:00:00",
  },
  {
    id: 4,
    uuid: "uuid-4",
    username: "SpinMaster",
    phone_number: "+60177889900",
    tier: "Bronze",
    current_tokens: 900,
    station: "Ubetclub",
    registered_date: "2026-04-01T12:00:00",
    last_check_in_date: "2026-04-29T17:00:00",
    last_login_datetime: "2026-04-29T20:00:00",
  },
  {
    id: 5,
    uuid: "uuid-5",
    username: "GoldRush77",
    phone_number: "+60133445566",
    tier: "Platinum",
    current_tokens: 15800,
    station: "n1gang",
    registered_date: "2025-12-10T08:30:00",
    last_check_in_date: "2026-04-30T08:00:00",
    last_login_datetime: "2026-04-30T22:00:00",
  },
  {
    id: 6,
    uuid: "uuid-6",
    username: "StarPlayer",
    phone_number: "+60144556677",
    tier: "Diamond",
    current_tokens: 42000,
    station: "ep369",
    registered_date: "2025-11-05T14:00:00",
    last_check_in_date: "2026-04-30T12:00:00",
    last_login_datetime: "2026-04-30T23:30:00",
  },
  {
    id: 7,
    uuid: "uuid-7",
    username: "CoolBet22",
    phone_number: "+60155667788",
    tier: "Silver",
    current_tokens: 2800,
    station: "KGAME99",
    registered_date: "2026-03-20T16:00:00",
    last_check_in_date: "2026-04-28T09:00:00",
    last_login_datetime: "2026-04-29T14:00:00",
  },
  {
    id: 8,
    uuid: "uuid-8",
    username: "WinnerX",
    phone_number: "+60166778899",
    tier: "Gold",
    current_tokens: 6500,
    station: "LV918",
    registered_date: "2026-02-14T10:00:00",
    last_check_in_date: "2026-04-30T15:00:00",
    last_login_datetime: "2026-04-30T20:00:00",
  },
  {
    id: 9,
    uuid: "uuid-9",
    username: "ProSpin44",
    phone_number: "+60177889901",
    tier: "Bronze",
    current_tokens: 450,
    station: "Acebet77",
    registered_date: "2026-04-25T09:00:00",
    last_check_in_date: "2026-04-27T11:00:00",
    last_login_datetime: "2026-04-28T16:00:00",
  },
  {
    id: 10,
    uuid: "uuid-10",
    username: "BigWin2026",
    phone_number: "+60188990011",
    tier: "Platinum",
    current_tokens: 19200,
    station: "Ubetclub",
    registered_date: "2025-10-01T07:00:00",
    last_check_in_date: "2026-04-30T06:00:00",
    last_login_datetime: "2026-04-30T19:00:00",
  },
  {
    id: 11,
    uuid: "uuid-11",
    username: "MegaSpin",
    phone_number: "+60199001122",
    tier: "Silver",
    current_tokens: 4100,
    station: "n1gang",
    registered_date: "2026-01-15T13:00:00",
    last_check_in_date: "2026-04-29T14:00:00",
    last_login_datetime: "2026-04-30T10:00:00",
  },
  {
    id: 12,
    uuid: "uuid-12",
    username: "TopPlayer99",
    phone_number: "+60111223345",
    tier: "Gold",
    current_tokens: 7800,
    station: "ep369",
    registered_date: "2026-02-28T11:00:00",
    last_check_in_date: "2026-04-30T16:00:00",
    last_login_datetime: "2026-04-30T21:30:00",
  },
  {
    id: 13,
    uuid: "uuid-13",
    username: "RoyalFlush",
    phone_number: "+60122334456",
    tier: "Diamond",
    current_tokens: 38500,
    station: "KGAME99",
    registered_date: "2025-09-20T10:00:00",
    last_check_in_date: "2026-04-30T07:00:00",
    last_login_datetime: "2026-04-30T18:00:00",
  },
  {
    id: 14,
    uuid: "uuid-14",
    username: "LuckyCharm",
    phone_number: "+60133445567",
    tier: "Bronze",
    current_tokens: 600,
    station: "LV918",
    registered_date: "2026-04-20T15:00:00",
    last_check_in_date: "2026-04-26T12:00:00",
    last_login_datetime: "2026-04-27T09:00:00",
  },
  {
    id: 15,
    uuid: "uuid-15",
    username: "SuperStar88",
    phone_number: "+60144556678",
    tier: "Silver",
    current_tokens: 3200,
    station: "Acebet77",
    registered_date: "2026-03-05T08:00:00",
    last_check_in_date: "2026-04-30T10:00:00",
    last_login_datetime: "2026-04-30T17:00:00",
  },
  {
    id: 16,
    uuid: "uuid-16",
    username: "KingCobra",
    phone_number: "+60155667789",
    tier: "Gold",
    current_tokens: 9100,
    station: "Ubetclub",
    registered_date: "2026-01-08T14:00:00",
    last_check_in_date: "2026-04-29T20:00:00",
    last_login_datetime: "2026-04-30T12:00:00",
  },
  {
    id: 17,
    uuid: "uuid-17",
    username: "BetMaster7",
    phone_number: "+60166778890",
    tier: "Platinum",
    current_tokens: 22000,
    station: "n1gang",
    registered_date: "2025-08-15T09:00:00",
    last_check_in_date: "2026-04-30T09:00:00",
    last_login_datetime: "2026-04-30T22:30:00",
  },
  {
    id: 18,
    uuid: "uuid-18",
    username: "Phoenix99",
    phone_number: "+60177889912",
    tier: "Bronze",
    current_tokens: 350,
    station: "ep369",
    registered_date: "2026-04-28T11:00:00",
    last_check_in_date: "2026-04-29T08:00:00",
    last_login_datetime: "2026-04-29T15:00:00",
  },
  {
    id: 19,
    uuid: "uuid-19",
    username: "DragonSpin",
    phone_number: "+60188990023",
    tier: "Silver",
    current_tokens: 2900,
    station: "KGAME99",
    registered_date: "2026-03-12T16:00:00",
    last_check_in_date: "2026-04-30T11:00:00",
    last_login_datetime: "2026-04-30T20:30:00",
  },
  {
    id: 20,
    uuid: "uuid-20",
    username: "EagleEye",
    phone_number: "+60199001134",
    tier: "Gold",
    current_tokens: 5600,
    station: "LV918",
    registered_date: "2026-02-01T10:00:00",
    last_check_in_date: "2026-04-28T15:00:00",
    last_login_datetime: "2026-04-30T09:00:00",
  },
  {
    id: 21,
    uuid: "uuid-21",
    username: "TigerLuck",
    phone_number: "+60111224456",
    tier: "Diamond",
    current_tokens: 51000,
    station: "Acebet77",
    registered_date: "2025-07-01T08:00:00",
    last_check_in_date: "2026-04-30T14:00:00",
    last_login_datetime: "2026-04-30T23:00:00",
  },
  {
    id: 22,
    uuid: "uuid-22",
    username: "NovaBet",
    phone_number: "+60122335567",
    tier: "Bronze",
    current_tokens: 780,
    station: "Ubetclub",
    registered_date: "2026-04-15T09:00:00",
    last_check_in_date: "2026-04-25T10:00:00",
    last_login_datetime: "2026-04-26T18:00:00",
  },
  {
    id: 23,
    uuid: "uuid-23",
    username: "QuantumWin",
    phone_number: "+60133446678",
    tier: "Platinum",
    current_tokens: 17500,
    station: "n1gang",
    registered_date: "2025-11-20T12:00:00",
    last_check_in_date: "2026-04-30T08:30:00",
    last_login_datetime: "2026-04-30T21:00:00",
  },
  {
    id: 24,
    uuid: "uuid-24",
    username: "BlazeSpin",
    phone_number: "+60144557789",
    tier: "Silver",
    current_tokens: 4800,
    station: "ep369",
    registered_date: "2026-01-25T15:00:00",
    last_check_in_date: "2026-04-30T13:00:00",
    last_login_datetime: "2026-04-30T19:30:00",
  },
  {
    id: 25,
    uuid: "uuid-25",
    username: "MysticBet",
    phone_number: "+60155668890",
    tier: "Gold",
    current_tokens: 7200,
    station: "KGAME99",
    registered_date: "2026-02-18T11:00:00",
    last_check_in_date: "2026-04-29T18:00:00",
    last_login_datetime: "2026-04-30T16:00:00",
  },
];

export default function MembersPage() {
  return (
    <AdminRouteGuard>
      <MembersContent />
    </AdminRouteGuard>
  );
}

// ── Reusable gold gradient style ──────────────────────────────────────
const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

// ── Dropdown filter component ─────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange, icon = "chevron" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = value || label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-9 rounded px-3 py-2 shrink-0 transition-opacity hover:opacity-90"
        style={{ background: GOLD_BG }}
      >
        {icon === "calendar" && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )}
        <span className="font-['Times_New_Roman'] text-[14px] text-black whitespace-nowrap">
          {displayLabel}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-lg border border-[rgba(255,255,132,0.3)] bg-[#0f2618] shadow-xl overflow-hidden">
          {/* Clear / All option */}
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 font-['Times_New_Roman'] text-[13px] transition-colors ${!value
                ? "text-[#e9af41] bg-[rgba(233,175,65,0.1)]"
                : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 font-['Times_New_Roman'] text-[13px] border-t border-white/5 transition-colors ${value === opt
                  ? "text-[#e9af41] bg-[rgba(233,175,65,0.1)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Date range filter ─────────────────────────────────────────────────
function DateFilter({ label, fromDate, toDate, onFromChange, onToChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasValue = fromDate || toDate;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-9 rounded px-3 py-2 shrink-0 transition-opacity hover:opacity-90"
        style={{ background: GOLD_BG }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="font-['Times_New_Roman'] text-[14px] text-black whitespace-nowrap">
          {label}
        </span>
        {hasValue && <span className="w-1.5 h-1.5 rounded-full bg-[#06b800]" />}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-[260px] rounded-lg border border-[rgba(255,255,132,0.3)] bg-[#0f2618] shadow-xl p-3 flex flex-col gap-2.5">
          <label className="font-['Times_New_Roman'] text-[12px] text-white/60">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full h-9 rounded px-2.5 bg-white/10 border border-white/10 font-['Times_New_Roman'] text-[13px] text-white outline-none focus:border-[#e9af41]/50 [color-scheme:dark]"
          />
          <label className="font-['Times_New_Roman'] text-[12px] text-white/60">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full h-9 rounded px-2.5 bg-white/10 border border-white/10 font-['Times_New_Roman'] text-[13px] text-white outline-none focus:border-[#e9af41]/50 [color-scheme:dark]"
          />
          <button
            onClick={() => {
              onFromChange("");
              onToChange("");
            }}
            className="font-['Times_New_Roman'] text-[12px] text-[#e9af41] hover:underline self-end mt-1"
          >
            Clear dates
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sort icon for table headers ────────────────────────────────────────
function SortIcon({ active, dir }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0 ml-0.5"
    >
      <path
        d="M4 5L7 2L10 5"
        stroke={active && dir === "asc" ? "#e9af41" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9L7 12L10 9"
        stroke={active && dir === "desc" ? "#e9af41" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Date formatters ────────────────────────────────────────────────────
function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${dd}.${mm}.${yyyy} ${h12}:${minutes} ${ampm}`;
  } catch {
    return dateString;
  }
}

function toDateOnly(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

// ── Pagination component ───────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-end gap-2 pt-4 pr-2 pb-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="font-['Times_New_Roman'] text-[13px] text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 italic"
      >
        Previous
      </button>
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="font-['Times_New_Roman'] text-[13px] text-white/40 px-1"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`font-['Times_New_Roman'] text-[13px] min-w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${currentPage === page
                ? "bg-[#e9af41] text-black font-bold"
                : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="font-['Times_New_Roman'] text-[13px] text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 italic"
      >
        Next
      </button>
    </div>
  );
}

// ── View Member Profile Modal ──────────────────────────────────────────
function ViewMemberModal({ member, onClose, onNavigate }) {
  if (!member) return null;

  // Mock profile data — TODO (Backend): fetch from GET /member/members/{uuid}/
  const profile = {
    full_name: member.username || "",
    email: `${(member.username || "user").toLowerCase()}@email.com`,
    gender: "Male",
    dob: "15/03/1995",
    interest: "Lucky Spin, Mart",
    mrs_vip_tier: member.tier || "Bronze",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-[14px] border border-[#6a6a6a] bg-[#484848] p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile info card */}
        <div className="rounded-[10px] border border-[#6e6e6e] bg-[#555555] p-5 sm:p-6 mb-5">
          <h2 className="font-['Times_New_Roman'] font-bold text-[20px] text-white text-center mb-5">
            Member Profile
          </h2>

          {/* Profile picture */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-['Times_New_Roman'] text-[14px] text-white/90">
              Profile Picture
            </span>
            <div className="w-[30px] h-[30px] rounded bg-[#e9af41]/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="20"
                  height="18"
                  rx="3"
                  fill="#e9af41"
                />
                <circle cx="8.5" cy="9.5" r="2.5" fill="white" />
                <path
                  d="M2 17l5-5 3 3 4-4 8 6"
                  fill="white"
                  fillOpacity="0.7"
                />
              </svg>
            </div>
          </div>

          {/* Info rows */}
          {[
            { label: "Full Name:", value: profile.full_name },
            { label: "Email:", value: profile.email },
            { label: "Gender:", value: profile.gender },
            { label: "DOB:", value: profile.dob },
            { label: "Interest:", value: profile.interest },
            { label: "MRS VIP Tier:", value: profile.mrs_vip_tier },
          ].map((row) => (
            <div key={row.label} className="flex items-baseline gap-2 py-1.5">
              <span className="font-['Times_New_Roman'] font-bold text-[14px] text-white/90 w-[110px] shrink-0">
                {row.label}
              </span>
              <span className="font-['Times_New_Roman'] text-[14px] text-white/70">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Token History", action: () => onNavigate && onNavigate("token-history", member) },
            { label: "Reward History", action: () => onNavigate && onNavigate("reward-history", member) },
            { label: "Deposit History", action: () => onNavigate && onNavigate("deposit-history", member) },
            { label: "Station", action: () => onNavigate && onNavigate("station", member) },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action || undefined}
              className="h-[44px] rounded-[8px] border border-[#2ed82e] bg-[#06b800] font-['Times_New_Roman'] font-bold text-[15px] text-white hover:bg-[#05a000] transition-colors shadow-md"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="h-[36px] px-5 rounded font-['Times_New_Roman'] font-bold text-[14px] text-black hover:opacity-90 transition-opacity"
            style={{ background: GOLD_BG }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Member Profile Modal ──────────────────────────────────────────
function EditMemberModal({ member, onClose, onSave }) {
  if (!member) return null;

  // Mock profile for editing — TODO (Backend): fetch & update via API
  const [form, setForm] = useState({
    full_name: member.username || "",
    email: `${(member.username || "user").toLowerCase()}@email.com`,
    gender: "Male",
    dob: "1995-03-15",
    interest: "Lucky Spin, Mart",
    mrs_vip_tier: member.tier || "Bronze",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    // TODO (Backend): PATCH /member/profile/{uuid}/update-profile/
    onSave?.(form);
    onClose();
  };

  const fields = [
    { key: "full_name", label: "Full Name:", type: "text" },
    { key: "email", label: "Email:", type: "email" },
    {
      key: "gender",
      label: "Gender:",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { key: "dob", label: "DOB:", type: "date" },
    { key: "interest", label: "Interest:", type: "text" },
    {
      key: "mrs_vip_tier",
      label: "MRS VIP Tier:",
      type: "select",
      options: TIER_OPTIONS,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[540px] rounded-[14px] border border-[#6a6a6a] bg-[#484848] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-admin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold badge + title */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/assets/admin/Edit-profile.png" alt="Gold Badge" width={80} height={80} className="object-contain" />
          {/* Ribbon */}

          <h2 className="font-['Times_New_Roman'] font-bold text-[22px] text-white">
            Edit Profile
          </h2>
        </div>

        {/* Profile picture upload */}
        <div className="mb-5">
          <p className="font-['Times_New_Roman'] text-[14px] text-white/90 mb-2">
            Profile Picture
          </p>
          <div className="w-full h-[80px] rounded-lg border-2 border-dashed border-[#e9af41]/40 flex items-center justify-center cursor-pointer hover:border-[#e9af41]/70 transition-colors bg-white/[0.03]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="18" rx="3" fill="#e9af41" />
              <circle cx="8.5" cy="9.5" r="2.5" fill="white" />
              <path d="M2 17l5-5 3 3 4-4 8 6" fill="white" fillOpacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4 mb-6">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <label className="font-['Times_New_Roman'] font-bold text-[14px] text-white/90 w-[110px] shrink-0">
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="flex-1 h-[38px] rounded px-3 bg-[#b0b0b0] text-[#333] font-['Times_New_Roman'] text-[14px] outline-none focus:ring-2 focus:ring-[#e9af41]/40 border-none cursor-pointer"
                >
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="flex-1 h-[38px] rounded px-3 bg-[#b0b0b0] text-[#333] font-['Times_New_Roman'] text-[14px] outline-none focus:ring-2 focus:ring-[#e9af41]/40 placeholder:text-[#666] [color-scheme:light]"
                />
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="h-[38px] px-6 rounded border border-white/20 bg-white font-['Times_New_Roman'] font-bold text-[14px] text-red-500 hover:bg-white/90 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="h-[38px] px-6 rounded font-['Times_New_Roman'] font-bold text-[14px] text-black hover:opacity-90 transition-opacity"
            style={{ background: GOLD_BG }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main content ───────────────────────────────────────────────────────
function MembersContent() {
  const router = useRouter();

  // TODO (Backend): Replace mock data with real API call
  const [members] = useState(MOCK_MEMBERS);
  const [isLoading] = useState(false);
  const [error] = useState(null);

  // Modal state
  const [viewMember, setViewMember] = useState(null);
  const [editMember, setEditMember] = useState(null);

  // Navigate to history sub-pages
  const handleHistoryNavigate = useCallback(
    (type, member) => {
      const params = new URLSearchParams({
        memberId: String(member.id),
        name: member.username || "",
      });
      router.push(`/admin/members/${type}?${params.toString()}`);
    },
    [router],
  );

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [regFrom, setRegFrom] = useState("");
  const [regTo, setRegTo] = useState("");
  const [checkinFrom, setCheckinFrom] = useState("");
  const [checkinTo, setCheckinTo] = useState("");
  const [loginFrom, setLoginFrom] = useState("");
  const [loginTo, setLoginTo] = useState("");

  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const itemsPerPage = 10;

  // Date range helper
  const isInDateRange = useCallback((dateStr, from, to) => {
    if (!from && !to) return true;
    const d = toDateOnly(dateStr);
    if (!d) return true;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }, []);

  // Filter + sort
  const filteredMembers = useMemo(() => {
    let list = [...members];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.username?.toLowerCase().includes(q));
    }
    if (phoneQuery.trim()) {
      const q = phoneQuery.toLowerCase();
      list = list.filter((m) => m.phone_number?.toLowerCase().includes(q));
    }

    // Dropdown filters
    if (tierFilter) list = list.filter((m) => m.tier === tierFilter);
    if (stationFilter) list = list.filter((m) => m.station === stationFilter);

    // Date range filters
    list = list.filter((m) => isInDateRange(m.registered_date, regFrom, regTo));
    list = list.filter((m) =>
      isInDateRange(m.last_check_in_date, checkinFrom, checkinTo),
    );
    list = list.filter((m) =>
      isInDateRange(m.last_login_datetime, loginFrom, loginTo),
    );

    // Sort
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        if (typeof va === "number" && typeof vb === "number")
          return sortDir === "asc" ? va - vb : vb - va;
        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return list;
  }, [
    members,
    searchQuery,
    phoneQuery,
    tierFilter,
    stationFilter,
    regFrom,
    regTo,
    checkinFrom,
    checkinTo,
    loginFrom,
    loginTo,
    sortKey,
    sortDir,
    isInDateRange,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMembers = filteredMembers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    phoneQuery,
    tierFilter,
    stationFilter,
    regFrom,
    regTo,
    checkinFrom,
    checkinTo,
    loginFrom,
    loginTo,
  ]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Column definitions
  const columns = [
    { key: "id", label: "No", minW: "min-w-[50px]" },
    { key: "username", label: "Member Name", minW: "min-w-[120px]" },
    { key: "phone_number", label: "Phone Number", minW: "min-w-[130px]" },
    { key: "tier", label: "MRS VIP Tier", minW: "min-w-[110px]" },
    { key: "current_tokens", label: "Current Tokens", minW: "min-w-[110px]" },
    {
      key: "registered_date",
      label: "Registered Date/Time",
      minW: "min-w-[165px]",
    },
    {
      key: "last_check_in_date",
      label: "Last Check in Date/Time",
      minW: "min-w-[175px]",
    },
    {
      key: "last_login_datetime",
      label: "Last Login Date/Time",
      minW: "min-w-[165px]",
    },
  ];

  const activeFilterCount = [
    tierFilter,
    stationFilter,
    regFrom || regTo,
    checkinFrom || checkinTo,
    loginFrom || loginTo,
    searchQuery,
    phoneQuery,
  ].filter(Boolean).length;

  return (
    <>
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:pl-[388px] xl:pr-10 xl:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="font-['Times_New_Roman'] font-bold text-[22px] sm:text-[28px] text-white">
            Member List
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

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300 font-['Times_New_Roman']">
            Failed to load members. Please try again.
          </div>
        )}

        {/* Table card */}
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
          {/* Filters row */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <p className="font-['Times_New_Roman'] font-bold text-[16px] sm:text-[18px] text-white whitespace-nowrap italic">
              The Member List
            </p>
            {activeFilterCount > 0 && (
              <span className="font-['Times_New_Roman'] text-[11px] text-[#e9af41] bg-[rgba(233,175,65,0.15)] rounded-full px-2 py-0.5">
                {activeFilterCount} active
              </span>
            )}
            <span className="font-['Times_New_Roman'] text-[13px] text-white/80 ml-auto mr-1 sm:mr-2">
              Filter By:
            </span>

            {/* Date range filters */}
            <DateFilter
              label="Registered Date/Time"
              fromDate={regFrom}
              toDate={regTo}
              onFromChange={setRegFrom}
              onToChange={setRegTo}
            />
            <DateFilter
              label="Last Checkin Date/Time"
              fromDate={checkinFrom}
              toDate={checkinTo}
              onFromChange={setCheckinFrom}
              onToChange={setCheckinTo}
            />
            <DateFilter
              label="Last Login Date/Time"
              fromDate={loginFrom}
              toDate={loginTo}
              onFromChange={setLoginFrom}
              onToChange={setLoginTo}
            />

            {/* Dropdown filters */}
            <FilterDropdown
              label="Station"
              options={STATION_OPTIONS}
              value={stationFilter}
              onChange={setStationFilter}
            />
            <FilterDropdown
              label="MRS VIP Tier"
              options={TIER_OPTIONS}
              value={tierFilter}
              onChange={setTierFilter}
            />

            {/* Text search inputs */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Member"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[120px] sm:w-[140px] rounded px-3 py-2 font-['Times_New_Roman'] text-[14px] text-black italic placeholder:text-black/50 outline-none"
                style={{ background: GOLD_BG }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black text-[16px] leading-none"
                >
                  ×
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                className="h-9 w-[140px] sm:w-[160px] rounded px-3 py-2 font-['Times_New_Roman'] text-[14px] text-black italic placeholder:text-black/50 outline-none"
                style={{ background: GOLD_BG }}
              />
              {phoneQuery && (
                <button
                  onClick={() => setPhoneQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black text-[16px] leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          {!isLoading && (
            <div className="font-['Times_New_Roman'] text-[12px] text-white/40">
              Showing {filteredMembers.length === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of{" "}
              {filteredMembers.length} members
              {activeFilterCount > 0 &&
                ` (filtered from ${members.length} total)`}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9af41] border-t-transparent" />
              <span className="ml-3 font-['Times_New_Roman'] text-white/60">
                Loading members...
              </span>
            </div>
          )}

          {/* Table */}
          {!isLoading && (
            <div className="overflow-x-auto scrollbar-admin rounded-lg">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-black">
                    {columns.map((c) => (
                      <th
                        key={c.key}
                        className={`${c.minW} px-2 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors`}
                        onClick={() => handleSort(c.key)}
                      >
                        <div className="flex items-center">
                          <span className="font-['Times_New_Roman'] font-bold text-[13px] sm:text-[14px] text-white whitespace-nowrap">
                            {c.label}
                          </span>
                          <SortIcon active={sortKey === c.key} dir={sortDir} />
                        </div>
                      </th>
                    ))}
                    <th className="min-w-[120px] px-2 py-3 text-left">
                      <div className="flex items-center">
                        <span className="font-['Times_New_Roman'] font-bold text-[13px] sm:text-[14px] text-white">
                          Action
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-5 py-12 text-center font-['Times_New_Roman'] text-white/40"
                      >
                        {activeFilterCount > 0
                          ? "No members found matching your filters."
                          : "No members found."}
                      </td>
                    </tr>
                  ) : (
                    currentMembers.map((m, idx) => (
                      <tr
                        key={m.uuid || idx}
                        className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                          {m.username || "N/A"}
                        </td>
                        <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                          {m.phone_number || "N/A"}
                        </td>
                        <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                          {m.tier || "N/A"}
                        </td>
                        <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                          {m.current_tokens?.toLocaleString() || "0"}
                        </td>
                        <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                          {formatDateTime(m.registered_date)}
                        </td>
                        <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                          {formatDateTime(m.last_check_in_date)}
                        </td>
                        <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                          {formatDateTime(m.last_login_datetime)}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setViewMember(m)}
                              className="bg-[#06b800] rounded px-3 py-1.5 font-['Times_New_Roman'] font-bold text-[13px] text-white hover:bg-[#05a000] transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setEditMember(m)}
                              className="border border-[#00a63e] rounded px-3 py-1.5 font-['Times_New_Roman'] text-[13px] text-[#00a63e] hover:bg-[#00a63e]/10 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
    </main>

    {/* Modals */}
    {viewMember && (
      <ViewMemberModal
        member={viewMember}
        onClose={() => setViewMember(null)}
        onNavigate={handleHistoryNavigate}
      />
    )}
    {editMember && (
      <EditMemberModal
        member={editMember}
        onClose={() => setEditMember(null)}
      />
    )}
    </>
  );
}
