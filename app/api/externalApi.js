import { apiRequest } from './apiClient';
import { ENDPOINTS } from './api';

// ============================================================================
// EXTERNAL APIs - Public endpoints for third-party integration
// These endpoints do not require authentication
// ============================================================================

// GET /third-party/special-codes/ - Get special codes
export async function getSpecialCode() {
  return await apiRequest(ENDPOINTS.EXTERNAL.SPECIAL_CODE, {
    method: 'GET'
  }, false); // No auth required
}

// GET /third-party/station-wallet-vip/<special_code>/ - Get wallet VIP tiers (public)
export async function getExternalWalletVipTiers(specialCode) {
  return await apiRequest(ENDPOINTS.EXTERNAL.WALLET_VIP_TIERS(specialCode), {
    method: 'GET'
  }, false); // No auth required
}

// GET /third-party/station-floating-menu/<special_code>/ - Get floating menus (public)
export async function getExternalFloatingMenus(specialCode) {
  return await apiRequest(ENDPOINTS.EXTERNAL.FLOATING_MENUS(specialCode), {
    method: 'GET'
  }, false); // No auth required
}
