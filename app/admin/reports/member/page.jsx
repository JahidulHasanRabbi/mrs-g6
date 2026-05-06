"use client";

import Sidebar from "../../../components/admin/Sidebar";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";

export default function MemberReportPage() {
  return (
    <AdminRouteGuard>
      <MemberReportContent />
    </AdminRouteGuard>
  );
}

// ── Mock data ──────────────────────────────────────────────────────────
// TODO (Backend): Replace all mock data below with real API calls
// Daily/Monthly/Yearly APIs: new_member, total_member, active_member, token_issued
// Member list API: paginated, filterable by date, station, vip tier, search

const MOCK_STATS = [
  { title: "Total Active Member", label: "Active Users", value: "2,500", pct: 78, sub: "Today Active Users", subVal: "935", theme: "gold" },
  { title: "Total New Member", label: "New Users", value: "1,500", pct: 45, sub: "Today New Users", subVal: "20", theme: "green" },
  { title: "Token Issued", label: "New Tokens", value: "100", pct: 10, sub: "Today New Tokens", subVal: "1", theme: "grey" },
];

const MOCK_SUMMARY = {
  totalMembers: "100",
  newMembers: "50",
  activeMembers: "50",
  tokensIssued: "50",
};

const MOCK_DAILY_LINE = [
  { day: "Sat", val: 4200 },
  { day: "Sun", val: 5100 },
  { day: "Mon", val: 4600 },
  { day: "Tue", val: 2800 },
  { day: "Wed", val: 6200 },
  { day: "Thu", val: 5800 },
  { day: "Fri", val: 6500 },
];

const MOCK_BAR_DATA = [
  { day: "Sat", total: 6000, active: 3000 },
  { day: "Sun", total: 5200, active: 2600 },
  { day: "Mon", total: 7000, active: 3800 },
  { day: "Tue", total: 4800, active: 2400 },
  { day: "Wed", total: 3600, active: 1200 },
  { day: "Thu", total: 6200, active: 3200 },
  { day: "Fri", total: 7400, active: 3400 },
];

const MOCK_MEMBERS = [
  { id: 1, name: "John88", phone: "+6012345567", vip_tier: "Bronze", tokens: "1,2000", reg_date: "30.04.2026 8:00 PM", last_checkin: "30.04.2026 8:00 PM", last_login: "30.04.2026 8:00 PM" },
  { id: 2, name: "AceKing99", phone: "+60198765432", vip_tier: "Silver", tokens: "3,500", reg_date: "28.04.2026 3:00 PM", last_checkin: "29.04.2026 10:00 AM", last_login: "30.04.2026 6:00 PM" },
  { id: 3, name: "LuckyDraw01", phone: "+60112223344", vip_tier: "Gold", tokens: "8,200", reg_date: "15.03.2026 9:00 AM", last_checkin: "30.04.2026 7:00 PM", last_login: "30.04.2026 9:00 PM" },
  { id: 4, name: "SpinMaster", phone: "+60177889900", vip_tier: "Bronze", tokens: "900", reg_date: "01.04.2026 12:00 PM", last_checkin: "29.04.2026 5:00 PM", last_login: "29.04.2026 8:00 PM" },
];

// ── Theme configs for donut cards ──────────────────────────────────────
const DONUT_THEMES = {
  gold: {
    stroke: "#e9af41",
    track: "rgba(255,255,255,0.15)",
    badgeBg: "#e9af41",
    badgeText: "text-black",
  },
  green: {
    stroke: "#06b800",
    track: "rgba(255,255,255,0.15)",
    badgeBg: "#06b800",
    badgeText: "text-white",
  },
  grey: {
    stroke: "#888888",
    track: "rgba(255,255,255,0.08)",
    badgeBg: "#6b6b6b",
    badgeText: "text-white",
  },
};

// ── Donut stat card ────────────────────────────────────────────────────
function DonutCard({ title, label, value, pct, sub, subVal, theme = "gold" }) {
  const t = DONUT_THEMES[theme];
  const r = 80;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const gradId = `donutGrad-${theme}`;
  return (
    <div className="flex-1 min-w-[220px] rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-4 flex flex-col gap-1.5 items-center">
      <p className="font-['Times_New_Roman'] font-bold text-[18px] text-white whitespace-nowrap">{title}</p>
      <div className="relative w-[180px] h-[180px]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r={r} fill="none" stroke={t.track} strokeWidth="18" />
          <circle
            cx="100" cy="100" r={r} fill="none"
            stroke={t.stroke} strokeWidth="18"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-['Times_New_Roman'] text-[14px] text-[#06b800]">{label}</span>
          <span className="font-['Times_New_Roman'] font-bold text-[26px] text-white">{value}</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5 w-full">
        <span
          className={`font-['Times_New_Roman'] text-[10px] text-center rounded px-1.5 py-0.5 font-bold ${t.badgeText}`}
          style={{ background: t.badgeBg }}
        >{pct}%</span>
        <div className="flex flex-col gap-0.5">
          <span className="font-['Times_New_Roman'] text-[11px] text-white/60">{sub}</span>
          <span className="font-['Times_New_Roman'] font-bold text-[10px] text-[#e8e4e4]">{subVal}</span>
        </div>
      </div>
    </div>
  );
}

// ── Summary stat card (4th card — no donut) ───────────────────────────
function SummaryCard() {
  const rows = [
    { label: "Total Members", value: MOCK_SUMMARY.totalMembers },
    { label: "New Members", value: MOCK_SUMMARY.newMembers },
    { label: "Active Members", value: MOCK_SUMMARY.activeMembers },
    { label: "Tokens Issued", value: MOCK_SUMMARY.tokensIssued },
  ];
  return (
    <div className="flex-1 min-w-[220px] rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-6 flex flex-col justify-center gap-5">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col items-center gap-0.5">
          <span className="font-['Times_New_Roman'] text-[14px] italic text-[#06b800]">{r.label}</span>
          <span className="font-['Times_New_Roman'] font-bold text-[28px] text-white">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Line chart card ────────────────────────────────────────────────────
function LineChartCard() {
  const max = 8000;
  const w = 460;
  const h = 200;
  const padL = 32;
  const padB = 26;
  const cw = w - padL;
  const ch = h - padB;
  const step = cw / (MOCK_DAILY_LINE.length - 1);

  const pts = MOCK_DAILY_LINE.map((d, i) => ({
    x: padL + i * step,
    y: ch - (d.val / max) * ch,
  }));
  const pathD = pts.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cpx1 = prev.x + step * 0.4;
    const cpx2 = p.x - step * 0.4;
    return `C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
  }).join(" ");

  const yLabels = ["8K", "6K", "4K", "2K", "0.0"];
  return (
    <div className="flex-1 min-w-[380px] rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="capitalize font-['Times_New_Roman'] font-bold text-[18px] text-white">Daily User Summary</p>
        <span
          className="font-['Times_New_Roman'] font-bold text-[12px] text-[#292929] rounded px-2.5 py-1.5"
          style={{ background: "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)" }}
        >last 7 days</span>
      </div>
      <div className="flex items-center gap-1 bg-[rgba(6,184,0,0.1)] rounded-[10px] px-1.5 py-0.5 w-fit">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06b800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
        <span className="font-['Times_New_Roman'] text-[10px] text-[#06b800]">+0.85%</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {yLabels.map((l, i) => {
          const y = (i / (yLabels.length - 1)) * ch;
          return (
            <g key={l}>
              <line x1={padL} y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fill="#757575" fontSize="10" fontFamily="Times New Roman">{l}</text>
            </g>
          );
        })}
        <path d={pathD} fill="none" stroke="#e9af41" strokeWidth="2.5" />
        {MOCK_DAILY_LINE.map((d, i) => (
          <text key={d.day} x={padL + i * step} y={ch + 18} textAnchor="middle" fill="#757575" fontSize="12" fontFamily="Times New Roman">{d.day}</text>
        ))}
        <circle cx={pts[4].x} cy={pts[4].y} r="4" fill="white" stroke="#e9af41" strokeWidth="2" />
        <rect x={pts[3].x} y={pts[4].y - 26} width="80" height="40" rx="8" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,132,0.4)" strokeWidth="0.5" />
        <text x={pts[3].x + 40} y={pts[4].y - 10} textAnchor="middle" fill="white" fontSize="11" fontFamily="Times New Roman">Wednesday</text>
        <text x={pts[3].x + 40} y={pts[4].y + 4} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9" fontFamily="Times New Roman">132 check-ins</text>
      </svg>
    </div>
  );
}

// ── Bar chart card ─────────────────────────────────────────────────────
function BarChartCard() {
  const max = 8000;
  const yLabels = ["8K", "6K", "4K", "2K", "0"];
  return (
    <div className="flex-1 min-w-[380px] rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="capitalize font-['Times_New_Roman'] font-bold text-[18px] text-white">Member Activity Overview</p>
        <span
          className="font-['Times_New_Roman'] font-bold text-[14px] text-black rounded px-3 py-1.5"
          style={{ background: "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)" }}
        >last 7 days</span>
      </div>
      <p className="capitalize font-['Times_New_Roman'] text-[14px] text-[#5c5c5c]">Active Users : 185</p>
      <div className="flex items-end gap-0 h-[220px]">
        <div className="flex flex-col justify-between h-full pr-3 pb-6">
          {yLabels.map((l) => (
            <span key={l} className="font-['Times_New_Roman'] text-[11px] text-[#757575] text-right">{l}</span>
          ))}
        </div>
        <div className="flex-1 flex items-end justify-around h-full relative">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute w-full border-t border-white/5" style={{ bottom: `${(i / 4) * 100}%` }} />
          ))}
          {MOCK_BAR_DATA.map((d, i) => {
            const totalH = (d.total / max) * 100;
            const activeH = (d.active / max) * 100;
            const isHighlight = i === 5;
            return (
              <div key={d.day} className="flex flex-col items-center gap-1.5 z-10" style={{ width: `${100 / 7}%` }}>
                <div className="w-[22px] rounded-t-[6px] overflow-hidden relative" style={{ height: `${totalH * 2}px` }}>
                  <div className="absolute inset-0 bg-[#f6f6f6] rounded-[6px]" />
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-b-[6px]"
                    style={{
                      height: `${(activeH / totalH) * 100}%`,
                      background: isHighlight
                        ? "linear-gradient(13deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)"
                        : "#fab47f",
                    }}
                  />
                </div>
                <span className="font-['Times_New_Roman'] text-[12px] text-[#757575]">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Gold filter button ─────────────────────────────────────────────────
function GoldButton({ children, italic = false }) {
  return (
    <button
      className="flex items-center gap-1 h-9 rounded px-3 py-2 shrink-0"
      style={{ background: "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)" }}
    >
      <span className={`font-['Times_New_Roman'] text-[14px] text-black whitespace-nowrap ${italic ? "italic" : ""}`}>{children}</span>
      {!italic && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </button>
  );
}

// ── Member table ───────────────────────────────────────────────────────
function MemberTable() {
  const cols = [
    { key: "id", label: "No", w: "w-[60px]" },
    { key: "name", label: "Member Name", w: "w-[140px]" },
    { key: "phone", label: "Phone Number", w: "w-[130px]" },
    { key: "vip_tier", label: "MRS VIP Tier", w: "w-[110px]" },
    { key: "tokens", label: "Current Tokens", w: "w-[120px]" },
    { key: "reg_date", label: "Registered Date/Time", w: "w-[170px]" },
    { key: "last_checkin", label: "Last Check in Date/Time", w: "w-[180px]" },
    { key: "last_login", label: "Last Login Date/Time", w: "w-[160px]" },
  ];

  const SortIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 ml-0.5">
      <path d="M4 5L7 2L10 5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9L7 12L10 9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-4 flex flex-col gap-4">
      {/* Table filters */}
      <div className="flex items-center flex-wrap gap-3">
        <p className="capitalize font-['Times_New_Roman'] font-bold text-[18px] text-white whitespace-nowrap">
          The Member List Is Given Below
        </p>
        <span className="font-['Times_New_Roman'] text-[13px] text-white/80 ml-auto mr-2">Filter By:</span>
        <GoldButton>Registered Date/Time</GoldButton>
        <GoldButton>Last Checkin Date/Time</GoldButton>
        <GoldButton>Last Login Date/Time</GoldButton>
        <GoldButton>Station</GoldButton>
        <GoldButton>MRS VIP Tier</GoldButton>
        <GoldButton italic>Enter Member</GoldButton>
        <GoldButton italic>Enter Phone Number</GoldButton>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-black rounded-t-[6px]">
              {cols.map((c) => (
                <th key={c.key} className={`${c.w} px-2 py-3.5 text-left`}>
                  <div className="flex items-center">
                    <span className="font-['Times_New_Roman'] font-bold text-[14px] text-white whitespace-nowrap">{c.label}</span>
                    <SortIcon />
                  </div>
                </th>
              ))}
              <th className="w-[140px] px-2 py-3.5 text-left">
                <div className="flex items-center">
                  <span className="font-['Times_New_Roman'] font-bold text-[14px] text-white">Action</span>
                  <SortIcon />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_MEMBERS.map((m) => (
              <tr key={m.id} className="border-b border-[rgba(240,240,240,0.2)]">
                {cols.map((c) => (
                  <td key={c.key} className={`${c.w} px-2 py-3.5 font-['Times_New_Roman'] text-[13px] ${c.key === "id" ? "text-white" : "text-white/80"} whitespace-nowrap`}>
                    {m[c.key]}
                  </td>
                ))}
                <td className="w-[140px] px-2 py-3.5">
                  <div className="flex gap-1.5">
                    <button className="bg-[#06b800] rounded px-3 py-1.5 font-['Times_New_Roman'] font-bold text-[13px] text-white">View</button>
                    <button className="border border-[#00a63e] rounded px-3 py-1.5 font-['Times_New_Roman'] text-[13px] text-[#00a63e]">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page layout ────────────────────────────────────────────────────────
function MemberReportContent() {
  return (
    <div className="min-h-screen bg-[#07190d]">
      <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px]">
        <Sidebar activeItem="member-report" />
      </aside>

      <main className="min-h-screen pl-[388px] pr-10 pt-8 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="capitalize font-['Times_New_Roman'] font-bold text-[28px] text-white">Member Report</h1>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        {/* Sub-header + date filter */}
        <div className="flex items-center justify-between mb-6">
          <p className="capitalize font-['Times_New_Roman'] font-bold text-[18px] text-white">The Token Reports Are Given</p>
          <div className="flex items-center gap-3">
            <span className="font-['Times_New_Roman'] text-[13px] text-white/80">Filter By:</span>
            <GoldButton>Date/Time</GoldButton>
          </div>
        </div>

        {/* Stat cards */}
        <div className="flex flex-wrap gap-5 mb-6">
          {MOCK_STATS.map((s) => (
            <DonutCard key={s.title} {...s} />
          ))}
          <SummaryCard />
        </div>

        {/* Charts row */}
        <div className="flex flex-wrap gap-5 mb-6">
          <LineChartCard />
          <BarChartCard />
        </div>

        {/* Member table */}
        <MemberTable />
      </main>
    </div>
  );
}
