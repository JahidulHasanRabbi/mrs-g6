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
  getWorldCupMatchPredictions,
} from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";
import { COUNTRY_MAP, countryCode, countryName } from "../../lib/worldcupCountries";

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
  const hasNation = data.country !== null && data.country !== undefined;
  const hasOnboarded = hasNation || readOnboarded();
  return {
    name: data.player_name,
    countryId: data.country ?? null,
    countryCode: countryCode(data.country),
    countryName: data.country_name ?? countryName(data.country),
    countryFlag: null,
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
export async function confirmNation(countryId) {
  const memberUuid = tokenStorage.getMemberUuid();
  const data = await chooseWorldCupCountry(memberUuid, countryId);
  markOnboarded();
  return {
    country: data.country,
    country_name: data.country_name,
    country_code: countryCode(data.country),
  };
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
  // data: { tiers: [{ tier, count, countries: [{ id, name }] }] }
  const result = {};
  for (const t of data.tiers ?? []) {
    const label = TIER_LABELS[t.tier] ?? `Tier ${t.tier}`;
    result[label] = (t.countries ?? []).map((c) => ({
      id: c.id,
      code: countryCode(c.id),
      name: c.name,
      tier: t.tier,
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
    id: c.country,
    code: countryCode(c.country),
    name: c.country_name ?? countryName(c.country),
    points: c.total_points ?? 0,
    users: c.total_users ?? 0,
  }));
}

export async function getGlobalPlayers() {
  const data = await getWorldCupLeaderboardPlayers();
  return (data.results ?? data ?? []).map((p) => ({
    rank: p.rank,
    name: p.player_name,
    code: countryCode(p.country),
    countryId: p.country,
    points: p.total_points ?? 0,
  }));
}

export async function getPlayersByCountry(countryId) {
  const data = await getWorldCupLeaderboardPlayers({ country: countryId });
  return (data.results ?? data ?? []).map((p) => ({
    rank: p.rank,
    name: p.player_name,
    code: countryCode(p.country),
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
    code: countryCode(r.country),
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
  const settled = [];
  for (const m of matches) {
    const homeInfo = COUNTRY_MAP[m.team_home] ?? { name: String(m.team_home), code: null };
    const awayInfo = COUNTRY_MAP[m.team_away] ?? { name: String(m.team_away), code: null };
    const fixture = {
      uuid: m.uuid,
      group: m.group_label ?? "",
      home: {
        id: m.team_home,
        code: homeInfo.code,
        name: homeInfo.name,
      },
      away: {
        id: m.team_away,
        code: awayInfo.code,
        name: awayInfo.name,
      },
      date: m.kickoff_at ? formatKickoff(m.kickoff_at) : "",
      homeOdds: 50,
      awayOdds: 50,
      locked: m.status !== 1,
      status: m.status,
      winner: m.winner ?? null,
    };
    if (m.status === 1) upcoming.push(fixture);
    else if (m.status === 2) ongoing.push(fixture);
    else if (m.status === 3) settled.push(fixture);
  }
  return { upcoming, ongoing, settled };
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
    matchUuid: p.match_uuid,
    team: {
      id: p.predicted_team,
      name: COUNTRY_MAP[p.predicted_team]?.name ?? "",
      code: countryCode(p.predicted_team),
    },
    homeName: COUNTRY_MAP[p.team_home]?.name ?? String(p.team_home ?? ""),
    awayName: COUNTRY_MAP[p.team_away]?.name ?? String(p.team_away ?? ""),
    result: p.state === 2 ? "win" : p.state === 3 ? "loss" : "pending",
  }));
}

// Lightweight map of already-predicted match UUIDs → prediction state.
// Used by PredictionsList to disable the Predict button on already-predicted matches.
export async function getMatchPredictionsMap() {
  const memberUuid = tokenStorage.getMemberUuid();
  const data = await getWorldCupMatchPredictions(memberUuid);
  const map = {};
  for (const p of (Array.isArray(data) ? data : [])) {
    map[p.match_uuid] = { predictionUuid: p.prediction_uuid, state: p.state };
  }
  return map;
}

// ---------------------------------------------------------------------------
// Submit prediction
// ---------------------------------------------------------------------------

export async function submitPrediction(matchUuid, teamId) {
  const memberUuid = tokenStorage.getMemberUuid();
  return await submitWorldCupPrediction(memberUuid, matchUuid, teamId);
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
