import { apiRequest } from './apiClient';
import { ENDPOINTS, BASE_URL } from './api';
import { tokenStorage } from './tokenStorage';
import { buildQueryParams } from './queryParams';

function storeAdminSession(response) {
  if (response.access && response.refresh) {
    tokenStorage.setAdminTokens(response.access, response.refresh);
  }
  if (response.id || response.uuid || response.username) {
    tokenStorage.setAdminIdentity({
      uuid: response.id || response.uuid,
      username: response.username
    });
  }
  if (response.role) {
    tokenStorage.setAdminRole(response.role);
  }
  if (Array.isArray(response.permissions)) {
    tokenStorage.setAdminPermissions(response.permissions);
  }
}

export async function adminLogin(username, password) {
  tokenStorage.clearAdminTokens();

  const response = await apiRequest(ENDPOINTS.ADMIN.LOGIN, {
    method: 'POST',
    body: { username, password }
  }, false);
  
  storeAdminSession(response);
  
  return response;
}

export async function completeAdminLogin(approvalId) {
  const response = await apiRequest(ENDPOINTS.ADMIN.LOGIN_COMPLETE, {
    method: 'POST',
    body: { approval_id: approvalId }
  }, false);

  storeAdminSession(response);

  return response;
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

  if (response.access) {
    // Some servers only return a new access token on refresh
    tokenStorage.setAdminTokens(response.access, response.refresh || null);
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

export async function getAdminUsers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.USERS}${qs}`, { method: 'GET' }, true, 'admin');
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

// Mission Management
export async function getMissions(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.MISSION.MISSIONS}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function getMission(uuid) {
  return await apiRequest(ENDPOINTS.MISSION.MISSION(uuid), { method: 'GET' }, true, 'admin');
}

export async function createMission(data) {
  return await apiRequest(ENDPOINTS.MISSION.MISSIONS, { method: 'POST', body: data }, true, 'admin');
}

export async function updateMission(uuid, data) {
  return await apiRequest(ENDPOINTS.MISSION.MISSION(uuid), { method: 'PUT', body: data }, true, 'admin');
}

export async function archiveMission(uuid) {
  return await apiRequest(ENDPOINTS.MISSION.ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
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
  const payload = { lucky_spins: luckySpins };
  const response = await fetch(`${BASE_URL}${ENDPOINTS.ADMIN.CHANGE_SPIN_SEQUENCES}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenStorage.getAdminAccessToken()}`
    },
    body: JSON.stringify(payload)
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
  
  // PATCH might return 204 No Content, which has no body
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

export async function getSmashEggItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.SMASH_EGG_ITEMS}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

export async function getSmashEggItem(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.SMASH_EGG_ITEM(uuid), {
    method: 'GET'
  }, true, 'admin');
}

export async function createSmashEggItem(itemData) {
  return await apiRequest(ENDPOINTS.ADMIN.SMASH_EGG_ITEMS, {
    method: 'POST',
    body: itemData
  }, true, 'admin');
}

export async function updateSmashEggItem(uuid, itemData) {
  return await apiRequest(ENDPOINTS.ADMIN.SMASH_EGG_ITEM(uuid), {
    method: 'PUT',
    body: itemData
  }, true, 'admin');
}

export async function archiveSmashEggItem(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.ARCHIVE_SMASH_EGG_ITEM(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

export async function getSmashEggSequences(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.SMASH_EGG_SEQUENCES}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

export async function createSmashEggSequence(itemOrder, itemUuid) {
  return await apiRequest(ENDPOINTS.ADMIN.SMASH_EGG_SEQUENCES, {
    method: 'POST',
    body: { item_order: itemOrder, item_uuid: itemUuid }
  }, true, 'admin');
}

export async function deleteSmashEggSequence(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.SMASH_EGG_SEQUENCE(uuid), {
    method: 'DELETE'
  }, true, 'admin');
}

export async function changeSmashEggSequencesOrder(smashes) {
  return await apiRequest(ENDPOINTS.ADMIN.CHANGE_SMASH_EGG_SEQUENCES, {
    method: 'PATCH',
    body: { smashes }
  }, true, 'admin');
}

export async function getSmashEggSettings() {
  return await apiRequest(ENDPOINTS.ADMIN.SMASH_EGG_SETTINGS, {
    method: 'GET'
  }, true, 'admin');
}

export async function updateSmashEggSettings(settingsData) {
  return await apiRequest(ENDPOINTS.ADMIN.SMASH_EGG_SETTINGS, {
    method: 'POST',
    body: settingsData
  }, true, 'admin');
}

export async function getMembers() {
  return await apiRequest(`${ENDPOINTS.ADMIN.MEMBERS}?page_size=1000`, {
    method: 'GET'
  }, true, 'admin');
}

export async function getRedemptionItems() {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_ITEMS, {
    method: 'GET'
  }, true, 'admin');
}

export async function getRedemptionItem(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_ITEM(uuid), {
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

// Redeem Links Management
export async function getRedeemLinks(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.REDEEM_LINKS}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

export async function getRedeemLink(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEEM_LINK(uuid), {
    method: 'GET'
  }, true, 'admin');
}

export async function createRedeemLink(data) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEEM_LINKS, {
    method: 'POST',
    body: data
  }, true, 'admin');
}

export async function updateRedeemLink(uuid, data) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEEM_LINK(uuid), {
    method: 'PUT',
    body: data
  }, true, 'admin');
}

export async function archiveRedeemLink(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEEM_LINK_ARCHIVE(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

export async function getRedeemLinkHistory(uuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.REDEEM_LINK_HISTORY(uuid)}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

// GET /redemption/dashboard/kpi/ - redeem link KPI totals.
// from_date/to_date are all-or-nothing: sending only one returns 400
// ("use YYYY-MM-DD for both"), so an incomplete range falls back to all-time.
export async function getRedeemLinkKpi({ from_date, to_date } = {}) {
  const params = from_date && to_date ? { from_date, to_date } : {};
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.REDEEM_LINK_KPI}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

export async function getRedemptionSettings() {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_SETTINGS, {
    method: 'GET'
  }, true, 'admin');
}

export async function updateRedemptionSettings(settingsData) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_SETTINGS, {
    method: 'POST',
    body: settingsData
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

// Promotions (Settings → Promotions)

// GET /settings/available-promotions/ -> [{ value, label }] promotion type options
export async function getAvailablePromotions() {
  return await apiRequest(ENDPOINTS.ADMIN.AVAILABLE_PROMOTIONS, { method: 'GET' }, true, 'admin');
}

// GET /settings/promotions/get-by-station/<station_uuid>/
export async function getPromotionsByStation(stationUuid) {
  return await apiRequest(ENDPOINTS.ADMIN.PROMOTIONS_BY_STATION(stationUuid), { method: 'GET' }, true, 'admin');
}

// POST /settings/promotions/
// body: { station_id, promotions: [{ promotion_type, item_uuid | item_name, promotion_code }] }
export async function createPromotion(data) {
  return await apiRequest(ENDPOINTS.ADMIN.PROMOTIONS, {
    method: 'POST',
    body: data
  }, true, 'admin');
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

// GET /redemption/redemption-tier/{uuid}/ - Get single redemption tier
export async function getRedemptionTier(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_TIER_SINGLE(uuid), {
    method: 'GET'
  }, true, 'admin');
}

// POST /redemption/redemption-tier/ - Create redemption tier
export async function createRedemptionTier(tierData) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_TIERS, {
    method: 'POST',
    body: tierData
  }, true, 'admin');
}

// PUT /redemption/redemption-tier/{uuid}/ - Update redemption tier
export async function updateRedemptionTier(uuid, tierData) {
  return await apiRequest(ENDPOINTS.ADMIN.REDEMPTION_TIER_SINGLE(uuid), {
    method: 'PUT',
    body: tierData
  }, true, 'admin');
}

// PATCH /redemption/redemption-tier/{uuid}/archive/ - Archive redemption tier
export async function archiveRedemptionTier(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.ARCHIVE_REDEMPTION_TIER(uuid), {
    method: 'PATCH'
  }, true, 'admin');
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

// GET /usage-report/summary/
export async function getUsageReportSummary(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.USAGE_REPORT.SUMMARY}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /usage-report/games/
export async function getUsageReportGames(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.USAGE_REPORT.GAMES}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /usage-report/games/retention/
export async function getUsageReportRetention(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.USAGE_REPORT.RETENTION}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /usage-report/insights/
export async function getUsageReportInsights(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.USAGE_REPORT.INSIGHTS}${qs}`, { method: 'GET' }, true, 'admin');
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

// ============================================================================
// FLOATING MENU MANAGEMENT
// ============================================================================

// GET /third-party/floating-menu/ - Get all floating menus
export async function getFloatingMenus(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.FLOATING_MENU}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

// GET /third-party/floating-menu/{uuid}/ - Get single floating menu
export async function getFloatingMenu(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.FLOATING_MENU_SINGLE(uuid), {
    method: 'GET'
  }, true, 'admin');
}

// POST /third-party/floating-menu/ - Create floating menu
export async function createFloatingMenu(menuData) {
  return await apiRequest(ENDPOINTS.ADMIN.FLOATING_MENU, {
    method: 'POST',
    body: menuData
  }, true, 'admin');
}

// PUT /third-party/floating-menu/{uuid}/ - Update floating menu
export async function updateFloatingMenu(uuid, menuData) {
  return await apiRequest(ENDPOINTS.ADMIN.FLOATING_MENU_SINGLE(uuid), {
    method: 'PUT',
    body: menuData
  }, true, 'admin');
}

// PATCH /third-party/floating-menu/{uuid}/archive/ - Archive floating menu
export async function archiveFloatingMenu(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.FLOATING_MENU_ARCHIVE(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

// ============================================================================
// FLOATING MENU ROOT ICON MANAGEMENT
// ============================================================================

// GET /third-party/floating-menu-root-icon/ - Get all root icons
export async function getFloatingMenuRootIcons(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.FLOATING_MENU_ROOT_ICON}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

// POST /third-party/floating-menu-root-icon/ - Create/Update root icon
// Note: This endpoint overwrites the previous icon for the station
export async function createOrUpdateRootIcon(rootIconData) {
  return await apiRequest(ENDPOINTS.ADMIN.FLOATING_MENU_ROOT_ICON, {
    method: 'POST',
    body: rootIconData
  }, true, 'admin');
}

// ============================================================================
// FRAMES MANAGEMENT
// ============================================================================

// GET /settings/frames/ - Get all frames
export async function getFrames(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.FRAMES}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

// GET /settings/frames/{uuid}/ - Get single frame
export async function getFrame(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.FRAME_SINGLE(uuid), {
    method: 'GET'
  }, true, 'admin');
}

// POST /settings/frames/ - Create frame
export async function createFrame(frameData) {
  return await apiRequest(ENDPOINTS.ADMIN.FRAMES, {
    method: 'POST',
    body: frameData
  }, true, 'admin');
}

// PUT /settings/frames/{uuid}/ - Update frame
export async function updateFrame(uuid, frameData) {
  return await apiRequest(ENDPOINTS.ADMIN.FRAME_SINGLE(uuid), {
    method: 'PUT',
    body: frameData
  }, true, 'admin');
}

// PATCH /settings/frames/{uuid}/archive/ - Archive frame
export async function archiveFrame(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.FRAME_ARCHIVE(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

// ============================================================================
// MISSION SETTINGS
// ============================================================================

export async function getMissionSettings() {
  return await apiRequest(ENDPOINTS.ADMIN.MISSION_SETTINGS, {
    method: 'GET'
  }, true, 'admin');
}

export async function updateMissionSettings(data) {
  return await apiRequest(ENDPOINTS.ADMIN.MISSION_SETTINGS, {
    method: 'POST',
    body: data
  }, true, 'admin');
}

// ============================================================================
// PENALTY KICK MANAGEMENT
// ============================================================================

export async function getPenaltyKickSettings() {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_SETTINGS, {
    method: 'GET'
  }, true, 'admin');
}

export async function updatePenaltyKickSettings(settingsData) {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_SETTINGS, {
    method: 'POST',
    body: settingsData
  }, true, 'admin');
}

export async function getPenaltyKickItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.PENALTY_KICK_ITEMS}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

export async function getPenaltyKickItem(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_ITEM(uuid), {
    method: 'GET'
  }, true, 'admin');
}

export async function createPenaltyKickItem(itemData) {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_ITEMS, {
    method: 'POST',
    body: itemData
  }, true, 'admin');
}

export async function updatePenaltyKickItem(uuid, itemData) {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_ITEM(uuid), {
    method: 'PUT',
    body: itemData
  }, true, 'admin');
}

export async function archivePenaltyKickItem(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_ITEM_ARCHIVE(uuid), {
    method: 'PATCH'
  }, true, 'admin');
}

export async function getPenaltyKickSequences(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.ADMIN.PENALTY_KICK_SEQUENCES}${qs}`, {
    method: 'GET'
  }, true, 'admin');
}

export async function createPenaltyKickSequence(itemOrder, itemUuid) {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_SEQUENCES, {
    method: 'POST',
    body: { item_order: itemOrder, item_uuid: itemUuid }
  }, true, 'admin');
}

export async function deletePenaltyKickSequence(uuid) {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_SEQUENCE(uuid), {
    method: 'DELETE'
  }, true, 'admin');
}

export async function reorderPenaltyKickSequences(kicks) {
  return await apiRequest(ENDPOINTS.ADMIN.PENALTY_KICK_SEQUENCE_REORDER, {
    method: 'PATCH',
    body: { kicks }
  }, true, 'admin');
}

// ============================================================================
// WORLD CUP - ADMIN
// ============================================================================

// GET/POST /worldcup/settings/
export async function getWorldCupSettings() {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.SETTINGS, { method: 'GET' }, true, 'admin');
}
export async function updateWorldCupSettings(data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.SETTINGS, { method: 'POST', body: data }, true, 'admin');
}

// Countries - Read only (countries are 1-10, managed by backend)
export async function getWorldCupCountries(params = {}) {
  const qs = buildQueryParams(params);
  // Use the user endpoint since admin doesn't have a separate country list endpoint
  return await apiRequest(`${ENDPOINTS.WORLDCUP_USER.COUNTRY_LIST}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getWorldCupMatchCountries() {
  // Match creation and prediction use the separate 48-country reference list.
  return await apiRequest(ENDPOINTS.WORLDCUP_USER.MATCH_COUNTRY_LIST, { method: 'GET' }, true, 'admin');
}

// Banners CRUD
export async function getWorldCupBanners(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_ADMIN.BANNERS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getWorldCupBanner(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.BANNER(uuid), { method: 'GET' }, true, 'admin');
}
export async function createWorldCupBanner(data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.BANNERS, { method: 'POST', body: data }, true, 'admin');
}
export async function updateWorldCupBanner(uuid, data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.BANNER(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveWorldCupBanner(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.BANNER_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// Reward Items CRUD
export async function getWorldCupRewardItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_ADMIN.REWARD_ITEMS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getWorldCupRewardItem(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.REWARD_ITEM(uuid), { method: 'GET' }, true, 'admin');
}
export async function createWorldCupRewardItem(data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.REWARD_ITEMS, { method: 'POST', body: data }, true, 'admin');
}
export async function updateWorldCupRewardItem(uuid, data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.REWARD_ITEM(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveWorldCupRewardItem(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.REWARD_ITEM_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// Matches CRUD
export async function getWorldCupMatches(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_ADMIN.MATCHES}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getWorldCupMatch(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.MATCH(uuid), { method: 'GET' }, true, 'admin');
}
export async function createWorldCupMatch(data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.MATCHES, { method: 'POST', body: data }, true, 'admin');
}
export async function updateWorldCupMatch(uuid, data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.MATCH(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveWorldCupMatch(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.MATCH_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}
export async function settleWorldCupMatch(uuid, winnerUuid) {
  const winner = Number(winnerUuid);
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.MATCH_SETTLE(uuid), { method: 'POST', body: { winner } }, true, 'admin');
}

// Dummy Players CRUD
export async function getWorldCupDummyPlayers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_ADMIN.DUMMY_PLAYERS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getWorldCupDummyPlayer(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.DUMMY_PLAYER(uuid), { method: 'GET' }, true, 'admin');
}
export async function createWorldCupDummyPlayer(data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.DUMMY_PLAYERS, { method: 'POST', body: data }, true, 'admin');
}
export async function updateWorldCupDummyPlayer(uuid, data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.DUMMY_PLAYER(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveWorldCupDummyPlayer(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.DUMMY_PLAYER_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// Dummy Countries CRUD
export async function getWorldCupDummyCountries(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_ADMIN.DUMMY_COUNTRIES}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getWorldCupDummyCountry(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.DUMMY_COUNTRY(uuid), { method: 'GET' }, true, 'admin');
}
export async function createWorldCupDummyCountry(data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.DUMMY_COUNTRIES, { method: 'POST', body: data }, true, 'admin');
}
export async function updateWorldCupDummyCountry(uuid, data) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.DUMMY_COUNTRY(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveWorldCupDummyCountry(uuid) {
  return await apiRequest(ENDPOINTS.WORLDCUP_ADMIN.DUMMY_COUNTRY_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// GET /worldcup/ranking/realtime/  (real members only; supports scope, country,
// period, from_date/to_date, total_win, winning_streak)
export async function getWorldCupRankingRealtime(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_ADMIN.RANKING_REALTIME}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /worldcup/dashboard/kpi/  (period: 1=daily; or from_date/to_date)
export async function getWorldCupDashboardKpi(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.WORLDCUP_ADMIN.DASHBOARD_KPI}${qs}`, { method: 'GET' }, true, 'admin');
}

// ===========================================================================
// LEADERBOARD (Deposit / Withdraw / Referral) — postman/leaderboard.md
//
// leaderboard_type: 1 = Deposit, 2 = Withdraw, 3 = Referral.
// "Banner" functions below map to the shared Info endpoint (information +
// terms_and_conditions), selected/created per board via leaderboard_type.
// "Dummy player" functions map to the per-board fake-data endpoint.
// ===========================================================================

const LB_TYPE = { deposit: 1, withdraw: 2, referral: 3 };

// --- Info (shared endpoint, filtered/created by leaderboard_type) -----------
async function getLeaderboardInfoList(type, params = {}) {
  const qs = buildQueryParams({ type, ...params });
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.INFO}${qs}`, { method: 'GET' }, true, 'admin');
}
async function getLeaderboardInfo(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.INFO_SINGLE(uuid), { method: 'GET' }, true, 'admin');
}
async function createLeaderboardInfo(type, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.INFO, { method: 'POST', body: { leaderboard_type: type, ...data } }, true, 'admin');
}
async function updateLeaderboardInfo(uuid, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.INFO_SINGLE(uuid), { method: 'PUT', body: data }, true, 'admin');
}
async function archiveLeaderboardInfo(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.INFO_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// --- Status (single global flag) -------------------------------------------
export async function getLeaderboardStatus() {
  return await apiRequest(ENDPOINTS.LEADERBOARD.STATUS, { method: 'GET' }, true, 'admin');
}
export async function updateLeaderboardStatus(isOpen) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.STATUS, { method: 'PUT', body: { is_open: Boolean(isOpen) } }, true, 'admin');
}

// --- Campaign (shared endpoint, filtered/created by leaderboard_type) -------
export async function getLeaderboardCampaigns(type, params = {}) {
  const qs = buildQueryParams({ type, ...params });
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.CAMPAIGN}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getLeaderboardCampaign(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.CAMPAIGN_SINGLE(uuid), { method: 'GET' }, true, 'admin');
}
export async function createLeaderboardCampaign(type, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.CAMPAIGN, { method: 'POST', body: { leaderboard_type: type, ...data } }, true, 'admin');
}
export async function updateLeaderboardCampaign(uuid, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.CAMPAIGN_SINGLE(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveLeaderboardCampaign(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.CAMPAIGN_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// --- Generate Ranking (Top 20 batch for one board) -------------------------
export async function generateLeaderboardRanking(type) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.GENERATE_RANKING, { method: 'POST', body: { leaderboard_type: type } }, true, 'admin');
}

export async function getLeaderboardRealRanking(type) {
  const qs = buildQueryParams({ type });
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.REAL_RANKING}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function getLeaderboardExclusions(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.EXCLUSIONS}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function createLeaderboardExclusions(memberIds) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.EXCLUSIONS, {
    method: 'POST',
    body: { member_ids: memberIds },
  }, true, 'admin');
}

export async function archiveLeaderboardExclusion(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.EXCLUSION_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// ---------------------------------------------------------------------------
// Deposit Leaderboard
// ---------------------------------------------------------------------------
export const getDepositBanners = (params = {}) => getLeaderboardInfoList(LB_TYPE.deposit, params);
export const getDepositBanner = (uuid) => getLeaderboardInfo(uuid);
export const createDepositBanner = (data) => createLeaderboardInfo(LB_TYPE.deposit, data);
export const updateDepositBanner = (uuid, data) => updateLeaderboardInfo(uuid, data);
export const archiveDepositBanner = (uuid) => archiveLeaderboardInfo(uuid);

export async function getDepositRewardItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.DEPOSIT_REWARD_ITEMS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getDepositRewardItem(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.DEPOSIT_REWARD_ITEM(uuid), { method: 'GET' }, true, 'admin');
}
export async function createDepositRewardItem(data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.DEPOSIT_REWARD_ITEMS, { method: 'POST', body: data }, true, 'admin');
}
export async function updateDepositRewardItem(uuid, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.DEPOSIT_REWARD_ITEM(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveDepositRewardItem(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.DEPOSIT_REWARD_ITEM_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

export async function getDepositDummyPlayers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.DEPOSIT_FAKE_DATA}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getDepositDummyPlayer(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.DEPOSIT_FAKE_DATA_SINGLE(uuid), { method: 'GET' }, true, 'admin');
}
export async function createDepositDummyPlayer(data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.DEPOSIT_FAKE_DATA, { method: 'POST', body: data }, true, 'admin');
}
export async function updateDepositDummyPlayer(uuid, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.DEPOSIT_FAKE_DATA_SINGLE(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveDepositDummyPlayer(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.DEPOSIT_FAKE_DATA_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// ---------------------------------------------------------------------------
// Referrer Leaderboard (referral board, leaderboard_type 3)
// ---------------------------------------------------------------------------
export const getReferrerBanners = (params = {}) => getLeaderboardInfoList(LB_TYPE.referral, params);
export const getReferrerBanner = (uuid) => getLeaderboardInfo(uuid);
export const createReferrerBanner = (data) => createLeaderboardInfo(LB_TYPE.referral, data);
export const updateReferrerBanner = (uuid, data) => updateLeaderboardInfo(uuid, data);
export const archiveReferrerBanner = (uuid) => archiveLeaderboardInfo(uuid);

export async function getReferrerRewardItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.REFERRAL_REWARD_ITEMS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getReferrerRewardItem(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.REFERRAL_REWARD_ITEM(uuid), { method: 'GET' }, true, 'admin');
}
export async function createReferrerRewardItem(data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.REFERRAL_REWARD_ITEMS, { method: 'POST', body: data }, true, 'admin');
}
export async function updateReferrerRewardItem(uuid, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.REFERRAL_REWARD_ITEM(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveReferrerRewardItem(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.REFERRAL_REWARD_ITEM_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

export async function getReferrerDummyPlayers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.REFERRAL_FAKE_DATA}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getReferrerDummyPlayer(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.REFERRAL_FAKE_DATA_SINGLE(uuid), { method: 'GET' }, true, 'admin');
}
export async function createReferrerDummyPlayer(data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.REFERRAL_FAKE_DATA, { method: 'POST', body: data }, true, 'admin');
}
export async function updateReferrerDummyPlayer(uuid, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.REFERRAL_FAKE_DATA_SINGLE(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveReferrerDummyPlayer(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.REFERRAL_FAKE_DATA_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// ---------------------------------------------------------------------------
// Withdrawal Leaderboard (withdraw board, leaderboard_type 2)
// ---------------------------------------------------------------------------
export const getWithdrawalBanners = (params = {}) => getLeaderboardInfoList(LB_TYPE.withdraw, params);
export const getWithdrawalBanner = (uuid) => getLeaderboardInfo(uuid);
export const createWithdrawalBanner = (data) => createLeaderboardInfo(LB_TYPE.withdraw, data);
export const updateWithdrawalBanner = (uuid, data) => updateLeaderboardInfo(uuid, data);
export const archiveWithdrawalBanner = (uuid) => archiveLeaderboardInfo(uuid);

export async function getWithdrawalRewardItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.WITHDRAW_REWARD_ITEMS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getWithdrawalRewardItem(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.WITHDRAW_REWARD_ITEM(uuid), { method: 'GET' }, true, 'admin');
}
export async function createWithdrawalRewardItem(data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.WITHDRAW_REWARD_ITEMS, { method: 'POST', body: data }, true, 'admin');
}
export async function updateWithdrawalRewardItem(uuid, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.WITHDRAW_REWARD_ITEM(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveWithdrawalRewardItem(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.WITHDRAW_REWARD_ITEM_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

export async function getWithdrawalDummyPlayers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.LEADERBOARD.WITHDRAW_FAKE_DATA}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getWithdrawalDummyPlayer(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.WITHDRAW_FAKE_DATA_SINGLE(uuid), { method: 'GET' }, true, 'admin');
}
export async function createWithdrawalDummyPlayer(data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.WITHDRAW_FAKE_DATA, { method: 'POST', body: data }, true, 'admin');
}
export async function updateWithdrawalDummyPlayer(uuid, data) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.WITHDRAW_FAKE_DATA_SINGLE(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveWithdrawalDummyPlayer(uuid) {
  return await apiRequest(ENDPOINTS.LEADERBOARD.WITHDRAW_FAKE_DATA_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// ============================================================================
// AVATAR RPG (Phase 3) — back office
// ============================================================================

// GET /avatar/settings/ — single shared settings row (game status, costs, terms)
export async function getAvatarSettings() {
  return await apiRequest(ENDPOINTS.AVATAR.SETTINGS, { method: 'GET' }, true, 'admin');
}

// POST /avatar/settings/ — partial update, returns the full settings row
export async function updateAvatarSettings(data) {
  return await apiRequest(ENDPOINTS.AVATAR.SETTINGS, { method: 'POST', body: data }, true, 'admin');
}

// Equipment items — fixed catalog of 4 (one per slot). No create/archive.
export async function getAvatarEquipmentItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.EQUIPMENT_ITEMS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getAvatarEquipmentItem(uuid) {
  return await apiRequest(ENDPOINTS.AVATAR.EQUIPMENT_ITEM(uuid), { method: 'GET' }, true, 'admin');
}
export async function updateAvatarEquipmentItem(uuid, data) {
  // PATCH: only name / power_bonus are editable; slot_type is immutable
  return await apiRequest(ENDPOINTS.AVATAR.EQUIPMENT_ITEM(uuid), { method: 'PATCH', body: data }, true, 'admin');
}

// Bosses — fixed catalog of 4 (one per planet). No create/archive.
export async function getAvatarBosses(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.BOSSES}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getAvatarBoss(uuid) {
  return await apiRequest(ENDPOINTS.AVATAR.BOSS(uuid), { method: 'GET' }, true, 'admin');
}
export async function updateAvatarBoss(uuid, data) {
  // PATCH: power_required / hp / dice_threshold / equipment_reward_slot / is_active; planet is immutable
  return await apiRequest(ENDPOINTS.AVATAR.BOSS(uuid), { method: 'PATCH', body: data }, true, 'admin');
}

// Avatar missions — full CRUD + archive
export async function getAvatarMissions(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.MISSIONS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getAvatarMission(uuid) {
  return await apiRequest(ENDPOINTS.AVATAR.MISSION(uuid), { method: 'GET' }, true, 'admin');
}
export async function createAvatarMission(data) {
  return await apiRequest(ENDPOINTS.AVATAR.MISSIONS, { method: 'POST', body: data }, true, 'admin');
}
export async function updateAvatarMission(uuid, data) {
  return await apiRequest(ENDPOINTS.AVATAR.MISSION(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveAvatarMission(uuid) {
  return await apiRequest(ENDPOINTS.AVATAR.MISSION_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// Mystery box items — full CRUD + archive. `image` may be a File (auto formdata).
export async function getMysteryBoxItems(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.AVATAR.MYSTERY_BOX_ITEMS}${qs}`, { method: 'GET' }, true, 'admin');
}
export async function getMysteryBoxItem(uuid) {
  return await apiRequest(ENDPOINTS.AVATAR.MYSTERY_BOX_ITEM(uuid), { method: 'GET' }, true, 'admin');
}
export async function createMysteryBoxItem(data) {
  return await apiRequest(ENDPOINTS.AVATAR.MYSTERY_BOX_ITEMS, { method: 'POST', body: data }, true, 'admin');
}
export async function updateMysteryBoxItem(uuid, data) {
  return await apiRequest(ENDPOINTS.AVATAR.MYSTERY_BOX_ITEM(uuid), { method: 'PUT', body: data }, true, 'admin');
}
export async function archiveMysteryBoxItem(uuid) {
  return await apiRequest(ENDPOINTS.AVATAR.MYSTERY_BOX_ITEM_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// GET /avatar/mystery-box-items/probability-total/ — { total, is_valid }
// Active item probabilities should sum to exactly 1.
export async function getMysteryBoxProbabilityTotal() {
  return await apiRequest(ENDPOINTS.AVATAR.MYSTERY_BOX_PROBABILITY_TOTAL, { method: 'GET' }, true, 'admin');
}
