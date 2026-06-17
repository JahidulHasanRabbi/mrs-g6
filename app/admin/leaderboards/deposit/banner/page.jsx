"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import {
  getDepositBanner,
  createDepositBanner,
  updateDepositBanner,
} from "../../../../api/adminApi";
import { MOCK_BANNERS, isMockUuid } from "../../../../components/admin/leaderboards/mockData";

function BannerForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [form, setForm] = useState({
    description: "",
    termsCondition: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingUuid) return;
    const applyMock = () => {
      const m = MOCK_BANNERS.find((x) => x.uuid === editingUuid);
      if (m) setForm({ description: m.description ?? "", termsCondition: m.terms_condition ?? "" });
    };
    if (isMockUuid(editingUuid)) {
      applyMock();
      return;
    }
    getDepositBanner(editingUuid)
      .then((b) => {
        setForm({
          description: b.description ?? "",
          termsCondition: b.terms_condition ?? b.terms_and_condition ?? "",
        });
      })
      .catch(applyMock);
  }, [editingUuid]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSave = async () => {
    if (!form.description) {
      setError("Description is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        description: form.description.trim(),
        terms_condition: form.termsCondition.trim(),
      };
      if (editingUuid) {
        await updateDepositBanner(editingUuid, payload);
      } else {
        await createDepositBanner(payload);
      }
      router.push("/admin/leaderboards/deposit");
    } catch (e) {
      const data = e?.data;
      const errorMsg =
        data?.detail ||
        (data && typeof data === "object"
          ? Object.values(data).flat()[0]
          : null) ||
        e?.message ||
        "Failed to save.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormChrome
      title={editingUuid ? "Edit Banner Information" : "Add Banner Information"}
      onBack={() => router.push("/admin/leaderboards/deposit")}
      onSave={onSave}
      saving={saving}
    >
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={5}
            className={`${INPUT_BASE} resize-none`}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Term & Condition</label>
          <textarea
            value={form.termsCondition}
            onChange={set("termsCondition")}
            rows={5}
            className={`${INPUT_BASE} resize-none`}
          />
        </div>
      </div>
    </FormChrome>
  );
}

export default function AddDepositBannerPage() {
  return (
    <Suspense fallback={null}>
      <BannerForm />
    </Suspense>
  );
}
