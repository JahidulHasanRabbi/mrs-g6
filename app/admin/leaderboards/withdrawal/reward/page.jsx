"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import {
  getWithdrawalRewardItem,
  createWithdrawalRewardItem,
  updateWithdrawalRewardItem,
} from "../../../../api/adminApi";

const ITEM_TYPES = [
  { value: 1, label: "Free Credit" },
  { value: 2, label: "Item" },
  { value: 3, label: "Token" },
  { value: 4, label: "Other" },
];

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#e9af41"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function normalizeItemType(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 1;
}

function normalizeAmount(value) {
  const cleaned = String(value ?? "").replace(/[^\d.]/g, "");
  return cleaned || "";
}

function parseInteger(value) {
  const cleaned = String(value ?? "").replace(/[,\s]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstApiMessage(data) {
  if (data?.details && typeof data.details === "object") {
    const message = Object.values(data.details).flat().find(Boolean);
    if (message) return message;
  }
  if (data?.detail) return data.detail;
  if (data?.error && data?.details && typeof data.details === "object") {
    const message = Object.values(data.details).flat().find(Boolean);
    if (message) return message;
  }
  if (data && typeof data === "object") {
    return Object.values(data).flat().find(Boolean);
  }
  return null;
}

function RewardForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    position: "",
    itemType: 1,
    creditAmount: "",
    tokenAmount: "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!editingUuid) return;
    getWithdrawalRewardItem(editingUuid)
      .then((r) => {
        setForm({
          name: r.reward_name ?? "",
          quantity: String(r.quantity ?? ""),
          position: String(r.position ?? ""),
          itemType: normalizeItemType(r.item_type),
          creditAmount: normalizeAmount(r.credit_amount),
          tokenAmount: r.token_amount != null ? String(r.token_amount) : "",
          imageFile: null,
        });
        setImagePreview(r.image || null);
      })
      .catch(() => {});
  }, [editingUuid]);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const onImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, imageFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!form.name) {
      setError("Reward name is required.");
      return;
    }
    const quantity = parseInteger(form.quantity);
    if (quantity === null) {
      setError("Quantity is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const position = parseInteger(form.position);
      const payload = {
        reward_name: form.name.trim(),
        quantity,
        item_type: form.itemType,
      };
      if (position !== null) {
        payload.position = position;
      }
      if (Number(form.itemType) === 1) {
        payload.credit_amount = normalizeAmount(form.creditAmount) || normalizeAmount(form.name);
      }
      if (Number(form.itemType) === 3) {
        const tokenAmount = parseInteger(form.tokenAmount);
        if (tokenAmount === null) {
          setError("Token amount is required for Token rewards.");
          setSaving(false);
          return;
        }
        payload.token_amount = tokenAmount;
      }
      if (form.imageFile) {
        payload.image = form.imageFile;
      }
      if (editingUuid) {
        await updateWithdrawalRewardItem(editingUuid, payload);
      } else {
        await createWithdrawalRewardItem(payload);
      }
      router.push("/admin/leaderboards/withdrawal");
    } catch (e) {
      const data = e?.data;
      const errorMsg =
        firstApiMessage(data) ||
        e?.message ||
        "Failed to save.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormChrome
      title={editingUuid ? "Edit Reward" : "Add Reward"}
      onBack={() => router.push("/admin/leaderboards/withdrawal")}
      onSave={onSave}
      saving={saving}
    >
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Reward Name</label>
          <input type="text" value={form.name} onChange={set("name")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Quantity</label>
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={set("quantity")}
            className={INPUT_BASE}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Rank Position</label>
          <input
            type="number"
            min="0"
            value={form.position}
            onChange={set("position")}
            className={INPUT_BASE}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Item Type</label>
          <div className="relative">
            <select
              value={form.itemType}
              onChange={(e) => setForm((p) => ({ ...p, itemType: Number(e.target.value) }))}
              className={`${INPUT_BASE} appearance-none pr-10`}
            >
              {ITEM_TYPES.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>
        {Number(form.itemType) === 1 && (
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Credit Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.creditAmount}
              onChange={set("creditAmount")}
              className={INPUT_BASE}
            />
          </div>
        )}
        {Number(form.itemType) === 3 && (
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Token Amount</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.tokenAmount}
              onChange={set("tokenAmount")}
              className={INPUT_BASE}
            />
          </div>
        )}
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Choose Image</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-[122px] w-full items-center justify-center gap-3 rounded-[8px] border-2 border-dashed border-white/40 text-white/70 transition-colors hover:border-[#f2cb7a]/70 hover:text-white"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Preview"
                className="h-full w-full rounded-[8px] object-contain"
              />
            ) : (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="1.5" fill="white" fillOpacity="0.7" stroke="none" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[12px]">Upload Image</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
        </div>
      </div>
    </FormChrome>
  );
}

export default function AddWithdrawalRewardPage() {
  return (
    <Suspense fallback={null}>
      <RewardForm />
    </Suspense>
  );
}
