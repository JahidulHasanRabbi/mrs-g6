"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createMissionPopupSetting,
  getMissionPopupSetting,
  getMissions,
  getStationList,
  getVipTiers,
  getWalletVipTiers,
  updateMissionPopupSetting,
} from "../../../../api/adminApi";
import { apiErrorMessage } from "../../../../components/admin/ui/GameUI";
import { MISSION_CATEGORY_OPTIONS } from "../../../../config/missionOptions";
import {
  POPUP_CLAIM_LIMIT_OPTIONS,
  POPUP_DEPOSIT_MODE_OPTIONS,
  POPUP_DISPLAY_FREQUENCY_OPTIONS,
  POPUP_LIMITED_TIMES,
  POPUP_REWARD_CATEGORY_OPTIONS,
} from "../../../../config/missionPopupOptions";
import {
  DateInput,
  Field,
  GOLD_BG,
  NumberInput,
  SectionTitle,
  Select,
  TextInput,
  TimeInput,
  Toggle,
} from "../../../../components/admin/mission-game/formControls";
import WeekdayPicker from "../../../../components/admin/mission-game/WeekdayPicker";
import MultiSelectChips from "../../../../components/admin/mission-game/MultiSelectChips";
import { useToast } from "../../../../components/admin/ui/Toast";

const EMPTY_FORM = {
  isEnabled: true,
  missionCategory: 1,
  missionUuid: "",
  startDate: "",
  endDate: "",
  daysOfWeek: [],
  startTime: "",
  endTime: "",
  title: "",
  content: "",
  depositAmount: "",
  depositTimes: 1,
  depositMode: 1,
  displayFrequency: 1,
  displayLimit: "",
  claimLimitType: 1,
  claimLimitCount: "",
  rewardCategory: 1,
  rewardAmount: "",
  stationUuids: [],
  walletVipUuids: [],
  mrsLevelUuids: [],
};

const asList = (data) => (Array.isArray(data) ? data : data?.results ?? []);

function toForm(api) {
  return {
    isEnabled: api.is_enabled ?? true,
    missionCategory: api.mission_category ?? 1,
    missionUuid: api.mission_uuid ?? api.mission ?? "",
    startDate: String(api.start_date ?? "").slice(0, 10),
    endDate: String(api.end_date ?? "").slice(0, 10),
    daysOfWeek: Array.isArray(api.days_of_week) ? api.days_of_week : [],
    startTime: String(api.start_time ?? "").slice(0, 5),
    endTime: String(api.end_time ?? "").slice(0, 5),
    title: api.title ?? "",
    content: api.content ?? "",
    depositAmount: api.deposit_amount ?? "",
    depositTimes: api.deposit_times ?? 1,
    depositMode: api.deposit_mode ?? 1,
    displayFrequency: api.display_frequency ?? 1,
    displayLimit: api.display_limit ?? "",
    claimLimitType: api.claim_limit_type ?? 1,
    claimLimitCount: api.claim_limit_count ?? "",
    rewardCategory: api.reward_category ?? 1,
    rewardAmount: api.reward_amount ?? "",
    stationUuids: api.station_uuids ?? [],
    walletVipUuids: api.wallet_vip_uuids ?? [],
    mrsLevelUuids: api.mrs_level_uuids ?? [],
  };
}

function toPayload(form, bannerFile) {
  const payload = {
    is_enabled: !!form.isEnabled,
    mission_category: Number(form.missionCategory),
    mission_uuid: form.missionUuid,
    start_date: form.startDate,
    end_date: form.endDate,
    days_of_week: form.daysOfWeek,
    start_time: form.startTime || null,
    end_time: form.endTime || null,
    title: form.title.trim(),
    content: form.content.trim(),
    deposit_amount: Number(form.depositAmount) || 0,
    deposit_times: Math.max(1, Number(form.depositTimes) || 1),
    deposit_mode: Number(form.depositMode),
    display_frequency: Number(form.displayFrequency),
    claim_limit_type: Number(form.claimLimitType),
    reward_category: Number(form.rewardCategory),
    reward_amount: Number(form.rewardAmount) || 0,
    station_uuids: form.stationUuids,
    wallet_vip_uuids: form.walletVipUuids,
    mrs_level_uuids: form.mrsLevelUuids,
  };
  // Counts only mean something for the "limited times" options.
  payload.display_limit =
    Number(form.displayFrequency) === POPUP_LIMITED_TIMES ? Math.max(1, Number(form.displayLimit) || 1) : null;
  payload.claim_limit_count =
    Number(form.claimLimitType) === POPUP_LIMITED_TIMES ? Math.max(1, Number(form.claimLimitCount) || 1) : null;
  if (bannerFile) payload.banner_image = bannerFile;
  return payload;
}

function PopOutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const editingUuid = searchParams.get("uuid") || null;

  const [form, setForm] = useState(EMPTY_FORM);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [missions, setMissions] = useState([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [walletTiers, setWalletTiers] = useState([]);
  const [mrsTiers, setMrsTiers] = useState([]);
  const [audienceLoading, setAudienceLoading] = useState(true);
  const [loading, setLoading] = useState(!!editingUuid);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    Promise.all([
      getStationList().catch(() => []),
      getWalletVipTiers({ page_size: 100 }).catch(() => []),
      getVipTiers().catch(() => []),
    ])
      .then(([stationData, walletData, mrsData]) => {
        setStations(
          asList(stationData).map((s) => ({ value: s.uuid, label: s.name || s.station_name || s.uuid })),
        );
        setWalletTiers(
          asList(walletData).map((t) => ({
            value: t.uuid,
            label: t.station_name ? `${t.name} · ${t.station_name}` : t.name,
          })),
        );
        setMrsTiers(
          asList(mrsData)
            .slice()
            .sort((a, b) => (a.level_order ?? 0) - (b.level_order ?? 0))
            .map((t) => ({ value: t.uuid, label: t.name })),
        );
      })
      .finally(() => setAudienceLoading(false));
  }, []);

  // Requirement row 11: the mission list follows the selected category. Held
  // until an edit payload has landed, so the saved category is fetched once.
  useEffect(() => {
    if (loading) return;
    setMissionsLoading(true);
    getMissions({ category: form.missionCategory, page_size: 100 })
      .then((data) => setMissions(asList(data).map((m) => ({ value: m.uuid, label: m.mission_name }))))
      .catch(() => setMissions([]))
      .finally(() => setMissionsLoading(false));
  }, [form.missionCategory, loading]);

  useEffect(() => {
    if (!editingUuid) return;
    getMissionPopupSetting(editingUuid)
      .then((data) => {
        setForm(toForm(data));
        if (data?.banner_image) setBannerPreview(data.banner_image);
      })
      .catch((err) => setError(apiErrorMessage(err, "Failed to load promotion.")))
      .finally(() => setLoading(false));
  }, [editingUuid]);

  const handleBanner = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.missionUuid) return "Select the mission this promotion attaches to.";
    if (!form.startDate || !form.endDate) return "Start date and end date are required.";
    if (form.endDate < form.startDate) return "End date cannot be before the start date.";
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      return "End time must be after the start time.";
    }
    if (!(Number(form.depositAmount) > 0)) return "Required deposit amount must be greater than 0.";
    if (!(Number(form.rewardAmount) > 0)) return "Reward amount must be greater than 0.";
    return "";
  };

  const handleSave = async () => {
    const message = validate();
    setError(message);
    if (message) return;

    setSaving(true);
    try {
      const payload = toPayload(form, bannerFile);
      if (editingUuid) await updateMissionPopupSetting(editingUuid, payload);
      else await createMissionPopupSetting(payload);
      toast.success(editingUuid ? "Pop-out promotion updated" : "Pop-out promotion created");
      router.push("/admin/mission-game/pop-out");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to save promotion."));
    } finally {
      setSaving(false);
    }
  };

  const limitedDisplay = Number(form.displayFrequency) === POPUP_LIMITED_TIMES;
  const limitedClaim = Number(form.claimLimitType) === POPUP_LIMITED_TIMES;

  return (
    <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
      <h2
        className="mb-6 bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent"
        style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}
      >
        {editingUuid ? "Edit Pop-out Promotion" : "Add Pop-out Promotion"}
      </h2>

      {error && (
        <p className="mb-4 rounded-[8px] border border-red-500/40 bg-red-500/10 px-4 py-2 text-[13px] text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-8 text-center text-[13px] text-white/60">Loading promotion...</p>
      ) : (
        <>
          <SectionTitle>Pop Out Setting</SectionTitle>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
            <Field label="Pop Out">
              <Toggle checked={form.isEnabled} onChange={set("isEnabled")} label={form.isEnabled ? "Enabled" : "Disabled"} />
            </Field>
            <Field label="Mission Category">
              <Select
                value={form.missionCategory}
                onChange={(v) => setForm((p) => ({ ...p, missionCategory: v, missionUuid: "" }))}
                options={MISSION_CATEGORY_OPTIONS}
              />
            </Field>
            <Field label="Mission">
              <Select
                value={form.missionUuid}
                onChange={set("missionUuid")}
                options={missions}
                disabled={missionsLoading || missions.length === 0}
                placeholder={missionsLoading ? "Loading missions..." : "Select a mission"}
              />
            </Field>

            <Field label="Start Date">
              <DateInput value={form.startDate} onChange={set("startDate")} />
            </Field>
            <Field label="End Date">
              <DateInput value={form.endDate} onChange={set("endDate")} />
            </Field>
            <div className="hidden md:block" aria-hidden="true" />

            <Field label="Start Time">
              <TimeInput value={form.startTime} onChange={set("startTime")} />
            </Field>
            <Field label="End Time">
              <TimeInput value={form.endTime} onChange={set("endTime")} />
            </Field>
            <div className="hidden md:block" aria-hidden="true" />

            <Field label="Active Day(s)" className="md:col-span-3">
              <WeekdayPicker value={form.daysOfWeek} onChange={set("daysOfWeek")} />
            </Field>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Content Setting</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Banner / Image">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBanner}
                  className="w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2 text-[13px] text-white file:mr-3 file:rounded-[6px] file:border-0 file:bg-[#e9af41] file:px-3 file:py-1 file:text-[12px] file:font-semibold file:text-[#141828]"
                />
                {bannerPreview && (
                  <img
                    src={bannerPreview}
                    alt="Pop-out banner preview"
                    className="mt-3 max-h-[160px] w-full rounded-[8px] border border-white/10 object-contain"
                  />
                )}
              </Field>
              <Field label="Title">
                <TextInput value={form.title} onChange={set("title")} placeholder="Happy Friday!" />
              </Field>
              <Field label="Pop Out Content">
                <TextInput
                  value={form.content}
                  onChange={set("content")}
                  placeholder="Deposit RM200 & Get Extra 50 Tokens"
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Deposit Requirement</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Required Deposit Amount (RM)">
                <NumberInput value={form.depositAmount} onChange={set("depositAmount")} min={0} placeholder="200" />
              </Field>
              <Field label="Number of Deposit Times">
                <NumberInput value={form.depositTimes} onChange={set("depositTimes")} min={1} />
              </Field>
              <Field label="Deposit Type">
                <Select value={form.depositMode} onChange={set("depositMode")} options={POPUP_DEPOSIT_MODE_OPTIONS} />
              </Field>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Display Frequency</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Show Pop Out">
                <Select
                  value={form.displayFrequency}
                  onChange={set("displayFrequency")}
                  options={POPUP_DISPLAY_FREQUENCY_OPTIONS}
                />
              </Field>
              {limitedDisplay && (
                <Field label="Maximum Display Times">
                  <NumberInput value={form.displayLimit} onChange={set("displayLimit")} min={1} placeholder="3" />
                </Field>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Reward Claim Limit</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Maximum Claims per Member">
                <Select value={form.claimLimitType} onChange={set("claimLimitType")} options={POPUP_CLAIM_LIMIT_OPTIONS} />
              </Field>
              {limitedClaim && (
                <Field label="Maximum Claim Times">
                  <NumberInput value={form.claimLimitCount} onChange={set("claimLimitCount")} min={1} placeholder="1" />
                </Field>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Reward Setting</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Reward Category">
                <Select
                  value={form.rewardCategory}
                  onChange={set("rewardCategory")}
                  options={POPUP_REWARD_CATEGORY_OPTIONS}
                />
              </Field>
              <Field label="Reward Amount">
                <NumberInput value={form.rewardAmount} onChange={set("rewardAmount")} min={0} placeholder="50" />
              </Field>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Eligibility Setting</SectionTitle>
            <p className="mb-4 text-[12px] text-white/60">
              All three are optional. Leaving one empty means it does not filter. When both level types are set, a member
              must satisfy both.
            </p>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Station">
                <MultiSelectChips
                  options={stations}
                  value={form.stationUuids}
                  onChange={set("stationUuids")}
                  emptyMeans="all stations"
                  loading={audienceLoading}
                />
              </Field>
              <Field label="Wallet VIP Level(s)">
                <MultiSelectChips
                  options={walletTiers}
                  value={form.walletVipUuids}
                  onChange={set("walletVipUuids")}
                  emptyMeans="all wallet levels"
                  loading={audienceLoading}
                />
              </Field>
              <Field label="MRS Level(s)">
                <MultiSelectChips
                  options={mrsTiers}
                  value={form.mrsLevelUuids}
                  onChange={set("mrsLevelUuids")}
                  emptyMeans="all MRS levels"
                  loading={audienceLoading}
                />
              </Field>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/mission-game/pop-out")}
          disabled={saving}
          className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundImage: GOLD_BG }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function AddPopOutPage() {
  return (
    <Suspense fallback={null}>
      <PopOutForm />
    </Suspense>
  );
}
