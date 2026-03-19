import { apiRequest } from './apiClient';
import { ENDPOINTS } from './api';
import { tokenStorage } from './tokenStorage';

// POST /login/generate-token/
export async function generateMemberToken(id, o) {
  const response = await apiRequest(ENDPOINTS.MEMBER.GENERATE_TOKEN, {
    method: 'POST',
    body: JSON.stringify({ id, o })
  }, false);
  
  if (response.access && response.member_uuid) {
    tokenStorage.setMemberTokens(response.access, response.member_uuid);
  }
  
  return {
    access: response.access,
    member_uuid: response.member_uuid,
    tokens_obtained: response.tokens_obtained
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

// PUT /member/{uuid}/profile/
export async function updateProfile(memberUuid, data) {
  return await apiRequest(ENDPOINTS.MEMBER.UPDATE_PROFILE(memberUuid), {
    method: 'PATCH',
    body: data
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

// GET /settings/checkin-settings/ (using member token)
export async function getCheckinSettings() {
  return await apiRequest(ENDPOINTS.ADMIN.CHECKIN_SETTINGS, {
    method: 'GET'
  }, true, 'member');
}
