"use client";

import { useEffect, useState } from "react";
import ModalShell from "../penalty-kick/ModalShell";

const FIELD =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";
const LABEL = "mb-2 block text-[14px] font-semibold text-white";

// Game status — the only field on /bosswar/settings/. 1 = open, 2 = closed.
export function GameStatusModal({ open, initial, onClose, onSave }) {
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setIsOpen(Number(initial) === 1);
  }, [open, initial]);

  return (
    <ModalShell
      open={open}
      title="Game Status"
      onClose={onClose}
      saving={saving}
      onSave={async () => {
        setSaving(true);
        try {
          await onSave({ game_status: isOpen ? 1 : 2 });
        } finally {
          setSaving(false);
        }
      }}
    >
      <p className="mb-4 text-[13px] text-white/60">
        Closing Boss War blocks every attack; members see a closed notice.
      </p>
      <div className="flex items-center justify-between rounded-[8px] border border-[#f2cb7a] px-4 py-3">
        <span className="text-[14px] text-white">{isOpen ? "Open" : "Closed"}</span>
        <button
          type="button"
          role="switch"
          aria-checked={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${isOpen ? "bg-[#e9af41]" : "bg-white/15"}`}
        >
          <span
            className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${isOpen ? "translate-x-[23px]" : "translate-x-[3px]"}`}
          />
        </button>
      </div>
    </ModalShell>
  );
}

// VIP combat bonus — per member tier crit rate and damage multiplier.
export function VipBonusModal({ open, initial, tiers = [], onClose, onSave }) {
  const [form, setForm] = useState({ member_tier_uuid: "", critical_rate: "", damage_bonus: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      member_tier_uuid: initial?.member_tier_uuid ?? "",
      critical_rate: initial?.critical_rate ?? "",
      damage_bonus: initial?.damage_bonus ?? "",
    });
  }, [open, initial]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <ModalShell
      open={open}
      title={initial ? "Edit VIP Bonus" : "Add VIP Bonus"}
      onClose={onClose}
      saving={saving}
      onSave={async () => {
        setSaving(true);
        try {
          await onSave({
            member_tier_uuid: form.member_tier_uuid,
            critical_rate: String(form.critical_rate || "0"),
            damage_bonus: String(form.damage_bonus || "0"),
          });
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className={LABEL}>Member Tier</label>
          <select value={form.member_tier_uuid} onChange={set("member_tier_uuid")} className={`${FIELD} appearance-none`}>
            <option value="" style={{ background: "#041502" }}>Select a tier</option>
            {tiers.map((t) => (
              <option key={t.uuid} value={t.uuid} style={{ background: "#041502", color: "white" }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Critical Rate (%)</label>
          <input type="number" min="0" step="0.01" value={form.critical_rate} onChange={set("critical_rate")} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Damage Bonus (multiplier)</label>
          <input type="number" min="0" step="0.01" value={form.damage_bonus} onChange={set("damage_bonus")} className={FIELD} />
          <p className="mt-1 text-[12px] text-white/50">1.20 means 20% extra damage.</p>
        </div>
      </div>
    </ModalShell>
  );
}

// Deposit → attack point band. Bands are thresholds: the highest band at or
// below the deposit is the one that pays out.
export function DepositPointModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({ deposit_amount: "", attack_point_amount: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      deposit_amount: initial?.deposit_amount ?? "",
      attack_point_amount: initial?.attack_point_amount ?? "",
    });
  }, [open, initial]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <ModalShell
      open={open}
      title={initial ? "Edit Deposit Band" : "Add Deposit Band"}
      onClose={onClose}
      saving={saving}
      onSave={async () => {
        setSaving(true);
        try {
          await onSave({
            deposit_amount: String(form.deposit_amount || "0"),
            attack_point_amount: Number(form.attack_point_amount) || 0,
          });
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className={LABEL}>Deposit Amount</label>
          <input type="number" min="0" step="0.01" value={form.deposit_amount} onChange={set("deposit_amount")} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Attack Points Awarded</label>
          <input type="number" min="0" step="1" value={form.attack_point_amount} onChange={set("attack_point_amount")} className={FIELD} />
        </div>
        <p className="text-[12px] text-white/50">
          Bands are thresholds — a deposit uses the highest band at or below its amount.
        </p>
      </div>
    </ModalShell>
  );
}

// Settle payouts. Empty body settles everything due; a boss uuid settles one.
export function SettlePayoutModal({ open, bosses = [], onClose, onSave }) {
  const [bossUuid, setBossUuid] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setBossUuid("");
  }, [open]);

  return (
    <ModalShell
      open={open}
      title="Settle Payouts"
      onClose={onClose}
      saving={saving}
      saveLabel="Settle"
      onSave={async () => {
        setSaving(true);
        try {
          await onSave(bossUuid ? { boss_uuid: bossUuid } : {});
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className={LABEL}>Boss</label>
          <select value={bossUuid} onChange={(e) => setBossUuid(e.target.value)} className={`${FIELD} appearance-none`}>
            <option value="" style={{ background: "#041502" }}>All bosses due</option>
            {bosses.map((b) => (
              <option key={b.uuid} value={b.uuid} style={{ background: "#041502", color: "white" }}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[12px] text-white/50">
          A boss must be defeated or ended before it can be settled.
        </p>
      </div>
    </ModalShell>
  );
}
