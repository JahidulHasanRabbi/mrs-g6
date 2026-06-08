"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../../components/admin/ui/Toast";
import * as adminApi from "../../../api/adminApi";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";

const ITEM_TYPES = [
  { value: "1", label: "Free Credit" },
  { value: "2", label: "Token" },
  { value: "3", label: "Prize" },
  { value: "4", label: "World Cup Score" },
];

const TYPE_LABEL_TO_VALUE = {
  "FREE CREDIT": "1",
  TOKEN: "2",
  PRIZE: "3",
  "WORLD CUP SCORE": "4",
};

function parseNumber(value) {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[14px] text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? "bg-[#e9af41]" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[23px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.7">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" fill="white" fillOpacity="0.7" stroke="none" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AddRewardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const fileRef = useRef(null);
  const rewardId = searchParams.get("id");
  const isEditing = Boolean(rewardId);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    itemType: "1",
    minWithdraw: "",
    maxWithdraw: "",
    tokenAmount: "",
    scoreAmount: "",
    unlimited: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!rewardId) return;
    let cancelled = false;
    async function loadReward() {
      setLoading(true);
      try {
        const item = await adminApi.getPenaltyKickItem(rewardId);
        if (cancelled) return;
        setForm({
          name: item.reward_name || "",
          quantity: item.unlimited ? "" : String(item.quantity ?? ""),
          itemType: TYPE_LABEL_TO_VALUE[String(item.item_type || "").toUpperCase()] || String(item.item_type || "1"),
          minWithdraw: item.min_withdraw ?? "",
          maxWithdraw: item.max_withdraw ?? "",
          tokenAmount: item.token_amount ?? "",
          scoreAmount: item.score_amount ?? "",
          unlimited: Boolean(item.unlimited),
        });
        setImagePreview(item.image || null);
      } catch (error) {
        toast.error("Failed to load reward", { description: error?.data?.detail || error?.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadReward();
    return () => {
      cancelled = true;
    };
  }, [rewardId, toast]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const buildPayload = () => {
    const payload = {
      reward_name: form.name.trim(),
      unlimited: Boolean(form.unlimited),
      item_type: Number(form.itemType),
    };
    if (!form.unlimited) payload.quantity = parseNumber(form.quantity);
    if (form.itemType === "1") {
      payload.min_withdraw = String(form.minWithdraw || "0");
      payload.max_withdraw = String(form.maxWithdraw || "0");
    }
    if (form.itemType === "2") payload.token_amount = parseNumber(form.tokenAmount);
    if (form.itemType === "4") payload.score_amount = parseNumber(form.scoreAmount);
    if (imageFile) payload.image = imageFile;
    return payload;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warning("Reward name is required");
      return;
    }
    if (!form.unlimited && parseNumber(form.quantity) <= 0) {
      toast.warning("Quantity is required when unlimited is off");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEditing) {
        await adminApi.updatePenaltyKickItem(rewardId, payload);
        toast.success("Reward updated");
      } else {
        await adminApi.createPenaltyKickItem(payload);
        toast.success("Reward created");
      }
      router.push("/admin/penalty-kick");
    } catch (error) {
      toast.error(isEditing ? "Failed to update reward" : "Failed to create reward", {
        description: error?.data?.detail || error?.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[16px] bg-[#041502] p-6 text-center text-[13px] text-white/60 shadow-[0_-4px_12px_-2px_#dea220]">
        Loading reward...
      </div>
    );
  }

  return (
    <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
      <h2
        className="mb-6 bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent"
        style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}
      >
        {isEditing ? "Edit Reward" : "Add Reward"}
      </h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Reward Name</label>
          <input type="text" value={form.name} onChange={handleChange("name")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Quantity</label>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange("quantity")}
            disabled={form.unlimited}
            className={`${INPUT_BASE} ${form.unlimited ? "opacity-50" : ""}`}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Item Type</label>
          <div className="relative">
            <select value={form.itemType} onChange={handleChange("itemType")} className={`${INPUT_BASE} appearance-none pr-10`}>
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value} style={{ background: "#041502", color: "white" }}>
                  {t.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {form.itemType === "1" && (
          <>
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-white">Min withdraw</label>
              <input type="number" min="0" step="0.01" value={form.minWithdraw} onChange={handleChange("minWithdraw")} className={INPUT_BASE} />
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-white">Max withdraw</label>
              <input type="number" min="0" step="0.01" value={form.maxWithdraw} onChange={handleChange("maxWithdraw")} className={INPUT_BASE} />
            </div>
          </>
        )}
        {form.itemType === "2" && (
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Token Amount</label>
            <input type="number" min="1" value={form.tokenAmount} onChange={handleChange("tokenAmount")} className={INPUT_BASE} />
          </div>
        )}
        {form.itemType === "4" && (
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Score Amount</label>
            <input type="number" min="1" value={form.scoreAmount} onChange={handleChange("scoreAmount")} className={INPUT_BASE} />
          </div>
        )}
        <div>
          <label className="mb-4 block text-[14px] font-semibold text-white">Unlimited</label>
          <Toggle checked={form.unlimited} onChange={(v) => setForm((prev) => ({ ...prev, unlimited: v }))} label="Active" />
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 block text-[14px] font-semibold text-white">Choose Image</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-[140px] w-full max-w-[420px] items-center justify-center gap-3 rounded-[8px] border-2 border-dashed border-white/40 text-white/70 transition-colors hover:border-[#f2cb7a]/70 hover:text-white"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="h-full w-full rounded-[8px] object-contain" />
            ) : (
              <>
                <ImagePlaceholderIcon />
                <span className="text-[14px]">Upload Image</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/penalty-kick")}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          <BackIcon />
          Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundImage: GOLD_BG }}
        >
          <CheckIcon />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
