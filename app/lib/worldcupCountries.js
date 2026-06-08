// World Cup country reference — single source of truth for the fixed 10 countries.
// The API represents countries as integers (1–10) with no codes/flags returned.
// This table maps each ID to its display name and local flag asset code.
// Local flag SVGs live in /public/assets/leaderboard/flags/<code>.svg.

export const COUNTRY_MAP = {
  1:  { name: "Spain",       code: "es",     tier: 1 },
  2:  { name: "France",      code: "fr",     tier: 1 },
  3:  { name: "England",     code: "gb-eng", tier: 1 },
  4:  { name: "Brazil",      code: "br",     tier: 1 },
  5:  { name: "Argentina",   code: "ar",     tier: 1 },
  6:  { name: "Portugal",    code: "pt",     tier: 2 },
  7:  { name: "Germany",     code: "de",     tier: 2 },
  8:  { name: "Netherlands", code: "nl",     tier: 2 },
  9:  { name: "Morocco",     code: "ma",     tier: 3 },
  10: { name: "Japan",       code: "jp",     tier: 3 },
};

export function countryCode(id) { return COUNTRY_MAP[id]?.code ?? null; }
export function countryName(id) { return COUNTRY_MAP[id]?.name ?? (id ? `Country ${id}` : null); }
export function countryTier(id) { return COUNTRY_MAP[id]?.tier ?? null; }
