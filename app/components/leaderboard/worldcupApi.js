// Real API adapter for the leaderboard. Exports the same function signatures
// as mockApi.js so components can swap imports without structural changes.

import {
  getWorldCupCountryList,
  getWorldCupLeaderboardCountries,
  getWorldCupLeaderboardPlayers,
  getWorldCupPrizePool,
  getWorldCupMatchList,
  getWorldCupProfile,
  chooseWorldCupCountry,
  submitWorldCupPrediction,
  getWorldCupPredictions,
} from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";

// localStorage key for tracking whether the onboarding intro was shown.
// The API does not persist this — it's a one-time UI gate.
const ONBOARDED_KEY = "mrs_lb_onboarded";

function readOnboarded() {
  if (typeof window === "undefined") return false;
  try { return !!window.localStorage.getItem(ONBOARDED_KEY); } catch { return false; }
}
function markOnboarded() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(ONBOARDED_KEY, "1"); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getMyProfile() {
  const memberUuid = tokenStorage.getMemberUuid();
  const data = await getWorldCupProfile(memberUuid);
  const hasNation = data.country_uuid !== null && data.country_uuid !== undefined;
  const hasOnboarded = hasNation || readOnboarded();
  return {
    name: data.player_name,
    countryCode: data.country_code,
    countryName: data.country_name,
    countryFlag: data.country_flag,
    totalPoints: data.total_points ?? 0,
    globalRank: data.global_rank ?? 0,
    countryRank: data.country_rank ?? 0,
    winningStreak: data.current_streak ?? 0,
    totalPredictions: data.total_predictions ?? 0,
    totalWins: data.total_wins ?? 0,
    hasNation,
    hasOnboarded,
  };
}

// Called after the user completes nation selection; posts to API then persists
// the onboarded flag locally so the intro carousel is never shown again.
export async function confirmNation(countryUuid) {
  const memberUuid = tokenStorage.getMemberUuid();
  const data = await chooseWorldCupCountry(memberUuid, countryUuid);
  markOnboarded();
  return data;
}

export function clearNationSelection() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ONBOARDED_KEY);
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Country list (for NationSelect)
// ---------------------------------------------------------------------------

const TIER_LABELS = {
  1: "Tier 1 · Global Giants",
  2: "Tier 2 · Contenders",
  3: "Tier 3 · Challengers",
};

export async function getCountriesByTier() {
  const data = await getWorldCupCountryList();
  // data: { tiers: [{ tier, count, countries: [{ uuid, code, name, flag, tier, tier_display }] }] }
  const result = {};
  for (const t of data.tiers ?? []) {
    const label = TIER_LABELS[t.tier] ?? `Tier ${t.tier}`;
    result[label] = (t.countries ?? []).map((c) => ({
      uuid: c.uuid,
      code: c.code,
      name: c.name,
      flag: c.flag,
      tier: c.tier,
    }));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

export async function getCountryRankings() {
  const data = await getWorldCupLeaderboardCountries();
  return (data.results ?? data ?? []).map((c) => ({
    rank: c.rank,
    uuid: c.uuid,
    code: c.code,
    name: c.name,
    flag: c.flag,
    points: c.total_points ?? 0,
    users: c.total_users ?? 0,
  }));
}

export async function getGlobalPlayers() {
  const data = await getWorldCupLeaderboardPlayers();
  return (data.results ?? data ?? []).map((p) => ({
    rank: p.rank,
    name: p.player_name,
    code: p.country_code,
    flag: p.flag,
    countryUuid: p.country_uuid,
    points: p.total_points ?? 0,
  }));
}

export async function getPlayersByCountry(countryUuid) {
  const data = await getWorldCupLeaderboardPlayers({ country: countryUuid });
  return (data.results ?? data ?? []).map((p) => ({
    rank: p.rank,
    name: p.player_name,
    code: p.country_code,
    flag: p.flag,
    points: p.total_points ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Prizes
// ---------------------------------------------------------------------------

export async function getCountryPrizes() {
  const data = await getWorldCupPrizePool({ type: "top-country" });
  return (data.results ?? data ?? []).map((r, i) => ({
    rank: r.position ?? i + 1,
    uuid: r.uuid,
    name: r.reward_name,
    description: r.description,
    image: r.image,
    code: r.country_code,
    flag: r.country_flag,
    quantity: r.quantity,
  }));
}

export async function getPlayerPrizes() {
  const data = await getWorldCupPrizePool({ type: "global-top-player" });
  return (data.results ?? data ?? []).map((r, i) => ({
    rank: r.position ?? i + 1,
    uuid: r.uuid,
    name: r.reward_name,
    description: r.description,
    image: r.image,
    quantity: r.quantity,
  }));
}

export async function getPredictionPrizes() {
  const data = await getWorldCupPrizePool({ type: "prediction" });
  return (data.results ?? data ?? []).map((r, i) => {
    const wins = r.win_condition ?? 0;
    return {
      position: ordinal(r.position ?? i + 1),
      condition: wins ? `${wins} Consecutive Win${wins !== 1 ? "s" : ""}` : r.reward_name,
      reward: r.token_amount ? `${r.token_amount} TOKEN SPIN` : r.reward_name,
      type: r.token_amount ? "tokens" : "phone",
      uuid: r.uuid,
    };
  });
}

// ---------------------------------------------------------------------------
// Matches / Fixtures
// ---------------------------------------------------------------------------

export async function getFixtures() {
  const data = await getWorldCupMatchList();
  const matches = data.results ?? data ?? [];
  const upcoming = [];
  const ongoing = [];
  for (const m of matches) {
    const fixture = {
      uuid: m.uuid,
      group: m.group_label ?? "",
      home: {
        uuid: m.team_home_uuid,
        code: m.team_home_flag ? "" : (m.team_home_name ?? "").slice(0, 3).toUpperCase(),
        name: m.team_home_name,
        flag: m.team_home_flag,
      },
      away: {
        uuid: m.team_away_uuid,
        code: m.team_away_flag ? "" : (m.team_away_name ?? "").slice(0, 3).toUpperCase(),
        name: m.team_away_name,
        flag: m.team_away_flag,
      },
      date: m.kickoff_at ? formatKickoff(m.kickoff_at) : "",
      homeOdds: 50,
      awayOdds: 50,
      locked: m.status !== 1,
      status: m.status,
    };
    if (m.status === 1) upcoming.push(fixture);
    else if (m.status === 2) ongoing.push(fixture);
  }
  return { upcoming, ongoing };
}

// ---------------------------------------------------------------------------
// My Predictions
// ---------------------------------------------------------------------------

export async function getMyPredictions() {
  const memberUuid = tokenStorage.getMemberUuid();
  const data = await getWorldCupPredictions(memberUuid);
  const items = data.results ?? data ?? [];
  return items.map((p, i) => ({
    match: i + 1,
    uuid: p.uuid,
    team: {
      uuid: p.predicted_team_uuid,
      name: p.predicted_team_name,
      flag: null,
      code: "",
    },
    result: p.state === 2 ? "win" : p.state === 3 ? "loss" : "pending",
  }));
}

// ---------------------------------------------------------------------------
// Submit prediction
// ---------------------------------------------------------------------------

export async function submitPrediction(matchUuid, teamUuid) {
  const memberUuid = tokenStorage.getMemberUuid();
  return await submitWorldCupPrediction(memberUuid, matchUuid, teamUuid);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatKickoff(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }) +
      " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
