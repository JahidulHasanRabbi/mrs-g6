"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../../components/admin/ui/Toast";
import * as adminApi from "../../../api/adminApi";
import {
  BOSS_STATUS_OPTIONS,
  BOSS_TYPE_OPTIONS,
  GOLD_BG,
  REWARD_GEM_OPTIONS,
  describeApiError,
  fromLocalInput,
  labelToValue,
  toLocalInput,
} from "../../../components/admin/boss-war/constants";

const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";

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

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={`${INPUT_BASE} appearance-none pr-10`}>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

const EMPTY = {
  name: "",
  bossType: 1,
  status: 1,
  hpMax: "",
  hpRemaining: "",
  startsAt: "",
  endsAt: "",
  minDamage: "",
  maxDamage: "",
  baseCriticalRate: "",
  criticalMultiplier: "",
  rewardGem: 1,
};

function BossForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const fileRef = useRef(null);
  const bossUuid = searchParams.get("uuid");
  const isEditing = Boolean(bossUuid);

  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!bossUuid) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const boss = await adminApi.getBossWarBoss(bossUuid);
        if (cancelled) return;
        setForm({
          name: boss.name || "",
          bossType: labelToValue(BOSS_TYPE_OPTIONS, boss.boss_type),
          status: labelToValue(BOSS_STATUS_OPTIONS, boss.status),
          hpMax: boss.hp_max ?? "",
          hpRemaining: boss.hp_remaining ?? "",
          startsAt: toLocalInput(boss.starts_at),
          endsAt: toLocalInput(boss.ends_at),
          minDamage: boss.min_damage ?? "",
          maxDamage: boss.max_damage ?? "",
          baseCriticalRate: boss.base_critical_rate ?? "",
          criticalMultiplier: boss.critical_multiplier ?? "",
          rewardGem: labelToValue(REWARD_GEM_OPTIONS, boss.reward_gem),
        });
        setImagePreview(boss.image || null);
      } catch (error) {
        toast.error("Failed to load boss", { description: describeApiError(error) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [bossUuid, toast]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

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
      name: form.name.trim(),
      boss_type: Number(form.bossType),
      status: Number(form.status),
      hp_max: Number(form.hpMax) || 0,
      starts_at: fromLocalInput(form.startsAt),
      ends_at: fromLocalInput(form.endsAt),
      reward_gem: Number(form.rewardGem),
    };
    // Optional fields: only sent when filled, so a blank box keeps the
    // server-side default rather than forcing a zero.
    if (String(form.hpRemaining).trim() !== "") payload.hp_remaining = Number(form.hpRemaining);
    if (String(form.minDamage).trim() !== "") payload.min_damage = Number(form.minDamage);
    if (String(form.maxDamage).trim() !== "") payload.max_damage = Number(form.maxDamage);
    if (String(form.baseCriticalRate).trim() !== "") payload.base_critical_rate = String(form.baseCriticalRate);
    if (String(form.criticalMultiplier).trim() !== "") payload.critical_multiplier = String(form.criticalMultiplier);
    if (imageFile) payload.image = imageFile;
    return payload;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warning("Boss name is required");
      return;
    }
    if (!form.startsAt || !form.endsAt) {
      toast.warning("Start and end times are required");
      return;
    }
    if (Number(form.hpMax) <= 0) {
      toast.warning("Max HP must be greater than zero");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await adminApi.updateBossWarBoss(bossUuid, buildPayload());
        toast.success("Boss updated");
      } else {
        await adminApi.createBossWarBoss(buildPayload());
        toast.success("Boss created");
      }
      router.push("/admin/boss-war");
    } catch (error) {
      toast.error(isEditing ? "Failed to update boss" : "Failed to create boss", {
        description: describeApiError(error),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[16px] bg-[#041502] p-6 text-center text-[13px] text-white/60 shadow-[0_-4px_12px_-2px_#dea220]">
        Loading boss...
      </div>
    );
  }

  return (
    <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
      <h2
        className="mb-6 bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent"
        style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}
      >
        {isEditing ? "Edit Boss" : "Add Boss"}
      </h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Boss Name</label>
          <input type="text" value={form.name} onChange={set("name")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Boss Type</label>
          <Select value={form.bossType} onChange={set("bossType")} options={BOSS_TYPE_OPTIONS} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Status</label>
          <Select value={form.status} onChange={set("status")} options={BOSS_STATUS_OPTIONS} />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Max HP</label>
          <input type="number" min="1" value={form.hpMax} onChange={set("hpMax")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Remaining HP</label>
          <input type="number" min="0" value={form.hpRemaining} onChange={set("hpRemaining")} placeholder="Defaults to max HP" className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Reward Gem</label>
          <Select value={form.rewardGem} onChange={set("rewardGem")} options={REWARD_GEM_OPTIONS} />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Starts At</label>
          <input type="datetime-local" value={form.startsAt} onChange={set("startsAt")} className={INPUT_BASE} style={{ colorScheme: "dark" }} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Ends At</label>
          <input type="datetime-local" value={form.endsAt} onChange={set("endsAt")} className={INPUT_BASE} style={{ colorScheme: "dark" }} />
        </div>
        <div />

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Min Damage</label>
          <input type="number" min="0" value={form.minDamage} onChange={set("minDamage")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Max Damage</label>
          <input type="number" min="0" value={form.maxDamage} onChange={set("maxDamage")} className={INPUT_BASE} />
        </div>
        <div />

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Base Critical Rate (%)</label>
          <input type="number" min="0" step="0.01" value={form.baseCriticalRate} onChange={set("baseCriticalRate")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Critical Multiplier</label>
          <input type="number" min="0" step="0.01" value={form.criticalMultiplier} onChange={set("criticalMultiplier")} className={INPUT_BASE} />
        </div>
        <div />

        <div className="md:col-span-3">
          <label className="mb-2 block text-[14px] font-semibold text-white">Boss Image</label>
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
          onClick={() => router.push("/admin/boss-war")}
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

export default function AddBossPage() {
  return (
    <Suspense fallback={null}>
      <BossForm />
    </Suspense>
  );
}
