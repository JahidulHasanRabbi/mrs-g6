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
    3: "Other"
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
  
  return options[value] || '';
}
