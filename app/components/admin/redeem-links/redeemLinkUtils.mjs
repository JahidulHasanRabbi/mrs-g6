export const STATION_OPTIONS = [
  { value: "1", label: "N1GANG" },
  { value: "2", label: "KGAME99" },
  { value: "3", label: "EP369" },
  { value: "4", label: "ACEBET77" },
  { value: "5", label: "UBETCLUB" },
  { value: "6", label: "LV918" },
];

export const REWARD_TYPE_OPTIONS = [
  { value: "1", label: "TOKEN" },
  { value: "2", label: "BATTLE POINT" },
  { value: "3", label: "FREE CREDIT" },
];

const optionValueByLabel = (options, value, fallback) => {
  const normalized = String(value ?? "").trim().toUpperCase();
  const option = options.find(
    (item) => item.value === normalized || item.label.toUpperCase() === normalized,
  );
  return option?.value ?? fallback;
};

export function mapRedeemLinkToForm(item = {}) {
  return {
    name: item.name || "",
    station: optionValueByLabel(STATION_OPTIONS, item.station, "1"),
    stationUrl: item.station_url || "",
    rewardType: optionValueByLabel(REWARD_TYPE_OPTIONS, item.reward_type, "1"),
    amount: item.amount == null ? "" : String(item.amount),
    quantity: item.quantity == null ? "" : String(item.quantity),
    startDate: item.start_date || "",
    endDate: item.end_date || "",
  };
}

function isPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1;
}

function hasHttpScheme(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateRedeemLinkForm(form = {}) {
  const errors = {};
  if (!String(form.name || "").trim()) errors.name = "Campaign name is required.";
  if (!STATION_OPTIONS.some((item) => item.value === String(form.station))) {
    errors.station = "Select a valid station.";
  }
  if (!hasHttpScheme(form.stationUrl)) {
    errors.stationUrl = "Station URL must start with http:// or https://.";
  }
  if (!REWARD_TYPE_OPTIONS.some((item) => item.value === String(form.rewardType))) {
    errors.rewardType = "Select a valid reward type.";
  }
  if (!isPositiveInteger(form.amount)) {
    errors.amount = "Amount must be a whole number of at least 1.";
  }
  if (!isPositiveInteger(form.quantity)) {
    errors.quantity = "Quantity must be a whole number of at least 1.";
  }
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.endDate) errors.endDate = "End date is required.";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date cannot be earlier than start date.";
  }
  return errors;
}

export function buildRedeemLinkPayload(form) {
  return {
    name: String(form.name || "").trim(),
    station: Number(form.station),
    station_url: String(form.stationUrl || "").trim(),
    reward_type: Number(form.rewardType),
    amount: Number(form.amount),
    quantity: Number(form.quantity),
    start_date: form.startDate,
    end_date: form.endDate,
  };
}

export function describeRedeemLinkError(error) {
  const details = error?.data?.details;
  if (typeof details === "string" && details) return details;
  if (details && typeof details === "object") {
    const messages = Object.values(details)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(Boolean)
      .map(String);
    if (messages.length) return messages.join(" ");
  }
  return error?.data?.detail || error?.data?.error || error?.message || "Something went wrong.";
}

export function getRedeemLinkStatus(reason) {
  if (!reason) return { label: "Available", tone: "success" };
  if (reason === "Redeem link has not started yet") return { label: "Scheduled", tone: "info" };
  if (reason === "Redeem link has expired") return { label: "Expired", tone: "warning" };
  if (reason === "Redeem link quota is full") return { label: "Quota Full", tone: "danger" };
  if (reason === "Redeem link is no longer available") return { label: "Archived", tone: "neutral" };
  return { label: reason, tone: "neutral" };
}

export function buildRedeemShareUrl(origin, stationUrl, uuid) {
  const url = new URL("/", origin);
  url.searchParams.set("o", stationUrl);
  url.searchParams.set("reward", uuid);
  return url.toString();
}
