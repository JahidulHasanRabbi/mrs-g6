// Boss War choice values. Numbers are what the API accepts on write; the
// labels are what it echoes back on read, so both directions are covered here.

export const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";

export const BOSS_TYPE_OPTIONS = [
  { value: 1, label: "Daily" },
  { value: 2, label: "Weekly" },
  { value: 3, label: "Event" },
];

export const BOSS_STATUS_OPTIONS = [
  { value: 1, label: "Upcoming" },
  { value: 2, label: "Active" },
  { value: 3, label: "Defeated" },
  { value: 4, label: "Ended" },
];

export const REWARD_GEM_OPTIONS = [
  { value: 1, label: "Common" },
  { value: 2, label: "Rare" },
  { value: 3, label: "Premium" },
  { value: 4, label: "Epic" },
  { value: 5, label: "Legendary" },
];

export const REWARD_TYPE_OPTIONS = [
  { value: 1, label: "Ranking" },
  { value: 2, label: "Kill" },
  { value: 3, label: "Participation" },
];

// Boss War's own item scale — unrelated to the mini-game scales, which number
// their types differently.
export const ITEM_TYPE_OPTIONS = [
  { value: 1, label: "Free Credit" },
  { value: 2, label: "KR Coins" },
  { value: 3, label: "Prize" },
  { value: 4, label: "Battle Point" },
  { value: 5, label: "Attack Point" },
];

// The API returns labels, not numbers, on read. Map them back for edit forms.
export function labelToValue(options, label) {
  const normalized = String(label ?? "").replace(/_/g, " ").trim().toUpperCase();
  const hit = options.find((o) => o.label.toUpperCase() === normalized);
  if (hit) return hit.value;
  // "KR Coins" is our display name for the API's TOKEN.
  if (normalized === "TOKEN") return 2;
  const asNumber = Number(label);
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : options[0]?.value ?? 1;
}

export function valueToLabel(options, value) {
  return options.find((o) => o.value === Number(value))?.label ?? String(value ?? "-");
}

// `datetime-local` wants "YYYY-MM-DDTHH:mm"; the API sends a full ISO string
// with an offset.
export function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromLocalInput(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function describeApiError(error) {
  const details = error?.data?.details;
  if (typeof details === "string") return details;
  if (details && typeof details === "object") {
    return Object.entries(details)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(" ") : messages}`)
      .join(" · ");
  }
  return error?.data?.error || error?.data?.detail || error?.message || "Something went wrong.";
}
