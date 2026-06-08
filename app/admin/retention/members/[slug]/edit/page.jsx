"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GRAD_GOLD } from "../../../../../components/admin/retention/constants";
import { getCrmMemberSingle, getCrmVipTiers, updateCrmMember } from "../../../../../api/crmApi";
import { getStationList, getWalletVipTiers } from "../../../../../api/adminApi";

// Member edit form — Figma 87:7291. 3-step wizard:
//   01 Basic Info   (Profile Data + Basic Info shown in the Figma)
//   02 Financial Info  (stub fields until Figma is available)
//   03 Game Info       (stub fields until Figma is available)
//
// Initial values are loaded from GET /crm-members/members/<uuid>/ and saved
// via PATCH /crm-members/members/<uuid>/ split into the three payload sections
// the API expects (profile_data / basic_info / game_info).

const STEPS = ["Basic Info", "Financial Info", "Game Info"];

const TAG_PALETTE = {
  vip:     { bg: "#d9acff", color: "#9216fc" },
  game:    { bg: "#ffe9bc", color: "#dc9c23" },
  risk:    { bg: "#fb3748", color: "#ffffff" },
  weekly:  { bg: "#a4a4a4", color: "#141828" },
  active:  { bg: "#84ebb4", color: "#179451" },
  hobby:   { bg: "#9a6e10", color: "#ffffff" },
  // Per-status colors so each status reads at a glance.
  "status:Active":    { bg: "#84ebb4", color: "#179451" },
  "status:Inactive":  { bg: "#d4d4d4", color: "#3a3a3a" },
  "status:Dormant":   { bg: "#ffe9bc", color: "#a86b00" },
  "status:Suspended": { bg: "#fb3748", color: "#ffffff" },
};

// Status label → palette key. Centralised so the chip color stays consistent
// whether it's rendered in the closed pill or in the dropdown options.
const statusKind = (label) => `status:${label}`;

// Available options for each tag-pill field. The `kind` controls the chip
// color via TAG_PALETTE above.
const TAG_OPTIONS = {
  vip:                 { kind: "vip",    options: ["VIP 1", "VIP 2", "VIP 3", "VIP 4", "VIP 5"] },
  playerType:          { kind: "game",   options: ["VIP", "Regular", "New", "Dormant"] },
  risk:                { kind: "risk",   options: ["Low", "Medium", "High"] },
  depositFreq:         { kind: "weekly", options: ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly"] },
  status:              { kind: "active", options: ["Active", "Inactive", "Dormant", "Suspended"] },
  hobby:               { kind: "hobby",  options: ["Gaming", "Reading", "Sports", "Music", "Travel", "Cooking", "Photography"] },
  providerPref:        { kind: "hobby",  options: ["Pragmatic", "Microgaming", "NetEnt", "Playtech", "PG Soft", "Evolution"] },
  depositTrigger:      { kind: "hobby",  options: ["Bonus", "Promotion", "FOMO", "Habit", "Tournament"] },
  churnRiskReason:     { kind: "hobby",  options: ["Any", "Lost Interest", "Better Offer", "Personal Reason", "Service Issue"] },
  reactivationTrigger: { kind: "hobby",  options: ["Any", "Bonus", "Tournament", "VIP Upgrade", "Personal Outreach"] },
};

const SELECT_OPTIONS = {
  gender: ["Male", "Female", "Prefer not to say"],
  nationality: ["South Korean", "Malaysian", "Singaporean", "Thai", "Other"],
  marital: ["Single", "Married", "Divorced", "Widowed"],
  playerSegment: ["VIP", "Regular", "New", "Dormant"],
  riskStyle: ["Conservative", "Balanced", "Aggressive", "High Risk"],
  depositFreqStyle: ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly"],
  paymentMethod: ["Bank Transfer", "Credit Card", "Debit Card", "E-Wallet", "Crypto", "Other"],
  playTimePattern: ["Morning (6am-12pm)", "Afternoon (12pm-6pm)", "Evening (6pm-8pm)", "Night (8pm-2am)", "Late Night (2am-6am)"],
};

// Order matters — the index + 1 is the integer the API expects ("Will have
// choices later" per the doc, so we own the mapping locally for now). Always
// keep this aligned with the corresponding TAG_OPTIONS list.
const ENUM_INDEX = {
  vip: TAG_OPTIONS.vip.options,
  playerType: TAG_OPTIONS.playerType.options,
  risk: TAG_OPTIONS.risk.options,
  depositFreq: TAG_OPTIONS.depositFreq.options,
  status: TAG_OPTIONS.status.options,
  hobby: TAG_OPTIONS.hobby.options,
  providerPref: TAG_OPTIONS.providerPref.options,
  depositTrigger: TAG_OPTIONS.depositTrigger.options,
  churnRiskReason: TAG_OPTIONS.churnRiskReason.options,
  reactivationTrigger: TAG_OPTIONS.reactivationTrigger.options,
  gender: SELECT_OPTIONS.gender,
  nationality: SELECT_OPTIONS.nationality,
  marital: SELECT_OPTIONS.marital,
  playerSegment: SELECT_OPTIONS.playerSegment,
  riskStyle: SELECT_OPTIONS.riskStyle,
  depositFreqStyle: SELECT_OPTIONS.depositFreqStyle,
  paymentMethod: SELECT_OPTIONS.paymentMethod,
  playTimePattern: SELECT_OPTIONS.playTimePattern,
};

function labelToInt(enumKey, label) {
  if (!label) return undefined;
  const list = ENUM_INDEX[enumKey];
  if (!list) return undefined;
  const normalized = normalizeLabel(label);
  const idx = list.findIndex((opt) => normalizeLabel(opt) === normalized);
  return idx >= 0 ? idx + 1 : undefined;
}

function normalizeLabel(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function riskLabelToInt(label) {
  const normalized = normalizeLabel(label).replace(" risk", "");
  return labelToInt("risk", normalized);
}

function findVipUuid(vipTiers, label) {
  const normalized = normalizeLabel(label);
  const match = (vipTiers || []).find((tier) => {
    const candidates = [
      tier.name,
      tier.tier_name,
      tier.vip_tier,
      tier.level,
      tier.title,
    ].map(normalizeLabel);
    return candidates.includes(normalized);
  });
  return match?.uuid || match?.id;
}

function getExistingVipUuid(data) {
  return (
    data?.profile_data?.mrs_vip_level_uuid ||
    data?.profile_data?.vip_level_uuid ||
    data?.basic_info?.mrs_vip_level_uuid ||
    data?.basic_info?.vip_level_uuid ||
    data?.basic_info?.mrs_level_uuid ||
    data?.basic_info?.vip_uuid ||
    data?.customer_data?.mrs_vip_level_uuid ||
    data?.customer_data?.vip_level_uuid ||
    data?.customer_data?.mrs_level_uuid ||
    data?.customer_data?.vip_uuid ||
    data?.mrs_vip_level_uuid ||
    data?.vip_level_uuid ||
    data?.mrs_level_uuid ||
    data?.vip_uuid ||
    undefined
  );
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
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
  ].map(normalizeLabel).filter(Boolean);
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
  ].map(normalizeLabel).filter(Boolean);
}

function walletTierName(tier) {
  return tier?.tier_name || tier?.name || tier?.level || tier?.vip_level || tier?.title || "";
}

function buildWalletLevelSelections(data, walletVipTiers = [], stationList = []) {
  const raw = data?.customer_data?.wallet_levels || data?.customer_data?.wallet_level || data?.profile_data?.wallet_levels;
  if (!Array.isArray(raw)) return {};
  return raw.reduce((acc, item) => {
    if (item?.station_uuid && item?.wallet_level_uuid) {
      acc[item.station_uuid] = item.wallet_level_uuid;
      return acc;
    }
    const stationLabel = normalizeLabel(item?.Station || item?.station || item?.station_name);
    const levelLabel = normalizeLabel(item?.Level || item?.level || item?.tier_name || item?.name);
    if (!stationLabel || !levelLabel) return acc;
    const station = stationList.find((s) => stationCandidates(s).includes(stationLabel));
    const tier = walletVipTiers.find(
      (t) => walletTierStationCandidates(t).includes(stationLabel) && normalizeLabel(walletTierName(t)) === levelLabel
    );
    if (station?.uuid && tier?.uuid) acc[station.uuid] = tier.uuid;
    return acc;
  }, {});
}

function walletLevelsToPayload(walletLevels = {}) {
  return Object.entries(walletLevels)
    .filter(([, wallet_level_uuid]) => wallet_level_uuid)
    .map(([station_uuid, wallet_level_uuid]) => ({ station_uuid, wallet_level_uuid }));
}

function hasDisplayValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function moneyValue(value) {
  if (!hasDisplayValue(value)) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) {
    return `RM ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `RM ${value}`;
}

function dateToInput(value) {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const ymdWithTime = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T\s]/);
  if (ymdWithTime) return `${ymdWithTime[1]}-${ymdWithTime[2]}-${ymdWithTime[3]}`;
  const match = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateOnly(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const raw = String(value);
  const inputDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (inputDate) return `${inputDate[3]}/${inputDate[2]}/${inputDate[1]}`;
  const displayDate = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (displayDate) return `${displayDate[1]}/${displayDate[2]}/${displayDate[3]}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseBetSize(value) {
  if (!value) return { min: "", max: "" };
  const parts = String(value).match(/\d+(?:\.\d+)?/g) || [];
  return {
    min: parts[0] || "",
    max: parts[1] || parts[0] || "",
  };
}

function emptyForm() {
  return {
    image: null,
    vip: null,
    playerType: null,
    risk: null,
    depositFreq: null,
    status: null,
    walletLevels: {},

    fullName: "",
    phone: "",
    gender: "",
    dob: "",
    age: "",
    nationality: "",
    homeAddress: "",
    marital: "",
    job: "",
    // Multi-tag fields hold an array of { kind, label } objects.
    hobby: [],

    totalSales: "",
    totalWithdrawal: "",
    totalWinLoss: "",
    totalBonus: "",
    totalTicketSales: "",
    totalWithdrawalTicket: "",
    arpu: "",
    avgDeposit: "",
    lastDepositDate: "",
    paymentMethod: "",

    gamePreference: "",
    providerPref: [],
    playTimePattern: "",
    avgBetMin: "",
    avgBetMax: "",
    playerSegment: "",
    riskStyle: "",
    depositFreqStyle: "",
    depositTrigger: [],
    churnRiskReason: [],
    reactivationTrigger: [],
    note: "",
  };
}

// Convert the raw API value for a multi-select field into the `[{kind,label}]`
// shape MultiTagSelectField expects. Accepts an array of labels, a single
// label, or a comma-separated string. Empty/nullish values become [].
function tagListFor(kind, value) {
  if (!value && value !== 0) return [];
  const labels = Array.isArray(value)
    ? value
    : String(value).split(",").map((s) => s.trim());
  return labels.filter(Boolean).map((label) => ({ kind, label }));
}

// Map a list of selected tag objects back to the integer enum codes the API
// expects. Drops entries that fail enum lookup so partial data doesn't break
// the save.
function labelsToInts(enumKey, list) {
  return (list || [])
    .map((item) => labelToInt(enumKey, item.label))
    .filter((v) => v !== undefined);
}

// Hydrate the form from the GET response. Tag-style fields wrap the label in
// `{ kind, label }` to match TagSelectField; selects/inputs are plain strings.
function apiToForm(data, vipTiers = [], walletVipTiers = [], stationList = []) {
  const form = emptyForm();
  if (!data) return form;
  const c = data.customer_data || {};
  const b = data.basic_info || {};
  const f = data.financial_info || {};
  const g = data.gaming_info || {};

  const tagFor = (kind, label) => (label ? { kind, label } : null);
  const betSize = parseBetSize(g.average_bet_size);

  return {
    ...form,
    // vip_level and status are not in the documented GET fields. Try every
    // plausible path since basic_info GET output is undocumented — the API
    // may return them there even though the doc doesn't list the fields.
    ...(() => {
      const vipLabel =
        c.mrs_level || c.vip_level ||
        b.mrs_level || b.vip_level || b.vip_level_name ||
        data?.profile_data?.mrs_vip_level || data?.profile_data?.mrs_vip_level_name ||
        data?.profile_data?.vip_level || data?.profile_data?.vip_level_name ||
        data?.mrs_vip_level ||
        data?.vip_level || null;
      const vipUuid = getExistingVipUuid(data) || findVipUuid(vipTiers, vipLabel);
      const statusLabel =
        data?.status ||
        data?.profile_data?.status ||
        b.status || b.status_display ||
        "Active";
      return {
        vip: tagFor("vip", vipLabel),
        vipUuid,
        status: { kind: statusKind(statusLabel), label: statusLabel },
      };
    })(),
    playerType: tagFor("game", g.player_type),
    risk: tagFor("risk", g.risk_style),
    depositFreq: tagFor("weekly", g.deposit_frequency_style),
    walletLevels: buildWalletLevelSelections(data, walletVipTiers, stationList),

    // customer_data returns documented string values (e.g. gender="Male").
    // basic_info GET fields are undocumented and likely return the same
    // integer enum codes used in the PUT, which won't match select options.
    // Prefer customer_data strings; fall back to basic_info as a safety net.
    fullName: data.full_name || c.username || b.username || "",
    phone: c.phone_number || b.phone_number || "",
    gender: c.gender || b.gender || "",
    dob: dateToInput(c.date_of_birth || b.date_of_birth),
    age: c.age ?? b.age ?? "",
    nationality: c.nationality || b.nationality || "",
    homeAddress: c.home_address || b.home_address || "",
    marital: c.marital_status || b.marital_status || "",
    job: c.job || b.job || "",
    hobby: tagListFor("hobby", c.hobby || b.hobby),

    totalSales: f.total_sales ?? "",
    totalWithdrawal: f.total_withdrawal ?? "",
    totalWinLoss: f.total_win_lose ?? "",
    totalBonus: f.total_bonus ?? "",
    totalTicketSales: f.total_sales_ticket ?? "",
    totalWithdrawalTicket: f.total_withdrawal_ticket ?? "",
    arpu: f.arpu ?? "",
    avgDeposit: f.average_deposit ?? "",
    lastDepositDate: formatDateOnly(f.last_deposit_date, ""),
    paymentMethod: f.payment_method || "",

    gamePreference: g.game_preference || "",
    providerPref: tagListFor("hobby", g.provider_preference),
    playTimePattern: g.play_time_pattern || "",
    avgBetMin: betSize.min,
    avgBetMax: betSize.max,
    playerSegment: g.player_type || "",
    riskStyle: g.risk_style || "",
    depositFreqStyle: g.deposit_frequency_style || "",
    depositTrigger: tagListFor("hobby", g.deposit_trigger),
    churnRiskReason: tagListFor("hobby", g.churn_risk_reason),
    reactivationTrigger: tagListFor("hobby", g.reactivation_trigger),
    note: g.note || "",
  };
}

// Build the PATCH payload split into the three top-level objects the API
// expects. Values still kept as strings/labels are mapped to ints where the
// doc says "Int / Will have choices later".
function formToApi(form, vipTiers = [], originalData = null) {
  const vipUuid = form.vipUuid || findVipUuid(vipTiers, form.vip?.label);
  const paymentMethod = labelToInt("paymentMethod", form.paymentMethod);
  const playTimePattern = labelToInt("playTimePattern", form.playTimePattern);
  const existingProfile = originalData?.profile_data || {};
  const existingTags = existingProfile.tags || originalData?.customer_data?.tags;
  const existingWalletLevels = existingProfile.wallet_levels;
  const walletLevels = walletLevelsToPayload(form.walletLevels);

  // Doc 8 removed these from profile_data. Keep the old mapping here as a
  // reference only in case backend reintroduces the fields later.
  // const playerType = labelToInt("playerType", form.playerType?.label) || labelToInt("playerSegment", form.playerSegment);
  // const risk = riskLabelToInt(form.risk?.label) || riskLabelToInt(form.riskStyle);
  // const status = labelToInt("status", form.status?.label) || 1;

  return {
    profile_data: {
      mrs_vip_level_uuid: vipUuid,
      tags: Array.isArray(existingTags) ? existingTags : undefined,
      wallet_levels: walletLevels.length ? walletLevels : Array.isArray(existingWalletLevels) ? existingWalletLevels : undefined,
      // Old profile_data fields, no longer documented in CRM doc 8:
      // player_type: playerType,
      // risk,
      // deposit_frequency: labelToInt("depositFreq", form.depositFreq?.label),
      // status,
    },
    basic_info: {
      gender: labelToInt("gender", form.gender),
      date_of_birth: form.dob || undefined,
      nationality: labelToInt("nationality", form.nationality),
      home_address: form.homeAddress || undefined,
      marital_status: labelToInt("marital", form.marital),
      job: form.job || undefined,
      hobby: labelsToInts("hobby", form.hobby),
      payment_method: paymentMethod,
    },
    game_info: {
      game_preference: form.gamePreference || undefined,
      provider_Preference: labelsToInts("providerPref", form.providerPref),
      play_type_pattern: playTimePattern,
      average_bet_size: Number(form.avgBetMax || form.avgBetMin) || undefined,
      player_type: labelToInt("playerSegment", form.playerSegment),
      risk_style: labelToInt("riskStyle", form.riskStyle),
      deposit_frequency_style: labelToInt("depositFreqStyle", form.depositFreqStyle),
      deposit_trigger: labelsToInts("depositTrigger", form.depositTrigger),
      churn_risk_reason: labelsToInts("churnRiskReason", form.churnRiskReason),
      reactivation_trigger: labelsToInts("reactivationTrigger", form.reactivationTrigger),
      note: form.note || undefined,
    },
  };
}

export default function MemberEditPage() {
  const router = useRouter();
  const params = useParams();
  const memberUuid = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberName, setMemberName] = useState("Member");
  const [vipTiers, setVipTiers] = useState([]);
  const [walletVipTiers, setWalletVipTiers] = useState([]);
  const [stationList, setStationList] = useState([]);
  const [originalMember, setOriginalMember] = useState(null);

  useEffect(() => {
    if (!memberUuid) return;
    let cancelled = false;
    const fetchMember = async () => {
      setLoading(true);
      try {
        const [res, tiersRes, walletTiersRes, stationsRes] = await Promise.all([
          getCrmMemberSingle(memberUuid),
          getCrmVipTiers({ page: 1, page_size: 100 }).catch((err) => {
            console.error("[member-edit] crm vip tiers load failed", err);
            return [];
          }),
          getWalletVipTiers({ page: 1, page_size: 100 }).catch((err) => {
            console.error("[member-edit] wallet vip tiers load failed", err);
            return [];
          }),
          getStationList().catch((err) => {
            console.error("[member-edit] station list load failed", err);
            return [];
          }),
        ]);
        if (cancelled) return;
        const tiers = normalizeListResponse(tiersRes);
        const walletTiers = normalizeListResponse(walletTiersRes);
        const stations = normalizeListResponse(stationsRes);
        setVipTiers(tiers);
        setWalletVipTiers(walletTiers);
        setStationList(stations);
        setOriginalMember(res);
        setForm(apiToForm(res, tiers, walletTiers, stations));
        setMemberName(res?.full_name || res?.basic_info?.username || "Member");
      } catch (err) {
        if (cancelled) return;
        console.error("[member-edit] load failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMember();
    return () => {
      cancelled = true;
    };
  }, [memberUuid]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const goBack = () => router.push(`/admin/retention/members/${memberUuid}`);
  const goPrev = () => setStep((s) => Math.max(0, s - 1));
  const goNext = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const goToStep = (idx) => setStep(Math.max(0, Math.min(STEPS.length - 1, idx)));

  const onSave = async () => {
    if (saving) return;
    const vipUuid = form.vipUuid || getExistingVipUuid(originalMember) || findVipUuid(vipTiers, form.vip?.label);
    if (!vipUuid) {
      alert("Please select a valid VIP Level before saving.");
      return;
    }
    setSaving(true);
    try {
      await updateCrmMember(memberUuid, formToApi({ ...form, vipUuid }, vipTiers, originalMember));
      router.push(`/admin/retention/members/${memberUuid}`);
    } catch (err) {
      console.error("[member-edit] save failed", err);
      setSaving(false);
    }
  };

  if (loading) {
    return <MemberEditSkeleton />;
  }

  return (
    <>
      <EditHeader name={memberName} />
      <Card>
        <Stepper step={step} onPrev={goPrev} onNext={goNext} onStepClick={goToStep} />
        {step === 0 && (
          <BasicInfoStep
            form={form}
            setField={setField}
            vipTiers={vipTiers}
            walletVipTiers={walletVipTiers}
            stationList={stationList}
          />
        )}
        {step === 1 && <FinancialInfoStep form={form} setField={setField} />}
        {step === 2 && <GameInfoStep form={form} setField={setField} />}
        <ActionRow
          mode={step === 0 ? "cancel" : "back"}
          onSecondary={step === 0 ? goBack : goPrev}
          onSave={onSave}
          saving={saving}
        />
      </Card>
    </>
  );
}

function EditHeader({ name }) {
  return (
    <div className="flex items-start gap-2 px-2">
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
        <span className="text-[12px] font-medium leading-[18px] text-white">EDIT PROFILE</span>
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
      </div>
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

function MemberEditSkeleton() {
  return (
    <>
      <div className="flex items-start gap-2 px-2">
        <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-[14px] w-[88px]" />
          <SkeletonBlock className="h-[32px] w-[210px]" />
        </div>
      </div>

      <Card>
        <div
          className="flex items-stretch overflow-hidden rounded-[6px] border border-[#f2cb7a]"
          style={{ backgroundImage: "linear-gradient(179deg, #11320e 0%, #031101 99.7%)" }}
        >
          <SkeletonBlock className="h-[66px] w-14 shrink-0 rounded-none" />
          <div className="flex flex-1 items-center justify-between gap-3 overflow-hidden px-4 py-3">
            {STEPS.map((label) => (
              <div key={label} className="flex min-w-[150px] flex-1 items-center justify-center gap-3">
                <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
                <SkeletonBlock className="h-[18px] w-[104px]" />
              </div>
            ))}
          </div>
          <SkeletonBlock className="h-[66px] w-14 shrink-0 rounded-none" />
        </div>

        <SkeletonBlock className="h-[34px] w-[170px]" />
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-[18px] w-[86px]" />
          <SkeletonBlock className="h-[61px] w-[61px] rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonField key={index} />
          ))}
          <div className="sm:col-span-2 xl:col-span-3">
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-[22px] w-[96px]" />
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SkeletonField compact />
                  <SkeletonField compact />
                </div>
                <div className="flex flex-wrap gap-2">
                  <SkeletonBlock className="h-[26px] w-[120px]" />
                  <SkeletonBlock className="h-[26px] w-[135px]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <SkeletonBlock className="h-[34px] w-[130px]" />
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <SkeletonField key={index} />
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <SkeletonBlock className="h-[43px] w-[102px]" />
          <SkeletonBlock className="h-[43px] w-[92px]" />
        </div>
      </Card>
    </>
  );
}

function SkeletonField({ compact = false }) {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonBlock className="h-[22px] w-[120px]" />
      <SkeletonBlock className={`${compact ? "h-[44px]" : "h-[46px]"} w-full`} />
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="flex w-full flex-col gap-6 rounded-[16px] bg-[#05060a] p-6 sm:p-10 shadow-[0_0_1.5px_0_#dea220]">
      {children}
    </div>
  );
}

function Stepper({ step, onPrev, onNext, onStepClick }) {
  return (
    <div
      className="flex items-stretch rounded-[6px] border border-[#f2cb7a] overflow-hidden"
      style={{ backgroundImage: "linear-gradient(179deg, #11320e 0%, #031101 99.7%)" }}
    >
      <ArrowButton direction="left" onClick={onPrev} disabled={step === 0} />
      <div className="flex flex-1 items-center justify-between gap-2 px-4 py-3 overflow-x-auto scrollbar-admin">
        {STEPS.map((label, idx) => (
          <StepItem
            key={label}
            index={idx + 1}
            label={label}
            active={idx === step}
            onClick={() => onStepClick(idx)}
          />
        ))}
      </div>
      <ArrowButton direction="right" onClick={onNext} disabled={step === STEPS.length - 1} />
    </div>
  );
}

function StepItem({ index, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "step" : undefined}
      className="group flex flex-1 items-center justify-center gap-3 px-4 py-1 rounded-md transition hover:bg-white/5"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
          active
            ? "bg-[#eaad2c]"
            : "border-2 border-[#fbeed2] group-hover:border-[#eaad2c]"
        }`}
      >
        <span
          className={`text-[14px] font-semibold leading-[21px] text-center ${
            active ? "text-[#141828]" : "text-[#fbeed2]"
          }`}
          style={{ letterSpacing: "-1px" }}
        >
          {String(index).padStart(2, "0")}
        </span>
      </span>
      <span
        className="text-[14px] font-semibold text-[#fbeed2] leading-[21px] whitespace-nowrap"
        style={{ letterSpacing: "-1px" }}
      >
        {label}
      </span>
    </button>
  );
}

function ArrowButton({ direction, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous step" : "Next step"}
      className={`flex w-14 shrink-0 items-center justify-center transition ${
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fbeed2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: direction === "right" ? "rotate(180deg)" : undefined }}
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <h2
      className="bg-clip-text text-transparent font-bold w-full"
      style={{
        backgroundImage: GRAD_GOLD,
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: "26px",
        lineHeight: "39px",
        letterSpacing: "-2px",
      }}
    >
      {children}
    </h2>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="text-[18px] font-medium text-[#f6dda6] leading-[27px] whitespace-nowrap">
      {children}
    </label>
  );
}

function FieldWrapper({ label, children, span = 1 }) {
  return (
    <div className={`flex flex-col gap-2 ${span === 2 ? "sm:col-span-2 xl:col-span-2" : ""}`}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, leftIcon, type = "text" }) {
  const inputRef = useRef(null);
  const isDate = type === "date";
  const openDatePicker = () => {
    if (!isDate) return;
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-[8px] border border-[#fbeed2] px-4 py-3 ${isDate ? "cursor-pointer" : ""}`}
      onClick={openDatePicker}
    >
      {leftIcon}
      <input
        ref={inputRef}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        lang={isDate ? "en-GB" : undefined}
        className={`flex-1 bg-transparent text-[12px] font-medium leading-[18px] text-white outline-none placeholder:text-white/40 [color-scheme:dark] ${isDate ? "cursor-pointer" : ""}`}
      />
    </div>
  );
}

// Numeric input with a bold "RM" prefix label, matching the financial-info
// design. `inputMode="decimal"` raises a numeric keypad on mobile; we don't
// use type="number" because that disables thousand-separator formatting and
// strips leading zeros when binding to a string.
function CurrencyInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-[#fbeed2] px-4 py-3">
      <span className="text-[12px] font-bold leading-[18px] text-white">RM</span>
      <input
        type="text"
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[12px] font-medium leading-[18px] text-white outline-none placeholder:text-white/40"
      />
    </div>
  );
}

// "RM 50 ~ 150" range input used for Average Bet Size on the Game Info step.
// Two numeric fields with a bold tilde separator; both share the same gold
// border so the visual reads as one control.
function BetRangeInput({ min, max, onMinChange, onMaxChange }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-[#fbeed2] px-4 py-3">
      <span className="text-[12px] font-bold leading-[18px] text-white">RM</span>
      <input
        type="text"
        inputMode="decimal"
        value={min ?? ""}
        onChange={(e) => onMinChange(e.target.value)}
        className="w-full min-w-0 bg-transparent text-[12px] font-medium leading-[18px] text-white outline-none placeholder:text-white/40"
      />
      <span className="text-[12px] font-bold leading-[18px] text-white">~</span>
      <input
        type="text"
        inputMode="decimal"
        value={max ?? ""}
        onChange={(e) => onMaxChange(e.target.value)}
        className="w-full min-w-0 bg-transparent text-[12px] font-medium leading-[18px] text-white outline-none placeholder:text-white/40"
      />
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 6 }) {
  return (
    <div className="rounded-[8px] border border-[#fbeed2] px-4 py-3">
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full resize-none bg-transparent text-[12px] font-medium leading-[18px] text-white outline-none placeholder:text-white/40"
      />
    </div>
  );
}

function DropdownInput({ value, onChange, options, placeholder = "Select...", disabled = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const normalizedOptions = (options || []).filter((opt) => opt?.value);
  const selected = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex min-h-[44px] w-full items-center gap-3 rounded-[8px] border px-4 py-3 text-left transition ${
          disabled ? "cursor-not-allowed border-[#fbeed2]/30 opacity-60" : "border-[#fbeed2] hover:border-[#f2cb7a]"
        }`}
      >
        <span className={`flex-1 text-[12px] font-medium leading-[18px] ${selected ? "text-white" : "text-white/40"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fbeed2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}
        >
          <polyline points="6 15 12 9 18 15" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[220px] overflow-y-auto rounded-[8px] border border-[#f2cb7a] bg-[#05060a] shadow-[0_12px_24px_rgba(0,0,0,0.55)]">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex min-h-[38px] w-full items-center px-3 py-2 text-left text-[12px] font-medium leading-[18px] text-white/50 hover:bg-white/5"
          >
            {placeholder}
          </button>
          {normalizedOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex min-h-[38px] w-full items-center px-3 py-2 text-left text-[12px] font-medium leading-[18px] hover:bg-white/5 ${
                opt.value === value ? "text-[#f2cb7a]" : "text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectInput({ value, onChange, options, disabled = false }) {
  return (
    <DropdownInput
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={(options || []).map((opt) => ({ value: opt, label: opt }))}
    />
  );
}

function ObjectSelectInput({ value, onChange, options, disabled = false, placeholder = "Select..." }) {
  return <DropdownInput value={value} onChange={onChange} options={options} disabled={disabled} placeholder={placeholder} />;
}

function WalletVipFields({ value = {}, onChange, walletVipTiers = [], stationList = [] }) {
  const walletStations = (stationList || []).filter((station) =>
    (walletVipTiers || []).some((tier) =>
      stationCandidates(station).some((candidate) => walletTierStationCandidates(tier).includes(candidate))
    )
  );
  const [selectedStationUuid, setSelectedStationUuid] = useState("");

  useEffect(() => {
    if (selectedStationUuid || walletStations.length === 0) return;
    const firstSelected = walletStations.find((station) => value?.[station.uuid]);
    setSelectedStationUuid((firstSelected || walletStations[0])?.uuid || "");
  }, [selectedStationUuid, walletStations, value]);

  const updateStationLevel = (stationUuid, tierUuid) => {
    onChange({
      ...value,
      [stationUuid]: tierUuid || undefined,
    });
  };

  if (walletStations.length === 0) {
    return <ReadOnlyValue value="No wallet VIP tiers available" />;
  }

  const selectedStation = walletStations.find((station) => station.uuid === selectedStationUuid);
  const selectedStationTiers = selectedStation
    ? (walletVipTiers || []).filter((tier) =>
        stationCandidates(selectedStation).some((candidate) => walletTierStationCandidates(tier).includes(candidate))
      )
    : [];
  const selectedCount = Object.values(value || {}).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium leading-[16px] text-white/60">Wallet Station</span>
          <ObjectSelectInput
            value={selectedStationUuid}
            onChange={setSelectedStationUuid}
            options={walletStations
              .filter((station) => station.uuid)
              .map((station) => ({ value: station.uuid, label: stationName(station) || station.uuid }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium leading-[16px] text-white/60">Wallet Station VIP</span>
          <ObjectSelectInput
            value={selectedStationUuid ? value?.[selectedStationUuid] || "" : ""}
            onChange={(tierUuid) => updateStationLevel(selectedStationUuid, tierUuid)}
            disabled={!selectedStationUuid}
            placeholder={selectedStationUuid ? "Select..." : "Select station first"}
            options={selectedStationTiers
              .filter((tier) => tier.uuid)
              .map((tier) => ({ value: tier.uuid, label: walletTierName(tier) || tier.uuid }))}
          />
        </div>
      </div>
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {walletStations.filter((station) => value?.[station.uuid]).map((station) => {
            const tier = (walletVipTiers || []).find((item) => item.uuid === value[station.uuid]);
            return (
              <span key={station.uuid} className="rounded-[6px] border border-[#f2cb7a]/40 px-2 py-1 text-[11px] font-medium leading-[16px] text-[#f6dda6]">
                {stationName(station) || station.uuid}: {walletTierName(tier) || "—"}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Editable tag-pill field. Click anywhere on the closed pill to open the
// dropdown; pick an option to set the value; the in-chip X clears it back to
// "No value" without re-opening. Outside-clicks dismiss the menu.
//
// `kindFor(label)` overrides `kind` when present — used for fields like
// Status where the chip color varies per option label.
function TagSelectField({ value, onChange, kind, options, kindFor }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const resolveKind = (label) => (kindFor ? kindFor(label) : kind);
  const paletteFor = (label) => TAG_PALETTE[resolveKind(label)] || TAG_PALETTE.weekly;
  const selectedPalette = value ? paletteFor(value.label) : null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[44px] items-center justify-between gap-2 rounded-[8px] border border-[#fbeed2] px-4 py-3 text-left transition hover:border-[#f2cb7a]"
      >
        {value ? (
          <span
            className="inline-flex items-center gap-1 rounded-[4px] px-1 text-[12px] font-medium leading-[18px]"
            style={{ backgroundColor: selectedPalette.bg, color: selectedPalette.color }}
          >
            {value.label}
            <span
              role="button"
              tabIndex={0}
              aria-label={`Remove ${value.label}`}
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(null);
                }
              }}
              className="flex h-3 w-3 cursor-pointer items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          </span>
        ) : (
          <span className="text-[12px] text-white/40">Select...</span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fbeed2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[220px] overflow-y-auto rounded-[8px] border border-[#f2cb7a] bg-[#05060a] shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange({ kind: resolveKind(opt), label: opt }); setOpen(false); }}
              className="flex w-full items-center px-3 py-2 text-left text-[12px] font-medium leading-[18px] text-[#f6dda6] hover:bg-white/5"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Multi-select tag field. Selected values render as removable chips inside the
// closed control; the dropdown shows every option with a checkbox indicator.
// Clicking an option toggles it; the menu stays open so you can pick several
// in a row. Outside-clicks dismiss the menu.
//
// `value` is an array of `{ kind, label }`. Empty array renders the "Select…"
// placeholder, matching the single-select TagSelectField visual.
function MultiTagSelectField({ value = [], onChange, kind, options, kindFor }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedLabels = value.map((v) => v.label);
  const resolveKind = (label) => (kindFor ? kindFor(label) : kind);
  const paletteFor = (label) => TAG_PALETTE[resolveKind(label)] || TAG_PALETTE.weekly;

  const toggle = (label) => {
    if (selectedLabels.includes(label)) {
      onChange(value.filter((v) => v.label !== label));
    } else {
      onChange([...value, { kind: resolveKind(label), label }]);
    }
  };
  const remove = (label) => onChange(value.filter((v) => v.label !== label));

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[44px] items-center justify-between gap-2 rounded-[8px] border border-[#fbeed2] px-4 py-2 text-left transition hover:border-[#f2cb7a]"
      >
        {value.length > 0 ? (
          <span className="flex flex-wrap items-center gap-1">
            {value.map((v) => {
              const p = paletteFor(v.label);
              return (
                <span
                  key={v.label}
                  className="inline-flex items-center gap-1 rounded-[4px] px-1 text-[12px] font-medium leading-[18px]"
                  style={{ backgroundColor: p.bg, color: p.color }}
                >
                  {v.label}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${v.label}`}
                    onClick={(e) => { e.stopPropagation(); remove(v.label); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(v.label);
                      }
                    }}
                    className="flex h-3 w-3 items-center justify-center"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </span>
                </span>
              );
            })}
          </span>
        ) : (
          <span className="text-[12px] text-white/40">Select...</span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fbeed2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[220px] overflow-y-auto rounded-[8px] border border-[#f2cb7a] bg-[#05060a] shadow-lg">
          {options.map((opt) => {
            const checked = selectedLabels.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium leading-[18px] text-[#f6dda6] hover:bg-white/5"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                    checked ? "border-[#eaad2c] bg-[#eaad2c]" : "border-white/40"
                  }`}
                >
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UserImage({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>User Image</FieldLabel>
      <label className="flex items-center gap-2 w-fit cursor-pointer">
        <div
          className="flex h-[61px] w-[61px] items-center justify-center overflow-hidden rounded-full"
          style={{ backgroundImage: GRAD_GOLD }}
        >
          {value ? (
            <img src={typeof value === "string" ? value : URL.createObjectURL(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
        <span className="text-[12px] font-medium leading-[18px] text-white">Choose Image</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

function BasicInfoStep({ form, setField, vipTiers = [], walletVipTiers = [], stationList = [] }) {
  const vipOptionsFromApi = vipTiers.length
    ? vipTiers
        .map((tier) => tier.name || tier.tier_name || tier.vip_tier || tier.level || tier.title)
        .filter(Boolean)
    : TAG_OPTIONS.vip.options;
  const vipOptions = form.vip?.label && !vipOptionsFromApi.includes(form.vip.label)
    ? [form.vip.label, ...vipOptionsFromApi]
    : vipOptionsFromApi;
  const handleVipChange = (next) => {
    setField("vip", next);
    setField("vipUuid", next ? findVipUuid(vipTiers, next.label) : undefined);
  };

  return (
    <>
      <SectionTitle>Profile Data</SectionTitle>
      <UserImage value={form.image} onChange={(file) => setField("image", file)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-6">
        <FieldWrapper label="VIP Level">
          <TagSelectField value={form.vip} onChange={handleVipChange} kind={TAG_OPTIONS.vip.kind} options={vipOptions} />
        </FieldWrapper>
        <FieldWrapper label="Player Type">
          <TagSelectField value={form.playerType} onChange={(v) => setField("playerType", v)} {...TAG_OPTIONS.playerType} />
        </FieldWrapper>
        <FieldWrapper label="Risk">
          <TagSelectField value={form.risk} onChange={(v) => setField("risk", v)} {...TAG_OPTIONS.risk} />
        </FieldWrapper>
        <FieldWrapper label="Deposit Freq.">
          <TagSelectField value={form.depositFreq} onChange={(v) => setField("depositFreq", v)} {...TAG_OPTIONS.depositFreq} />
        </FieldWrapper>
        <FieldWrapper label="Status">
          <TagSelectField
            value={form.status}
            onChange={(v) => setField("status", v)}
            options={TAG_OPTIONS.status.options}
            kindFor={statusKind}
          />
        </FieldWrapper>
        <div className="sm:col-span-2 xl:col-span-3">
          <FieldWrapper label="Wallet VIP">
            <WalletVipFields
              value={form.walletLevels}
              onChange={(next) => setField("walletLevels", next)}
              walletVipTiers={walletVipTiers}
              stationList={stationList}
            />
          </FieldWrapper>
        </div>
      </div>

      <SectionTitle>Basic Info</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-6">
        <FieldWrapper label="Full Name">
          <ReadOnlyValue value={form.fullName} />
        </FieldWrapper>
        <FieldWrapper label="Phone">
          <ReadOnlyValue value={form.phone} />
        </FieldWrapper>
        <FieldWrapper label="Gender">
          <SelectInput value={form.gender} onChange={(v) => setField("gender", v)} options={SELECT_OPTIONS.gender} />
        </FieldWrapper>
        <FieldWrapper label="Date of Birth">
          <TextInput type="date" value={form.dob} onChange={(v) => setField("dob", v)} leftIcon={<CalendarIcon />} />
        </FieldWrapper>
        <FieldWrapper label="Age">
          <ReadOnlyValue value={form.age} />
        </FieldWrapper>
        <FieldWrapper label="Nationality">
          <SelectInput value={form.nationality} onChange={(v) => setField("nationality", v)} options={SELECT_OPTIONS.nationality} />
        </FieldWrapper>
        <FieldWrapper label="Home Address">
          <TextInput value={form.homeAddress} onChange={(v) => setField("homeAddress", v)} />
        </FieldWrapper>
        <FieldWrapper label="Marital Status">
          <SelectInput value={form.marital} onChange={(v) => setField("marital", v)} options={SELECT_OPTIONS.marital} />
        </FieldWrapper>
        <FieldWrapper label="Job">
          <TextInput value={form.job} onChange={(v) => setField("job", v)} />
        </FieldWrapper>
        <FieldWrapper label="Hobby">
          <MultiTagSelectField value={form.hobby} onChange={(v) => setField("hobby", v)} {...TAG_OPTIONS.hobby} />
        </FieldWrapper>
      </div>
    </>
  );
}

// Read-only display for computed financial values that the API doesn't accept
// as input (they're calculated server-side and returned via GET).
function ReadOnlyValue({ value, prefix }) {
  const display = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <div className="flex min-h-[44px] items-center gap-3 rounded-[8px] border border-[#fbeed2] px-4 py-3">
      {prefix && <span className="text-[12px] font-bold leading-[18px] text-white">{prefix}</span>}
      <span className="flex-1 text-[12px] font-medium leading-[18px] text-white">{display}</span>
    </div>
  );
}

function FinancialInfoStep({ form, setField }) {
  return (
    <>
      <SectionTitle>Financial Info</SectionTitle>
      <p className="text-[12px] text-white/50 -mt-4">
        These values are calculated by the server and are shown for reference only.
        Only Payment Method can be edited.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-6">
        <FieldWrapper label="Total Sales">
          <ReadOnlyValue value={moneyValue(form.totalSales)} />
        </FieldWrapper>
        <FieldWrapper label="Total Withdrawal">
          <ReadOnlyValue value={moneyValue(form.totalWithdrawal)} />
        </FieldWrapper>
        <FieldWrapper label="Total Win/Loss">
          <ReadOnlyValue value={moneyValue(form.totalWinLoss)} />
        </FieldWrapper>
        <FieldWrapper label="Total Bonus">
          <ReadOnlyValue value={moneyValue(form.totalBonus)} />
        </FieldWrapper>
        <FieldWrapper label="Total Ticket Sales">
          <ReadOnlyValue value={form.totalTicketSales} />
        </FieldWrapper>
        <FieldWrapper label="Total Withdrawal Ticket">
          <ReadOnlyValue value={form.totalWithdrawalTicket} />
        </FieldWrapper>
        <FieldWrapper label="ARPU">
          <ReadOnlyValue value={moneyValue(form.arpu)} />
        </FieldWrapper>
        <FieldWrapper label="Average Deposit">
          <ReadOnlyValue value={moneyValue(form.avgDeposit)} />
        </FieldWrapper>
        <FieldWrapper label="Last Deposit Date">
          <ReadOnlyValue value={form.lastDepositDate} />
        </FieldWrapper>
        <FieldWrapper label="Payment Method">
          <SelectInput value={form.paymentMethod} onChange={(v) => setField("paymentMethod", v)} options={SELECT_OPTIONS.paymentMethod} />
        </FieldWrapper>
      </div>
    </>
  );
}

function GameInfoStep({ form, setField }) {
  return (
    <>
      <SectionTitle>Game Info</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-6">
        <FieldWrapper label="Game Preference">
          <TextInput value={form.gamePreference} onChange={(v) => setField("gamePreference", v)} />
        </FieldWrapper>
        <FieldWrapper label="Provider Preference">
          <MultiTagSelectField value={form.providerPref} onChange={(v) => setField("providerPref", v)} {...TAG_OPTIONS.providerPref} />
        </FieldWrapper>
        <FieldWrapper label="Play Time Pattern">
          <SelectInput value={form.playTimePattern} onChange={(v) => setField("playTimePattern", v)} options={SELECT_OPTIONS.playTimePattern} />
        </FieldWrapper>
        <FieldWrapper label="Average Bet Size">
          <BetRangeInput
            min={form.avgBetMin}
            max={form.avgBetMax}
            onMinChange={(v) => setField("avgBetMin", v)}
            onMaxChange={(v) => setField("avgBetMax", v)}
          />
        </FieldWrapper>
        <FieldWrapper label="Player Type">
          <SelectInput value={form.playerSegment} onChange={(v) => setField("playerSegment", v)} options={SELECT_OPTIONS.playerSegment} />
        </FieldWrapper>
        <FieldWrapper label="Risk Style">
          <SelectInput value={form.riskStyle} onChange={(v) => setField("riskStyle", v)} options={SELECT_OPTIONS.riskStyle} />
        </FieldWrapper>
        <FieldWrapper label="Deposit Frequency Style">
          <SelectInput value={form.depositFreqStyle} onChange={(v) => setField("depositFreqStyle", v)} options={SELECT_OPTIONS.depositFreqStyle} />
        </FieldWrapper>
        <FieldWrapper label="Deposit Trigger">
          <MultiTagSelectField value={form.depositTrigger} onChange={(v) => setField("depositTrigger", v)} {...TAG_OPTIONS.depositTrigger} />
        </FieldWrapper>
        <FieldWrapper label="Churn Risk Reason">
          <MultiTagSelectField value={form.churnRiskReason} onChange={(v) => setField("churnRiskReason", v)} {...TAG_OPTIONS.churnRiskReason} />
        </FieldWrapper>
        <FieldWrapper label="Re-activation Trigger">
          <MultiTagSelectField value={form.reactivationTrigger} onChange={(v) => setField("reactivationTrigger", v)} {...TAG_OPTIONS.reactivationTrigger} />
        </FieldWrapper>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <FieldLabel>Note</FieldLabel>
        <TextArea value={form.note} onChange={(v) => setField("note", v)} placeholder="Write note" />
      </div>
    </>
  );
}

// mode: "cancel" on the first step (X icon → exit the wizard) or "back" on
// later steps (left-arrow icon → previous step). Save is identical in both.
function ActionRow({ mode, onSecondary, onSave, saving }) {
  const isBack = mode === "back";
  return (
    <div className="flex justify-end gap-4">
      <button
        type="button"
        onClick={onSecondary}
        disabled={saving}
        className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] leading-[21px] transition hover:brightness-110 disabled:opacity-50"
        style={{ letterSpacing: "-1px" }}
      >
        {isBack ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
        {isBack ? "Back" : "Cancel"}
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
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
