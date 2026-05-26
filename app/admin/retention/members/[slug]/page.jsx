"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PeriodToggle from "../../../../components/admin/retention/PeriodToggle";
import { ASSETS, GRAD_DARK, GRAD_GOLD } from "../../../../components/admin/retention/constants";
import { getCrmMemberSingle, patchCrmMember } from "../../../../api/crmApi";
import { getVipTierList, getWalletVipTiers, getStationList } from "../../../../api/adminApi";

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

// Map GET response wallet_level (names) → PUT payload wallet_levels (UUIDs).
function buildWalletLevels(memberData, walletVipTiers, stationList) {
  const raw = memberData?.customer_data?.wallet_level;
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    const sName = String(item?.Station || item?.station || "").toLowerCase();
    const lName = String(item?.Level || item?.level || "").toLowerCase();
    const station = stationList.find((s) => String(s.name || s.station_name || "").toLowerCase() === sName);
    const tier = walletVipTiers.find(
      (t) => String(t.station_name || "").toLowerCase() === sName &&
             String(t.tier_name || t.name || "").toLowerCase() === lName
    );
    if (station?.uuid && tier?.uuid) out.push({ station_uuid: station.uuid, wallet_level_uuid: tier.uuid });
  }
  return out;
}

export default function MemberProfilePage() {
  const params = useParams();
  const memberUuid = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";
  const [period, setPeriod] = useState("Daily");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [walletVipTiers, setWalletVipTiers] = useState([]);
  const [stationList, setStationList] = useState([]);

  useEffect(() => {
    if (!memberUuid) return;
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [res, walletTiersRes, stationsRes] = await Promise.all([
          getCrmMemberSingle(memberUuid),
          getWalletVipTiers().catch(() => []),
          getStationList().catch(() => []),
        ]);
        if (cancelled) return;
        setData(res);
        setWalletVipTiers(normalizeListResponse(walletTiersRes));
        setStationList(normalizeListResponse(stationsRes));
      } catch (err) {
        if (cancelled) return;
        console.error("[member-profile] fetch failed", err);
        setError(err);
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
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
      />
      <StatsRow stats={stats} />
      <InfoGrid basicInfo={basicInfo} financialInfo={financialInfo} gamingInfo={gamingInfo} />
      <NotesCard notes={show(data?.gaming_info?.note || data?.notes, "No notes available.")} />

      {activeModal === "note" && (
        <NoteModal
          memberUuid={memberUuid}
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
          walletVipTiers={walletVipTiers}
          stationList={stationList}
          initialWalletLevels={buildWalletLevels(data, walletVipTiers, stationList)}
          onClose={() => setActiveModal(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

function ProfileHeader({ name, tags, dateJoined, slug, period, onPeriodChange, activeBrands, onNoteOpen, onVipOpen }) {
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
            <MoreOptionsMenu onNoteOpen={onNoteOpen} onVipOpen={onVipOpen} />
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
  // { key: "send-bonus",       label: "Send Bonus" },
  { key: "add-note",         label: "Add Note" },
  { key: "change-vip-level", label: "Change VIP Level" },
  { key: "block-customer",   label: "Block Customer", danger: true },
];

function MoreOptionsMenu({ onNoteOpen, onVipOpen }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (key) => {
    setOpen(false);
    if (key === "add-note") onNoteOpen();
    else if (key === "change-vip-level") onVipOpen();
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

// Custom styled dropdown matching the dark edit-form style.
function StyledSelect({ value, onChange, options, placeholder = "Select...", disabled = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full min-h-[42px] items-center justify-between gap-2 rounded-[8px] border px-4 py-2.5 text-left transition ${
          disabled ? "border-[#fbeed2]/30 opacity-50 cursor-not-allowed" : "border-[#fbeed2] hover:border-[#f2cb7a]"
        }`}
      >
        <span className={`text-[13px] font-medium leading-[20px] ${selected ? "text-white" : "text-white/40"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[200px] overflow-y-auto rounded-[8px] border border-[#f2cb7a] bg-[#05060a] shadow-lg">
          <button type="button" onClick={() => { onChange(""); setOpen(false); }}
            className="flex w-full items-center px-3 py-2 text-left hover:bg-white/5">
            <span className="text-[13px] font-medium text-white/40 leading-[20px]">{placeholder}</span>
          </button>
          {options.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/5">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: "#d9acff" }} />
              <span className="text-[13px] font-medium text-[#f6dda6] leading-[20px]">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteModal({ memberUuid, initialNote, onClose, onSaved }) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await patchCrmMember(memberUuid, { game_info: { note: note || "" } });
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

function VipModal({ memberUuid, memberData, currentVipLabel, walletVipTiers, stationList, initialWalletLevels, onClose, onSaved }) {
  const [mrsTiers, setMrsTiers] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [selectedMrsUuid, setSelectedMrsUuid] = useState(null);
  const [walletSelections, setWalletSelections] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    getVipTierList()
      .then((res) => {
        const tiers = normalizeListResponse(res);
        setMrsTiers(tiers);
        if (currentVipLabel) {
          const match = tiers.find((t) => (t.name || t.tier_name || "").toLowerCase() === currentVipLabel.toLowerCase());
          if (match) setSelectedMrsUuid(match.uuid);
        }
      })
      .catch((err) => console.error("[vip-modal] tiers load failed", err))
      .finally(() => setTiersLoading(false));
  }, [currentVipLabel]);

  useEffect(() => {
    const init = {};
    for (const wl of initialWalletLevels || []) {
      if (wl.station_uuid && wl.wallet_level_uuid) init[wl.station_uuid] = wl.wallet_level_uuid;
    }
    setWalletSelections(init);
  }, [initialWalletLevels]);

  // Stations that actually have wallet VIP tiers
  const walletStations = (stationList || []).filter((s) =>
    (walletVipTiers || []).some(
      (t) => String(t.station_name || "").toLowerCase() === String(s.name || s.station_name || "").toLowerCase()
    )
  );

  const [walletStation, setWalletStation] = useState("");
  const selectedStation = walletStations.find((s) => s.uuid === walletStation);
  const selectedStationTiers = selectedStation
    ? (walletVipTiers || []).filter(
        (t) => String(t.station_name || "").toLowerCase() === String(selectedStation.name || selectedStation.station_name || "").toLowerCase()
      )
    : [];
  const currentLevelUuid = walletStation ? (walletSelections[walletStation] || "") : "";

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const walletLevels = Object.entries(walletSelections)
        .filter(([, uuid]) => uuid)
        .map(([station_uuid, wallet_level_uuid]) => ({ station_uuid, wallet_level_uuid }));
      await patchCrmMember(memberUuid, {
        profile_data: {
          mrs_vip_level_uuid: selectedMrsUuid,
          wallet_levels: walletLevels,
        },
      });
      onSaved();
    } catch (err) {
      console.error("[vip-modal] save failed", err);
      setSaveError("Failed to update VIP level. Please try again.");
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle>Change VIP Level</ModalTitle>

      {/* MRS VIP Section */}
      <div className="mb-5">
        <p className="text-[14px] font-medium text-[#f6dda6] leading-[21px] mb-2">MRS VIP Level</p>
        {currentVipLabel && (
          <div className="mb-3">
            <p className="text-[11px] text-white/50 mb-1">Current</p>
            <span className="inline-flex h-[24px] items-center rounded-[8px] px-3 text-[12px] font-semibold" style={{ backgroundColor: TAG_STYLES.vip.bg, color: TAG_STYLES.vip.color }}>
              {currentVipLabel}
            </span>
          </div>
        )}
        {tiersLoading ? (
          <div className="rounded-[8px] border border-[#fbeed2]/30 px-4 py-3 text-[12px] text-white/40">Loading...</div>
        ) : (
          <StyledSelect
            value={selectedMrsUuid || ""}
            onChange={(v) => setSelectedMrsUuid(v || null)}
            placeholder="Select MRS VIP..."
            options={mrsTiers.map((t) => ({ value: t.uuid, label: t.name || t.tier_name || t.uuid }))}
          />
        )}
      </div>

      {/* Wallet VIP — cascading: pick station, then pick level for that station */}
      {walletStations.length > 0 && (
        <div className="mb-5">
          <p className="text-[14px] font-medium text-[#f6dda6] leading-[21px] mb-3">Wallet VIP Level</p>
          <div className="flex flex-col gap-3">
            {/* Station selector */}
            <div>
              <p className="text-[11px] text-white/50 mb-1">Station</p>
              <StyledSelect
                value={walletStation}
                onChange={setWalletStation}
                placeholder="Select station..."
                options={walletStations.map((s) => ({ value: s.uuid, label: s.name || s.station_name }))}
              />
            </div>
            {/* VIP level for selected station */}
            <div>
              <p className="text-[11px] text-white/50 mb-1">VIP Level</p>
              <StyledSelect
                value={currentLevelUuid}
                disabled={!walletStation}
                onChange={(v) => setWalletSelections((prev) => ({ ...prev, [walletStation]: v || undefined }))}
                placeholder={walletStation ? "Select level..." : "Select a station first"}
                options={selectedStationTiers.map((t) => ({ value: t.uuid, label: t.tier_name || t.name || t.uuid }))}
              />
            </div>
            {/* Summary chips of all selected wallet levels */}
            {Object.keys(walletSelections).filter((k) => walletSelections[k]).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {walletStations.filter((s) => walletSelections[s.uuid]).map((s) => {
                  const tier = (walletVipTiers || []).find((t) => t.uuid === walletSelections[s.uuid]);
                  return (
                    <span key={s.uuid} className="rounded-[6px] border border-[#f2cb7a]/40 px-2 py-0.5 text-[11px] text-[#f6dda6]">
                      {s.name || s.station_name}: {tier?.tier_name || tier?.name || "—"}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {saveError && <p className="mt-2 text-[12px] text-[#fb3748]">{saveError}</p>}
      <ModalActions onClose={onClose} onSave={handleSave} saving={saving} />
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
