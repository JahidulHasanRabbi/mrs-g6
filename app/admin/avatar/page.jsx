"use client";

// /admin/avatar — Avatar game settings hub.
//
// Penalty-kick pattern: the header row holds outline ActionButtons that open
// small focused ModalShell dialogs, each POSTing only its slice of
// /avatar/settings/ (the endpoint supports partial update and returns the full
// fresh row). The card body is a read-only summary of the current values.

import { useEffect, useState } from "react";
import ModalShell from "../../components/admin/penalty-kick/ModalShell";
import { useToast } from "../../components/admin/ui/Toast";
import { getAvatarSettings, updateAvatarSettings } from "../../api/adminApi";
import { AVATAR_GAME_STATUS_LABELS } from "../../config/avatarOptions";
import {
  ActionButton,
  Card,
  CardHeader,
  Field,
  ICONS,
  INPUT_BASE,
  MaskIcon,
  StatusPill,
  Toggle,
  apiErrorMessage,
} from "../../components/admin/ui/GameUI";

// ---------------------------------------------------------------------------
// Field groups — one modal per group, one POST per save.
// [key, label, min] — API doc minimums; whole numbers everywhere.
// ---------------------------------------------------------------------------

const GROUPS = {
  levels: {
    title: "Avatar & Levels",
    fields: [
      ["max_level", "Max Level", 1, null],
      ["battle_point_per_level_multiplier", "BP per Level Multiplier", 1, "Next level cost = level × multiplier"],
      ["battle_power_per_level", "Battle Power per Level", 0, "Battle power = level × this + equipped power bonus"],
    ],
  },
  equipment: {
    title: "Equipment",
    fields: [
      ["equipment_slot_count", "Equipment Slot Count", 1, null],
      ["discard_equipment_cost", "Discard Cost (Tokens)", 0, "Tokens charged per discard"],
      ["backpack_capacity", "Backpack Capacity", 1, "Max unequipped equipment held"],
    ],
  },
  challenge: {
    title: "Challenge",
    fields: [
      ["dice_count", "Dice Count", 1, "Dice rolled per turn"],
      ["dice_sides", "Dice Sides", 2, null],
      ["free_daily_attempts", "Free Daily Attempts", 0, "Shared across all bosses per day"],
      ["extra_attempt_token_cost", "Extra Attempt Cost (Tokens)", 0, null],
    ],
  },
};

function NumberGroupModal({ group, open, settings, onClose, onSaved }) {
  const toast = useToast();
  const def = GROUPS[group];
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !settings) return;
    const next = {};
    def.fields.forEach(([key]) => {
      next[key] = settings[key] ?? "";
    });
    setForm(next);
  }, [open, settings, def]);

  const handleSave = async () => {
    for (const [key, label, min] of def.fields) {
      const v = Number(form[key]);
      if (!Number.isInteger(v) || v < min) {
        toast.warning(`${label} must be a whole number of at least ${min}`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {};
      def.fields.forEach(([key]) => {
        payload[key] = Number(form[key]);
      });
      const data = await updateAvatarSettings(payload);
      toast.success(`${def.title} saved`);
      onSaved(data);
      onClose();
    } catch (err) {
      toast.error(`Failed to save ${def.title.toLowerCase()}`, {
        description: apiErrorMessage(err, "Please try again."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={def.title} open={open} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {def.fields.map(([key, label, min, hint]) => (
          <Field key={key} label={label} hint={hint}>
            <input
              type="number"
              min={min}
              step="1"
              value={form[key] ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              className={INPUT_BASE}
            />
          </Field>
        ))}
      </div>
    </ModalShell>
  );
}

function GameStatusModal({ open, settings, onClose, onSaved }) {
  const toast = useToast();
  const [openStatus, setOpenStatus] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !settings) return;
    setOpenStatus(Number(settings.game_status ?? 1) === 1);
  }, [open, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateAvatarSettings({ game_status: openStatus ? 1 : 2 });
      toast.success("Game status saved");
      onSaved(data);
      onClose();
    } catch (err) {
      toast.error("Failed to save game status", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Game Status" open={open} onClose={onClose} onSave={handleSave} saving={saving} width="max-w-[480px]">
      <div className="rounded-[8px] border border-white/10 bg-white/[0.03] px-4 py-3">
        <Toggle checked={openStatus} onChange={setOpenStatus} label="Game Open" />
        <p className="mt-2 text-[12px] text-white/40">
          Closing the game also closes Challenge and Avatar Missions for members, and turns off the Avatar feature flag.
        </p>
      </div>
    </ModalShell>
  );
}

function DescriptionModal({ open, settings, onClose, onSaved }) {
  const toast = useToast();
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !settings) return;
    setDescription(settings.description ?? "");
  }, [open, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateAvatarSettings({ description });
      toast.success("Description saved");
      onSaved(data);
      onClose();
    } catch (err) {
      toast.error("Failed to save description", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Description" open={open} onClose={onClose} onSave={handleSave} saving={saving}>
      <Field label="Game Description" hint="Shown to members inside the Avatar game info.">
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={INPUT_BASE}
        />
      </Field>
    </ModalShell>
  );
}

// Read-only summary tile.
function Stat({ label, value }) {
  return (
    <div className="rounded-[12px] border border-white/5 bg-white/[0.03] px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-white/40">{label}</p>
      <p className="mt-1 text-[20px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </p>
    </div>
  );
}

export default function AvatarSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(null); // "status" | "levels" | "equipment" | "challenge" | "description"

  useEffect(() => {
    getAvatarSettings()
      .then(setSettings)
      .catch((err) =>
        toast.error("Failed to load game settings", { description: apiErrorMessage(err, "Please refresh the page.") }),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => setOpenModal(null);
  const n = (key) => Number(settings?.[key] ?? 0).toLocaleString("en-US");

  return (
    <Card>
      <CardHeader title="Game Settings">
        <ActionButton icon={<MaskIcon src={ICONS.check} />} onClick={() => setOpenModal("status")} disabled={loading}>
          Game Status
        </ActionButton>
        <ActionButton icon={<MaskIcon src={ICONS.level} />} onClick={() => setOpenModal("levels")} disabled={loading}>
          Avatar &amp; Levels
        </ActionButton>
        <ActionButton icon={<MaskIcon src={ICONS.crown} />} onClick={() => setOpenModal("equipment")} disabled={loading}>
          Equipment
        </ActionButton>
        <ActionButton icon={<MaskIcon src={ICONS.dice} />} onClick={() => setOpenModal("challenge")} disabled={loading}>
          Challenge
        </ActionButton>
        <ActionButton icon={<MaskIcon src={ICONS.settings} />} onClick={() => setOpenModal("description")} disabled={loading}>
          Description
        </ActionButton>
      </CardHeader>

      <div className="px-6 pb-6">
        {loading ? (
          <p className="py-10 text-center text-[13px] text-white/50">Loading game settings...</p>
        ) : !settings ? (
          <p className="py-10 text-center text-[13px] text-white/50">Could not load game settings.</p>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3 rounded-[12px] border border-white/5 bg-white/[0.03] px-5 py-4">
              <span className="text-[13px] text-white/60">Game Status</span>
              <StatusPill
                active={Number(settings.game_status) === 1}
                activeLabel={AVATAR_GAME_STATUS_LABELS[1]}
                inactiveLabel={AVATAR_GAME_STATUS_LABELS[2]}
              />
              {Number(settings.game_status) === 2 && (
                <span className="text-[12px] text-amber-300/80">
                  Members cannot play while the game is closed.
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <Stat label="Max Level" value={n("max_level")} />
              <Stat label="BP / Level Multiplier" value={`×${n("battle_point_per_level_multiplier")}`} />
              <Stat label="Power / Level" value={`+${n("battle_power_per_level")}`} />
              <Stat label="Equipment Slots" value={n("equipment_slot_count")} />
              <Stat label="Discard Cost" value={`${n("discard_equipment_cost")} Tokens`} />
              <Stat label="Backpack Capacity" value={n("backpack_capacity")} />
              <Stat label="Dice" value={`${n("dice_count")} × d${n("dice_sides")}`} />
              <Stat label="Free Daily Attempts" value={n("free_daily_attempts")} />
              <Stat label="Extra Attempt Cost" value={`${n("extra_attempt_token_cost")} Tokens`} />
              <Stat
                label="Description"
                value={settings.description ? `${String(settings.description).slice(0, 24)}${settings.description.length > 24 ? "…" : ""}` : "—"}
              />
            </div>
          </>
        )}
      </div>

      <GameStatusModal open={openModal === "status"} settings={settings} onClose={close} onSaved={setSettings} />
      <NumberGroupModal group="levels" open={openModal === "levels"} settings={settings} onClose={close} onSaved={setSettings} />
      <NumberGroupModal group="equipment" open={openModal === "equipment"} settings={settings} onClose={close} onSaved={setSettings} />
      <NumberGroupModal group="challenge" open={openModal === "challenge"} settings={settings} onClose={close} onSaved={setSettings} />
      <DescriptionModal open={openModal === "description"} settings={settings} onClose={close} onSaved={setSettings} />
    </Card>
  );
}
