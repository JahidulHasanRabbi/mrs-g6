// Real API adapter for the leaderboard. Exports the same function signatures
// as mockApi.js so components can swap imports without structural changes.

import { formatKrCoins } from "../../api/apiOptions";
import {
  getWorldCupCountryList,
  getWorldCupLeaderboardCountries,
  getWorldCupLeaderboardPlayers,
  getWorldCupPrizePool,
  getWorldCupMatchList,
  getWorldCupProfile,
  getProfile,
  chooseWorldCupCountry,
  submitWorldCupPrediction,
  getWorldCupPredictions,
  getWorldCupMatchPredictions,
  getWorldCupPredictionStatus,
} from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";
import {
  COUNTRY_MAP,
  MATCH_COUNTRY_MAP,
  countryCode,
  countryName,
  matchCountryCode,
  matchCountryName,
} from "../../lib/worldcupCountries";
import { formatWorldCupKickoff } from "../../lib/worldcupDateTime";

// localStorage key for tracking whether the onboarding intro was shown.
// The API does not persist this — it's a one-time UI gate.
const ONBOARDED_KEY = "mrs_lb_onboarded";
const DRAW_TEAM_ID = 0;

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
  const [worldCupResult, memberProfileResult] = await Promise.allSettled([
    getWorldCupProfile(memberUuid),
    getProfile(memberUuid),
  ]);
  if (worldCupResult.status === "rejected") throw worldCupResult.reason;
  const data = worldCupResult.value;
  const memberProfile = memberProfileResult.status === "fulfilled" ? memberProfileResult.value : null;
  const hasNation = data.country !== null && data.country !== undefined;
  const hasOnboarded = hasNation || readOnboarded();
  return {
    name: playerDisplayName(data, memberProfile),
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
  let data;
  try {
    data = await getWorldCupCountryList();
  } catch {
    data = null;
  }
  // data: { tiers: [{ tier, count, countries: [{ id, name }] }] }
  const result = {};
  for (const t of data?.tiers ?? []) {
    const label = TIER_LABELS[t.tier] ?? `Tier ${t.tier}`;
    result[label] = (t.countries ?? [])
      .map((c) => ({
        id: c.id,
        code: countryCode(c.id),
        name: c.name,
        tier: t.tier,
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));
  }
  if (Object.keys(result).length > 0) return result;

  for (const [id, country] of Object.entries(COUNTRY_MAP)) {
    const label = TIER_LABELS[country.tier] ?? `Tier ${country.tier}`;
    if (!result[label]) result[label] = [];
    result[label].push({
      id: Number(id),
      code: country.code,
      name: country.name,
      tier: country.tier,
    });
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
    rank: p.global_rank,
    name: playerDisplayName(p),
    code: countryCode(p.country),
    countryId: p.country,
    points: p.total_points ?? 0,
  }));
}

export async function getPlayersByCountry(countryId) {
  const data = await getWorldCupLeaderboardPlayers({ country: countryId });
  return (data.results ?? data ?? []).map((p) => ({
    rank: p.country_rank ?? p.global_rank,
    name: playerDisplayName(p),
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
  return (data.results ?? data ?? [])
    .map((r, i) => ({
      rank: r.position ?? i + 1,
      uuid: r.uuid,
      name: r.reward_name,
      description: r.description,
      image: r.image,
      quantity: r.quantity,
    }))
    .sort((a, b) => a.rank - b.rank);
}

export async function getPredictionPrizes() {
  const data = await getWorldCupPrizePool({ type: "prediction" });
  const items = (data.results ?? data ?? [])
    .slice()
    .sort((a, b) => {
      const aWins = Number(a.win_condition);
      const bWins = Number(b.win_condition);
      if (Number.isFinite(aWins) && Number.isFinite(bWins)) return aWins - bWins;
      const aPos = Number(a.position);
      const bPos = Number(b.position);
      if (Number.isFinite(aPos) && Number.isFinite(bPos)) return aPos - bPos;
      if (Number.isFinite(aWins)) return -1;
      if (Number.isFinite(bWins)) return 1;
      return 0;
    });
  return items.map((r, i) => {
    const wins = Number(r.win_condition);
    const achievement = Number.isFinite(wins)
      ? `${wins} Match Win Streak`
      : firstNonBlank(r.description, r.reward_name) || "Correct Prediction";
    return {
      position: ordinal(i + 1),
      condition: achievement,
      reward: r.token_amount ? formatKrCoins(Number(r.token_amount)) : r.reward_name,
      type: r.token_amount ? "tokens" : "phone",
      image: r.image,
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
    const homeInfo = MATCH_COUNTRY_MAP[m.team_home] ?? { name: String(m.team_home), code: null };
    const awayInfo = MATCH_COUNTRY_MAP[m.team_away] ?? { name: String(m.team_away), code: null };
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
      winnerTeam: m.status === 3 && m.winner
        ? {
          id: m.winner,
          code: matchCountryCode(m.winner),
          name: matchCountryName(m.winner),
        }
        : null,
      isDraw: m.status === 3 && (m.winner === null || m.winner === undefined),
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
  return items.map((p, i) => {
    const winner = p.winner ?? null;
    const isSettledDraw = Number(p.match_status) === 3 && winner === null;
    return {
      match: i + 1,
      uuid: p.uuid,
      matchUuid: p.match_uuid,
      team: {
        id: p.predicted_team,
        name: predictionTeamName(p.predicted_team, p.predicted_team_name),
        code: matchCountryCode(p.predicted_team),
      },
      winnerTeam: winner
        ? {
          id: winner,
          name: matchCountryName(winner) ?? "",
          code: matchCountryCode(winner),
        }
        : null,
      winnerLabel: p.state === 4 || isSettledDraw ? "Draw" : winner ? null : "",
      homeName: matchCountryName(p.team_home) ?? String(p.team_home ?? ""),
      awayName: matchCountryName(p.team_away) ?? String(p.team_away ?? ""),
      result: p.state === 2 ? "win" : p.state === 3 ? "loss" : p.state === 4 ? "draw" : "pending",
    };
  });
}

// Lightweight map of already-predicted match UUIDs -> prediction state/team.
// Used by PredictionsList to disable the Predict button and show the user's pick.
export async function getMatchPredictionsMap() {
  const memberUuid = tokenStorage.getMemberUuid();
  const data = await getWorldCupMatchPredictions(memberUuid);
  const map = {};
  for (const p of (Array.isArray(data) ? data : [])) {
    map[p.match_uuid] = {
      predictionUuid: p.prediction_uuid,
      state: p.state,
      team: {
        id: p.predicted_team,
        name: predictionTeamName(p.predicted_team, p.predicted_team_name),
        code: matchCountryCode(p.predicted_team),
      },
    };
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

export async function getPredictionEligibility() {
  const memberUuid = tokenStorage.getMemberUuid();
  return await getWorldCupPredictionStatus(memberUuid);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function firstNonBlank(...values) {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function predictionTeamName(teamId, providedName) {
  if (Number(teamId) === DRAW_TEAM_ID) return "Draw";
  return providedName ?? matchCountryName(teamId) ?? "";
}

function playerDisplayName(row, memberProfile = null) {
  return firstNonBlank(
    row?.player_name,
    row?.full_name,
    memberProfile?.full_name,
  ) || "Player";
}

function formatKickoff(iso) {
  return formatWorldCupKickoff(iso);
}
