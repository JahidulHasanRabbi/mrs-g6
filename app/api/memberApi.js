import { apiRequest } from './apiClient';
import { ENDPOINTS } from './api';
import { tokenStorage } from './tokenStorage';

export async function generateMemberToken(id, o) {
  const response = await apiRequest(ENDPOINTS.MEMBER.GENERATE_TOKEN, {
    method: 'POST',
    body: JSON.stringify({ id, o })
  }, false);
  
  if (response.access && response.refresh && response.member_uuid) {
    tokenStorage.setMemberTokens(response.access, response.refresh, response.member_uuid);
  }
  
  return {
    access: response.access,
    refresh: response.refresh,
    member_uuid: response.member_uuid,
    tokens_obtained: response.tokens_obtained
  };
}

export async function checkIn() {
  return await apiRequest(ENDPOINTS.MEMBER.CHECK_IN, {
    method: 'POST'
  }, true, 'member');
}

export async function claimWelcomeGift() {
  return await apiRequest(ENDPOINTS.MEMBER.WELCOME_GIFT, {
    method: 'POST'
  }, true, 'member');
}

export async function getMemberInfo(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.MEMBER_INFO(memberUuid), {
    method: 'GET'
  }, true, 'member');
}

export async function performOneSpin(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.ONE_SPIN(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

export async function performTenSpin(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.TEN_SPIN(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

export async function performFiftySpin(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.FIFTY_SPIN(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

export async function performHundredSpin(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.HUNDRED_SPIN(memberUuid), {
    method: 'POST'
  }, true, 'member');
}

export async function getMemberProfile(memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.PROFILE(memberUuid), {
    method: 'GET'
  }, true, 'member');
}

export async function updateMemberProfile(memberUuid, profileData) {
  return await apiRequest(ENDPOINTS.MEMBER.UPDATE_PROFILE(memberUuid), {
    method: 'PATCH',
    body: JSON.stringify(profileData)
  }, true, 'member');
}

export async function getAllRedemptionItems() {
  return await apiRequest(ENDPOINTS.MEMBER.ALL_REDEMPTION_ITEMS, {
    method: 'GET'
  }, true, 'member');
}

export async function getAvailableRedemptionItems() {
  return await apiRequest(ENDPOINTS.MEMBER.AVAILABLE_REDEMPTION_ITEMS, {
    method: 'GET'
  }, true, 'member');
}

export async function redeemItem(itemUuid, memberUuid) {
  return await apiRequest(ENDPOINTS.MEMBER.REDEEM_ITEM(itemUuid), {
    method: 'POST',
    body: JSON.stringify({ member_uuid: memberUuid })
  }, true, 'member');
}
