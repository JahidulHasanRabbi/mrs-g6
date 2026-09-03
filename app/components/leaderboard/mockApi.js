// Mock backend for the leaderboard flow. Swap imports in page.js with a
// real api wrapper once the backend is wired.

const fakeLatency = (ms = 250) =>
  new Promise((r) => setTimeout(r, ms));

// flagUrl moved to primitives.jsx; re-exported here for backward compat.
export { flagUrl } from "./primitives";

export const COUNTRIES_BY_TIER = {
  "Tier 1 · Global Giants": [
    { code: "br", name: "BRAZIL" },
    { code: "fr", name: "FRANCE" },
    { code: "ar", name: "ARGENTINA" },
    { code: "de", name: "GERMANY" },
  ],
  "Tier 2 · Contenders": [
    { code: "es", name: "SPAIN" },
    { code: "it", name: "ITALY" },
    { code: "pt", name: "PORTUGAL" },
  ],
  "Tier 3 · Challengers": [
    { code: "jp", name: "JAPAN" },
    { code: "us", name: "USA" },
  ],
};
export const ALL_COUNTRIES = Object.values(COUNTRIES_BY_TIER).flat();

const COUNTRY_RANKINGS = [
  { rank: 1, code: "br", name: "BRAZIL",    points: 1250, users: 230 },
  { rank: 2, code: "fr", name: "FRANCE",    points: 1250, users: 230 },
  { rank: 3, code: "es", name: "SPAIN",     points: 1250, users: 230 },
  { rank: 4, code: "pt", name: "PORTUGAL",  points: 1250, users: 230 },
  { rank: 5, code: "ar", name: "ARGENTINA", points: 1250, users: 230 },
  { rank: 6, code: "de", name: "GERMANY",   points: 1250, users: 230 },
  { rank: 7, code: "it", name: "ITALY",     points: 1250, users: 230 },
  { rank: 8, code: "gb-eng", name: "ENGLAND", points: 1500, users: 300 },
  { rank: 9, code: "jp", name: "JAPAN",     points: 1100, users: 210 },
  { rank: 10, code: "us", name: "USA",      points: 1700, users: 340 },
];

// The per-country "Top Players" drill-down (Figma: Top Players / <COUNTRY>).
// The designs reuse the same roster of names for every nation, with that
// nation's flag down the whole list — so we generate each country's list from
// one roster, stamping every row's `code` with the country so <Flag> matches.
const TOP_PLAYERS_ROSTER = [
  { name: "Arek Park",         points: 1250 },
  { name: "Noren Dunk",        points: 1250 },
  { name: "Brazil _lover",     points: 1250 },
  { name: "Messi_fan",         points: 1250 },
  { name: "Mark Nguyen",       points: 1250 },
  { name: "Hyueng Min Son",    points: 1250 },
  { name: "Harry Kane",        points: 1250 },
  { name: "Lionel Messi",      points: 1200 },
  { name: "Cristiano Ronaldo", points: 1150 },
  { name: "Neymar Jr",         points: 1100 },
];

const playersFor = (code) =>
  TOP_PLAYERS_ROSTER.map((p, i) => ({ rank: i + 1, ...p, code }));

// Every country surfaced in the rankings / nation picker gets a roster so its
// drill-down shows the right flag. Add a country here when the backend lands.
const PLAYERS_BY_COUNTRY = Object.fromEntries(
  ["br", "fr", "es", "it", "pt", "ar", "de", "gb-eng", "jp", "us"].map((code) => [
    code,
    playersFor(code),
  ]),
);
const GLOBAL_PLAYERS = [
  { rank: 1, name: "Arek Park",         points: 1250, code: "br" },
  { rank: 2, name: "Noren Dunk",        points: 890,  code: "fr" },
  { rank: 3, name: "Brazil _lover",     points: 769,  code: "br" },
  { rank: 4, name: "Messi_fan",         points: 555,  code: "ar" },
  { rank: 5, name: "Mark Nguyen",       points: 516,  code: "es" },
  { rank: 6, name: "Hyueng Min Son",    points: 250,  code: "de" },
  { rank: 7, name: "Harry Kane",        points: 50,   code: "gb-eng" },
  { rank: 8, name: "Lionel Messi",      points: 40,   code: "ar" },
  { rank: 9, name: "Cristiano Ronaldo", points: 45,   code: "pt" },
  { rank: 10, name: "Neymar Jr",        points: 37,   code: "br" },
];

const MY_PROFILE = {
  name: "Messi_fan",
  countryCode: "es",
  countryName: "SPAIN",
  globalRank: 2730,
  countryRank: 230,
  winningStreak: 8,
  totalPoints: 1250,
  totalPredictions: 15,
  totalWins: 12,
  // Default to a brand-new customer so the required first-time flow is the
  // default experience: Onboarding ("Become Top 10") → Nation Select
  // ("Choose Your Nation") → My Profile. A customer cannot reach My Profile
  // until both flags are true (the render gate in page.js enforces this).
  // Flip either to true to simulate a returning customer; ?fresh=1 always
  // forces the first-time flow regardless of these defaults.
  hasNation: false,
  hasOnboarded: false,
};

const FIXTURES = {
  upcoming: [
    { group: "GROUP A", home: { code: "pt", name: "PORTUGAL" }, away: { code: "ar", name: "ARGENTINA" }, date: "12th June 2.00pm", homeOdds: 39, awayOdds: 61 },
    { group: "GROUP B", home: { code: "gb-eng", name: "ENGLAND" }, away: { code: "de", name: "GERMANY" }, date: "12th June 3.30pm", homeOdds: 80, awayOdds: 20 },
  ],
  ongoing: [
    { group: "GROUP A", home: { code: "pt", name: "PORTUGAL" }, away: { code: "ar", name: "ARGENTINA" }, date: "12th June 2.00pm", homeOdds: 39, awayOdds: 61, locked: true },
    { group: "GROUP B", home: { code: "gb-eng", name: "ENGLAND" }, away: { code: "de", name: "GERMANY" }, date: "12th June 3.30pm", homeOdds: 80, awayOdds: 20, locked: true },
  ],
};

const MY_PREDICTIONS = [
  { match: 5,  team: { code: "ar", name: "ARGENTINA" }, result: "win" },
  { match: 6,  team: { code: "de", name: "GERMANY" },   result: "loss" },
  { match: 7,  team: { code: "gb-eng", name: "ENGLAND" }, result: "win" },
  { match: 8,  team: { code: "it", name: "ITALY" },     result: "loss" },
  { match: 9,  team: { code: "gb-eng", name: "ENGLAND" }, result: "win" },
  { match: 10, team: { code: "gb-eng", name: "ENGLAND" }, result: "loss" },
  { match: 11, team: { code: "gb-eng", name: "ENGLAND" }, result: "win" },
];

const COUNTRY_PRIZES = [
  { rank: 1, code: "br", name: "BRAZIL",    car: "BMW M4" },
  { rank: 2, code: "ar", name: "ARGENTINA", car: "Audi A6" },
  { rank: 3, code: "br", name: "BRAZIL",    car: "Mercedes C-Class" },
];

const PLAYER_PRIZES = [
  { rank: 1, name: "Arek Park",      code: "br" },
  { rank: 2, name: "Noren Dunk",     code: "fr" },
  { rank: 3, name: "Brazil _lover",  code: "ar" },
  { rank: 4, name: "Messi_fan",      code: "ar" },
  { rank: 5, name: "Mark Nguyen",    code: "ar" },
  { rank: 6, name: "Hyueng Min Son", code: "ar" },
  { rank: 7, name: "Harry Kane",     code: "es" },
];

const PREDICTION_PRIZES = [
  { position: "1st", condition: "10 Consecutive Wins", reward: "SAMSUNG PHONE", type: "phone" },
  { position: "2nd", condition: "9 Consecutive Wins",  reward: "90 KR COIN SPIN", type: "tokens" },
  { position: "3rd", condition: "8 Consecutive Wins",  reward: "75 KR COIN SPIN", type: "tokens" },
  { position: "4th", condition: "7 Consecutive Wins",  reward: "60 KR COIN SPIN", type: "tokens" },
  { position: "5th", condition: "5 Consecutive Wins",  reward: "50 KR COIN SPIN", type: "tokens" },
  { position: "6th", condition: "3 Consecutive Wins",  reward: "35 KR COIN SPIN", type: "tokens" },
  { position: "7th", condition: "1 Consecutive Win",   reward: "20 KR COIN SPIN", type: "tokens" },
];

// Persist the country selection so a customer who has chosen a nation goes
// straight to My Profile on every later visit (and across full reloads),
// while a customer who hasn't keeps seeing Onboarding → Nation Select.
// Mock-only: a real backend would return these flags on the profile.
const NATION_STORAGE_KEY = "mrs_lb_nation";

function readNationPatch() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(NATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearNationSelection() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(NATION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export async function getMyProfile() {
  await fakeLatency(150);
  // A saved selection overrides the (new-customer) defaults.
  return { ...MY_PROFILE, ...(readNationPatch() ?? {}) };
}
export async function getCountryRankings() { await fakeLatency(220); return COUNTRY_RANKINGS.slice(); }
export async function getGlobalPlayers() { await fakeLatency(220); return GLOBAL_PLAYERS.slice(); }
export async function getPlayersByCountry(code) { await fakeLatency(220); return (PLAYERS_BY_COUNTRY[code] ?? PLAYERS_BY_COUNTRY.es).slice(); }
export async function getFixtures() { await fakeLatency(180); return { upcoming: FIXTURES.upcoming.slice(), ongoing: FIXTURES.ongoing.slice() }; }
export async function getMyPredictions() { await fakeLatency(180); return MY_PREDICTIONS.slice(); }
export async function getCountryPrizes() { await fakeLatency(160); return COUNTRY_PRIZES.slice(); }
export async function getPlayerPrizes() { await fakeLatency(160); return PLAYER_PRIZES.slice(); }
export async function getPredictionPrizes() { await fakeLatency(160); return PREDICTION_PRIZES.slice(); }
export async function confirmNation(code, name) {
  await fakeLatency(180);
  // Persist so every subsequent leaderboard visit skips the intro and lands
  // on My Profile directly.
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        NATION_STORAGE_KEY,
        JSON.stringify({ hasNation: true, hasOnboarded: true, countryCode: code, countryName: name }),
      );
    } catch {
      /* ignore */
    }
  }
  return { ok: true, code };
}
// Records a winner prediction for a fixture. Mock only — swap for a real
// endpoint (e.g. memberApi) once the backend exists.
export async function submitPrediction(group, teamCode) { await fakeLatency(200); return { ok: true, group, teamCode }; }
