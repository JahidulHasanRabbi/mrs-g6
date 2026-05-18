"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PeriodToggle from "../../../../components/admin/retention/PeriodToggle";
import { ASSETS, GRAD_DARK, GRAD_GOLD } from "../../../../components/admin/retention/constants";
import { getCrmMemberSingle } from "../../../../api/crmApi";

// Member profile detail — mirrors Figma node 34:316.
// Route: /admin/retention/members/[slug] where slug is the member UUID coming
// from the list pages. The page hits GET /crm-members/members/<uuid>/ and
// renders three info sections (basic / financial / gaming) plus the header
// stats. Fields the API doesn't return are shown as "—" so the UI stays intact.

const TAG_STYLES = {
  vip:    { bg: "#d9acff", color: "#8800fb" },
  game:   { bg: "#ffe9bc", color: "#d48a00" },
  low:    { bg: "#fb3748", color: "#fbeed2" },
  active: { bg: "#84ebb4", color: "#00813c" },
  weekly: { bg: "#a4a4a4", color: "#141828" },
};

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function show(value, fallback = "—") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

// Heuristic for tag kind/colors: pick chips based on field content so it
// resembles the Figma without inventing data the API doesn't provide.
function inferTags(data) {
  const tags = [];
  const vip = data?.customer_data?.vip_level || data?.vip_level;
  if (vip) tags.push({ label: vip, kind: "vip" });
  const game = data?.gaming_info?.game_preference;
  if (game) tags.push({ label: game, kind: "game" });
  const priority = data?.priority;
  if (priority) tags.push({ label: priority, kind: priority === "Low" ? "low" : "active" });
  return tags;
}

export default function MemberProfilePage() {
  const params = useParams();
  const memberUuid = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";
  const [period, setPeriod] = useState("Daily");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!memberUuid) return;
    let cancelled = false;
    const fetchMember = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCrmMemberSingle(memberUuid);
        if (!cancelled) setData(res);
      } catch (err) {
        if (cancelled) return;
        console.error("[member-profile] fetch failed", err);
        setError(err);
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMember();
    return () => {
      cancelled = true;
    };
  }, [memberUuid]);

  if (loading) {
    return (
      <div className="px-2 py-12 text-center text-[14px] text-white/60">
        Loading member profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-2 py-12 text-center text-[14px] text-white/60">
        Failed to load member profile.
      </div>
    );
  }

  const basicInfo = {
    Username: show(data?.customer_data?.username),
    Phone: show(data?.customer_data?.phone_number),
    Gender: show(data?.customer_data?.gender),
    "Date of Birth": show(data?.customer_data?.date_of_birth),
    Age: show(data?.customer_data?.age),
    Nationality: show(data?.customer_data?.nationality),
    "Home Address": show(data?.customer_data?.home_address),
    "Marital Status": show(data?.customer_data?.marital_status),
    Job: show(data?.customer_data?.job),
    Hobby: show(data?.customer_data?.hobby),
  };

  const financialInfo = {
    "Total Sales": formatCurrency(data?.financial_info?.total_sales),
    "Total Win/lose": formatCurrency(data?.financial_info?.total_win_lose),
    "Total Sales Ticket": show(data?.financial_info?.total_sales_ticket),
    ARPU: formatCurrency(data?.financial_info?.arpu),
    "Average Deposit": formatCurrency(data?.financial_info?.average_deposit),
    "Last Deposit Date": show(data?.financial_info?.last_deposit_date),
    "Payment Method": show(data?.financial_info?.payment_method),
  };

  const gamingInfo = {
    "Game Preference": show(data?.gaming_info?.game_preference),
    "Provider Preference": show(data?.gaming_info?.provider_preference),
    "Play Time Pattern": show(data?.gaming_info?.play_time_pattern),
    "Average Bet Size": show(data?.gaming_info?.average_bet_size),
    "Player Type": show(data?.gaming_info?.player_type),
    "Risk Style": show(data?.gaming_info?.risk_style),
    "Deposit Frequency Style": show(data?.gaming_info?.deposit_frequency_style),
    "Deposit Trigger": show(data?.gaming_info?.deposit_trigger),
    "Churn Risk Reason": show(data?.gaming_info?.churn_risk_reason),
    "Re-activation Trigger": show(data?.gaming_info?.reactivation_trigger),
  };

  const stats = {
    mrsLevel: show(data?.customer_data?.vip_level),
    nsLevel: show(data?.customer_data?.ns_level, "—"),
    totalSales: formatCurrency(data?.financial_info?.total_sales),
    totalWinLose: formatCurrency(data?.financial_info?.total_win_lose),
  };

  return (
    <>
      <ProfileHeader
        name={data?.full_name || data?.customer_data?.username || "Member"}
        tags={inferTags(data)}
        dateJoined={show(data?.date_joined)}
        slug={memberUuid}
        period={period}
        onPeriodChange={setPeriod}
      />
      <StatsRow stats={stats} />
      <InfoGrid basicInfo={basicInfo} financialInfo={financialInfo} gamingInfo={gamingInfo} />
      <NotesCard notes={show(data?.notes, "No notes available.")} />
    </>
  );
}

function ProfileHeader({ name, tags, dateJoined, slug, period, onPeriodChange }) {
  return (
    <div className="flex flex-col gap-4 px-2 md:flex-row md:items-start md:justify-between md:gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-clip rounded-full"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium leading-[18px] text-white">MEMBER PROFILE</span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <h1
                className="bg-clip-text text-transparent font-bold whitespace-nowrap"
                style={{
                  backgroundImage: GRAD_GOLD,
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: "26px",
                  lineHeight: "39px",
                  letterSpacing: "-2px",
                }}
              >
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <Tag key={tag.label} label={tag.label} kind={tag.kind} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-normal leading-[15px] text-white capitalize">
            Date Joined: {dateJoined}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/retention/members/${slug}/edit`}
              className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 transition hover:brightness-110"
              style={{ backgroundImage: GRAD_GOLD }}
            >
              <EditIcon />
              <span className="text-[12px] font-medium leading-[18px] text-[#141828]">Edit Profile</span>
            </Link>
            <MoreOptionsMenu />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PeriodToggle period={period} onPeriodChange={onPeriodChange} />
      </div>
    </div>
  );
}

// Cream popover triggered by the dots button next to Edit Profile. Items
// are placeholders until the corresponding admin endpoints are wired up.
const MORE_OPTIONS = [
  { key: "send-bonus",      label: "Send Bonus" },
  { key: "add-note",        label: "Add Note" },
  { key: "change-vip-level", label: "Change VIP Level" },
  { key: "add-tag",         label: "Add Tag" },
  { key: "block-customer",  label: "Block Customer", danger: true },
  { key: "alert",           label: "Alert",          danger: true },
];

function MoreOptionsMenu() {
  const [open, setOpen] = useState(false);

  const handleSelect = (key) => {
    setOpen(false);
    if (process.env.NODE_ENV !== "production") {
      console.log(`[member-profile] more-options action: ${key}`);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border-2 border-[#f2cb7a] transition hover:brightness-110"
        style={{ backgroundImage: GRAD_GOLD }}
      >
        <DotsIcon />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="menu"
            className="absolute left-0 top-full z-20 mt-2 min-w-[220px] overflow-hidden rounded-[12px] bg-[#fbeed2] py-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          >
            {MORE_OPTIONS.map((opt) => (
              <li key={opt.key} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(opt.key)}
                  className={`block w-full px-5 py-2 text-left text-[14px] font-medium leading-[21px] transition hover:bg-[#f2cb7a]/30 ${
                    opt.danger ? "text-[#d00416]" : "text-[#141828]"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function Tag({ label, kind }) {
  const style = TAG_STYLES[kind] || TAG_STYLES.weekly;
  return (
    <span
      className="flex h-[23px] items-center justify-center rounded-[12px] px-3 py-1 text-[12px] font-medium leading-[18px] whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {label}
    </span>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#141828">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function StatsRow({ stats }) {
  const items = [
    { label: "MRS Level", value: stats.mrsLevel },
    { label: "NS Level", value: stats.nsLevel },
    { label: "Total Sales", value: stats.totalSales },
    { label: "Total Win/lose", value: stats.totalWinLose },
  ];
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      className="flex flex-col gap-2 border border-[#05060a] p-2"
      style={{ backgroundImage: "linear-gradient(179deg, #11320e 0%, #031101 99.7%)" }}
    >
      <p
        className="text-[16px] font-semibold uppercase text-[#edba4d] leading-[24px] whitespace-nowrap"
        style={{ letterSpacing: "-1px" }}
      >
        {label}
      </p>
      <p
        className="text-[14px] font-semibold text-white leading-[21px] whitespace-nowrap"
        style={{ letterSpacing: "-1px" }}
      >
        {value}
      </p>
    </div>
  );
}

function InfoGrid({ basicInfo, financialInfo, gamingInfo }) {
  return (
    <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <InfoCard title="Basic Info" data={basicInfo} />
      <InfoCard title="Financial Info" data={financialInfo} />
      <InfoCard title="Gaming Info" data={gamingInfo} />
    </div>
  );
}

function InfoCard({ title, data }) {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] bg-[rgba(5,6,10,0.3)] p-6 shadow-[0_0_3px_0_#dea220]">
      <h3
        className="text-[16px] font-semibold uppercase text-[#f6dda6] leading-[24px]"
        style={{ letterSpacing: "-1px" }}
      >
        {title}
      </h3>
      <div className="flex flex-col gap-3">
        {Object.entries(data).map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex-1 min-w-0 text-[14px] font-semibold text-white leading-[21px]"
        style={{ letterSpacing: "-1px" }}
      >
        {label}
      </span>
      <span className="text-[12px] font-medium text-[#84ebb4] leading-[18px] text-right whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

function NotesCard({ notes }) {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] bg-[rgba(5,6,10,0.3)] p-6 shadow-[0_0_3px_0_#dea220]">
      <h3
        className="text-[16px] font-semibold uppercase text-[#f6dda6] leading-[24px]"
        style={{ letterSpacing: "-1px" }}
      >
        Notes
      </h3>
      <p className="text-[12px] font-medium text-white leading-[18px]">{notes}</p>
    </div>
  );
}
