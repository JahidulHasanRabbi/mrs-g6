"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import {
  getDepositDummyPlayer,
  createDepositDummyPlayer,
  updateDepositDummyPlayer,
} from "../../../../api/adminApi";
import { MOCK_DEPOSIT_PLAYERS, isMockUuid } from "../../../../components/admin/leaderboards/mockData";

function DummyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [form, setForm] = useState({
    name: "",
    rank: "",
    totalDeposit: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingUuid) return;
    const applyMock = () => {
      const m = MOCK_DEPOSIT_PLAYERS.find((x) => x.uuid === editingUuid);
      if (m) {
        setForm({
          name: m.player_name ?? "",
          rank: String(m.rank ?? ""),
          totalDeposit: String(m.total_deposit ?? ""),
        });
      }
    };
    if (isMockUuid(editingUuid)) {
      applyMock();
      return;
    }
    getDepositDummyPlayer(editingUuid)
      .then((d) => {
        setForm({
          name: d.player_name ?? "",
          rank: String(d.rank ?? ""),
          totalDeposit: String(d.total_deposit ?? ""),
        });
      })
      .catch(applyMock);
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
        player_name: form.name.trim(),
        rank: toNum(form.rank),
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
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Player Name</label>
          <input type="text" value={form.name} onChange={set("name")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Rank</label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-4 text-[14px] font-bold text-[#e9af41]">
              #
            </span>
            <input
              type="number"
              min="1"
              value={form.rank}
              onChange={set("rank")}
              className={`${INPUT_BASE} pl-9`}
            />
          </div>
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
