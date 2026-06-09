export const MISSION_CATEGORY_LABELS = {
  1: "Daily Mission",
  2: "Weekly Mission",
  3: "Challenge Mission",
};

export const MISSION_TYPE_LABELS = {
  1: "One Time",
  2: "Repeatable",
  3: "Recurring",
};

export const MISSION_RESET_TYPE_LABELS = {
  1: "Daily",
  2: "Weekly",
  3: "Monthly",
  4: "None",
};

export const MISSION_ACTION_LABELS = {
  1: "Login",
  2: "Deposit Amount",
  3: "Play Spin",
  4: "Play Smash",
  5: "Check In",
  6: "Play Kick",
  7: "Withdraw Amount",
  8: "Referral Friend",
  9: "Redemption",
};

export const MISSION_STATUS_LABELS = {
  1: "In Progress",
  2: "Completed",
  3: "Claimed",
};

export const MISSION_CATEGORY_OPTIONS = Object.entries(MISSION_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: Number(value), label }),
);

export const MISSION_TYPE_OPTIONS = Object.entries(MISSION_TYPE_LABELS).map(
  ([value, label]) => ({ value: Number(value), label }),
);

export const MISSION_RESET_TYPE_OPTIONS = Object.entries(MISSION_RESET_TYPE_LABELS).map(
  ([value, label]) => ({ value: Number(value), label }),
);

export const MISSION_ACTION_OPTIONS = Object.entries(MISSION_ACTION_LABELS).map(
  ([value, label]) => ({ value: Number(value), label }),
);

export const MISSION_CATEGORY_BY_TAB = {
  daily: 1,
  weekly: 2,
  challenge: 3,
};

export const MISSION_TAB_BY_CATEGORY = {
  1: "daily",
  2: "weekly",
  3: "challenge",
};
