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

// POST /front-view/member-feedback/ - Submit member feedback
export async function submitFeedback(feedbackData) {
  console.log('memberApi.submitFeedback called with:', feedbackData);
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
