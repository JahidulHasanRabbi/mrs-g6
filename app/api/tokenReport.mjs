// Reason codes for the token ledger (currency=1). Shared with the member
// token-history screen via queryParams.js so both stay on one list.
export const TOKEN_CATEGORY_LABELS = {
  1: "Check-In",
  2: "LuckySpin",
  3: "VIP-Monthly",
  4: "Mart-Redeem",
  5: "Top Up",
  6: "Welcome",
  7: "VIP-Upgrade",
  8: "VIP-Birthday",
  9: "Finish-Profile",
  10: "Penalty-Kick",
  11: "Mission",
  12: "Worldcup-Top-Player",
  13: "Prediction",
  14: "Smash-Egg",
  15: "Avatar",
  16: "Challenge",
  17: "Leaderboard",
  18: "Redeem-Link",
};

// Reason codes for the battle point ledger (currency=2). Same integers mean
// different things here — 2 is Mission, not LuckySpin.
export const BATTLE_POINT_CATEGORY_LABELS = {
  1: "Check-In",
  2: "Mission",
  3: "Mini-Game",
  4: "Level-Up",
  5: "Challenge",
  6: "Redeem-Link",
  7: "Manual",
};

const CURRENCY_VALUES = {
  "KR Coins": 1,
  "Battle Point": 2,
};

export const TOKEN_REPORT_CURRENCIES = Object.keys(CURRENCY_VALUES);

export function getTokenReportCurrencyValue(value) {
  if (value === 1 || value === "1") return 1;
  if (value === 2 || value === "2") return 2;
  return CURRENCY_VALUES[value];
}

export function getTokenReportCategoryOptions(currency) {
  const currencyValue = getTokenReportCurrencyValue(currency);
  const categories = currencyValue === 1
    ? TOKEN_CATEGORY_LABELS
    : currencyValue === 2
      ? BATTLE_POINT_CATEGORY_LABELS
      : null;

  return categories
    ? Object.entries(categories).map(([value, label]) => ({ value: Number(value), label }))
    : [];
}

function getCategoryValue(currency, category) {
  if (category === undefined || category === null || category === "") return undefined;
  if (typeof category === "number") return category;
  return getTokenReportCategoryOptions(currency).find((option) => option.label === category)?.value;
}

export function buildTokenReportParams({
  page,
  pageSize,
  currency,
  category,
  startDate,
  endDate,
  detail,
  username,
  phone,
  stationUuid,
} = {}) {
  const currencyValue = getTokenReportCurrencyValue(currency);
  const params = {
    page,
    page_size: pageSize,
    currency: currencyValue,
    category: currencyValue ? getCategoryValue(currencyValue, category) : undefined,
    token_details: currencyValue === 2 ? undefined : detail || undefined,
  };

  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (username) params.username = username;
  if (phone) params.phone_number = phone;
  if (stationUuid) params.station_uuid = stationUuid;

  return params;
}

// Client-side sort of the rows on the current page. Both ledgers share the
// column list, but battle point rows leave username / station / token_details
// null, so every string compare has to tolerate a missing value.
export function compareTokenReportRows(a, b, { key, direction } = {}) {
  const multiplier = direction === "asc" ? 1 : -1;

  if (key === "amount") {
    return ((Number(a?.amount) || 0) - (Number(b?.amount) || 0)) * multiplier;
  }

  if (key === "created") {
    return (toTime(a?.created) - toTime(b?.created)) * multiplier;
  }

  return String(a?.[key] ?? "").localeCompare(String(b?.[key] ?? "")) * multiplier;
}

function toTime(value) {
  const time = new Date(value ?? "").getTime();
  return Number.isNaN(time) ? 0 : time;
}

// `id` repeats across the two ledgers, so the row key has to come from uuid.
// Fall back to currency + id if a row ever arrives without one.
export function tokenReportRowKey(row, index) {
  return row?.uuid || `${row?.currency || "row"}-${row?.id ?? index}`;
}
