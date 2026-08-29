// Mission Pop Out promotion enums. Same label/option shape as missionOptions.js:
// dropdowns render the labels and send the numeric keys.

export const POPUP_DEPOSIT_MODE_LABELS = {
  1: "Single Deposit",
  2: "Accumulated Deposit",
};

export const POPUP_DISPLAY_FREQUENCY_LABELS = {
  1: "Once per member",
  2: "Once per member per day",
  3: "Limited times during promotion period",
};

export const POPUP_CLAIM_LIMIT_LABELS = {
  1: "Once per member",
  2: "Once per member per day",
  3: "Limited times during promotion period",
};

export const POPUP_REWARD_CATEGORY_LABELS = {
  1: "Token",
  2: "Battle Point",
};

const toOptions = (labels) =>
  Object.entries(labels).map(([value, label]) => ({ value: Number(value), label }));

export const POPUP_DEPOSIT_MODE_OPTIONS = toOptions(POPUP_DEPOSIT_MODE_LABELS);
export const POPUP_DISPLAY_FREQUENCY_OPTIONS = toOptions(POPUP_DISPLAY_FREQUENCY_LABELS);
export const POPUP_CLAIM_LIMIT_OPTIONS = toOptions(POPUP_CLAIM_LIMIT_LABELS);
export const POPUP_REWARD_CATEGORY_OPTIONS = toOptions(POPUP_REWARD_CATEGORY_LABELS);

// Only frequency/claim-limit option 3 takes a companion count.
export const POPUP_LIMITED_TIMES = 3;

// ISO-8601 weekday numbering (Mon=1 … Sun=7).
export const POPUP_WEEKDAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 7, label: "Sunday", short: "Sun" },
];

export const POPUP_REWARD_UNIT = { 1: "Tokens", 2: "Battle Points" };
