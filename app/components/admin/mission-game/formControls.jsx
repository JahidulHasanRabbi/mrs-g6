"use client";

// Mission Game form bits. The gold-theme primitives live in
// components/admin/ui/GameUI — only the controls GameUI does not have are
// defined here, plus the pinned-column classes the two mission tables share.

import { INPUT_BASE } from "../ui/GameUI";

export {
  GOLD_BG,
  INPUT_BASE,
  Field,
  SectionTitle,
  Select,
  Toggle,
} from "../ui/GameUI";

// Header fill for both mission tables.
export const TABLE_HEAD_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

// Action column pins right so Edit/Archive stay reachable when the table is
// wider than the panel. A row's hover tint cannot show through an opaque
// pinned cell, so the cell repaints it via an overlay — same technique as
// RedeemLinksTable.
export const STICKY_ACTION = "sticky right-0 z-[2] shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.8)]";
export const STICKY_ACTION_CELL =
  "relative bg-[#041502] after:pointer-events-none after:absolute after:inset-0 group-hover:after:bg-white/[0.02]";

export function DateInput({ value, onChange, disabled }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${INPUT_BASE} [color-scheme:dark]`}
    />
  );
}

export function TimeInput({ value, onChange, disabled }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${INPUT_BASE} [color-scheme:dark]`}
    />
  );
}

export function NumberInput({ value, onChange, min = 0, placeholder, disabled }) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={INPUT_BASE}
    />
  );
}

export function TextInput({ value, onChange, placeholder, disabled }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={INPUT_BASE}
    />
  );
}
