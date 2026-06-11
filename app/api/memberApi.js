import { apiRequest } from './apiClient';
import { ENDPOINTS } from './api';
import { tokenStorage } from './tokenStorage';
import { buildQueryParams } from './queryParams';

// POST /login/generate-token/
export async function generateMemberToken(id, o) {
  const response = await apiRequest(ENDPOINTS.MEMBER.GENERATE_TOKEN, {
    method: 'POST',
    body: JSON.stringify({ id, o })
  }, false);
  
  if (response.access && response.member_uuid) {
    tokenStorage.setMemberTokens(response.access, response.member_uuid);
  }
  
  // Store station_url if provided by API
  if (response.station_url) {
    tokenStorage.setStationUrl(response.station_url);
  }
  
  return {
    access: response.access,
    member_uuid: response.member_uuid,
    tokens_obtained: response.tokens_obtained,
    station_url: response.station_url
  };
}

// GET /member/{uuid}/
export async function getMemberInfo(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.MEMBER_INFO(memberUuid), {
    method: 'GET'
  }, true, 'member');
}

// POST /member/{uuid}/check-in/
export async function checkIn(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.CHECK_IN, {
    method: 'POST',
    body: JSON.stringify({ member_uuid: memberUuid })
  }, true, 'member');
}

// POST /member/{uuid}/welcome-gift/
export async function claimWelcomeGift(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.WELCOME_GIFT, {
    method: 'POST',
    body: JSON.stringify({ member_uuid: memberUuid })
  }, true, 'member');
}

// Mission Game
export async function getMyMissions(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.MISSION.MY_MISSIONS}${qs}`, { method: 'GET' }, true, 'member');
}

export async function joinMission(uuid) {
  return await apiRequest(ENDPOINTS.MISSION.JOIN(uuid), { method: 'POST' }, true, 'member');
}

export async function claimMissionReward(uuid) {
  return await apiRequest(ENDPOINTS.MISSION.CLAIM(uuid), { method: 'POST' }, true, 'member');
}

export async function getMissionProgressHistory(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.MISSION.PROGRESS_HISTORY}${qs}`, { method: 'GET' }, true, 'member');
}

// GET /member/{uuid}/profile/
export async function getProfile(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.PROFILE(memberUuid), {
    method: 'GET'
  }, true, 'member');
}

// PATCH /member/{uuid}/update-profile/
export async function updateProfile(memberUuid, profileData) {
  return await apiRequest(ENDPOINTS.MEMBER.UPDATE_PROFILE(memberUuid), {
    method: 'PATCH',
    body: profileData
  }, true, 'member');
}

// GET /settings/banners/public/
export async function getPublicBanners(location = null) {
  const queryParams = location ? `?location=${location}` : '';
  return await apiRequest(`${ENDPOINTS.SETTINGS.PUBLIC_BANNERS}${queryParams}`, {
    method: 'GET'
  }, false);
}

// GET /lucky-spin/sequences/
export async function getAllLuckySpinSequences() {
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_SEQUENCES, {
    method: 'GET'
  }, true, 'member');
}

// GET /lucky-spin/items/
export async function getAllLuckySpinItems() {
  return await apiRequest(ENDPOINTS.MEMBER.ALL_LUCKY_SPIN_ITEMS, {
    method: 'GET'
  }, true, 'member');
}

// POST /member/{uuid}/one-spin/
export async function oneSpin(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.ONE_SPIN(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// POST /member/{uuid}/ten-spin/
export async function tenSpin(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.TEN_SPIN(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// POST /member/{uuid}/fifty-spin/
export async function fiftySpin(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.FIFTY_SPIN(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// POST /member/{uuid}/hundred-spin/
export async function hundredSpin(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.HUNDRED_SPIN(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// GET /redemption/available/
export async function getAvailableRedemptionItems() {
  return await apiRequest(ENDPOINTS.MEMBER.AVAILABLE_REDEMPTION_ITEMS, {
    method: 'GET'
  }, true, 'member');
}

// POST /redemption/{uuid}/redeem/
export async function redeemItem(itemUuid, memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.REDEEM_ITEM(itemUuid), {
    method: 'POST',
    body: JSON.stringify({ member_uuid: memberUuid })
  }, true, 'member');
}

// GET /redemption/redemption-tier/ (using member token)
export async function getPublicRedemptionTiers() {
  const response = await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_TIERS, {
    method: 'GET'
  }, true, 'member'); // Use member token
  // Handle paginated response
  return Array.isArray(response) ? response : (response?.results || []);
}

// GET /member/vip-tier/
export async function getVipTiers() {
  return await apiRequest(ENDPOINTS.ADMIN.VIP_TIERS, {
    method: 'GET'
  }, true, 'member');
}

// GET /member/vip-tier/{uuid}/
export async function getVipTierById(tierUuid) {
  return await apiRequest(ENDPOINTS.ADMIN.VIP_TIER(tierUuid), {
    method: 'GET'
  }, true, 'member');
}

// GET /settings/checkin-settings/ (using member token)
export async function getCheckinSettings() {
  return await apiRequest(ENDPOINTS.ADMIN.CHECKIN_SETTINGS, {
    method: 'GET'
  }, true, 'member');
}

// GET /front-view/winning-list/
export async function getWinningList() {
  return await apiRequest(ENDPOINTS.FRONT_VIEW.WINNING_LIST, {
    method: 'GET'
  }, false);
}

// GET /member/<uuid>/member-tokens/
export async function getMemberTokenHistory(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(
    `${ENDPOINTS.MEMBER.MEMBER_TOKENS(memberUuid)}${qs}`,
    { method: 'GET' }, true, 'member'
  );
}

// GET /member/<uuid>/member-rewards/
export async function getMemberRewardHistory(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(
    `${ENDPOINTS.MEMBER.MEMBER_REWARDS(memberUuid)}${qs}`,
    { method: 'GET' }, true, 'member'
  );
}

// POST /member/<uuid>/kick/
export async function kick(memberUuid, direction) {
  return await apiRequest(ENDPOINTS.MEMBER.KICK(memberUuid), {
    method: 'POST',
    body: { direction }
  }, true, 'member');
}

// GET /member/<uuid>/kick-history/
export async function getKickHistory(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.MEMBER.KICK_HISTORY(memberUuid)}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// GET /member/<uuid>/kick-full-history/  (all kicks: goals + saves)
export async function getKickFullHistory(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.MEMBER.KICK_FULL_HISTORY(memberUuid)}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// POST /member/<uuid>/kick/redeem-all/
export async function redeemAllKickRewards(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.KICK_REDEEM_ALL(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// GET /front-view/feature-status/ — combined mission/leaderboard/penalty-kick status
export async function getFeatureStatus() {
  return await apiRequest(ENDPOINTS.FRONT_VIEW.FEATURE_STATUS, {
    method: 'GET'
  }, true, 'member');
}

// GET /penalty-kick/game-status/
export async function getPenaltyKickGameStatus() {
  return await apiRequest(ENDPOINTS.MEMBER.PENALTY_KICK_GAME_STATUS, {
    method: 'GET'
  }, true, 'member');
}

// Best-effort settings read for token-per-shot display. Game open/maintenance
// state must come from getPenaltyKickGameStatus() on the member page.
export async function getPenaltyKickSettings() {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_SETTINGS, {
    method: 'GET'
  }, true, 'member');
}

// POST /front-view/member-feedback/ - Submit member feedback
export async function submitFeedback(feedbackData) {
  return await apiRequest('/front-view/member-feedback/', {
    method: 'POST',
    body: feedbackData  // apiClient will handle JSON.stringify
  }, true, 'member');
}

// GET /settings/terms-and-conditions/public/<category>/ - Get public T&C (no auth required)
export async function getPublicTermsAndConditions(category) {
  return await apiRequest(`/settings/terms-and-conditions/public/${category}/`, {
    method: 'GET'
  }, false);
}

// GET /third-party/frame/ - Get all frames (requires member token)
export async function getPublicFrames(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.FRAMES}${qs}`, {
    method: 'GET'
  }, true, 'member'); // Requires member authentication
}

// ============================================================================
// WORLD CUP - MEMBER / USER
// ============================================================================

// GET /worldcup/country-list/
export async function getWorldCupCountryList(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_USER.COUNTRY_LIST}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/match-country-list/
export async function getWorldCupMatchCountryList() {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.MATCH_COUNTRY_LIST, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/info/
export async function getWorldCupInfo() {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.INFO, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/banner-list/
export async function getWorldCupBannerList(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_USER.BANNER_LIST}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/prize-pool/
export async function getWorldCupPrizePool(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_USER.PRIZE_POOL}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/leaderboard/countries/
export async function getWorldCupLeaderboardCountries(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_USER.LEADERBOARD_COUNTRIES}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/leaderboard/players/  (?country=<country_id> to filter by country)
export async function getWorldCupLeaderboardPlayers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_USER.LEADERBOARD_PLAYERS}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/leaderboard/top-per-country/
export async function getWorldCupTopPerCountry() {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.LEADERBOARD_TOP_PER_COUNTRY, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/match-list/
export async function getWorldCupMatchList(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_USER.MATCH_LIST}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/<member_uuid>/profile/
export async function getWorldCupProfile(memberUuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.PROFILE(memberUuid), {
    method: 'GET'
  }, true, 'member');
}

// POST /worldcup/<member_uuid>/choose-country/
export async function chooseWorldCupCountry(memberUuid, countryId) {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.CHOOSE_COUNTRY(memberUuid), {
    method: 'POST',
    body: { country: countryId }
  }, true, 'member');
}

// POST /worldcup/<member_uuid>/predict/
export async function submitWorldCupPrediction(memberUuid, matchUuid, teamId) {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.PREDICT(memberUuid), {
    method: 'POST',
    body: { match_uuid: matchUuid, team: teamId }
  }, true, 'member');
}

// GET /worldcup/<member_uuid>/predictions/
export async function getWorldCupPredictions(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_USER.PREDICTIONS(memberUuid)}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/<member_uuid>/match-predictions/
export async function getWorldCupMatchPredictions(memberUuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.MATCH_PREDICTIONS(memberUuid), {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/<member_uuid>/prediction-status/
export async function getWorldCupPredictionStatus(memberUuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.PREDICTION_STATUS(memberUuid), {
    method: 'GET'
  }, true, 'member');
}

// GET /worldcup/<member_uuid>/matches/<match_uuid>/my-prediction/
// Returns empty body (HTTP 200) if not predicted — callers must handle null.
export async function getWorldCupMyPrediction(memberUuid, matchUuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.MY_PREDICTION(memberUuid, matchUuid), {
    method: 'GET'
  }, true, 'member');
}
