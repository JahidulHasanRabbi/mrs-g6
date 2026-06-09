// World Cup country references.
// Leaderboard country IDs (1-10) are separate from match/prediction country
// IDs (1-48). Do not use the leaderboard map for match teams.

export const LEADERBOARD_COUNTRY_MAP = {
  1: { name: "Spain", code: "es", tier: 1 },
  2: { name: "France", code: "fr", tier: 1 },
  3: { name: "England", code: "gb-eng", tier: 1 },
  4: { name: "Brazil", code: "br", tier: 1 },
  5: { name: "Argentina", code: "ar", tier: 1 },
  6: { name: "Portugal", code: "pt", tier: 2 },
  7: { name: "Germany", code: "de", tier: 2 },
  8: { name: "Netherlands", code: "nl", tier: 2 },
  9: { name: "Morocco", code: "ma", tier: 3 },
  10: { name: "Japan", code: "jp", tier: 3 },
};

export const MATCH_COUNTRY_MAP = {
  1: { name: "Algeria", code: "dz" },
  2: { name: "Argentina", code: "ar" },
  3: { name: "Australia", code: "au" },
  4: { name: "Austria", code: "at" },
  5: { name: "Belgium", code: "be" },
  6: { name: "Bosnia and Herzegovina", code: "ba" },
  7: { name: "Brazil", code: "br" },
  8: { name: "Cabo Verde", code: "cv" },
  9: { name: "Canada", code: "ca" },
  10: { name: "Colombia", code: "co" },
  11: { name: "Congo DR", code: "cd" },
  12: { name: "Croatia", code: "hr" },
  13: { name: "Curacao", code: "cw" },
  14: { name: "Czechia", code: "cz" },
  15: { name: "Cote d'Ivoire", code: "ci" },
  16: { name: "Ecuador", code: "ec" },
  17: { name: "Egypt", code: "eg" },
  18: { name: "England", code: "gb-eng" },
  19: { name: "France", code: "fr" },
  20: { name: "Germany", code: "de" },
  21: { name: "Ghana", code: "gh" },
  22: { name: "Haiti", code: "ht" },
  23: { name: "Iran", code: "ir" },
  24: { name: "Iraq", code: "iq" },
  25: { name: "Italy", code: "it" },
  26: { name: "Japan", code: "jp" },
  27: { name: "Jordan", code: "jo" },
  28: { name: "Korea Republic", code: "kr" },
  29: { name: "Mexico", code: "mx" },
  30: { name: "Morocco", code: "ma" },
  31: { name: "Netherlands", code: "nl" },
  32: { name: "New Zealand", code: "nz" },
  33: { name: "Norway", code: "no" },
  34: { name: "Panama", code: "pa" },
  35: { name: "Paraguay", code: "py" },
  36: { name: "Portugal", code: "pt" },
  37: { name: "Qatar", code: "qa" },
  38: { name: "Saudi Arabia", code: "sa" },
  39: { name: "Scotland", code: "gb-sct" },
  40: { name: "Senegal", code: "sn" },
  41: { name: "South Africa", code: "za" },
  42: { name: "Spain", code: "es" },
  43: { name: "Sweden", code: "se" },
  44: { name: "Switzerland", code: "ch" },
  45: { name: "Tunisia", code: "tn" },
  46: { name: "Turkiye", code: "tr" },
  47: { name: "United States", code: "us" },
  48: { name: "Uzbekistan", code: "uz" },
};

export const COUNTRY_MAP = LEADERBOARD_COUNTRY_MAP;

export function countryCode(id) { return LEADERBOARD_COUNTRY_MAP[id]?.code ?? null; }
export function countryName(id) { return LEADERBOARD_COUNTRY_MAP[id]?.name ?? (id ? `Country ${id}` : null); }
export function countryTier(id) { return LEADERBOARD_COUNTRY_MAP[id]?.tier ?? null; }

export function matchCountryCode(id) { return MATCH_COUNTRY_MAP[id]?.code ?? null; }
export function matchCountryName(id) { return MATCH_COUNTRY_MAP[id]?.name ?? (id ? `Country ${id}` : null); }
