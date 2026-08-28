"use client";

import { useEffect, useRef, useState } from "react";
import SettingsSection from "../../world-cup/SettingsSection";
import Button from "../../ui/Button";
import { useToast } from "../../ui/Toast";
import {
  getTurnoverPayoutSchedule,
  updateTurnoverPayoutSchedule,
} from "../../../../api/adminApi";

// The payout schedule is always Malaysia time (Asia/Kuala Lumpur, GMT+8, no
// DST) regardless of what timezone the admin's browser happens to be set to
// — so this never routes through `Date`/`toISOString()`, which would
// silently reinterpret the picked value using the *browser's* local offset
// and produce a wrong instant on any machine not already set to GMT+8. The
// +08:00 offset is appended/stripped as plain text instead, per the
// backend's confirmation that DRF accepts (and prefers, for this exact
// reason) an explicit offset over a UTC conversion.

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" with no offset;
// the API returns/accepts a full ISO string with a +08:00 offset.
function isoToLocalInput(iso) {
  if (!iso) return "";
  const match = String(iso).match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function localInputToIso(value) {
  if (!value) return null;
  return `${value}:00+08:00`;
}

// dd/mm/yyyy hh:mm display, built straight from the input's own
// "YYYY-MM-DDTHH:mm" value rather than through Date/toLocaleString() — the
// native input's own display format is locale-dependent (mm/dd/yyyy on a
// US-locale browser regardless of a lang attribute), so the visible text is
// rendered here instead of trusted to the browser.
function formatDisplay(localInputValue) {
  const match = String(localInputValue || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "";
  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export default function PayoutScheduleCard() {
  const toast = useToast();
  const [payoutAt, setPayoutAt] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const inputRef = useRef(null);

  const load = () => {
    getTurnoverPayoutSchedule()
      .then((res) => {
        setPayoutAt(res?.payout_at || "");
        setInputValue(isoToLocalInput(res?.payout_at));
      })
      .catch(() => {});
  };

  useEffect(load, []);

  const openPicker = () => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  const onSave = async () => {
    if (!inputValue) {
      toast.error("Pick a payout date and time first");
      return;
    }
    setSaving(true);
    try {
      const iso = localInputToIso(inputValue);
      const res = await updateTurnoverPayoutSchedule(iso);
      setPayoutAt(res?.payout_at || null);
      setInputValue(isoToLocalInput(res?.payout_at));
      toast.success("Payout schedule saved", {
        description: res?.payout_at ? `Scheduled for ${formatDisplay(isoToLocalInput(res.payout_at))}.` : "Schedule cleared.",
      });
    } catch (error) {
      toast.error("Failed to save payout schedule", { description: error?.data?.detail || error?.message });
    } finally {
      setSaving(false);
    }
  };

  const onClear = async () => {
    setClearing(true);
    try {
      await updateTurnoverPayoutSchedule(null);
      setPayoutAt(null);
      setInputValue("");
      toast.success("Payout schedule cleared");
    } catch (error) {
      toast.error("Failed to clear payout schedule", { description: error?.data?.detail || error?.message });
    } finally {
      setClearing(false);
    }
  };

  const displayText = formatDisplay(inputValue);

  return (
    <SettingsSection title="Payout Schedule">
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-white">Payout Date &amp; Time</label>
            {/* Text shown is always dd/mm/yyyy hh:mm, rendered by formatDisplay
                rather than the native input's own (locale-dependent) display —
                the actual <input type="datetime-local"> is stacked underneath,
                fully transparent, so a click anywhere in the box still opens
                the native calendar/time picker and drives the real value. */}
            <div
              onClick={openPicker}
              className="relative flex h-[42px] w-full cursor-pointer items-center rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 text-[14px] focus-within:ring-2 focus-within:ring-[#e9af41]/40"
            >
              <span className={displayText ? "text-white" : "text-white/40"}>
                {displayText || "dd/mm/yyyy hh:mm"}
              </span>
              <input
                ref={inputRef}
                type="datetime-local"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Payout date and time"
              />
            </div>
          </div>
        </div>
        <p className="text-[12px] text-white/60">
          {payoutAt
            ? `Currently scheduled for ${formatDisplay(isoToLocalInput(payoutAt))} (Malaysia time).`
            : "No payout is currently scheduled."}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={onSave} loading={saving}>
            Save Schedule
          </Button>
          <Button type="button" variant="secondary" onClick={onClear} loading={clearing} disabled={!payoutAt && !inputValue}>
            Clear Date
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
