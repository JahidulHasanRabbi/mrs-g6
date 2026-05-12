import { apiRequest } from './apiClient';
import { ENDPOINTS, BASE_URL } from './api';
import { tokenStorage } from './tokenStorage';
import { buildQueryParams } from './queryParams';

export async function adminLogin(username, password) {
  const response = await apiRequest(ENDPOINTS.ADMIN.LOGIN, {
    method: 'POST',
    body: { username, password }
  }, false);
  
  if (response.access && response.refresh) {
    tokenStorage.setAdminTokens(response.access, response.refresh);
  }
  
  return {
    access: response.access,
    refresh: response.refresh
  };
}

export async function adminLogout(refreshToken) {
  return await apiRequest(ENDPOINTS.ADMIN.LOGOUT, {
    method: 'POST',
    body: { refresh: refreshToken }
  }, true, 'admin');
}

export async function refreshToken(refreshToken) {
  const response = await apiRequest(ENDPOINTS.ADMIN.REFRESH_TOKEN, {
    method: 'POST',
    body: { refresh: refreshToken }
  }, false);
  
  if (response.access && response.refresh) {
    tokenStorage.setAdminTokens(response.access, response.refresh);
  }
  
  return {
    access: response.access,
    refresh: response.refresh
  };
}

export async function verifyToken(accessToken) {
  return await apiRequest(ENDPOINTS.ADMIN.VERIFY_TOKEN, {
    method: 'POST',
    body: { token: accessToken }
  }, false);
}

export async function getVipTiers() {
  return await apiRequest(ENDPOINTS.ADMIN.VIP_TIERS, {
    method: 'GET'
  }, true, 'admin');
}

export async function createVipTier(tierData) {
  return await apiRequest(ENDPOINTS.ADMIN.VIP_TIERS, {
    method: 'POST',
    body: tierData
  }, true, 'admin');
}

export async function updateVipTier(tierUuid, tierData) {
  return await apiRequest(ENDPOINTS.ADMIN.VIP_TIER(tierUuid), {
    method: 'PUT',
    body: tierData
  }, true, 'admin');
}

export async function archiveVipTier(tierUuid) {
  return await apiRequest(ENDPOINTS.ADMIN.ARCHIVE_VIP_TIER(tierUuid), {
    method: 'PATCH'
  }, true, 'admin');
}

export async function getLuckySpinItems() {
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_ITEMS, {
    method: 'GET'
  }, true, 'admin');
}

export async function getLuckySpinItem(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_ITEM(uuid), {
    method: 'GET'
  }, true, 'admin');
}

export async function createLuckySpinItem(itemData) {
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_ITEMS, {
    method: 'POST',
    body: itemData
  }, true, 'admin');
}

export async function updateLuckySpinItem(uuid, itemData) {
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_ITEM(uuid), {
    method: 'PUT',
    body: itemData
  }, true, 'admin');
}

export async function archiveLuckySpinItem(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.ARCHIVE_LUCKY_SPIN_ITEM(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

export async function getLuckySpinSequences() {
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_SEQUENCES, {
    method: 'GET'
  }, true, 'admin');
}

export async function getLuckySpinSequence(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_SEQUENCE(uuid), {
    method: 'GET'
  }, true, 'admin');
}

export async function createLuckySpinSequence(itemOrder, itemUuid) {
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_SEQUENCES, {
    method: 'POST',
    body: { item_order: itemOrder, item_uuid: itemUuid }
  }, true, 'admin');
}

export async function deleteLuckySpinSequence(uuid) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.ADMIN.LUCKY_SPIN_SEQUENCE(uuid)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${tokenStorage.getAdminAccessToken()}`
    }
  });
  
  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: response.statusText };
    }
    throw {
      message: `HTTP error: ${response.status}`,
      status: response.status,
      data: errorData
    };
  }
  
  // DELETE might return 204 No Content, which has no body
  if (response.status === 204) {
    return { success: true };
  }
  
  try {
    return await response.json();
  } catch (e) {
    // If no JSON body, return success
    return { success: true };
  }
}

export async function changeSpinSequencesOrder(luckySpins) {
  return await apiRequest(ENDPOINTS.ADMIN.CHANGE_SPIN_SEQUENCES, {
    method: 'PATCH',
    body: { lucky_spins: luckySpins }
  }, true, 'admin');
}

export async function getMembers() {
  return await apiRequest(ENDPOINTS.ADMIN.MEMBERS, {
    method: 'GET'
  }, true, 'admin');
}

export async function getRedemptionItems() {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_ITEMS, {
    method: 'GET'
  }, true, 'admin');
}

export async function createRedemptionItem(itemData) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_ITEMS, {
    method: 'POST',
    body: itemData
  }, true, 'admin');
}

export async function updateRedemptionItem(uuid, itemData) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_ITEM(uuid), {
    method: 'PUT',
    body: itemData
  }, true, 'admin');
}

export async function archiveRedemptionItem(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.ARCHIVE_REDEMPTION_ITEM(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

export async function getCheckinSettings() {
  return await apiRequest(ENDPOINTS.ADMIN.CHECKIN_SETTINGS, {
    method: 'GET'
  }, true, 'admin');
}

export async function updateCheckinSettings(daySettings) {
  return await apiRequest(ENDPOINTS.ADMIN.CHECKIN_SETTINGS, {
    method: 'POST',
    body: { day_settings: daySettings }
  }, true, 'admin');
}

// Banners Management
export async function getBanners() {
  return await apiRequest(ENDPOINTS.ADMIN.BANNERS, {
    method: 'GET'
  }, true, 'admin');
}

export async function getBanner(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.BANNER(uuid), {
    method: 'GET'
  }, true, 'admin');
}

export async function createBanner(bannerData) {
  return await apiRequest(ENDPOINTS.ADMIN.BANNERS, {
    method: 'POST',
    body: bannerData
  }, true, 'admin');
}

export async function updateBanner(uuid, bannerData) {
  return await apiRequest(ENDPOINTS.ADMIN.BANNER(uuid), {
    method: 'PUT',
    body: bannerData
  }, true, 'admin');
}

export async function archiveBanner(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.ARCHIVE_BANNER(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

// GET /member/token-report/
export async function getTokenReport(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.TOKEN_REPORT}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /member/reward-report/
export async function getRewardReport(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.REWARD_REPORT}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /member/member-list/
export async function getMemberList(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.MEMBER_LIST}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /member/<uuid>/member-deposit/
export async function getMemberDeposit(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.MEMBER_DEPOSIT(memberUuid)}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /member/<uuid>/member-tokens/ (Admin access)
export async function getMemberTokenHistory(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.MEMBER.MEMBER_TOKENS(memberUuid)}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /member/<uuid>/member-rewards/ (Admin access)
export async function getMemberRewardHistory(memberUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.MEMBER.MEMBER_REWARDS(memberUuid)}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /member/member-report/(daily|monthly|yearly)/
export async function getMemberReport(type, params = {}) {
  const qs = buildQueryParams(params);
  let endpoint = ENDPOINTS.ADMIN.MEMBER_REPORT_DAILY;
  if (type === 'monthly') endpoint = ENDPOINTS.ADMIN.MEMBER_REPORT_MONTHLY;
  if (type === 'yearly') endpoint = ENDPOINTS.ADMIN.MEMBER_REPORT_YEARLY;
  return await apiRequest(`${endpoint}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /member/member-list/{uuid}/ - Single member details (view modal)
export async function getMemberListSingle(memberUuid) {
  return await apiRequest(ENDPOINTS.ADMIN.MEMBER_LIST_SINGLE(memberUuid), { method: 'GET' }, true, 'admin');
}

// PUT /member/member-list/{uuid}/ - Edit member
export async function updateMember(memberUuid, data) {
  return await apiRequest(ENDPOINTS.ADMIN.MEMBER_LIST_SINGLE(memberUuid), {
    method: 'PUT',
    body: data
  }, true, 'admin');
}

// GET /front-view/station-list/ - For station filter dropdowns
export async function getStationList() {
  return await apiRequest(ENDPOINTS.ADMIN.STATION_LIST, { method: 'GET' }, true, 'admin');
}

// GET /member/vip-tier/ - reusable for filter dropdowns
export async function getVipTierList() {
  return await apiRequest(ENDPOINTS.ADMIN.VIP_TIERS, { method: 'GET' }, true, 'admin');
}

// Wallet VIP Management
export async function getWalletVipTiers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.WALLET_VIP}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function getWalletVipTier(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.WALLET_VIP_SINGLE(uuid), { method: 'GET' }, true, 'admin');
}

export async function createWalletVipTier(tierData) {
  return await apiRequest(ENDPOINTS.ADMIN.WALLET_VIP, {
    method: 'POST',
    body: tierData
  }, true, 'admin');
}

export async function updateWalletVipTier(uuid, tierData) {
  return await apiRequest(ENDPOINTS.ADMIN.WALLET_VIP_SINGLE(uuid), {
    method: 'PUT',
    body: tierData
  }, true, 'admin');
}

export async function archiveWalletVipTier(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.WALLET_VIP_ARCHIVE(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

// GET /settings/check-in-settings/ - for MRS VIP tier dropdown (returns list of check-in tiers)
// Note: API doc mentions /settings/check-in-tier/ but it doesn't exist. Use check-in-settings instead.
export async function getCheckinTiers() {
  const response = await apiRequest(ENDPOINTS.ADMIN.CHECKIN_SETTINGS, { method: 'GET' }, true, 'admin');
  // Handle paginated response
  return Array.isArray(response) ? response : (response?.results || []);
}

// GET /redemption/redemption-tier/ - for MRS VIP tier dropdown (returns list of mart tiers)
export async function getRedemptionTiers() {
  const response = await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_TIERS, { method: 'GET' }, true, 'admin');
  // Handle paginated response
  return Array.isArray(response) ? response : (response?.results || []);
}

// GET /front-view/member-feedback/ - Get all member feedback (admin)
export async function getMemberFeedback(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`/front-view/member-feedback/${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

// GET /settings/terms-and-conditions/ - Get all terms and conditions
export async function getTermsAndConditions() {
  return await apiRequest('/settings/terms-and-conditions/', {
    method: 'GET'
  }, true, 'admin');
}

// POST /settings/terms-and-conditions/ - Update terms and conditions for a category
export async function updateTermsAndConditions(data) {
  return await apiRequest('/settings/terms-and-conditions/', {
    method: 'POST',
    body: data
  }, true, 'admin');
}

// Front View Dashboard APIs
// GET /front-view/total-users/ - Get total users count
export async function getTotalUsers() {
  return await apiRequest(ENDPOINTS.FRONT_VIEW.TOTAL_USERS, {
    method: 'GET'
  }, true, 'admin');
}

// GET /front-view/active-users/ - Get active users count
export async function getActiveUsers() {
  return await apiRequest(ENDPOINTS.FRONT_VIEW.ACTIVE_USERS, {
    method: 'GET'
  }, true, 'admin');
}

// GET /front-view/daily-check-in/ - Get daily check-in data for last 7 days
export async function getDailyCheckIn() {
  return await apiRequest(ENDPOINTS.FRONT_VIEW.DAILY_CHECK_IN, {
    method: 'GET'
  }, true, 'admin');
}

// GET /front-view/winning-list/ - Get winning list
export async function getWinningList() {
  return await apiRequest(ENDPOINTS.FRONT_VIEW.WINNING_LIST, {
    method: 'GET'
  }, true, 'admin');
}
