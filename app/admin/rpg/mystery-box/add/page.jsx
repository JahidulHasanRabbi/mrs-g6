"use client";

// /admin/rpg/mystery-box/add — create / edit a mystery box item.
// Edit mode is ?uuid=<item uuid>: hydrates from GET /avatar/mystery-box-items/{uuid}/
// and saves with PUT. Reward fields are conditional on reward_type:
//   1 Token        → token_amount required
//   2 Battle Point → battle_point_amount required
//   3 Free Credit  → max_withdraw required (min_withdraw optional, ≤ max)
//   4 Equipment    → no extra fields (item drops from the boss reward slot)
//   5 Level Up     → level_up_count required
//   6 Gold Bar     → no extra fields
// `image` is optional; a newly picked File is sent as multipart automatically.
// Feedback follows the penalty-kick add-reward conventions (toasts).

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../../../components/admin/ui/Toast";
import { createMysteryBoxItem, getMysteryBoxItem, updateMysteryBoxItem } from "../../../../api/adminApi";
import { MYSTERY_BOX_REWARD_TYPE_OPTIONS } from "../../../../config/avatarOptions";
import {
  ActionButton,
  Card,
  Field,
  GOLD_BG,
  INPUT_BASE,
  SectionTitle,
  Select,
  Toggle,
  apiErrorMessage,
} from "../../../../components/admin/ui/GameUI";

const EMPTY_FORM = {
  rewardName: "",
  rewardType: 1,
  probability: "0.0000",
  tokenAmount: "",
  battlePointAmount: "",
  levelUpCount: "",
  unlimited: true,
  quantity: "",
  minWithdraw: "",
  maxWithdraw: "",
};

function toForm(api) {
  return {
    rewardName: api.reward_name ?? "",
    rewardType: api.reward_type ?? 1,
    probability: api.probability != null ? String(api.probability) : "0.0000",
    tokenAmount: api.token_amount != null ? String(api.token_amount) : "",
    battlePointAmount: api.battle_point_amount != null ? String(api.battle_point_amount) : "",
    levelUpCount: api.level_up_count != null ? String(api.level_up_count) : "",
    unlimited: Boolean(api.unlimited),
    quantity: api.quantity != null ? String(api.quantity) : "",
    minWithdraw: api.min_withdraw != null ? String(api.min_withdraw) : "",
    maxWithdraw: api.max_withdraw != null ? String(api.max_withdraw) : "",
  };
}

function validate(form) {
  if (!form.rewardName.trim()) return "Reward name is required";
  const probability = Number(form.probability);
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    return "Probability must be between 0 and 1 (e.g. 0.1800 for 18%)";
  }
  const type = Number(form.rewardType);
  if (type === 1) {
    const v = Number(form.tokenAmount);
    if (!Number.isInteger(v) || v <= 0) return "Token amount is required for Token rewards";
  }
  if (type === 2) {
    const v = Number(form.battlePointAmount);
    if (!Number.isInteger(v) || v <= 0) return "Battle point amount is required for Battle Point rewards";
  }
  if (type === 5) {
    const v = Number(form.levelUpCount);
    if (!Number.isInteger(v) || v <= 0) return "Level up count is required for Level Up rewards";
  }
  if (type === 3) {
    if (form.maxWithdraw === "") return "Max withdraw is required for Free Credit rewards";
    const max = Number(form.maxWithdraw);
    if (!Number.isFinite(max) || max < 0) return "Max withdraw must be a valid amount";
    if (form.minWithdraw !== "") {
      const min = Number(form.minWithdraw);
      if (!Number.isFinite(min) || min < 0) return "Min withdraw must be a valid amount";
      if (max < min) return "Max withdraw must not be below min withdraw";
    }
  }
  if (!form.unlimited) {
    const q = Number(form.quantity);
    if (!Number.isInteger(q) || q < 0) return "Quantity is required (min 0) when the item is not unlimited";
  }
  return "";
}

function toPayload(form, imageFile) {
  const type = Number(form.rewardType);
  const payload = {
    reward_name: form.rewardName.trim(),
    reward_type: type,
    probability: Number(form.probability).toFixed(4),
    // Unused numeric amounts must be 0, not null (verified against the API —
    // null is rejected with "This field may not be null.").
    token_amount: type === 1 ? Number(form.tokenAmount) : 0,
    battle_point_amount: type === 2 ? Number(form.battlePointAmount) : 0,
    level_up_count: type === 5 ? Number(form.levelUpCount) : 0,
    unlimited: Boolean(form.unlimited),
    min_withdraw: type === 3 && form.minWithdraw !== "" ? form.minWithdraw : null,
    max_withdraw: type === 3 ? form.maxWithdraw : null,
  };
  // The API rejects quantity in any form (even null/0) when unlimited is true:
  // "You cannot provide quantity when unlimited is True." — omit the key.
  if (!form.unlimited) payload.quantity = Number(form.quantity);
  // Only send the image when a new file was picked — sending nothing keeps
  // the stored image; the File flips the request to multipart automatically.
  if (imageFile) payload.image = imageFile;
  return payload;
}

function MysteryBoxItemForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const editingUuid = searchParams.get("uuid") || null;
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(editingUuid));

  useEffect(() => {
    if (!editingUuid) return;
    setLoading(true);
    getMysteryBoxItem(editingUuid)
      .then((data) => {
        setForm(toForm(data));
        setImagePreview(data.image || null);
      })
      .catch((err) =>
        toast.error("Failed to load item", { description: apiErrorMessage(err, "Please go back and retry.") }),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingUuid]);

  const set = (key) => (v) => setForm((p) => ({ ...p, [key]: v }));
  const type = Number(form.rewardType);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result || null);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const invalid = validate(form);
    if (invalid) {
      toast.warning(invalid);
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form, imageFile);
      if (editingUuid) {
        await updateMysteryBoxItem(editingUuid, payload);
        toast.success("Mystery box item updated");
      } else {
        await createMysteryBoxItem(payload);
        toast.success("Mystery box item created");
      }
      router.push("/admin/rpg/mystery-box");
    } catch (err) {
      toast.error(editingUuid ? "Failed to update item" : "Failed to create item", {
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
        {editingUuid ? "Edit Mystery Box Item" : "Add Mystery Box Item"}
      </h2>

      {loading ? (
        <p className="py-8 text-center text-[13px] text-white/60">Loading item...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
            <Field label="Reward Name">
              <input
                type="text"
                value={form.rewardName}
                onChange={(e) => set("rewardName")(e.target.value)}
                className={INPUT_BASE}
              />
            </Field>
            <Field label="Reward Type">
              <Select value={form.rewardType} onChange={set("rewardType")} options={MYSTERY_BOX_REWARD_TYPE_OPTIONS} />
            </Field>
            <Field label="Probability" hint="0 to 1, up to 4 decimals — 0.1800 = 18%. Items at 0 are shown but never drawn.">
              <input
                type="number"
                min="0"
                max="1"
                step="0.0001"
                value={form.probability}
                onChange={(e) => set("probability")(e.target.value)}
                className={INPUT_BASE}
              />
            </Field>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Reward Value</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              {type === 1 && (
                <Field label="Token Amount">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.tokenAmount}
                    onChange={(e) => set("tokenAmount")(e.target.value)}
                    className={INPUT_BASE}
                  />
                </Field>
              )}
              {type === 2 && (
                <Field label="Battle Point Amount">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.battlePointAmount}
                    onChange={(e) => set("battlePointAmount")(e.target.value)}
                    className={INPUT_BASE}
                  />
                </Field>
              )}
              {type === 5 && (
                <Field label="Level Up Count">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.levelUpCount}
                    onChange={(e) => set("levelUpCount")(e.target.value)}
                    className={INPUT_BASE}
                  />
                </Field>
              )}
              {type === 3 && (
                <>
                  <Field label="Min Withdraw (RM)" hint="Optional — lower bound of the random credit.">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minWithdraw}
                      onChange={(e) => set("minWithdraw")(e.target.value)}
                      className={INPUT_BASE}
                    />
                  </Field>
                  <Field label="Max Withdraw (RM)" hint="Required — upper bound of the random credit.">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.maxWithdraw}
                      onChange={(e) => set("maxWithdraw")(e.target.value)}
                      className={INPUT_BASE}
                    />
                  </Field>
                </>
              )}
              {type === 4 && (
                <p className="self-center text-[13px] text-white/50 md:col-span-2">
                  Equipment rewards drop one item matching the defeated boss's equipment reward slot — nothing to configure here.
                </p>
              )}
              {type === 6 && (
                <p className="self-center text-[13px] text-white/50 md:col-span-2">
                  Gold bar rewards are handled manually — nothing to configure here.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Stock</SectionTitle>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              <Field label="Unlimited">
                <div className="pt-2">
                  <Toggle checked={form.unlimited} onChange={set("unlimited")} label={form.unlimited ? "Yes" : "No"} />
                </div>
              </Field>
              {!form.unlimited && (
                <Field label="Quantity" hint="Remaining stock. Required when not unlimited.">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={(e) => set("quantity")(e.target.value)}
                    className={INPUT_BASE}
                  />
                </Field>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <SectionTitle>Image</SectionTitle>
            <div className="flex items-center gap-5">
              <label className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-[#f2cb7a]/50 bg-white/[0.03] transition-colors hover:bg-white/[0.06]">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Reward preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-2 text-center text-[11px] text-white/40">Click to upload</span>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <p className="text-[12px] text-white/40">
                Optional. Shown on the member reward list.
                {editingUuid && !imageFile && " Leave untouched to keep the current image."}
              </p>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex items-center justify-end gap-3">
        <ActionButton onClick={() => router.push("/admin/rpg/mystery-box")} disabled={saving}>
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
export default function AddMysteryBoxItemPage() {
  return (
    <Suspense fallback={null}>
      <MysteryBoxItemForm />
    </Suspense>
  );
}
