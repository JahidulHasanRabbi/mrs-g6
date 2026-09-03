// Shared, framework-free helpers for the member-facing redeem-link screen.
// Kept in a .mjs so they can be unit tested under `node --test` without a
// React/JSDOM harness.

// The reward wording differs per reward_type: TOKEN and BATTLE POINT are
// counted items, FREE CREDIT is a currency amount.
export function describeReward(info) {
  const amount = Number(info?.amount ?? 0);
  const pretty = amount.toLocaleString("en-US");
  const type = String(info?.reward_type || "").toUpperCase();

  if (type === "FREE CREDIT") return `RM ${pretty} Free Credit`;
  if (type === "BATTLE POINT") return `${pretty} Battle Point${amount === 1 ? "" : "s"}`;
  if (type === "TOKEN") return `${pretty} KR Coin${amount === 1 ? "" : "s"}`;
  // Unknown//new reward type: still show the number rather than dropping it.
  return `${pretty}${type ? ` ${type}` : ""}`.trim();
}

// The admin share URL is /?o=<station_url>&reward=<uuid>. `o` is the station
// URL: it is both the login destination and the key the theme engine matches
// on, so the link alone is enough to theme the page and to send a logged-out
// visitor to the right place.
export function readRedeemParams(searchParams) {
  const get = (key) => searchParams?.get?.(key) || "";
  return { linkUuid: get("reward"), origin: get("o") };
}

// Only http(s) destinations are followed. The origin arrives from the query
// string, so treating it as a bare host and prefixing https:// (as /auth does)
// would turn "javascript:alert(1)" into a navigable URL on some parsers.
export function safeStationUrl(origin) {
  if (!origin) return "";
  const candidate = String(origin).trim();
  const withScheme = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

// The API's failure strings are written for admins ("quota is full", "no
// promotion code configured for this station") and would either confuse a
// member or leak how the campaign is configured. Each known reason is restated
// in member-facing language; anything unrecognised falls through to the
// generic message rather than being shown raw.
const MEMBER_FAILURE_MESSAGES = [
  { match: "already redeemed", message: "You have already claimed this reward." },
  { match: "quota is full", message: "This reward has run out. All of them have been claimed." },
  { match: "no longer available", message: "This reward is no longer available." },
  { match: "has not started", message: "This reward isn't available yet. Please check back later." },
  { match: "has expired", message: "This reward has ended." },
  { match: "does not exist", message: "This reward link is not valid." },
  // FREE CREDIT setup problems — nothing the member can act on, and the raw
  // text exposes internal configuration.
  { match: "not linked to a station", message: "We couldn't verify your account for this reward. Please contact support." },
  { match: "no promotion code", message: "This reward isn't ready yet. Please try again later or contact support." },
];

const GENERIC_FAILURE = "Could not redeem this reward. Please try again.";

// Failure messages come back as a `details` string on a 400 (this API returns
// 400 rather than 404 for an unknown uuid).
export function describeRedeemFailure(error) {
  const details = error?.data?.details;

  let raw = "";
  if (typeof details === "string" && details) {
    raw = details;
  } else if (details && typeof details === "object") {
    raw = Object.values(details)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(Boolean)
      .map(String)
      .join(" ");
  }
  if (!raw) raw = error?.data?.detail || error?.data?.error || "";
  if (!raw) return GENERIC_FAILURE;

  const normalized = raw.toLowerCase();
  const known = MEMBER_FAILURE_MESSAGES.find((entry) => normalized.includes(entry.match));
  return known ? known.message : GENERIC_FAILURE;
}
