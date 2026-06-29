"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import {
  getDepositDummyPlayer,
  getDepositDummyPlayers,
  createDepositDummyPlayer,
  updateDepositDummyPlayer,
} from "../../../../api/adminApi";

function nextRankFrom(response) {
  const list = Array.isArray(response) ? response : response?.results ?? [];
  const maxRank = list.reduce((max, r) => Math.max(max, Number(r.rank) || 0), 0);
  return maxRank + 1;
}

function DummyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [form, setForm] = useState({
    name: "",
    totalDeposit: "",
  });
  // rank is required by the API but not edited in the UI: preserve it on edit,
  // auto-assign the next sequential rank on create.
  const [rank, setRank] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingUuid) {
      getDepositDummyPlayer(editingUuid)
        .then((d) => {
          setForm({
            name: d.player ?? "",
            totalDeposit: String(d.total_deposit ?? ""),
          });
          setRank(Number(d.rank) || 1);
        })
        .catch(() => {});
    } else {
      getDepositDummyPlayers()
        .then((res) => setRank(nextRankFrom(res)))
        .catch(() => {});
    }
  }, [editingUuid]);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const toNum = (s) => Number(String(s).replace(/[,\s#]/g, "")) || 0;

  const onSave = async () => {
    if (!form.name) {
      setError("Player name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        rank,
        player: form.name.trim(),
        total_deposit: toNum(form.totalDeposit),
      };
      if (editingUuid) {
        await updateDepositDummyPlayer(editingUuid, payload);
      } else {
        await createDepositDummyPlayer(payload);
      }
      router.push("/admin/leaderboards/deposit");
    } catch (e) {
      const data = e?.data;
      const fieldError =
        data && typeof data === "object"
          ? Object.entries(data).find(([, value]) => value !== undefined && value !== null)
          : null;
      const message = fieldError
        ? `${fieldError[0]}: ${Array.isArray(fieldError[1]) ? fieldError[1][0] : fieldError[1]}`
        : e?.message;
      setError(message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormChrome
      title={editingUuid ? "Edit Dummy Data" : "Add Dummy Data"}
      onBack={() => router.push("/admin/leaderboards/deposit")}
      onSave={onSave}
      saving={saving}
    >
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Player Name</label>
          <input type="text" value={form.name} onChange={set("name")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Total Deposit</label>
          <input
            type="number"
            min="0"
            value={form.totalDeposit}
            onChange={set("totalDeposit")}
            className={INPUT_BASE}
          />
        </div>
      </div>
    </FormChrome>
  );
}

export default function AddDepositDummyPage() {
  return (
    <Suspense fallback={null}>
      <DummyForm />
    </Suspense>
  );
}
