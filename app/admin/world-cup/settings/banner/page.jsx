"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import { useWorldCupSettings } from "../../../../contexts/WorldCupSettingsContext";

function ImagePlaceholder() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.7">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" fill="white" fillOpacity="0.7" stroke="none" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BannerForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id");

  const { banners, upsertBanner } = useWorldCupSettings();
  const existing = editingId ? banners.find((b) => b.id === editingId) : null;

  const [form, setForm] = useState({
    id: editingId || "",
    title: "BECOME TOP 10 PLAYERS",
    label: "Exclusive Rewards",
    section: "Real-time Rankings",
    subtitle: "Join a country to start earning XP and climbing the ranks!",
    description: "Live leaderboard allows players to get real-time updates on their rankings and see where they stand among others.",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (existing) {
      setForm({
        id: existing.id,
        title: existing.title || "",
        label: existing.label || "",
        section: existing.section || "",
        subtitle: existing.subtitle || "",
        description: existing.description || "",
        image: existing.image || null,
      });
      setImagePreview(existing.image || null);
    }
  }, [existing]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    setSaving(true);
    upsertBanner({ ...form, image: imagePreview });
    await new Promise((r) => setTimeout(r, 200));
    setSaving(false);
    router.push("/admin/world-cup/settings");
  };

  return (
    <FormChrome
      title={editingId ? "Edit Banner Information" : "Add Banner Information"}
      onBack={() => router.push("/admin/world-cup/settings")}
      onSave={onSave}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Banner Title</label>
          <input type="text" value={form.title} onChange={set("title")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Label Text</label>
          <input type="text" value={form.label} onChange={set("label")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Section Title</label>
          <input type="text" value={form.section} onChange={set("section")} className={INPUT_BASE} />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Choose Image</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-[140px] w-full items-center justify-center gap-3 rounded-[8px] border-2 border-dashed border-white/40 text-white/70 transition-colors hover:border-[#f2cb7a]/70 hover:text-white"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="h-full w-full rounded-[8px] object-contain" />
            ) : (
              <>
                <ImagePlaceholder />
                <span className="text-[14px]">Upload Image</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Banner Subtitle</label>
          <textarea
            value={form.subtitle}
            onChange={set("subtitle")}
            rows={4}
            className={`${INPUT_BASE} resize-none`}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={4}
            className={`${INPUT_BASE} resize-none`}
          />
        </div>
      </div>
    </FormChrome>
  );
}

export default function AddBannerPage() {
  return (
    <Suspense fallback={null}>
      <BannerForm />
    </Suspense>
  );
}
