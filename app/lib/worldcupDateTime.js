export const WORLDCUP_MATCH_TIME_ZONE = "Asia/Kuala_Lumpur";
export const WORLDCUP_MATCH_TIME_OFFSET = "+08:00";

const two = (value) => String(value).padStart(2, "0");

function partsMap(formatter, value) {
  return Object.fromEntries(
    formatter.formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

export function getWorldCupKickoffParts(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const dateParts = partsMap(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: WORLDCUP_MATCH_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    date,
  );
  const timeParts = partsMap(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: WORLDCUP_MATCH_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }),
    date,
  );

  const timeH = two(timeParts.hour === "24" ? "00" : timeParts.hour);
  const timeM = two(timeParts.minute);

  return {
    date: `${dateParts.year}-${dateParts.month}-${dateParts.day}`,
    time: `${timeH}:${timeM}`,
    timeH,
    timeM,
  };
}

export function buildWorldCupKickoffIso(date, hour, minute) {
  if (!date) return null;
  return `${date}T${two(hour)}:${two(minute)}:00${WORLDCUP_MATCH_TIME_OFFSET}`;
}

export function formatWorldCupKickoff(value) {
  const parts = getWorldCupKickoffParts(value);
  if (!parts) return value || "";

  const [, month, day] = parts.date.split("-");
  const [hourRaw, minute] = parts.time.split(":");
  const hour = Number(hourRaw);
  const suffix = hour >= 12 ? "pm" : "am";
  const hour12 = ((hour + 11) % 12) + 1;

  return `${Number(day)} ${monthName(month)} ${two(hour12)}:${minute}${suffix}`;
}

function monthName(month) {
  return new Intl.DateTimeFormat("en-GB", { month: "long" }).format(
    new Date(Date.UTC(2000, Number(month) - 1, 1)),
  );
}
