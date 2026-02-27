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
    2: "Sports",
    3: "Music",
    4: "Gaming",
    5: "Cooking",
    6: "Travel",
    7: "Photography",
    8: "Art",
    9: "Dancing",
    10: "Fitness",
    11: "Movies",
    12: "Shopping",
    13: "Gardening",
    14: "Technology",
    15: "Other"
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
