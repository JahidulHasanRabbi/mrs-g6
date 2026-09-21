"use client";

import { useEffect, useRef, useState } from "react";
import ModalShell from "../penalty-kick/ModalShell";
import { useToast } from "../ui/Toast";
import * as adminApi from "../../../api/adminApi";
import { ITEM_TYPE_OPTIONS, REWARD_TYPE_OPTIONS, describeApiError, labelToValue } from "./constants";

const FIELD =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";
const LABEL = "mb-2 block text-[14px] font-semibold text-white";

// Item type → the single amount field the API expects alongside it. PRIZE (3)
// carries no amount at all.
export const AMOUNT_FIELD_BY_ITEM_TYPE = {
  1: { key: "credit_amount", label: "Credit Amount", step: "0.01", asString: true },
  2: { key: "token_amount", label: "KR Coin Amount", step: "1" },
  4: { key: "battle_point_amount", label: "Battle Point Amount", step: "1" },
  5: { key: "attack_point_amount", label: "Attack Point Amount", step: "1" },
};

const EMPTY = {
  rewardType: 1,
  rewardName: "",
  positionStart: "",
  positionEnd: "",
  itemType: 1,
  amount: "",
};

export default function RewardItemModal({ open, initial, bossUuid, onClose, onSaved }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const itemType = labelToValue(ITEM_TYPE_OPTIONS, initial.item_type);
      const amountField = AMOUNT_FIELD_BY_ITEM_TYPE[itemType];
      setForm({
        rewardType: labelToValue(REWARD_TYPE_OPTIONS, initial.reward_type),
        rewardName: initial.reward_name || "",
        positionStart: initial.position_start ?? "",
        positionEnd: initial.position_end ?? "",
        itemType,
        amount: amountField ? initial[amountField.key] ?? "" : "",
      });
      setImagePreview(initial.image || null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [open, initial]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const isRanking = Number(form.rewardType) === 1;
  const amountField = AMOUNT_FIELD_BY_ITEM_TYPE[Number(form.itemType)];

  const handleSave = async () => {
    if (!form.rewardName.trim()) {
      toast.warning("Reward name is required");
      return;
    }

    const payload = {
      boss_uuid: bossUuid,
      reward_type: Number(form.rewardType),
      reward_name: form.rewardName.trim(),
      item_type: Number(form.itemType),
    };

    // Positions only apply to ranking rewards.
    if (isRanking) {
      if (String(form.positionStart).trim() !== "") payload.position_start = Number(form.positionStart);
      if (String(form.positionEnd).trim() !== "") payload.position_end = Number(form.positionEnd);
    }

    if (amountField && String(form.amount).trim() !== "") {
      payload[amountField.key] = amountField.asString ? String(form.amount) : Number(form.amount);
    }

    if (imageFile) payload.image = imageFile;

    setSaving(true);
    try {
      if (initial?.uuid) {
        await adminApi.updateBossWarRewardItem(bossUuid, initial.uuid, payload);
        toast.success("Reward item updated");
      } else {
        await adminApi.createBossWarRewardItem(bossUuid, payload);
        toast.success("Reward item created");
      }
      onSaved();
    } catch (error) {
      toast.error("Failed to save reward item", { description: describeApiError(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      title={initial ? "Edit Reward Item" : "Add Reward Item"}
      onClose={onClose}
      saving={saving}
      onSave={handleSave}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={LABEL}>Reward Type</label>
          <select value={form.rewardType} onChange={set("rewardType")} className={`${FIELD} appearance-none`}>
            {REWARD_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Reward Name</label>
          <input type="text" value={form.rewardName} onChange={set("rewardName")} className={FIELD} />
        </div>

        {isRanking && (
          <>
            <div>
              <label className={LABEL}>Position Start</label>
              <input type="number" min="1" value={form.positionStart} onChange={set("positionStart")} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Position End</label>
              <input type="number" min="1" value={form.positionEnd} onChange={set("positionEnd")} placeholder="Leave empty for a single rank" className={FIELD} />
            </div>
          </>
        )}

        <div>
          <label className={LABEL}>Item Type</label>
          <select value={form.itemType} onChange={set("itemType")} className={`${FIELD} appearance-none`}>
            {ITEM_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {amountField ? (
          <div>
            <label className={LABEL}>{amountField.label}</label>
            <input type="number" min="0" step={amountField.step} value={form.amount} onChange={set("amount")} className={FIELD} />
          </div>
        ) : (
          <div className="flex items-end">
            <p className="pb-2 text-[12px] text-white/50">A prize carries no amount.</p>
          </div>
        )}

        <div className="md:col-span-2">
          <label className={LABEL}>Image</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-[110px] w-full max-w-[320px] items-center justify-center gap-3 rounded-[8px] border-2 border-dashed border-white/40 text-[13px] text-white/70 transition-colors hover:border-[#f2cb7a]/70 hover:text-white"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="h-full w-full rounded-[8px] object-contain" />
            ) : (
              "Upload Image"
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>
      </div>
    </ModalShell>
  );
}
