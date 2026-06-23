"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GRAD_GOLD } from "../../../../components/admin/retention/constants";
import {
  AlertHistorySection,
  FollowUpCreateModal,
} from "../../../../components/admin/retention/FollowUpComponents";
import { assignCrmMemberToPic, getCrmFollowUps, getCrmMemberSingle, getCrmUsers, patchCrmMember, patchCrmMemberAlert, patchCrmMemberFollowUp, refreshCrmMember, sendCrmMemberBonus, updateCrmMemberData } from "../../../../api/crmApi";
import { getVipTierList, getWalletVipTiers, getStationList } from "../../../../api/adminApi";

const TAG_STYLES = {
  vip:    { bg: "#d9acff", color: "#8800fb" },
  game:   { bg: "#ffe9bc", color: "#d48a00" },
  low:    { bg: "#fb3748", color: "#fbeed2" },
  active: { bg: "#84ebb4", color: "#00813c" },
  weekly: { bg: "#a4a4a4", color: "#141828" },
  user:   { bg: "#fbeed2", color: "#9a6e10" },
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
  const walletLevels = customerData.wallet_levels || customerData.wallet_level;
  if (!Array.isArray(walletLevels) || walletLevels.length === 0) return [];
  return walletLevels
    .map((item) => {
      const name = normalizeLookup(item?.Station || item?.station || item?.station_name);
      return STATION_TO_BRAND[name] ?? null;
    })
    .filter(Boolean);
}


function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `RM ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const raw = String(value).trim();
  const normalized = raw.replace(/,/g, "");
  const match = normalized.match(/^(-?)(\d+)(\.\d+)?$/);
  if (!match) return `RM ${raw}`;
  const [, sign, integer, decimal = ""] = match;
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `RM ${sign}${grouped}${decimal}`;
}

// True when a `formatCurrency` result represents a negative amount (e.g.
// "RM -7,610.15"). Used to flip the value-cell color to red in StatCard
// and InfoRow so losses pop visually.
function isNegativeCurrency(value) {
  return typeof value === "string" && /^RM\s+-/.test(value);
}

function show(value, fallback = "—") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function formatDateOnly(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const raw = String(value);

  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;

  const dmy = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmy) return `${dmy[1]}/${dmy[2]}/${dmy[3]}`;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function inferTags(data) {
  const tags = [];
  const vip = data?.customer_data?.mrs_level || data?.customer_data?.vip_level || data?.vip_level;
  if (vip) tags.push({ label: vip, kind: "vip" });
  const game = data?.gaming_info?.game_preference;
  if (game) tags.push({ label: game, kind: "game" });
  const priority = data?.priority;
  if (priority) tags.push({ label: priority, kind: priority === "Low" ? "low" : "active" });
  const userTags = Array.isArray(data?.customer_data?.tags)
    ? data.customer_data.tags
    : Array.isArray(data?.profile_data?.tags)
      ? data.profile_data.tags
      : [];
  userTags.filter(Boolean).forEach((label) => tags.push({ label, kind: "user" }));
  return tags;
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
}

function normalizeLookup(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stationName(station) {
  return station?.name || station?.station_name || station?.Station || station?.special_code || station?.code || "";
}

function stationCandidates(station) {
  return [
    station?.name,
    station?.station_name,
    station?.Station,
    station?.special_code,
    station?.code,
    station?.short_code,
  ].map(normalizeLookup).filter(Boolean);
}

function walletTierStationCandidates(tier) {
  return [
    tier?.station_name,
    tier?.station,
    tier?.station_code,
    tier?.station_special_code,
    tier?.station_detail?.name,
    tier?.station_detail?.station_name,
    tier?.station_detail?.special_code,
  ].map(normalizeLookup).filter(Boolean);
}

function walletTierName(tier) {
  return tier?.tier_name || tier?.name || tier?.level || tier?.vip_level || tier?.title || "";
}

// Map GET response wallet_level (names) → PUT payload wallet_levels (UUIDs).
function brandFromStationValue(value, stationList = []) {
  const lookup = normalizeLookup(value);
  if (!lookup) return "";
  if (STATION_TO_BRAND[lookup]) return STATION_TO_BRAND[lookup];

  const station = stationList.find((item) => {
    if (item?.uuid && String(item.uuid).toLowerCase() === lookup) return true;
    return stationCandidates(item).includes(lookup);
  });
  if (!station) return "";

  return stationCandidates(station).map((candidate) => STATION_TO_BRAND[candidate]).find(Boolean) || stationName(station);
}

function normalizeStationTags(memberData, stationList = []) {
  const raw = memberData?.tags;
  const items = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? [raw] : [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const brand =
        brandFromStationValue(item.station_uuid, stationList) ||
        brandFromStationValue(item.station, stationList) ||
        brandFromStationValue(item.station_name, stationList) ||
        brandFromStationValue(item.Station, stationList) ||
        brandFromStationValue(item.brand, stationList);
      const tags = [
        item.vip_tag,
        item.other_tag,
        item.tag,
        item.name,
        ...(Array.isArray(item.tags) ? item.tags : []),
      ].filter(Boolean);
      if (!brand || tags.length === 0) return null;
      return { brand, tags };
    })
    .filter(Boolean);
}

function buildWalletLevels(memberData, walletVipTiers, stationList) {
  const raw = memberData?.customer_data?.wallet_levels || memberData?.customer_data?.wallet_level;
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    const sName = normalizeLookup(item?.Station || item?.station || item?.station_name);
    const lName = normalizeLookup(item?.Level || item?.level || item?.tier_name || item?.name);
    if (!sName || !lName) continue;
    const station = stationList.find((s) => stationCandidates(s).includes(sName));
    const tier = walletVipTiers.find(
      (t) => walletTierStationCandidates(t).includes(sName) &&
             normalizeLookup(walletTierName(t)) === lName
    );
    if (station?.uuid && tier?.uuid) out.push({ station_uuid: station.uuid, wallet_level_uuid: tier.uuid });
  }
  return out;
}

// Member's active stations (brand) with UUIDs, for the Send Bonus payload's
// required `station_uuid` (#12 / "Member Bonus - Post").
function memberStations(memberData, stationList) {
  const raw = memberData?.customer_data?.wallet_levels || memberData?.customer_data?.wallet_level;
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    const sName = normalizeLookup(item?.Station || item?.station || item?.station_name);
    if (!sName) continue;
    const station = stationList.find((s) => stationCandidates(s).includes(sName));
    if (station?.uuid) {
      out.push({ uuid: station.uuid, name: stationName(station), brand: STATION_TO_BRAND[sName] || stationName(station) });
    }
  }
  return out;
}

export default function MemberProfilePage() {
  const params = useParams();
  const memberUuid = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [walletVipTiers, setWalletVipTiers] = useState([]);
  const [stationList, setStationList] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertError, setAlertError] = useState("");
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [bonusUpdating, setBonusUpdating] = useState(false);
  const [bonusResult, setBonusResult] = useState(null);
  const [dataUpdating, setDataUpdating] = useState(false);
  // Member Alert state (#13): when on, the whole profile renders in red.
  const [isAlerted, setIsAlerted] = useState(false);
  const [alertConfirm, setAlertConfirm] = useState(null); // "on" | "off" | null
  const [alertToggleSaving, setAlertToggleSaving] = useState(false);

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

  useEffect(() => {
    if (!memberUuid) {
      setAlertHistory([]);
      return;
    }
    let cancelled = false;
    const fetchFollowUps = async () => {
      setAlertLoading(true);
      setAlertError("");
      try {
        const res = await getCrmFollowUps({ page: 1, page_size: 50, member_uuid: memberUuid });
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setAlertHistory(results);
      } catch (err) {
        if (cancelled) return;
        console.error("[member-profile] follow-up fetch failed", err);
        setAlertError("Failed to load follow-up history.");
        setAlertHistory([]);
      } finally {
        if (!cancelled) setAlertLoading(false);
      }
    };
    fetchFollowUps();
    return () => {
      cancelled = true;
    };
  }, [memberUuid, refreshKey]);

  // Seed the alert flag from the backend once data arrives (Member Single GET
  // returns top-level `alert: bool`).
  useEffect(() => {
    if (!data) return;
    setIsAlerted(Boolean(data.alert));
  }, [data]);

  if (loading) {
    return <MemberProfileSkeleton />;
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
    "Date of Birth": formatDateOnly(customer?.date_of_birth || basic?.date_of_birth),
    Age: show(customer?.age ?? basic?.age),
    Nationality: show(customer?.nationality || basic?.nationality),
    "Home Address": show(customer?.home_address || basic?.home_address),
    "Marital Status": show(customer?.marital_status || basic?.marital_status),
    Job: show(customer?.job || basic?.job),
    Hobby: show(customer?.hobby || basic?.hobby),
  };

  const financialInfo = {
    "Total Sales": formatCurrency(data?.financial_info?.total_sales),
    "Total Withdrawal": formatCurrency(data?.financial_info?.total_withdrawal ?? customer?.total_withdrawal),
    "Total Win/Loss": formatCurrency(data?.financial_info?.total_win_lose),
    "Total Bonus": formatCurrency(data?.financial_info?.total_bonus),
    "Total Sales Ticket": show(data?.financial_info?.total_sales_ticket),
    "Total Withdrawal Ticket": show(data?.financial_info?.total_withdrawal_ticket),
    ARPU: formatCurrency(data?.financial_info?.arpu),
    "Average Deposit": formatCurrency(data?.financial_info?.average_deposit),
    "Last Deposit Date": formatDateOnly(data?.financial_info?.last_deposit_date),
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
  const stationTags = normalizeStationTags(data, stationList);

  const handleSaved = () => {
    setActiveModal(null);
    setRefreshKey((k) => k + 1);
  };

  // "Update Bonus" (3-dots menu): trigger a server-side member refresh, then
  // re-pull this member so the bonus/financial figures reflect the latest.
  // Intentionally lightweight — the PIC can spam it; there is no throttle.
  const handleUpdateBonus = async () => {
    if (bonusUpdating || !memberUuid) return;
    setBonusUpdating(true);
    setBonusResult(null);
    try {
      const res = await refreshCrmMember(memberUuid);
      if (res?.status === "ERROR") {
        setBonusResult({
          status: "error",
          title: "Update Bonus Failed",
          message: res?.error_message || "Failed to refresh member bonus data. Please try again.",
        });
        return;
      }
      setBonusResult({
        status: "success",
        title: "Bonus Updated",
        message: "Member bonus data has been refreshed successfully.",
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("[member-profile] update bonus failed", err);
      const detail = err?.data?.detail || err?.data?.message || err?.message;
      setBonusResult({
        status: "error",
        title: "Update Bonus Failed",
        message: detail || "Failed to refresh member bonus data. Please try again.",
      });
    } finally {
      setBonusUpdating(false);
    }
  };

  // "Update Data" (3-dots menu): trigger a server-side member data sync, then
  // re-pull this member so the profile reflects the latest. Mirrors Update
  // Bonus — lightweight, no throttle. Reuses the same ResultModal via bonusResult.
  const handleUpdateData = async () => {
    if (dataUpdating || !memberUuid) return;
    setDataUpdating(true);
    setBonusResult(null);
    try {
      const res = await updateCrmMemberData(memberUuid);
      if (res?.status === "ERROR") {
        setBonusResult({
          status: "error",
          title: "Update Data Failed",
          message: res?.error_message || "Failed to update member data. Please try again.",
        });
        return;
      }
      setBonusResult({
        status: "success",
        title: "Data Updated",
        message: "Member data has been updated successfully.",
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("[member-profile] update data failed", err);
      const detail = err?.data?.detail || err?.data?.message || err?.message;
      setBonusResult({
        status: "error",
        title: "Update Data Failed",
        message: detail || "Failed to update member data. Please try again.",
      });
    } finally {
      setDataUpdating(false);
    }
  };

  // Confirm + persist the Alert toggle (#13) via PATCH /crm-members/members/<uuid>/alert/.
  const handleAlertConfirm = async () => {
    const turnOn = alertConfirm === "on";
    setAlertToggleSaving(true);
    try {
      await patchCrmMemberAlert(memberUuid, turnOn);
      setIsAlerted(turnOn);
      setAlertConfirm(null);
    } catch (err) {
      console.error("[member-profile] alert toggle failed", err);
    } finally {
      setAlertToggleSaving(false);
    }
  };

  const profileName = data?.full_name || basic?.username || "Member";
  const profilePriority = data?.priority || "High";
  return (
    <div
      className={
        isAlerted
          ? "flex flex-col gap-4 rounded-[16px] p-3 ring-2 ring-[#fb3748] bg-[#fb3748]/5"
          : "flex flex-col gap-4"
      }
    >
      {isAlerted && (
        <div className="flex items-center gap-2 rounded-[10px] border border-[#fb3748] bg-[#fb3748]/15 px-4 py-2 text-[13px] font-semibold text-[#fb6f7d]">
          <span aria-hidden="true">⚠</span>
          This member is under Alert.
        </div>
      )}
      <ProfileHeader
        name={profileName}
        tags={inferTags(data)}
        stationTags={stationTags}
        dateJoined={formatDateOnly(customer?.date_joined || data?.date_joined)}
        slug={memberUuid}
        activeBrands={activeBrands}
        alerted={isAlerted}
        onNoteOpen={() => setActiveModal("note")}
        onVipOpen={() => setActiveModal("vip")}
        onAlertOpen={() => setActiveModal("alert")}
        onAssignPicOpen={() => setActiveModal("assign-pic")}
        onUpdateBonus={handleUpdateBonus}
        bonusUpdating={bonusUpdating || dataUpdating}
        onUpdateData={handleUpdateData}
        onSendBonusOpen={() => setActiveModal("send-bonus")}
        onAlertToggle={() => setAlertConfirm(isAlerted ? "off" : "on")}
      />
      <StatsRow stats={stats} />
      <InfoGrid basicInfo={basicInfo} financialInfo={financialInfo} gamingInfo={gamingInfo} />
      <NotesCard notes={show(data?.gaming_info?.note || data?.notes, "No notes available.")} />
      <AlertHistorySection memberName={profileName} history={alertHistory} loading={alertLoading} error={alertError} />

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
      {activeModal === "alert" && (
        <FollowUpCreateModal
          memberName={profileName}
          title="Add Follow Up"
          submitting={alertSubmitting}
          submitError={alertError}
          onClose={() => setActiveModal(null)}
          onSubmit={async (entry) => {
            if (alertSubmitting) return;
            setAlertSubmitting(true);
            setAlertError("");
            try {
              await patchCrmMemberFollowUp(memberUuid, {
                follow_up_remark: entry.follow_up_remark || entry.note || "",
              });
              setActiveModal(null);
              setRefreshKey((k) => k + 1);
            } catch (err) {
              console.error("[member-profile] follow-up save failed", err);
              setAlertError("Failed to save follow-up. Please try again.");
            } finally {
              setAlertSubmitting(false);
            }
          }}
        />
      )}
      {activeModal === "assign-pic" && (
        <AssignPicModal
          memberUuid={memberUuid}
          currentPic={data?.retention || data?.retention_full_name}
          onClose={() => setActiveModal(null)}
          onSaved={handleSaved}
        />
      )}
      {activeModal === "send-bonus" && (
        <SendBonusModal
          memberUuid={memberUuid}
          memberName={profileName}
          stations={memberStations(data, stationList)}
          onClose={() => setActiveModal(null)}
          onResult={(result) => {
            setActiveModal(null);
            setBonusResult(result);
          }}
        />
      )}
      {alertConfirm && (
        <AlertConfirmModal
          mode={alertConfirm}
          memberName={profileName}
          saving={alertToggleSaving}
          onClose={() => setAlertConfirm(null)}
          onConfirm={handleAlertConfirm}
        />
      )}
      {bonusResult && (
        <ResultModal
          result={bonusResult}
          onClose={() => setBonusResult(null)}
        />
      )}
    </div>
  );
}

function ProfileHeader({ name, tags, stationTags, dateJoined, slug, activeBrands, alerted, onNoteOpen, onVipOpen, onAlertOpen, onAssignPicOpen, onUpdateBonus, bonusUpdating, onUpdateData, onSendBonusOpen, onAlertToggle }) {
  return (
    <div className="flex flex-col gap-3 px-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-2">
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
                className={`font-bold whitespace-nowrap ${alerted ? "text-[#fb6f7d]" : "bg-clip-text text-transparent"}`}
                style={{
                  backgroundImage: alerted ? undefined : GRAD_GOLD,
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: "26px",
                  lineHeight: "39px",
                  letterSpacing: "-2px",
                }}
              >
                {name}
              </h1>
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden pb-1">
                {tags.map((tag, index) => (
                  <Tag key={`${tag.kind}-${tag.label}-${index}`} label={tag.label} kind={tag.kind} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <ActiveBrandsRow active={activeBrands} />
      </div>
      <StationTagRow stationTags={stationTags} />
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
          <MoreOptionsMenu onNoteOpen={onNoteOpen} onVipOpen={onVipOpen} onAlertOpen={onAlertOpen} onAssignPicOpen={onAssignPicOpen} onUpdateBonus={onUpdateBonus} bonusUpdating={bonusUpdating} onUpdateData={onUpdateData} onSendBonusOpen={onSendBonusOpen} onAlertToggle={onAlertToggle} alerted={alerted} />
        </div>
      </div>
    </div>
  );
}

function StationTagRow({ stationTags = [] }) {
  if (!stationTags.length) return null;

  return (
    <div className="grid max-w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {stationTags.map((item, index) => {
        const colors = BRAND_COLORS[item.brand] || { bg: "#f2cb7a", text: "#141828", border: "#f2cb7a" };
        return (
          <div
            key={`${item.brand}-${index}`}
            className="grid h-[36px] min-w-0 grid-cols-[44px_1fr] items-center gap-2 rounded-[8px] border px-1.5 py-1"
            style={{ borderColor: colors.border }}
          >
            <span
              className="flex h-[26px] w-[38px] items-center justify-center rounded-[8px] text-[12px] font-semibold leading-[18px]"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {item.brand}
            </span>
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              {item.tags.map((label, tagIndex) => (
                <Tag key={`${item.brand}-${label}-${tagIndex}`} label={label} kind={tagKindForStationLabel(label)} compact />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActiveBrandsRow({ active }) {
  const activeSet = new Set(active || []);
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
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

function MoreOptionsMenu({ onNoteOpen, onVipOpen, onAlertOpen, onAssignPicOpen, onUpdateBonus, bonusUpdating, onUpdateData, onSendBonusOpen, onAlertToggle, alerted }) {
  const [open, setOpen] = useState(false);

  // "Alert" toggles to "Removed from Alert" once the member is flagged (#13).
  const options = [
    { key: "update-bonus", label: "Update Bonus" },
    { key: "update-data",  label: "Update Data" },
    { key: "send-bonus",   label: "Send Bonus" },
    { key: "add-note",     label: "Add Note" },
    { key: "assign-pic",   label: "Assign PIC" },
    { key: "change-vip",   label: "Change VIP" },
    { key: "follow-up",    label: "Follow Up" },
    { key: "alert",        label: alerted ? "Removed from Alert" : "Alert", danger: true },
  ];

  const handleSelect = (key) => {
    setOpen(false);
    if (key === "update-bonus") onUpdateBonus?.();
    else if (key === "update-data") onUpdateData?.();
    else if (key === "send-bonus") onSendBonusOpen?.();
    else if (key === "add-note") onNoteOpen();
    else if (key === "assign-pic") onAssignPicOpen();
    else if (key === "change-vip") onVipOpen();
    else if (key === "follow-up") onAlertOpen();
    else if (key === "alert") onAlertToggle?.();
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
        {bonusUpdating ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#141828]/30 border-t-[#141828]" />
        ) : (
          <DotsIcon />
        )}
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="menu"
            className="absolute left-0 top-full z-20 mt-2 min-w-[220px] overflow-hidden rounded-[12px] bg-[#fbeed2] py-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          >
            {options.map((opt) => (
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg rounded-[16px] p-8 shadow-[0_0_3px_0_#dea220]"
        style={{ backgroundColor: "#05060a" }}
      >
        {children}
      </div>
    </div>,
    document.body
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

function ResultModal({ result, onClose }) {
  const isSuccess = result?.status === "success";

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle>{result?.title || (isSuccess ? "Success" : "Failed")}</ModalTitle>
      <p className="text-[14px] font-medium leading-[21px] text-white/75">
        {result?.message}
      </p>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className={`flex items-center justify-center rounded-[8px] border-2 px-6 py-2 text-[14px] font-semibold leading-[21px] transition ${
            isSuccess
              ? "border-[#f2cb7a] text-[#141828] hover:brightness-110"
              : "border-[#d00416] text-[#d00416] hover:bg-[#d00416]/10"
          }`}
          style={isSuccess ? { backgroundImage: GRAD_GOLD, letterSpacing: "-1px" } : { letterSpacing: "-1px" }}
        >
          OK
        </button>
      </div>
    </ModalOverlay>
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
      <ModalTitle>{initialNote ? "Update Note" : "Add Note"}</ModalTitle>
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

function AssignPicModal({ memberUuid, currentPic, onClose, onSaved }) {
  const [pics, setPics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPicUuid, setSelectedPicUuid] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCrmUsers({ page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        setPics(normalizeListResponse(res));
      })
      .catch((err) => console.error("[assign-pic-modal] users load failed", err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (saving || !selectedPicUuid) return;
    setSaving(true);
    setSaveError(null);
    try {
      await assignCrmMemberToPic(memberUuid, { pic_uuid: selectedPicUuid });
      onSaved();
    } catch (err) {
      console.error("[assign-pic-modal] save failed", err);
      setSaveError("Failed to assign PIC. Please try again.");
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle>Assign PIC</ModalTitle>
      {currentPic ? (
        <div className="mb-4">
          <p className="text-[11px] text-white/50 mb-1">Current PIC</p>
          <span className="text-[13px] text-white">{currentPic}</span>
        </div>
      ) : null}
      <p className="text-[14px] font-medium text-[#f6dda6] leading-[21px] mb-2">Select PIC</p>
      {loading ? (
        <div className="rounded-[8px] border border-[#fbeed2]/30 px-4 py-3 text-[12px] text-white/40">Loading...</div>
      ) : (
        <StyledSelect
          value={selectedPicUuid}
          onChange={setSelectedPicUuid}
          placeholder="Select a PIC..."
          options={pics
            .map((u) => ({ value: u.uuid || u.id, label: u.full_name || u.username || u.email || u.uuid }))
            .filter((o) => o.value)}
        />
      )}
      {saveError && <p className="mt-2 text-[12px] text-[#fb3748]">{saveError}</p>}
      <ModalActions onClose={onClose} onSave={handleSave} saving={saving} />
    </ModalOverlay>
  );
}

// Placeholder bonus catalogue — the real list comes from the backend (#12).
const BONUS_OPTIONS = [
  { label: "RM 1 Bonus", value: "1" },
  { label: "RM 3 Bonus", value: "3" },
  { label: "RM 5 Bonus", value: "5" },
  { label: "RM 8 Bonus", value: "8" },
];

// Send Bonus (#12): pick a bonus (and station, if member is active on more
// than one), Confirm → sends to the member in NS.
function SendBonusModal({ memberUuid, memberName, stations, onClose, onResult }) {
  const [selected, setSelected] = useState("");
  const [stationUuid, setStationUuid] = useState(stations?.length === 1 ? stations[0].uuid : "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!selected || !stationUuid || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await sendCrmMemberBonus(memberUuid, { bonus: selected, station_uuid: stationUuid });
      if (res?.status === "ERROR") {
        setError(res?.error_message || "Failed to send bonus. Please try again.");
        setSending(false);
        return;
      }
      const bonus = BONUS_OPTIONS.find((item) => item.value === selected);
      onResult?.({
        status: "success",
        title: "Bonus Sent",
        message: `${bonus?.label || `RM ${selected} Bonus`} has been sent to ${memberName} in NS.`,
      });
    } catch (err) {
      console.error("[send-bonus] failed", err);
      const detail = err?.data?.error_message || err?.data?.detail || err?.data?.message || err?.message;
      setError(detail || "Failed to send bonus. Please try again.");
      setSending(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle>Send Bonus</ModalTitle>
      <p className="mb-3 text-[12px] text-white/60">Choose a bonus to send to {memberName} in NS.</p>
      {stations?.length > 1 ? (
        <div className="mb-3">
          <label className="mb-1 block text-[12px] font-medium text-[#fbeed2]">Brand / Station</label>
          <select
            value={stationUuid}
            onChange={(e) => setStationUuid(e.target.value)}
            className="w-full rounded-[8px] border border-[#f2cb7a] bg-[#141828] px-3 py-2 text-[13px] text-white outline-none"
          >
            <option value="">Select brand</option>
            {stations.map((s) => (
              <option key={s.uuid} value={s.uuid}>{s.brand}</option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto pr-1">
        {BONUS_OPTIONS.map((bonus) => {
          const active = selected === bonus.value;
          return (
            <button
              key={bonus.value}
              type="button"
              onClick={() => setSelected(bonus.value)}
              className={`flex items-center justify-between rounded-[8px] border px-4 py-3 text-left text-[13px] font-medium transition ${
                active ? "border-[#f2cb7a] bg-[#f2cb7a]/10 text-white" : "border-[#fbeed2]/30 text-[#f6dda6] hover:border-[#f2cb7a]"
              }`}
            >
              {bonus.label}
              {active ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#84ebb4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>
      {!stations?.length ? (
        <p className="mt-2 text-[12px] text-[#fb3748]">No active brand/station found for this member.</p>
      ) : null}
      {error && <p className="mt-2 text-[12px] text-[#fb3748]">{error}</p>}
      <ModalActions onClose={onClose} onSave={handleConfirm} saving={sending} saveLabel="Confirm" />
    </ModalOverlay>
  );
}

// Alert / Removed-from-Alert confirmation (#13).
function AlertConfirmModal({ mode, memberName, saving, onClose, onConfirm }) {
  const turningOn = mode === "on";
  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle>{turningOn ? "Mark as Alert" : "Remove from Alert"}</ModalTitle>
      <p className="text-[14px] font-medium leading-[21px] text-white/75">
        {turningOn
          ? `Mark ${memberName} as Alert? The whole profile will switch to the alert (red) design.`
          : `Remove ${memberName} from Alert? The profile will return to its normal design.`}
      </p>
      <ModalActions onClose={onClose} onSave={onConfirm} saving={saving} saveLabel={turningOn ? "Mark as Alert" : "Remove from Alert"} />
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
      (t) => stationCandidates(s).some((candidate) => walletTierStationCandidates(t).includes(candidate))
    )
  );

  const [walletStation, setWalletStation] = useState("");
  useEffect(() => {
    if (walletStation || walletStations.length === 0) return;
    const firstSelected = walletStations.find((s) => walletSelections[s.uuid]);
    setWalletStation((firstSelected || walletStations[0])?.uuid || "");
  }, [walletStation, walletStations, walletSelections]);

  const selectedStation = walletStations.find((s) => s.uuid === walletStation);
  const selectedStationTiers = selectedStation
    ? (walletVipTiers || []).filter(
        (t) => stationCandidates(selectedStation).some((candidate) => walletTierStationCandidates(t).includes(candidate))
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
      const profileData = { wallet_levels: walletLevels };
      if (selectedMrsUuid) profileData.mrs_vip_level_uuid = selectedMrsUuid;
      await patchCrmMember(memberUuid, {
        profile_data: profileData,
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
      <ModalTitle>Change VIP</ModalTitle>

      {/* NS VIP Section */}
      <div className="mb-5">
        <p className="text-[14px] font-medium text-[#f6dda6] leading-[21px] mb-2">NS VIP Level</p>
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
            placeholder="Select NS VIP..."
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
                options={walletStations.map((s) => ({ value: s.uuid, label: stationName(s) || s.uuid }))}
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
                options={selectedStationTiers
                  .filter((t) => t.uuid)
                  .map((t) => ({ value: t.uuid, label: walletTierName(t) || t.uuid }))}
              />
            </div>
            {/* Summary chips of all selected wallet levels */}
            {Object.keys(walletSelections).filter((k) => walletSelections[k]).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {walletStations.filter((s) => walletSelections[s.uuid]).map((s) => {
                  const tier = (walletVipTiers || []).find((t) => t.uuid === walletSelections[s.uuid]);
                  return (
                    <span key={s.uuid} className="rounded-[6px] border border-[#f2cb7a]/40 px-2 py-0.5 text-[11px] text-[#f6dda6]">
                      {stationName(s) || s.uuid}: {walletTierName(tier) || "—"}
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

function tagKindForStationLabel(label) {
  const normalized = normalizeLookup(label);
  if (normalized.includes("fake") || normalized.includes("same")) return "game";
  return "vip";
}

function Tag({ label, kind, compact = false }) {
  const style = TAG_STYLES[kind] || TAG_STYLES.weekly;
  return (
    <span
      className={`flex min-w-0 items-center justify-center rounded-[12px] text-[12px] font-medium leading-[18px] whitespace-nowrap ${
        compact ? "h-[22px] max-w-[112px] px-2.5 py-0.5" : "h-[23px] px-3 py-1"
      }`}
      style={{ backgroundColor: style.bg, color: style.color }}
      title={String(label)}
    >
      <span className="truncate">{label}</span>
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
  const negative = isNegativeCurrency(value);
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
        className={`text-[14px] font-semibold leading-[21px] whitespace-nowrap ${negative ? "text-[#fb3748]" : "text-white"}`}
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
  const negative = isNegativeCurrency(value);
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex-1 min-w-0 text-[14px] font-semibold text-white leading-[21px]"
        style={{ letterSpacing: "-1px" }}
      >
        {label}
      </span>
      <span className={`max-w-[55%] break-words text-right text-[12px] font-medium leading-[18px] ${negative ? "text-[#fb3748]" : "text-[#84ebb4]"}`}>
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

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-[8px] bg-white/10 ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(242,203,122,0.08)" }}
    />
  );
}

function MemberProfileSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4 px-2 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-col gap-2">
              <SkeletonBlock className="h-[14px] w-[96px]" />
              <div className="flex flex-wrap items-center gap-2">
                <SkeletonBlock className="h-[32px] w-[210px]" />
                <SkeletonBlock className="h-[23px] w-[60px] rounded-[12px]" />
                <SkeletonBlock className="h-[23px] w-[72px] rounded-[12px]" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pl-[64px]">
            <SkeletonBlock className="h-[12px] w-[150px]" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-[38px] w-[128px]" />
              <SkeletonBlock className="h-[38px] w-[38px]" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBlock className="h-[18px] w-[58px]" />
          {ACTIVE_BRANDS.map((code) => (
            <SkeletonBlock key={code} className="h-[34px] w-[44px]" />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-[36px] w-[72px]" />
          <SkeletonBlock className="h-[36px] w-[84px]" />
          <SkeletonBlock className="h-[36px] w-[72px]" />
        </div>
      </div>

      <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {["mrs", "ns", "sales", "win"].map((item) => (
          <div
            key={item}
            className="flex flex-col gap-2 border border-[#05060a] p-2"
            style={{ backgroundImage: "linear-gradient(179deg, #11320e 0%, #031101 99.7%)" }}
          >
            <SkeletonBlock className="h-[20px] w-[120px]" />
            <SkeletonBlock className="h-[18px] w-[86px]" />
          </div>
        ))}
      </div>

      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonInfoCard rows={10} />
        <SkeletonInfoCard rows={10} />
        <SkeletonInfoCard rows={9} />
      </div>

      <div className="flex flex-col gap-4 rounded-[16px] bg-[rgba(5,6,10,0.3)] p-6 shadow-[0_0_3px_0_#dea220]">
        <SkeletonBlock className="h-[22px] w-[74px]" />
        <SkeletonBlock className="h-[16px] w-full" />
        <SkeletonBlock className="h-[16px] w-3/4" />
      </div>

      <div className="flex flex-col gap-4 rounded-[16px] bg-[rgba(5,6,10,0.3)] p-6 shadow-[0_0_3px_0_#dea220]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SkeletonBlock className="h-[22px] w-[170px]" />
          <SkeletonBlock className="h-[36px] w-[118px]" />
        </div>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="grid grid-cols-1 gap-3 rounded-[10px] border border-white/5 bg-white/[0.03] p-4 md:grid-cols-[1fr_120px_120px]">
              <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-[16px] w-[180px]" />
                <SkeletonBlock className="h-[14px] w-full" />
              </div>
              <SkeletonBlock className="h-[26px] w-[96px]" />
              <SkeletonBlock className="h-[26px] w-[96px]" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SkeletonInfoCard({ rows }) {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] bg-[rgba(5,6,10,0.3)] p-6 shadow-[0_0_3px_0_#dea220]">
      <SkeletonBlock className="h-[22px] w-[140px]" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <SkeletonBlock className="h-[18px] flex-1" />
            <SkeletonBlock className="h-[18px] w-[92px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
