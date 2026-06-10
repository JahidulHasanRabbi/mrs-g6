"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import {
  getWorldCupBanner,
  createWorldCupBanner,
  updateWorldCupBanner,
} from "../../../../api/adminApi";

const LOCATION_OPTIONS = [
  { value: 1, label: "Home" },
  { value: 2, label: "Lobby" },
  { value: 3, label: "Prediction" },
];

function ChevronIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

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
  const editingUuid = params.get("uuid");

  const [form, setForm] = useState({
    title: "",
    label: "",
    section: "",
    subtitle: "",
    description: "",
    location: 1,
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (editingUuid) {
      getWorldCupBanner(editingUuid).then((b) => {
        setForm({
          title: b.title ?? "",
          label: b.label_text ?? "",
          section: b.section_title ?? "",
          subtitle: b.subtitle ?? "",
          description: b.description ?? "",
          location: b.location ?? 1,
          imageFile: null,
        });
        setImagePreview(b.image || null);
      }).catch(() => {});
    }
  }, [editingUuid]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, imageFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!form.title) { setError("Banner title is required."); return; }
    if (!editingUuid && !form.imageFile) { 
      setError("Banner image is required."); 
      return; 
    }
    setSaving(true);
    setError("");
    try {
      // Use plain object - apiClient will auto-convert to FormData when it detects File
      const payload = {
        title: form.title.trim(),
        location: form.location,
        label_text: form.label,
        section_title: form.section,
        subtitle: form.subtitle,
        description: form.description,
      };
      
      // Include image file if user uploaded one
      if (form.imageFile) {
        payload.image = form.imageFile;
      }

      if (editingUuid) {
        await updateWorldCupBanner(editingUuid, payload);
      } else {
        await createWorldCupBanner(payload);
      }
      router.push("/admin/world-cup/settings");
    } catch (e) {
      console.error('Error saving World Cup banner:', e);
      const errorMsg = e?.data?.detail || e?.data?.title?.[0] || e?.message || "Failed to save.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormChrome
      title={editingUuid ? "Edit Banner Information" : "Add Banner Information"}
      onBack={() => router.push("/admin/world-cup/settings")}
      onSave={onSave}
      saving={saving}
    >
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
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
          <label className="mb-2 block text-[14px] font-semibold text-white">Location</label>
          <div className="relative">
            <select
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: Number(e.target.value) }))}
              className={`${INPUT_BASE} appearance-none pr-10`}
            >
              {LOCATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>{o.label}</option>
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
          <textarea value={form.subtitle} onChange={set("subtitle")} rows={4} className={`${INPUT_BASE} resize-none`} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Description</label>
          <textarea value={form.description} onChange={set("description")} rows={4} className={`${INPUT_BASE} resize-none`} />
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
