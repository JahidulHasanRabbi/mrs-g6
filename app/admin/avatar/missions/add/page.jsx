"use client";

// /admin/avatar/missions/add — create / edit an avatar mission.
// Edit mode is ?uuid=<mission uuid>: the form hydrates from
// GET /avatar/avatar-missions/{uuid}/ and saves with PUT (full update).
// Feedback follows the penalty-kick add-reward conventions: toast.warning for
// validation, toast.success/error around the save.

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../../../components/admin/ui/Toast";
import { createAvatarMission, getAvatarMission, updateAvatarMission } from "../../../../api/adminApi";
import {
  AVATAR_MISSION_ACTION_OPTIONS,
  AVATAR_MISSION_CATEGORY_OPTIONS,
} from "../../../../config/avatarOptions";
import {
  ActionButton,
  Card,
  DateField,
  Field,
  GOLD_BG,
  INPUT_BASE,
  SectionTitle,
  Select,
  TimeField,
  apiErrorMessage,
} from "../../../../components/admin/ui/GameUI";

const EMPTY_FORM = {
  missionName: "",
  category: 1,
  description: "",
  conditionAction: 1,
  accumulateTarget: 1,
  rewardBattlePointQuantity: 0,
  rewardTokenQuantity: 0,
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
};

function dateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

// Accepts the time half of an ISO datetime ("...T08:00:00+08:00"); a bare
// date (or no value) has no time to read.
function timeOnly(value) {
  if (!value) return "";
  const text = String(value);
  if (!text.includes("T")) return "";
  const candidate = text.split("T")[1];
  return /^\d{2}:\d{2}/.test(candidate) ? candidate.slice(0, 5) : "";
}

function toForm(api) {
  return {
    missionName: api.mission_name ?? "",
    category: api.category ?? 1,
    description: api.description ?? "",
    conditionAction: api.condition_action ?? 1,
    accumulateTarget: api.accumulate_target ?? 1,
    rewardBattlePointQuantity: api.reward_battle_point_quantity ?? 0,
    rewardTokenQuantity: api.reward_token_quantity ?? 0,
    startDate: dateOnly(api.start_date),
    startTime: timeOnly(api.start_date),
    endDate: dateOnly(api.end_date),
    endTime: timeOnly(api.end_date),
  };
}

// The backend field carries the whole moment now (date + time), not a bare
// date. Dates stay optional here — no date means no schedule boundary.
function combineDateTime(date, time) {
  if (!date) return null;
  return `${date}T${time || "00:00"}:00`;
}

function toPayload(form) {
  return {
    mission_name: form.missionName.trim(),
    category: Number(form.category),
    description: form.description.trim(),
    condition_action: Number(form.conditionAction),
    accumulate_target: Number(form.accumulateTarget),
    reward_battle_point_quantity: Number(form.rewardBattlePointQuantity),
    reward_token_quantity: Number(form.rewardTokenQuantity) || 0,
    start_date: combineDateTime(form.startDate, form.startTime),
    end_date: combineDateTime(form.endDate, form.endTime),
  };
}

function AvatarMissionForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const editingUuid = searchParams.get("uuid") || null;
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(editingUuid));

  useEffect(() => {
    if (!editingUuid) return;
    setLoading(true);
    getAvatarMission(editingUuid)
      .then((data) => setForm(toForm(data)))
      .catch((err) =>
        toast.error("Failed to load mission", { description: apiErrorMessage(err, "Please go back and retry.") }),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingUuid]);

  const set = (key) => (v) => setForm((p) => ({ ...p, [key]: v }));

  const validate = () => {
    if (!form.missionName.trim()) return "Mission name is required";
    const target = Number(form.accumulateTarget);
    if (!Number.isInteger(target) || target < 1) return "Accumulate target must be a whole number of at least 1";
    const bp = Number(form.rewardBattlePointQuantity);
    if (!Number.isInteger(bp) || bp < 0) return "Battle point reward must be a whole number of at least 0";
    const tokens = Number(form.rewardTokenQuantity);
    if (!Number.isInteger(tokens) || tokens < 0) return "KR Coin reward must be a whole number of at least 0";
    if (form.startDate && form.endDate) {
      const start = combineDateTime(form.startDate, form.startTime);
      const end = combineDateTime(form.endDate, form.endTime);
      if (end < start) return "End date must not be before start date";
    }
    return "";
  };

  const handleSave = async () => {
    const invalid = validate();
    if (invalid) {
      toast.warning(invalid);
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingUuid) {
        await updateAvatarMission(editingUuid, payload);
        toast.success("Mission updated");
      } else {
        await createAvatarMission(payload);
        toast.success("Mission created");
      }
      router.push("/admin/avatar/missions");
    } catch (err) {
      toast.error(editingUuid ? "Failed to update mission" : "Failed to create mission", {
        description: apiErrorMessage(err, "Please try again."),
      });
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <h2
        className="mb-6 bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent"
        style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}
      >
        {editingUuid ? "Edit Avatar Mission" : "Add Avatar Mission"}
      </h2>

      {loading ? (
        <p className="py-8 text-center text-[13px] text-white/60">Loading mission...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
            <Field label="Mission Name">
              <input
                type="text"
                value={form.missionName}
                onChange={(e) => set("missionName")(e.target.value)}
                className={INPUT_BASE}
              />
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={set("category")} options={AVATAR_MISSION_CATEGORY_OPTIONS} />
            </Field>
            <Field label="Description">
              <input
                type="text"
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                className={INPUT_BASE}
              />
            </Field>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Mission Target</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Condition Action">
                <Select value={form.conditionAction} onChange={set("conditionAction")} options={AVATAR_MISSION_ACTION_OPTIONS} />
              </Field>
              <Field label="Accumulate Target">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.accumulateTarget}
                  onChange={(e) => set("accumulateTarget")(e.target.value)}
                  className={INPUT_BASE}
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Schedule</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Start Date" hint="Optional — leave empty to run immediately.">
                <DateField value={form.startDate} onChange={set("startDate")} />
              </Field>
              <Field label="Start Time">
                <TimeField value={form.startTime} onChange={set("startTime")} disabled={!form.startDate} />
              </Field>
              <div className="hidden md:block" aria-hidden="true" />
              <Field label="End Date" hint="Optional — must not be before start date.">
                <DateField value={form.endDate} onChange={set("endDate")} min={form.startDate || undefined} />
              </Field>
              <Field label="End Time">
                <TimeField value={form.endTime} onChange={set("endTime")} disabled={!form.endDate} />
              </Field>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Reward</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Battle Point Quantity">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.rewardBattlePointQuantity}
                  onChange={(e) => set("rewardBattlePointQuantity")(e.target.value)}
                  className={INPUT_BASE}
                />
              </Field>
              <Field label="KR Coin Quantity">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.rewardTokenQuantity}
                  onChange={(e) => set("rewardTokenQuantity")(e.target.value)}
                  className={INPUT_BASE}
                />
              </Field>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex items-center justify-end gap-3">
        <ActionButton onClick={() => router.push("/admin/avatar/missions")} disabled={saving}>
          Back
        </ActionButton>
        <ActionButton variant="filled" onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save"}
        </ActionButton>
      </div>
    </Card>
  );
}

// useSearchParams() requires a route-level Suspense boundary.
export default function AddAvatarMissionPage() {
  return (
    <Suspense fallback={null}>
      <AvatarMissionForm />
    </Suspense>
  );
}
