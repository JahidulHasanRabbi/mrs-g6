import { apiRequest } from './apiClient';
import { ENDPOINTS } from './api';

// ============================================================================
// EXTERNAL APIs - Public endpoints for third-party integration
// These endpoints do not require authentication
// ============================================================================

// GET /external/special-code/ - Get special promotional code
export async function getSpecialCode() {
  return await apiRequest(ENDPOINTS.EXTERNAL.SPECIAL_CODE, {
    method: 'GET'
  }, false); // No auth required
}

// GET /external/wallet-vip-tiers/ - Get wallet VIP tiers (public)
export async function getExternalWalletVipTiers() {
  return await apiRequest(ENDPOINTS.EXTERNAL.WALLET_VIP_TIERS, {
    method: 'GET'
  }, false); // No auth required
}

// GET /external/floating-menus/ - Get floating menus (public)
export async function getExternalFloatingMenus() {
  return await apiRequest(ENDPOINTS.EXTERNAL.FLOATING_MENUS, {
    method: 'GET'
  }, false); // No auth required
}
