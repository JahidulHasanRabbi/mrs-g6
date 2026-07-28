"use client";

import { useEffect, useRef, useState } from "react";

// Add / Edit reward form for Smash Egg. Pixel spec from Figma 1727:3817 —
// a full-width card (#05060a, gold drop-shadow), 3-column grid of fields with
// gold (#f6dda6) labels and #fbeed2-bordered inputs, and a Back / Save footer.
// Tokens + Prize fields are shown but dimmed/disabled unless the selected Item
// Type makes them relevant (Free credit → Min/Max withdraw; Token → Tokens;
// Prize → Prize), matching the design's conditional emphasis.

const GOLD_BG = "linear-gradient(98deg, #dc9d16 1%, #f2cb7a 98%)";
const LABEL = "text-[18px] font-medium leading-[27px] text-[#f6dda6]";
const FIELD =
  "w-full rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 text-[12px] leading-[18px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";

const ITEM_TYPES = ["Free credit", "Token", "Prize", "Battle Point"];

function ChevronIcon() {
  return (
    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[18px] w-[32px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-[#eaad2c]" : "bg-white/20"
      }`}
    >
      <span
        className={`inline-block h-[13px] w-[13px] transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[17px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

// A labelled field column. When `dimmed` the whole column drops to 50% opacity
// (the design shows non-applicable conditional fields greyed out).
function Field({ label, dimmed = false, children }) {
  return (
    <div className={`flex flex-1 flex-col gap-2 ${dimmed ? "opacity-50" : ""}`}>
      <span className={LABEL}>{label}</span>
      {children}
    </div>
  );
}

const EMPTY = {
  name: "",
  quantity: "",
  itemType: "Free credit",
  minWithdraw: "",
  maxWithdraw: "",
  tokens: "",
  battlePoints: "",
  prize: "",
  position: "",
  unlimited: false,
};

export default function RewardForm({ mode = "add", initial = null, onBack, onSave }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        ...EMPTY,
        name: initial.name || "",
        quantity: initial.unlimited ? "" : String(initial.quantity ?? ""),
        itemType: ITEM_TYPES.includes(initial.itemType) ? initial.itemType : "Free credit",
        minWithdraw: String(initial.minWithdraw ?? ""),
        maxWithdraw: String(initial.maxWithdraw ?? ""),
        tokens: String(initial.tokens ?? ""),
        battlePoints: String(initial.battlePoints ?? ""),
        position: initial.position == null ? "" : String(initial.position),
        unlimited: Boolean(initial.unlimited),
      });
      setImagePreview(initial.image || null);
      setImageFile(null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
      setImageFile(null);
    }
  }, [mode, initial]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave?.({
      name: form.name.trim(),
      quantity: form.unlimited ? 0 : Number(String(form.quantity).replace(/[.,]/g, "")) || 0,
      itemType: form.itemType,
      minWithdraw: form.minWithdraw,
      maxWithdraw: form.maxWithdraw,
      tokens: form.tokens,
      battlePoints: form.battlePoints,
      position: form.position,
      unlimited: form.unlimited,
      image: imageFile,
    });
  };

  const isCredit = form.itemType === "Free credit";
  const isToken = form.itemType === "Token";
  const isPrize = form.itemType === "Prize";
  const isBattlePoint = form.itemType === "Battle Point";

  return (
    <div className="flex w-full flex-col items-end gap-6 rounded-[16px] bg-[#05060a] p-10 drop-shadow-[0px_0px_1.5px_#dea220]">
      <h2
        className="w-full bg-clip-text text-[26px] font-bold leading-[39px] tracking-[-2px] text-transparent"
        style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: "linear-gradient(144deg, #dc9d16 1%, #f2cb7a 98%)" }}
      >
        {mode === "edit" ? "Edit Reward" : "Add Reward"}
      </h2>

      {/* Row 1 — Reward Name, Quantity, Item Type */}
      <div className="flex w-full items-start gap-10">
        <Field label="Reward Name">
          <input type="text" value={form.name} onChange={set("name")} placeholder="Enter reward name" className={FIELD} />
        </Field>
        <Field label="Quantity" dimmed={form.unlimited}>
          <input type="text" inputMode="numeric" value={form.quantity} onChange={set("quantity")} disabled={form.unlimited} placeholder="Enter quantity" className={FIELD} />
        </Field>
        <Field label="Item Type">
          <div className="relative w-full">
            <select value={form.itemType} onChange={set("itemType")} className={`${FIELD} appearance-none pr-10`}>
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: "#05060a", color: "white" }}>{t}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </Field>
      </div>

      {/* Row 2 — Min withdraw, Max withdraw, Unlimited */}
      <div className="flex w-full items-start gap-10">
        <Field label="Min withdraw" dimmed={!isCredit}>
          <input type="text" inputMode="numeric" value={form.minWithdraw} onChange={set("minWithdraw")} disabled={!isCredit} placeholder="0" className={FIELD} />
        </Field>
        <Field label="Max withdraw" dimmed={!isCredit}>
          <input type="text" inputMode="numeric" value={form.maxWithdraw} onChange={set("maxWithdraw")} disabled={!isCredit} placeholder="0" className={FIELD} />
        </Field>
        <Field label="Unlimited">
          <div className="flex w-full items-center gap-2 px-4 py-[10px]">
            <span className="flex-1 text-[12px] leading-[18px] text-white">{form.unlimited ? "Active" : "Inactive"}</span>
            <Toggle checked={form.unlimited} onChange={(v) => setForm((p) => ({ ...p, unlimited: v }))} />
          </div>
        </Field>
      </div>

      {/* Row 3 — Tokens, Prize, Choose Image */}
      <div className="flex w-full items-start gap-10">
        <Field label="Tokens" dimmed={!isToken}>
          <input type="text" inputMode="numeric" value={form.tokens} onChange={set("tokens")} disabled={!isToken} placeholder="0" className={FIELD} />
        </Field>
        <Field label="Prize" dimmed={!isPrize}>
          <div className="relative w-full">
            <select value={form.prize} onChange={set("prize")} disabled={!isPrize} className={`${FIELD} appearance-none pr-10`}>
              <option value="" style={{ background: "#05060a", color: "white" }} />
            </select>
            <ChevronIcon />
          </div>
        </Field>
        <Field label="Choose Image">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-[122px] w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#fbeed2] px-4 py-3 text-white/90 transition-colors hover:border-[#f2cb7a]"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="h-full w-full rounded-[8px] object-contain" />
            ) : (
              <>
                <ImageIcon />
                <span className="text-[12px] leading-[18px]">Upload Image</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </Field>
      </div>

      {/* Row 4 — Position. Orders the member-site prize list; must be unique
          across non-archived items or the API rejects the save. */}
      <div className="flex w-full items-start gap-10">
        <Field label="Battle Points" dimmed={!isBattlePoint}>
          <input
            type="text"
            inputMode="numeric"
            value={form.battlePoints}
            onChange={set("battlePoints")}
            disabled={!isBattlePoint}
            placeholder="0"
            className={FIELD}
          />
        </Field>
        <Field label="Position">
          <input
            type="text"
            inputMode="numeric"
            value={form.position}
            onChange={set("position")}
            placeholder="Leave empty to show last"
            className={FIELD}
          />
        </Field>
        <div className="flex-1" />
      </div>

      {/* Footer — Back / Save */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-1px] text-[#fbeed2] transition-colors hover:bg-white/5"
        >
          <BackIcon />
          Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-1px] text-[#141828] transition-opacity hover:opacity-90"
          style={{ backgroundImage: GOLD_BG }}
        >
          <CheckIcon />
          Save
        </button>
      </div>
    </div>
  );
}
