"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getMissionPromotion,
  getMissions,
  getVipTiers,
  getWalletVipTiers,
  listMissionPromotions,
  saveMissionPromotion,
} from "../../../../api/adminApi";
import { apiErrorMessage } from "../../../../components/admin/ui/GameUI";
import { MISSION_CATEGORY_OPTIONS } from "../../../../config/missionOptions";
import {
  POPUP_CLAIM_LIMIT_OPTIONS,
  POPUP_DEPOSIT_MODE_OPTIONS,
  POPUP_DISPLAY_FREQUENCY_OPTIONS,
  POPUP_ELIGIBILITY_STATION_LABELS,
  POPUP_ELIGIBILITY_STATION_OPTIONS,
  POPUP_LIMITED_TIMES,
  POPUP_REWARD_CATEGORY_OPTIONS,
} from "../../../../config/missionPopupOptions";
import {
  Field,
  GOLD_BG,
  NumberInput,
  SectionTitle,
  Select,
  TextInput,
  Toggle,
} from "../../../../components/admin/mission-game/formControls";
import { PromoDateInput, PromoTimeInput } from "../../../../components/admin/mission-game/PromoDateTimeInputs";
import WeekdayPicker from "../../../../components/admin/mission-game/WeekdayPicker";
import MultiSelectDropdown from "../../../../components/admin/mission-game/MultiSelectDropdown";
import ConfirmDialog from "../../../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../../../components/admin/ui/Toast";

// Wallet VIP tiers carry their own `station_name` string (e.g. "Acebet77"),
// not the fixed 1-6 station id a promotion's `eligibility_stations` uses —
// this bridges the two so the Wallet VIP picker can be scoped to whichever
// station(s) are currently checked above it.
const STATION_LABEL_BY_ID = POPUP_ELIGIBILITY_STATION_LABELS;

const EMPTY_FORM = {
  isEnabled: true,
  // UI-only: narrows the mission dropdown while creating. Not part of the
  // promotion payload — the promotion itself carries no mission_category.
  missionCategory: 1,
  missionUuid: "",
  startDate: "",
  endDate: "",
  daysOfWeek: [],
  startTime: "",
  endTime: "",
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
  stationIds: [],
  walletVipUuids: [],
  mrsLevelUuids: [],
};

const asList = (data) => (Array.isArray(data) ? data : data?.results ?? []);

function toForm(api) {
  return {
    isEnabled: api.enabled ?? true,
    missionCategory: 1,
    missionUuid: api.mission_uuid ?? "",
    startDate: String(api.start_date ?? "").slice(0, 10),
    endDate: String(api.end_date ?? "").slice(0, 10),
    daysOfWeek: Array.isArray(api.days_of_week) ? api.days_of_week : [],
    startTime: String(api.daily_start_time ?? "").slice(0, 5),
    endTime: String(api.daily_end_time ?? "").slice(0, 5),
    content: api.content_text ?? "",
    depositAmount: api.deposit_amount ?? "",
    depositTimes: api.deposit_times ?? 1,
    depositMode: api.deposit_mode ?? 1,
    displayFrequency: api.display_frequency_type ?? 1,
    displayLimit: api.display_frequency_limit ?? "",
    claimLimitType: api.claim_limit_type ?? 1,
    claimLimitCount: api.claim_limit_value ?? "",
    rewardCategory: api.reward_type ?? 1,
    rewardAmount: api.reward_amount ?? "",
    stationIds: Array.isArray(api.eligibility_stations) ? api.eligibility_stations : [],
    walletVipUuids: Array.isArray(api.eligibility_wallet_vip_tiers) ? api.eligibility_wallet_vip_tiers : [],
    mrsLevelUuids: Array.isArray(api.eligibility_mrs_tiers) ? api.eligibility_mrs_tiers : [],
  };
}

// PATCH .../promotion/ is an upsert but not a partial update — every field is
// sent every time, including on edit.
function toPayload(form, bannerFile) {
  const payload = {
    enabled: !!form.isEnabled,
    start_date: `${form.startDate}T00:00:00Z`,
    end_date: `${form.endDate}T23:59:59Z`,
    days_of_week: form.daysOfWeek,
    daily_start_time: `${form.startTime || "00:00"}:00`,
    daily_end_time: `${form.endTime || "23:59"}:59`,
    content_text: form.content.trim(),
    deposit_amount: Number(form.depositAmount) || 0,
    deposit_times: Math.max(1, Number(form.depositTimes) || 1),
    deposit_mode: Number(form.depositMode),
    display_frequency_type: Number(form.displayFrequency),
    claim_limit_type: Number(form.claimLimitType),
    reward_type: Number(form.rewardCategory),
    reward_amount: Number(form.rewardAmount) || 0,
    eligibility_stations: form.stationIds,
    eligibility_wallet_vip_tier_uuids: form.walletVipUuids,
    eligibility_mrs_tier_uuids: form.mrsLevelUuids,
  };
  // Counts only mean something for the "limited times" options.
  payload.display_frequency_limit =
    Number(form.displayFrequency) === POPUP_LIMITED_TIMES ? Math.max(1, Number(form.displayLimit) || 1) : null;
  payload.claim_limit_value =
    Number(form.claimLimitType) === POPUP_LIMITED_TIMES ? Math.max(1, Number(form.claimLimitCount) || 1) : null;
  // banner_image rejects an explicit null, so it is only ever sent when a new
  // file was actually chosen — omitting it on save leaves the existing one alone.
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
  const [promotedMissionUuids, setPromotedMissionUuids] = useState(null);
  const [missionName, setMissionName] = useState("");
  const [walletTierRows, setWalletTierRows] = useState([]);
  const [mrsTiers, setMrsTiers] = useState([]);
  const [audienceLoading, setAudienceLoading] = useState(true);
  const [loading, setLoading] = useState(!!editingUuid);
  const [saving, setSaving] = useState(false);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    Promise.all([
      getWalletVipTiers({ page_size: 100 }).catch(() => []),
      getVipTiers().catch(() => []),
    ])
      .then(([walletData, mrsData]) => {
        setWalletTierRows(asList(walletData));
        setMrsTiers(
          asList(mrsData)
            .slice()
            .sort((a, b) => (a.level_order ?? 0) - (b.level_order ?? 0))
            .map((t) => ({ value: t.uuid, label: t.name })),
        );
      })
      .finally(() => setAudienceLoading(false));
  }, []);

  // A promotion only ever attaches to one mission, so a mission that already
  // has one shouldn't be offered again while creating — fetched once, since
  // it doesn't depend on the category filter.
  useEffect(() => {
    if (editingUuid) return;
    listMissionPromotions()
      .then((rows) => setPromotedMissionUuids(new Set(rows.map((r) => r.mission_uuid))))
      .catch(() => setPromotedMissionUuids(new Set()));
  }, [editingUuid]);

  // Requirement row 11: the mission list follows the selected category. Only
  // relevant while creating — an existing promotion's mission is fixed by
  // editingUuid, so there is nothing to pick.
  useEffect(() => {
    if (loading || editingUuid) return;
    setMissionsLoading(true);
    getMissions({ category: form.missionCategory, page_size: 100 })
      .then((data) => setMissions(asList(data)))
      .catch(() => setMissions([]))
      .finally(() => setMissionsLoading(false));
  }, [form.missionCategory, loading, editingUuid]);

  // Missions with an existing promotion are hidden from the create dropdown
  // once we know which ones those are; while that check is still in flight,
  // show the full list rather than blocking on it.
  const missionOptions = missions
    .filter((m) => !promotedMissionUuids || !promotedMissionUuids.has(m.uuid))
    .map((m) => ({ value: m.uuid, label: `#${m.id} — ${m.mission_name}` }));

  // Wallet VIP tiers are per-station; MRS tiers are not (the member API
  // returns one global set with no station dimension), so only Wallet VIP
  // gets scoped by the Station picker above it.
  const selectedStationLabels = form.stationIds.map((id) => STATION_LABEL_BY_ID[id]?.toLowerCase()).filter(Boolean);
  const walletTierOptions = (
    selectedStationLabels.length === 0
      ? walletTierRows
      : walletTierRows.filter((t) => selectedStationLabels.includes(String(t.station_name || "").toLowerCase()))
  ).map((t) => ({
    value: t.uuid,
    label: t.station_name ? `${t.name} · ${t.station_name}` : t.name,
  }));

  // Narrowing the Station picker can leave a previously-checked Wallet VIP
  // level behind (its station no longer selected) — drop it rather than
  // silently keep applying a filter the admin can no longer see.
  useEffect(() => {
    if (audienceLoading || selectedStationLabels.length === 0) return;
    setForm((prev) => {
      const allowed = new Set(walletTierOptions.map((o) => o.value));
      const next = prev.walletVipUuids.filter((v) => allowed.has(v));
      return next.length === prev.walletVipUuids.length ? prev : { ...prev, walletVipUuids: next };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.stationIds.join(","), audienceLoading]);

  useEffect(() => {
    if (!editingUuid) return;
    getMissionPromotion(editingUuid)
      .then((data) => {
        setForm({ ...toForm(data), missionUuid: editingUuid });
        setMissionName(data?.mission_name || "");
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

  const handleSaveClick = () => {
    const message = validate();
    setError(message);
    if (message) return;
    setConfirmingSave(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = toPayload(form, bannerFile);
      // PATCH .../promotion/ upserts — same call whether creating or editing.
      await saveMissionPromotion(editingUuid || form.missionUuid, payload);
      toast.success(editingUuid ? "Pop-out promotion updated" : "Pop-out promotion created");
      router.push("/admin/mission-game/pop-out");
    } catch (err) {
      setConfirmingSave(false);
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
            {editingUuid ? (
              <Field label="Mission" className="md:col-span-2">
                <div className="flex h-[42px] items-center rounded-[8px] border border-white/10 bg-white/[0.03] px-4 text-[13px] text-white/80">
                  {missionName || editingUuid}
                </div>
              </Field>
            ) : (
              <>
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
                    options={missionOptions}
                    disabled={missionsLoading || missionOptions.length === 0}
                    placeholder={
                      missionsLoading || promotedMissionUuids === null
                        ? "Loading missions..."
                        : missionOptions.length === 0
                        ? "No missions available — every mission in this category already has a promotion"
                        : "Select a mission"
                    }
                  />
                </Field>
              </>
            )}

            <Field label="Start Date">
              <PromoDateInput value={form.startDate} onChange={set("startDate")} />
            </Field>
            <Field label="End Date">
              <PromoDateInput value={form.endDate} onChange={set("endDate")} />
            </Field>
            <div className="hidden md:block" aria-hidden="true" />

            <Field label="Start Time">
              <PromoTimeInput value={form.startTime} onChange={set("startTime")} />
            </Field>
            <Field label="End Time">
              <PromoTimeInput value={form.endTime} onChange={set("endTime")} />
            </Field>
            <div className="hidden md:block" aria-hidden="true" />

            <Field label="Active Day(s)" className="md:col-span-3">
              <WeekdayPicker value={form.daysOfWeek} onChange={set("daysOfWeek")} />
            </Field>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Content Setting</SectionTitle>
            <p className="mb-4 text-[12px] text-white/60">
              A banner image replaces the whole pop-out card — Pop Out Content is only shown when no
              banner is uploaded, rendered inside the default gold artwork instead.
            </p>
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
              <Field label="Pop Out Content">
                <TextInput
                  value={form.content}
                  onChange={set("content")}
                  placeholder="Deposit RM200 & Get Extra 50 Tokens"
                  disabled={!!bannerPreview}
                />
                {bannerPreview && (
                  <p className="mt-2 text-[11px] text-white/40">Ignored while a banner image is set above.</p>
                )}
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

            {/* Station + Wallet VIP grouped together: Wallet VIP tiers belong
                to a station, so picking one here scopes the other. */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <Field label="Station">
                <MultiSelectDropdown
                  options={POPUP_ELIGIBILITY_STATION_OPTIONS}
                  value={form.stationIds}
                  onChange={set("stationIds")}
                  emptyMeans="all stations"
                />
              </Field>
              <Field label="Wallet VIP Level(s)">
                <MultiSelectDropdown
                  options={walletTierOptions}
                  value={form.walletVipUuids}
                  onChange={set("walletVipUuids")}
                  emptyMeans="all wallet levels"
                  loading={audienceLoading}
                />
                {selectedStationLabels.length === 0 && (
                  <p className="mt-2 text-[11px] text-white/40">
                    Showing every station&apos;s levels — pick a Station above to narrow this list.
                  </p>
                )}
              </Field>
            </div>

            {/* MRS Level is unrelated to Station — the member API returns one
                global set of MRS tiers with no per-station dimension. */}
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-white/5 pt-5 md:grid-cols-2">
              <Field label="MRS Level(s)">
                <MultiSelectDropdown
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
          onClick={handleSaveClick}
          disabled={saving || loading}
          className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundImage: GOLD_BG }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmingSave}
        title={editingUuid ? "Update pop-out promotion?" : "Create pop-out promotion?"}
        message={
          editingUuid
            ? `Save these changes to the promotion on "${missionName}"? Members eligible for it will see the updated version next time it triggers.`
            : `Create this promotion on "${missions.find((m) => m.uuid === form.missionUuid)?.mission_name || "the selected mission"}"? It goes live immediately if enabled.`
        }
        confirmLabel={editingUuid ? "Save Changes" : "Create"}
        tone="primary"
        loading={saving}
        onConfirm={handleSave}
        onCancel={() => setConfirmingSave(false)}
      />
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
