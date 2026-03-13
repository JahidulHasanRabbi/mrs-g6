import { apiRequest } from './apiClient';
import { ENDPOINTS } from './api';
import { tokenStorage } from './tokenStorage';

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
  return await apiRequest(ENDPOINTS.ADMIN.LUCKY_SPIN_SEQUENCE(uuid), {
    method: 'DELETE'
  }, true, 'admin');
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
