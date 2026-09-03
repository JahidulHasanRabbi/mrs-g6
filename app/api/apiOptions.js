// Centralized API Options Configuration
// Dropdowns should display the labels but send the numeric keys to the API

export const API_OPTIONS = {
  GENDER: {
    1: "Male",
    2: "Female",
    3: "Prefer not to say"
  },
  HOBBY: {
    1: "Reading",
    2: "Cooking / Baking",
    3: "Travelling",
    4: "Music",
    5: "Gaming",
    6: "Sports",
    7: "Gardening",
    8: "Photography",
    9: "Art",
    10: "Crafting",
    11: "Watching Videos",
    12: "Dancing",
    13: "Hiking",
    14: "Writing",
    15: "Animal Care"
  },
  PRIZE_TYPE: {
    1: "ITEM",
    2: "VOUCHER",
    3: "CREDIT",
    4: "OTHERS"
  },
  ITEM_TYPE: {
    1: "Free Credit",
    2: "Item",
    3: "Token",
    4: "Other",
    5: "Battle Point"
  }
};

// Display-only overrides. The wire enum name is still "Token"; the UI says
// "KR Coins", so the rename must not reach API_OPTIONS itself.
const DISPLAY_LABEL_OVERRIDES = {
  ITEM_TYPE: { 3: "KR Coins" },
};

function toDisplayLabel(optionKey, key, label) {
  return DISPLAY_LABEL_OVERRIDES[optionKey]?.[key] ?? label;
}

// "1 KR Coin" / "1,000 KR Coins" — pluralises on the number, not the formatted
// string, so a pre-formatted "1,000" still reads correctly.
export function formatKrCoins(value) {
  const amount = Number(String(value ?? "").replace(/,/g, ""));
  const pretty = typeof value === "number" ? value.toLocaleString("en-US") : value;
  return `${pretty} KR Coin${amount === 1 ? "" : "s"}`;
}

// Rendering name for the free-form `itemType` tags that responseMappers emits
// (its enum numbers its own way — TOKEN is 2 there, 3 in ITEM_TYPE).
export function formatItemTypeLabel(value) {
  const raw = String(value ?? "").trim();
  if (raw.toUpperCase() !== "TOKEN") return value;
  // Some tables print the API's own upper-case words next to this, so match them.
  return raw === raw.toUpperCase() ? "KR COINS" : "KR Coins";
}

// Get options array for dropdown rendering
// Returns: [{ value: 1, label: "Male" }, { value: 2, label: "Female" }, ...]
export function getOptionsArray(optionKey) {
  const options = API_OPTIONS[optionKey];
  if (!options) {
    console.warn(`Invalid option key: ${optionKey}`);
    return [];
  }
  
  return Object.entries(options).map(([value, label]) => ({
    value: parseInt(value, 10),
    label: toDisplayLabel(optionKey, value, label)
  }));
}

// Get display label for a specific option value
export function getOptionLabel(optionKey, value) {
  const options = API_OPTIONS[optionKey];
  if (!options) {
    console.warn(`Invalid option key: ${optionKey}`);
    return '';
  }

  // Direct match by numeric/string key (e.g. 3 or "3").
  if (options[value] != null) return toDisplayLabel(optionKey, value, options[value]);

  // Some list endpoints return the enum *name* as a string ("TOKEN",
  // "FREE_CREDIT", "ITEM") instead of its numeric id. Resolve those by
  // comparing against the labels — normalising underscores to spaces and
  // ignoring case — so e.g. "FREE_CREDIT" -> "Free Credit".
  if (typeof value === 'string') {
    const normalized = value.replace(/_/g, ' ').trim().toUpperCase();
    const entry = Object.entries(options).find(
      ([, label]) => label.toUpperCase() === normalized
    );
    if (entry) return toDisplayLabel(optionKey, entry[0], entry[1]);
  }

  return '';
}

// Get numeric value from string label (reverse lookup)
export function getOptionValue(optionKey, label) {
  const options = API_OPTIONS[optionKey];
  if (!options) {
    console.warn(`Invalid option key: ${optionKey}`);
    return null;
  }
  
  // Find the key where the value matches the label (case-insensitive).
  // Normalise underscores to spaces so enum names like "FREE_CREDIT" resolve
  // to the "Free Credit" label.
  const normalized = String(label).replace(/_/g, ' ').trim().toUpperCase();
  const entry = Object.entries(options).find(
    ([key, value]) => value.toUpperCase() === normalized
  );
  if (entry) return parseInt(entry[0], 10);

  // Also accept a display label ("KR Coins") coming back off a dropdown.
  const override = Object.entries(DISPLAY_LABEL_OVERRIDES[optionKey] || {}).find(
    ([, value]) => value.toUpperCase() === normalized
  );

  return override ? parseInt(override[0], 10) : null;
}
