"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PeriodToggle from "../../../../components/admin/retention/PeriodToggle";
import { ASSETS, GRAD_DARK, GRAD_GOLD } from "../../../../components/admin/retention/constants";
import { getCrmMemberSingle, updateCrmMember, getCrmVipTiers } from "../../../../api/crmApi";

const TAG_STYLES = {
  vip:    { bg: "#d9acff", color: "#8800fb" },
  game:   { bg: "#ffe9bc", color: "#d48a00" },
  low:    { bg: "#fb3748", color: "#fbeed2" },
  active: { bg: "#84ebb4", color: "#00813c" },
  weekly: { bg: "#a4a4a4", color: "#141828" },
};

const ACTIVE_BRANDS = ["KG", "AB", "EP", "LV", "UB", "N1"];

const BRAND_COLORS = {
  N1: { bg: "#FBBF24", text: "#141828", border: "#FBBF24" }, // yellow
  KG: { bg: "#3B82F6", text: "#ffffff", border: "#3B82F6" }, // blue
  AB: { bg: "#F97316", text: "#ffffff", border: "#F97316" }, // orange
  EP: { bg: "#22C55E", text: "#141828", border: "#22C55E" }, // green
  UB: { bg: "#EF4444", text: "#ffffff", border: "#EF4444" }, // red
  LV: { bg: "#EC4899", text: "#ffffff", border: "#EC4899" }, // pink
};

// Lowercase station name/code → display code shown in "Active on" chips.
// Includes both full names and short codes so either format from the API works.
const STATION_TO_BRAND = {
  // full names
  "n1gang":   "N1",
  "kgame99":  "KG",
  "acebet77": "AB",
  "ep369":    "EP",
  "ubetclub": "UB",
  "lv918":    "LV",
  // short codes
  "n1": "N1",
  "kg": "KG",
  "ab": "AB",
  "ep": "EP",
  "ub": "UB",
  "lv": "LV",
};

// Reads customer_data.wallet_level from the Member Single API.
// Each item is { Station: str, Level: str }.
// Returns brand codes for stations found in the response.
// If wallet_level is missing or empty, returns [] — no fallback.
function inferActiveBrands(customerData) {
  if (!customerData) return [];
  const walletLevel = customerData.wallet_level;
  if (!Array.isArray(walletLevel) || walletLevel.length === 0) return [];
  return walletLevel
    .map((item) => {
      const name = String(item?.Station || item?.station || "").trim().toLowerCase();
      return STATION_TO_BRAND[name] ?? null;
    })
    .filter(Boolean);
}


function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function show(value, fallback = "—") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function inferTags(data) {
  const tags = [];
  const vip = data?.customer_data?.mrs_level || data?.customer_data?.vip_level || data?.vip_level;
  if (vip) tags.push({ label: vip, kind: "vip" });
  const game = data?.gaming_info?.game_preference;
  if (game) tags.push({ label: game, kind: "game" });
  const priority = data?.priority;
  if (priority) tags.push({ label: priority, kind: priority === "Low" ? "low" : "active" });
  return tags;
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
}

// ─── Enum maps for PUT payload (mirrors edit/page.jsx) ────────────────────────
const ENUMS = {
  gender:              ["Male", "Female", "Prefer not to say"],
  nationality:         ["South Korean", "Malaysian", "Singaporean", "Thai", "Other"],
  marital:             ["Single", "Married", "Divorced", "Widowed"],
  playerType:          ["VIP", "Regular", "New", "Dormant"],
  risk:                ["Low", "Medium", "High"],
  depositFreq:         ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly"],
  status:              ["Active", "Inactive", "Dormant", "Suspended"],
  hobby:               ["Gaming", "Reading", "Sports", "Music", "Travel", "Cooking", "Photography"],
  providerPref:        ["Pragmatic", "Microgaming", "NetEnt", "Playtech", "PG Soft", "Evolution"],
  depositTrigger:      ["Bonus", "Promotion", "FOMO", "Habit", "Tournament"],
  churnRiskReason:     ["Any", "Lost Interest", "Better Offer", "Personal Reason", "Service Issue"],
  reactivationTrigger: ["Any", "Bonus", "Tournament", "VIP Upgrade", "Personal Outreach"],
  riskStyle:           ["Conservative", "Balanced", "Aggressive", "High Risk"],
  depositFreqStyle:    ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly"],
  paymentMethod:       ["Bank Transfer", "Credit Card", "Debit Card", "E-Wallet", "Crypto", "Other"],
  playTimePattern:     ["Morning (6am-12pm)", "Afternoon (12pm-6pm)", "Evening (6pm-8pm)", "Night (8pm-2am)", "Late Night (2am-6am)"],
};

function labelToInt(enumKey, label) {
  if (!label) return undefined;
  const list = ENUMS[enumKey];
  if (!list) return undefined;
  const norm = String(label).toLowerCase().trim();
  const idx = list.findIndex((opt) => opt.toLowerCase().trim() === norm);
  return idx >= 0 ? idx + 1 : undefined;
}

function labelsToInts(enumKey, value) {
  if (!value) return [];
  const labels = Array.isArray(value) ? value : String(value).split(",").map((s) => s.trim());
  return labels.filter(Boolean).map((l) => labelToInt(enumKey, l)).filter((v) => v !== undefined);
}

function getExistingVipUuid(data) {
  return (
    data?.profile_data?.vip_level_uuid ||
    data?.basic_info?.vip_level_uuid ||
    data?.customer_data?.vip_level_uuid ||
    data?.customer_data?.mrs_level_uuid ||
    data?.vip_level_uuid ||
    undefined
  );
}

// Reconstruct the full PUT payload from the GET response data, applying any
// overrides for profile_data or game_info fields.
function buildMemberPayload(data, { profileDataOverrides = {}, gameInfoOverrides = {} } = {}) {
  const c = data?.customer_data || {};
  const b = data?.basic_info || {};
  const g = data?.gaming_info || {};
  const f = data?.financial_info || {};

  return {
    profile_data: {
      vip_level_uuid: getExistingVipUuid(data),
      player_type:       labelToInt("playerType", g.player_type),
      risk:              labelToInt("risk", g.risk_style),
      deposit_frequency: labelToInt("depositFreq", g.deposit_frequency_style),
      status:            labelToInt("status", data?.status || "Active") || 1,
      ...profileDataOverrides,
    },
    basic_info: {
      gender:         labelToInt("gender", c.gender || b.gender),
      date_of_birth:  c.date_of_birth || b.date_of_birth || undefined,
      nationality:    labelToInt("nationality", c.nationality || b.nationality),
      home_address:   c.home_address || b.home_address || undefined,
      marital_status: labelToInt("marital", c.marital_status || b.marital_status),
      job:            c.job || b.job || undefined,
      hobby:          labelsToInts("hobby", c.hobby || b.hobby),
      payment_method: labelToInt("paymentMethod", f.payment_method),
    },
    game_info: {
      game_preference:        g.game_preference || undefined,
      provider_Preference:    labelsToInts("providerPref", g.provider_preference),
      play_type_pattern:      labelToInt("playTimePattern", g.play_time_pattern),
      average_bet_size:       g.average_bet_size ? parseFloat(g.average_bet_size) || undefined : undefined,
      player_type:            labelToInt("playerType", g.player_type),
      risk_style:             labelToInt("riskStyle", g.risk_style),
      deposit_frequency_style: labelToInt("depositFreqStyle", g.deposit_frequency_style),
      deposit_trigger:        labelsToInts("depositTrigger", g.deposit_trigger),
      churn_risk_reason:      labelsToInts("churnRiskReason", g.churn_risk_reason),
      reactivation_trigger:   labelsToInts("reactivationTrigger", g.reactivation_trigger),
      note:                   g.note || undefined,
      ...gameInfoOverrides,
    },
  };
}

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberUuid = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";
  const [period, setPeriod] = useState("Daily");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState(null);

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
  }, [memberUuid, refreshKey]);

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

  const customer = data?.customer_data || {};
  const basic = data?.basic_info || {};

  const basicInfo = {
    Username: show(customer?.username || basic?.username),
    Phone: show(customer?.phone_number || basic?.phone_number),
    Gender: show(customer?.gender || basic?.gender),
    "Date of Birth": show(customer?.date_of_birth || basic?.date_of_birth),
    Age: show(customer?.age ?? basic?.age),
    Nationality: show(customer?.nationality || basic?.nationality),
    "Home Address": show(customer?.home_address || basic?.home_address),
    "Marital Status": show(customer?.marital_status || basic?.marital_status),
    Job: show(customer?.job || basic?.job),
    Hobby: show(customer?.hobby || basic?.hobby),
  };

  const financialInfo = {
    "Total Sales": formatCurrency(data?.financial_info?.total_sales),
    "Total Withdrawal": formatCurrency(customer?.total_withdrawal),
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
    mrsLevel: show(customer?.mrs_level || customer?.vip_level || data?.vip_level),
    nsLevel: show(customer?.ns_level, "—"),
    totalSales: formatCurrency(data?.financial_info?.total_sales),
    totalWinLose: formatCurrency(data?.financial_info?.total_win_lose),
  };

  const activeBrands = inferActiveBrands(data?.customer_data);

  const handleSaved = () => {
    setActiveModal(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <ProfileHeader
        name={data?.full_name || basic?.username || "Member"}
        tags={inferTags(data)}
        dateJoined={show(data?.date_joined)}
        slug={memberUuid}
        period={period}
        onPeriodChange={setPeriod}
        activeBrands={activeBrands}
        onNoteOpen={() => setActiveModal("note")}
        onVipOpen={() => setActiveModal("vip")}
        onAddTag={() => router.push(`/admin/retention/members/${memberUuid}/edit`)}
      />
      <StatsRow stats={stats} />
      <InfoGrid basicInfo={basicInfo} financialInfo={financialInfo} gamingInfo={gamingInfo} />
      <NotesCard notes={show(data?.gaming_info?.note || data?.notes, "No notes available.")} />

      {activeModal === "note" && (
        <NoteModal
          memberUuid={memberUuid}
          memberData={data}
          initialNote={data?.gaming_info?.note || ""}
          onClose={() => setActiveModal(null)}
          onSaved={handleSaved}
        />
      )}
      {activeModal === "vip" && (
        <VipModal
          memberUuid={memberUuid}
          memberData={data}
          currentVipLabel={stats.mrsLevel !== "—" ? stats.mrsLevel : ""}
          onClose={() => setActiveModal(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

function ProfileHeader({ name, tags, dateJoined, slug, period, onPeriodChange, activeBrands, onNoteOpen, onVipOpen, onAddTag }) {
  return (
    <div className="flex flex-col gap-4 px-2 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-6">
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
            <MoreOptionsMenu onNoteOpen={onNoteOpen} onVipOpen={onVipOpen} onAddTag={onAddTag} />
          </div>
        </div>
      </div>
      <ActiveBrandsRow active={activeBrands} />
      <div className="flex items-center gap-2">
        <PeriodToggle period={period} onPeriodChange={onPeriodChange} />
      </div>
    </div>
  );
}

function ActiveBrandsRow({ active }) {
  const activeSet = new Set(active || []);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] font-medium leading-[18px] text-white whitespace-nowrap">
        Active on:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {ACTIVE_BRANDS.map((code) => {
          const isActive = activeSet.has(code);
          const colors = BRAND_COLORS[code];
          return (
            <span
              key={code}
              className="flex h-[34px] min-w-[44px] items-center justify-center rounded-[8px] border-2 px-3 text-[12px] font-semibold leading-[18px]"
              style={
                isActive
                  ? { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }
                  : { borderColor: "rgba(242,203,122,0.4)", color: "rgba(246,221,166,0.4)" }
              }
            >
              {code}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const MORE_OPTIONS = [
  { key: "send-bonus",       label: "Send Bonus" },
  { key: "add-note",         label: "Add Note" },
  { key: "change-vip-level", label: "Change VIP Level" },
  { key: "add-tag",          label: "Add Tag" },
  { key: "block-customer",   label: "Block Customer", danger: true },
  { key: "alert",            label: "Alert",          danger: true },
];

function MoreOptionsMenu({ onNoteOpen, onVipOpen, onAddTag }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (key) => {
    setOpen(false);
    if (key === "add-note") onNoteOpen();
    else if (key === "change-vip-level") onVipOpen();
    else if (key === "add-tag") onAddTag();
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

function ModalOverlay({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg rounded-[16px] p-8 shadow-[0_0_3px_0_#dea220]"
        style={{ backgroundColor: "#05060a" }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalTitle({ children }) {
  return (
    <h2
      className="bg-clip-text text-transparent font-bold mb-5"
      style={{
        backgroundImage: GRAD_GOLD,
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: "22px",
        lineHeight: "33px",
        letterSpacing: "-1.5px",
      }}
    >
      {children}
    </h2>
  );
}

function ModalActions({ onClose, onSave, saving, saveLabel = "Save" }) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#d00416] px-6 py-2 text-[14px] font-semibold text-[#d00416] leading-[21px] transition hover:bg-[#d00416]/10 disabled:opacity-50"
        style={{ letterSpacing: "-1px" }}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] leading-[21px] transition hover:brightness-110 disabled:opacity-60"
        style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {saving ? "Saving..." : saveLabel}
      </button>
    </div>
  );
}

function NoteModal({ memberUuid, memberData, initialNote, onClose, onSaved }) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateCrmMember(memberUuid, buildMemberPayload(memberData, {
        gameInfoOverrides: { note: note || undefined },
      }));
      onSaved();
    } catch (err) {
      console.error("[note-modal] save failed", err);
      setSaveError("Failed to save note. Please try again.");
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle>Add Note</ModalTitle>
      <label className="block text-[14px] font-medium text-[#f6dda6] leading-[21px] mb-2">
        Note
      </label>
      <div className="rounded-[8px] border border-[#fbeed2] px-4 py-3">
        <textarea
          rows={6}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write a note about this member..."
          className="block w-full resize-none bg-transparent text-[12px] font-medium leading-[18px] text-white outline-none placeholder:text-white/40"
        />
      </div>
      {saveError && (
        <p className="mt-2 text-[12px] text-[#fb3748]">{saveError}</p>
      )}
      <ModalActions onClose={onClose} onSave={handleSave} saving={saving} />
    </ModalOverlay>
  );
}

function VipModal({ memberUuid, memberData, currentVipLabel, onClose, onSaved }) {
  const [vipTiers, setVipTiers] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    getCrmVipTiers({ page: 1, page_size: 100 })
      .then((res) => {
        const tiers = normalizeListResponse(res);
        setVipTiers(tiers);
        if (currentVipLabel) {
          const match = tiers.find((t) =>
            (t.name || t.tier_name || "").toLowerCase() === currentVipLabel.toLowerCase()
          );
          if (match) setSelectedUuid(match.uuid);
        }
      })
      .catch((err) => console.error("[vip-modal] tiers load failed", err))
      .finally(() => setTiersLoading(false));
  }, [currentVipLabel]);

  const handleSave = async () => {
    if (saving || !selectedUuid) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateCrmMember(memberUuid, buildMemberPayload(memberData, {
        profileDataOverrides: { vip_level_uuid: selectedUuid },
      }));
      onSaved();
    } catch (err) {
      console.error("[vip-modal] save failed", err);
      setSaveError("Failed to update VIP level. Please try again.");
      setSaving(false);
    }
  };

  const selectedTier = vipTiers.find((t) => t.uuid === selectedUuid);
  const selectedLabel = selectedTier ? (selectedTier.name || selectedTier.tier_name || "") : null;

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle>Change VIP Level</ModalTitle>

      {currentVipLabel && (
        <div className="mb-5">
          <p className="text-[12px] font-medium text-white/60 leading-[18px] mb-2">Current VIP Level</p>
          <span
            className="inline-flex h-[27px] items-center justify-center rounded-[12px] px-4 text-[12px] font-semibold"
            style={{ backgroundColor: TAG_STYLES.vip.bg, color: TAG_STYLES.vip.color }}
          >
            {currentVipLabel}
          </span>
        </div>
      )}

      <label className="block text-[14px] font-medium text-[#f6dda6] leading-[21px] mb-2">
        Select New VIP Level
      </label>
      {tiersLoading ? (
        <div className="rounded-[8px] border border-[#fbeed2]/30 px-4 py-3 text-[12px] text-white/40">
          Loading VIP levels...
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[8px] border border-[#fbeed2] px-4 py-3">
          <select
            value={selectedUuid || ""}
            onChange={(e) => setSelectedUuid(e.target.value || null)}
            className="flex-1 appearance-none bg-transparent text-[12px] font-medium leading-[18px] text-white outline-none [color-scheme:dark]"
          >
            <option value="" className="bg-[#05060a] text-white/60">Select a VIP level...</option>
            {vipTiers.map((tier) => {
              const label = tier.name || tier.tier_name || tier.uuid;
              return (
                <option key={tier.uuid} value={tier.uuid} className="bg-[#05060a] text-white">
                  {label}
                </option>
              );
            })}
          </select>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}

      {selectedLabel && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[12px] text-white/60">Selected:</span>
          <span
            className="inline-flex h-[23px] items-center justify-center rounded-[12px] px-3 text-[12px] font-medium"
            style={{ backgroundColor: TAG_STYLES.vip.bg, color: TAG_STYLES.vip.color }}
          >
            {selectedLabel}
          </span>
        </div>
      )}

      {saveError && (
        <p className="mt-2 text-[12px] text-[#fb3748]">{saveError}</p>
      )}
      <ModalActions
        onClose={onClose}
        onSave={handleSave}
        saving={saving}
        saveLabel={!selectedUuid ? "Select a level" : "Save"}
      />
    </ModalOverlay>
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
    { label: "Total Win/Lose", value: stats.totalWinLose },
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
