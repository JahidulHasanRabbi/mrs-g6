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

// How often the campaign's quota resets. The API marks recurrence as required
// but silently defaults an omitted value to ONE TIME, so leaving it out of the
// payload quietly made every campaign one-time.
export const RECURRENCE_OPTIONS = [
  { value: "1", label: "ONE TIME" },
  { value: "2", label: "DAILY" },
  { value: "3", label: "WEEKLY" },
  { value: "4", label: "MONTHLY" },
];

const optionValueByLabel = (options, value, fallback) => {
  const normalized = String(value ?? "").trim().toUpperCase();
  const option = options.find(
    (item) => item.value === normalized || item.label.toUpperCase() === normalized,
  );
  return option?.value ?? fallback;
};

// start_date/end_date are full ISO 8601 datetimes (the API returns them with a
// +08:00 offset). `datetime-local` inputs take "YYYY-MM-DDTHH:mm" with no zone,
// so hydrate by converting the instant into the browser's local wall clock —
// the same clock the table renders, so what you edit matches what you saw.
export function toDateTimeLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Inverse of the above: a zone-less local wall clock back to a full ISO instant.
// new Date("YYYY-MM-DDTHH:mm") is parsed as local time, so toISOString() carries
// the browser's offset — an admin in UTC+8 typing 08:00 sends 00:00Z.
export function fromDateTimeLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export function mapRedeemLinkToForm(item = {}) {
  return {
    name: item.name || "",
    station: optionValueByLabel(STATION_OPTIONS, item.station, "1"),
    stationUrl: item.station_url || "",
    rewardType: optionValueByLabel(REWARD_TYPE_OPTIONS, item.reward_type, "1"),
    amount: item.amount == null ? "" : String(item.amount),
    quantity: item.quantity == null ? "" : String(item.quantity),
    startDate: toDateTimeLocalInput(item.start_date),
    endDate: toDateTimeLocalInput(item.end_date),
    recurrence: optionValueByLabel(RECURRENCE_OPTIONS, item.recurrence, "1"),
    redeemPerRecurrence: Boolean(item.redeem_per_recurrence),
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
  if (!RECURRENCE_OPTIONS.some((item) => item.value === String(form.recurrence))) {
    errors.recurrence = "Select a valid recurrence.";
  }
  if (!isPositiveInteger(form.amount)) {
    errors.amount = "Amount must be a whole number of at least 1.";
  }
  if (!isPositiveInteger(form.quantity)) {
    errors.quantity = "Quantity must be a whole number of at least 1.";
  }
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.endDate) errors.endDate = "End date is required.";
  // Both are fixed-width "YYYY-MM-DDTHH:mm", so string order is chronological.
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
    start_date: fromDateTimeLocalInput(form.startDate),
    end_date: fromDateTimeLocalInput(form.endDate),
    recurrence: Number(form.recurrence),
    redeem_per_recurrence: Boolean(form.redeemPerRecurrence),
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

// Render an API timestamp as "dd/mm/yyyy hh:mm".
// The API returns ISO strings with a +08:00 offset; those are rendered in the
// viewer's local zone, matching how the rest of the admin surface reads dates.
// Deliberately not toLocaleString() — that flips to mm/dd/yyyy for US locales,
// which is ambiguous against dd/mm for any day <= 12.
export function formatRedeemLinkDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
}

function formatKpiDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Translate the Daily/Monthly/Yearly toggle into the explicit from/to range the
// KPI endpoint expects — it has no period `type` param of its own.
// Semantics mirror the retention PIC dashboard: Daily reports on *yesterday*
// (today's figures are still settling), Monthly is the current calendar month,
// Yearly is the current calendar year.
//
// An explicit picker range always wins. The endpoint rejects a half-filled
// range with 400, so a lone `from` or `to` is ignored rather than passed on.
export function buildKpiDateRange(period, fromDate, toDate, now = new Date()) {
  if (fromDate && toDate) return { from_date: fromDate, to_date: toDate };

  if (period === "Monthly") {
    return {
      from_date: formatKpiDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      to_date: formatKpiDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (period === "Yearly") {
    return {
      from_date: formatKpiDate(new Date(now.getFullYear(), 0, 1)),
      to_date: formatKpiDate(new Date(now.getFullYear(), 11, 31)),
    };
  }

  const yesterday = formatKpiDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  return { from_date: yesterday, to_date: yesterday };
}

export function buildRedeemShareUrl(origin, stationUrl, uuid) {
  const url = new URL("/", origin);
  url.searchParams.set("o", stationUrl);
  url.searchParams.set("reward", uuid);
  return url.toString();
}
