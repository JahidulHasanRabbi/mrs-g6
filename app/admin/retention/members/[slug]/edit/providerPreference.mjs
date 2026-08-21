export function providerPreferenceToInput(value) {
  if (Array.isArray(value)) {
    return value
      .map((provider) => String(provider).trim())
      .filter(Boolean)
      .join(", ");
  }

  return value == null ? "" : String(value);
}

export function providerPreferencePayload(value) {
  const providers = String(value ?? "")
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);

  return { provider_preference: providers };
}

// Suggestions offered in the Provider Preference dropdown. The API doc still
// says "(Will have choices later)" for provider_preference, so this list is a
// convenience only — any name typed by hand is kept and sent as-is. Replace it
// with the backend list once that ships.
export const PROVIDER_PREFERENCE_SUGGESTIONS = [
  "Pragmatic Play",
  "JILI",
  "Evolution",
  "PG Soft",
  "Habanero",
  "Spadegaming",
  "CQ9",
  "Joker",
  "Playtech",
  "Microgaming",
];

// Normalize either shape the field deals with (API array or the comma-joined
// string kept in form state) into a clean list of provider names.
export function providerPreferenceList(value) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(",");
  return raw.map((provider) => String(provider).trim()).filter(Boolean);
}

export function providerPreferenceFromList(list) {
  return providerPreferenceList(list).join(", ");
}
