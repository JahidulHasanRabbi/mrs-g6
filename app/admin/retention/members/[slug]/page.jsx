"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PeriodToggle from "../../../../components/admin/retention/PeriodToggle";
import { ASSETS, GRAD_DARK, GRAD_GOLD } from "../../../../components/admin/retention/constants";

// Member profile detail — mirrors Figma node 34:316.
// Routes: /admin/retention/members/[slug] where slug is the member name
// kebab-cased (e.g. "ah-chong"). Falls back to a generic stub when the slug
// isn't recognized so the page still renders for unknown members.

const TAG_STYLES = {
  vip:    { bg: "#d9acff", color: "#8800fb" },
  game:   { bg: "#ffe9bc", color: "#d48a00" },
  low:    { bg: "#fb3748", color: "#fbeed2" },
  active: { bg: "#84ebb4", color: "#00813c" },
  weekly: { bg: "#a4a4a4", color: "#141828" },
};

const MEMBER_PROFILES = {
  "ah-chong": {
    name: "Ah Chong",
    dateJoined: "July 2nd, 2025",
    tags: [
      { label: "VIP 1", kind: "vip" },
      { label: "Slots", kind: "game" },
      { label: "Low", kind: "low" },
      { label: "Active", kind: "active" },
      { label: "Weekly", kind: "weekly" },
    ],
    stats: { mrsLevel: "Ruby", nsLevel: "Gold III", totalSales: "RM 20,655", totalWinLose: "RM 15,098" },
    basicInfo: {
      Username: "kettle_man21",
      Phone: "+026646464654",
      Gender: "Male",
      "Date of Birth": "22.06.97",
      Age: "28",
      Nationality: "South Korean",
      "Home Address": "3b- South Side, Seoul",
      "Marital Status": "Married",
      Job: "UX Designer",
      Hobby: "Gaming",
    },
    financialInfo: {
      "Total Sales": "50",
      "Total Withdrawal": "50",
      "Total Win/lose": "50",
      "Total Bonus": "50",
      "Total Sales Ticket": "50",
      "Total Withdrawal Ticket": "50",
      ARPU: "50",
      "Average Deposit": "50",
      "Last Deposit Date": "50",
      "Payment Method": "50",
    },
    gamingInfo: {
      "Game Preference": "Slot - Great Blue",
      "Provider Preference": "Pragmatic Play",
      "Play Time Pattern": "Night ( 8pm - 2am )",
      "Average Bet Size": "RM 50 - RM 200",
      "Player Type": "VIP",
      "Risk Style": "High Risk",
      "Deposit Frequency Style": "Weekly",
      "Deposit Trigger": "Bonus",
      "Churn Risk Reason": "Any",
      "Re-activation Trigger": "Any",
    },
    notes:
      "Player behavior refers to the actions, attitudes, and interactions of individuals during sports or games. Good player behavior includes teamwork, respect, discipline, honesty, and fair play. Players should follow rules, respect referees, coaches, teammates, and opponents, and maintain self-control even during difficult situations. Positive behavior encourages healthy competition and creates a friendly environment for everyone. Bad behavior, such as cheating, arguing, or using offensive language, can negatively affect the game and team spirit. Responsible players also show dedication through regular practice and sportsmanship. Good player behavior not only improves performance but also teaches valuable life skills like leadership, cooperation, patience, and respect for others.",
  },
};

function slugToName(slug) {
  if (!slug) return "Unknown Member";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getProfileBySlug(slug) {
  if (MEMBER_PROFILES[slug]) return MEMBER_PROFILES[slug];
  return { ...MEMBER_PROFILES["ah-chong"], name: slugToName(slug) };
}

export default function MemberProfilePage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";
  const profile = getProfileBySlug(slug);
  const [period, setPeriod] = useState("Daily");

  return (
    <>
      <ProfileHeader profile={profile} slug={slug} period={period} onPeriodChange={setPeriod} />
      <StatsRow stats={profile.stats} />
      <InfoGrid profile={profile} />
      <NotesCard notes={profile.notes} />
    </>
  );
}

function ProfileHeader({ profile, slug, period, onPeriodChange }) {
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
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {profile.tags.map((tag) => (
                  <Tag key={tag.label} label={tag.label} kind={tag.kind} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-normal leading-[15px] text-white capitalize">
            Date Joined: {profile.dateJoined}
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
    // TODO: wire each action to its admin endpoint.
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

function InfoGrid({ profile }) {
  return (
    <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <InfoCard title="Basic Info" data={profile.basicInfo} />
      <InfoCard title="Financial Info" data={profile.financialInfo} />
      <InfoCard title="Gaming Info" data={profile.gamingInfo} />
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
