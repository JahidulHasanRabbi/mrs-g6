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

// GET /smash-egg/smash-egg-items/
export async function getAllSmashEggItems() {
  return await apiRequest(ENDPOINTS.MEMBER.ALL_SMASH_EGG_ITEMS, {
    method: 'GET'
  }, true, 'member');
}

// GET /smash-egg/smash-sequences/
export async function getAllSmashEggSequences() {
  return await apiRequest(ENDPOINTS.MEMBER.ALL_SMASH_EGG_SEQUENCES, {
    method: 'GET'
  }, true, 'member');
}

// GET /smash-egg/winning-list/
export async function getSmashEggWinningList() {
  return await apiRequest(ENDPOINTS.MEMBER.SMASH_EGG_WINNING_LIST, {
    method: 'GET'
  }, true, 'member');
}

// GET /member/<member_uuid>/smash-history/
export async function getSmashEggHistory(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.MEMBER.SMASH_EGG_HISTORY(memberUuid)}${qs}`, {
    method: 'GET'
  }, true, 'member');
}

// POST /member/<member_uuid>/one-smash/
export async function oneSmash(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.ONE_SMASH(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// POST /member/<member_uuid>/ten-smash/
export async function tenSmash(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.TEN_SMASH(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// POST /member/<member_uuid>/fifty-smash/
export async function fiftySmash(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.FIFTY_SMASH(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// POST /member/<member_uuid>/hundred-smash/
export async function hundredSmash(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.HUNDRED_SMASH(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

// GET /smash-egg/smash-egg-settings/
export async function getSmashEggSettings() {
  return await apiRequest(ENDPOINTS.MEMBER.SMASH_EGG_SETTINGS, {
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

// GET /redemption/game-status/
export async function getRedemptionGameStatus() {
  return await apiRequest(ENDPOINTS.MEMBER.REDEMPTION_GAME_STATUS, {
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

// ============================================================================
// LEADERBOARD — PUBLIC (postman/leaderboard.md)
// type: 1 = Deposit, 2 = Withdraw, 3 = Referral
// ============================================================================

// GET /leaderboard/public/info/  (optional ?type=)
export async function getPublicLeaderboardInfo(type) {
  const qs = type ? buildQueryParams({ type }) : '';
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.PUBLIC_INFO}${qs}`, { method: 'GET' }, true, 'member');
}

// GET /leaderboard/public/status/
export async function getPublicLeaderboardStatus() {
  return await apiRequest(ENDPOINTS.LEADERBOARD.PUBLIC_STATUS, { method: 'GET' }, true, 'member');
}

// GET /leaderboard/public/campaign/  (optional ?type=)
export async function getPublicLeaderboardCampaign(type) {
  const qs = type ? buildQueryParams({ type }) : '';
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.PUBLIC_CAMPAIGN}${qs}`, { method: 'GET' }, true, 'member');
}

// GET /leaderboard/public/{board}-ranking/  — latest generated Top 20 batch
export async function getPublicDepositRanking() {
  return await apiRequest(ENDPOINTS.LEADERBOARD.PUBLIC_DEPOSIT_RANKING, { method: 'GET' }, true, 'member');
}
export async function getPublicWithdrawRanking() {
  return await apiRequest(ENDPOINTS.LEADERBOARD.PUBLIC_WITHDRAW_RANKING, { method: 'GET' }, true, 'member');
}
export async function getPublicReferralRanking() {
  return await apiRequest(ENDPOINTS.LEADERBOARD.PUBLIC_REFERRAL_RANKING, { method: 'GET' }, true, 'member');
}

// GET /leaderboard/{board}-reward-items/ using member token for display prize mapping
export async function getMemberDepositRewardItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.DEPOSIT_REWARD_ITEMS}${qs}`, { method: 'GET' }, true, 'member');
}

export async function getMemberWithdrawalRewardItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.WITHDRAW_REWARD_ITEMS}${qs}`, { method: 'GET' }, true, 'member');
}

export async function getMemberReferrerRewardItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.REFERRAL_REWARD_ITEMS}${qs}`, { method: 'GET' }, true, 'member');
}

// ============================================================================
// AVATAR RPG (Phase 3) — MEMBER / USER
// docs/MRS - G6 Avatar API Documentation.md — all endpoints under /avatar/.
// The view-model mapping for the game screens lives in
// app/components/rpg/rpgApi.js; these are the raw API calls.
// ============================================================================

// GET /avatar/game-status/  — 1 = OPEN, 2 = CLOSE
export async function getAvatarGameStatus() {
  return await apiRequest(ENDPOINTS.AVATAR.GAME_STATUS, { method: 'GET' }, true, 'member');
}

// GET /avatar/settings/ — shared game math (max level, costs, capacity, dice)
export async function getAvatarSettings() {
  return await apiRequest(ENDPOINTS.AVATAR.SETTINGS, { method: 'GET' }, true, 'member');
}

// GET /avatar/member-avatar/profile/ — {journey_started:false} until start-journey
export async function getAvatarProfile() {
  return await apiRequest(ENDPOINTS.AVATAR.PROFILE, { method: 'GET' }, true, 'member');
}

// POST /avatar/member-avatar/start-journey/  — gender: 1 = MALE, 2 = FEMALE
export async function startAvatarJourney(gender) {
  return await apiRequest(ENDPOINTS.AVATAR.START_JOURNEY, {
    method: 'POST',
    body: { gender }
  }, true, 'member');
}

// POST /avatar/member-avatar/level-up/ — deducts next_level_cost battle points
export async function avatarLevelUp() {
  return await apiRequest(ENDPOINTS.AVATAR.LEVEL_UP, { method: 'POST' }, true, 'member');
}

// GET /avatar/member-avatar/my-equipment/  (?is_equipped=true|false)
export async function getMyAvatarEquipment(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.MY_EQUIPMENT}${qs}`, { method: 'GET' }, true, 'member');
}

// POST /avatar/member-avatar/equip/ — equipment_uuid is the MEMBER equipment uuid
export async function equipAvatarEquipment(equipmentUuid) {
  return await apiRequest(ENDPOINTS.AVATAR.EQUIP, {
    method: 'POST',
    body: { equipment_uuid: equipmentUuid }
  }, true, 'member');
}

// POST /avatar/member-avatar/unequip/ — back into the backpack (needs space)
export async function unequipAvatarEquipment(equipmentUuid) {
  return await apiRequest(ENDPOINTS.AVATAR.UNEQUIP, {
    method: 'POST',
    body: { equipment_uuid: equipmentUuid }
  }, true, 'member');
}

// POST /avatar/member-avatar/discard/ — charges discard_equipment_cost tokens, 204
export async function discardAvatarEquipment(equipmentUuid) {
  return await apiRequest(ENDPOINTS.AVATAR.DISCARD, {
    method: 'POST',
    body: { equipment_uuid: equipmentUuid }
  }, true, 'member');
}

// GET /avatar/member-avatar/battle-point-history/ (paginated)
export async function getAvatarBattlePointHistory(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.BATTLE_POINT_HISTORY}${qs}`, { method: 'GET' }, true, 'member');
}

// GET /avatar/avatar-missions/my-missions/  (?category=1..4)
export async function getMyAvatarMissions(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.MY_MISSIONS}${qs}`, { method: 'GET' }, true, 'member');
}

// POST /avatar/avatar-missions/{uuid}/claim/
export async function claimAvatarMission(uuid) {
  return await apiRequest(ENDPOINTS.AVATAR.MISSION_CLAIM(uuid), { method: 'POST' }, true, 'member');
}

// GET /avatar/avatar-missions/claim-history/ (paginated)
export async function getAvatarMissionClaimHistory(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.MISSION_CLAIM_HISTORY}${qs}`, { method: 'GET' }, true, 'member');
}

// GET /avatar/member-challenge/status/ — bosses, free attempts, unopened boxes
export async function getAvatarChallengeStatus() {
  return await apiRequest(ENDPOINTS.AVATAR.CHALLENGE_STATUS, { method: 'GET' }, true, 'member');
}

// POST /avatar/member-challenge/attack/ — returns the full dice script + box uuid
export async function attackAvatarBoss(bossUuid) {
  return await apiRequest(ENDPOINTS.AVATAR.CHALLENGE_ATTACK, {
    method: 'POST',
    body: { boss_uuid: bossUuid }
  }, true, 'member');
}

// POST /avatar/member-challenge/open-box/ — draws + applies the reward
export async function openAvatarMysteryBox(boxUuid) {
  return await apiRequest(ENDPOINTS.AVATAR.CHALLENGE_OPEN_BOX, {
    method: 'POST',
    body: { box_uuid: boxUuid }
  }, true, 'member');
}

// GET /avatar/member-challenge/my-boxes/ (paginated, ?is_opened=true|false)
export async function getMyAvatarBoxes(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.CHALLENGE_MY_BOXES}${qs}`, { method: 'GET' }, true, 'member');
}

// GET /avatar/mystery-box-items/ — the admin-configured reward catalog, read
// with the member token to render the "possible rewards" panel.
export async function getAvatarMysteryBoxCatalog(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.MYSTERY_BOX_ITEMS}${qs}`, { method: 'GET' }, true, 'member');
}

// GET /avatar/member-challenge/battle-history/ (paginated)
export async function getAvatarBattleHistory(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.CHALLENGE_BATTLE_HISTORY}${qs}`, { method: 'GET' }, true, 'member');
}
