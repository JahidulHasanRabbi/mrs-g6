"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import {
  getWithdrawalRewardItem,
  createWithdrawalRewardItem,
  updateWithdrawalRewardItem,
} from "../../../../api/adminApi";
import { MOCK_REWARDS, isMockUuid } from "../../../../components/admin/leaderboards/mockData";

const ITEM_TYPES = [
  { value: 1, label: "Top Withdrawal" },
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

function RewardForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    itemType: 1,
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!editingUuid) return;
    const applyMock = () => {
      const m = MOCK_REWARDS.find((x) => x.uuid === editingUuid);
      if (m) {
        setForm({
          name: m.reward_name ?? "",
          quantity: String(m.quantity ?? ""),
          itemType: normalizeItemType(m.item_type ?? m.item_type_display),
          imageFile: null,
        });
        setImagePreview(m.image || null);
      }
    };
    if (isMockUuid(editingUuid)) {
      applyMock();
      return;
    }
    getWithdrawalRewardItem(editingUuid)
      .then((r) => {
        setForm({
          name: r.reward_name ?? "",
          quantity: String(r.quantity ?? ""),
          itemType: normalizeItemType(r.item_type ?? r.item_type_display),
          imageFile: null,
        });
        setImagePreview(r.image || null);
      })
      .catch(applyMock);
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
    setSaving(true);
    setError("");
    try {
      const payload = {
        reward_name: form.name.trim(),
        quantity: Number(String(form.quantity).replace(/[,\s]/g, "")) || 0,
        item_type: form.itemType,
      };
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
        data?.detail ||
        (data && typeof data === "object" ? Object.values(data).flat()[0] : null) ||
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
