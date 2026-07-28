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
    label
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
  if (options[value] != null) return options[value];

  // Some list endpoints return the enum *name* as a string ("TOKEN",
  // "FREE_CREDIT", "ITEM") instead of its numeric id. Resolve those by
  // comparing against the labels — normalising underscores to spaces and
  // ignoring case — so e.g. "FREE_CREDIT" -> "Free Credit".
  if (typeof value === 'string') {
    const normalized = value.replace(/_/g, ' ').trim().toUpperCase();
    const match = Object.values(options).find(
      (label) => label.toUpperCase() === normalized
    );
    if (match) return match;
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

  return entry ? parseInt(entry[0], 10) : null;
}
