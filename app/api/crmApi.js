import { apiRequest } from './apiClient';
import { ENDPOINTS } from './api';
import { buildQueryParams } from './queryParams';

// ───────────────────────── User Access Panel ──────────────────────

// GET /admins/users/  (paginated)
// params: { page, page_size }
export async function getCrmUsers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.USERS}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function getCrmUserSingle(uuid) {
  return await apiRequest(ENDPOINTS.CRM.USER_SINGLE(uuid), { method: 'GET' }, true, 'admin');
}

export async function createCrmUser(data) {
  return await apiRequest(ENDPOINTS.CRM.USERS, {
    method: 'POST',
    body: data
  }, true, 'admin');
}

export async function updateCrmUser(uuid, data) {
  return await apiRequest(ENDPOINTS.CRM.USER_SINGLE(uuid), {
    method: 'PATCH',
    body: data
  }, true, 'admin');
}

export async function getCrmRoles(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.ROLES}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function getCrmLoginRequests(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.LOGIN_REQUESTS}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function approveCrmLoginRequest(uuid) {
  return await apiRequest(ENDPOINTS.CRM.LOGIN_REQUEST_APPROVE(uuid), { method: 'PATCH' }, true, 'admin');
}

export async function rejectCrmLoginRequest(uuid) {
  return await apiRequest(ENDPOINTS.CRM.LOGIN_REQUEST_REJECT(uuid), { method: 'PATCH' }, true, 'admin');
}

export async function getCrmActivityLog(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.ACTIVITY_LOG}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function getCrmPermissions() {
  return await apiRequest(ENDPOINTS.CRM.PERMISSIONS, { method: 'GET' }, true, 'admin');
}

export async function createCrmRole(data) {
  return await apiRequest(ENDPOINTS.CRM.ROLES, {
    method: 'POST',
    body: data
  }, true, 'admin');
}

export async function updateCrmRole(uuid, data) {
  return await apiRequest(ENDPOINTS.CRM.ROLE_SINGLE(uuid), {
    method: 'PUT',
    body: data
  }, true, 'admin');
}

export async function archiveCrmRole(uuid) {
  return await apiRequest(ENDPOINTS.CRM.ROLE_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// ───────────────────────── CRM VIP Tiers ──────────────────────────

// GET /member/vip-tier/  (paginated)
// params: { page, page_size }
export async function getCrmVipTiers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.CRM_VIP_TIERS}${qs}`, { method: 'GET' }, true, 'admin');
}

export async function createCrmVipTier(data) {
  return await apiRequest(ENDPOINTS.CRM.CRM_VIP_TIERS, { method: 'POST', body: data }, true, 'admin');
}

export async function updateCrmVipTier(uuid, data) {
  return await apiRequest(ENDPOINTS.CRM.CRM_VIP_TIER_SINGLE(uuid), { method: 'PUT', body: data }, true, 'admin');
}

export async function archiveCrmVipTier(uuid) {
  return await apiRequest(ENDPOINTS.CRM.CRM_VIP_TIER_ARCHIVE(uuid), { method: 'PATCH' }, true, 'admin');
}

// ───────────────────────── Member Profile ─────────────────────────

// GET /crm-members/members/  (paginated)
// params: { page, page_size, priority, wallet_vip_level, mrs_vip_level, retention, search }
export async function getCrmMembers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.MEMBERS}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-members/members/<uuid>/
export async function getCrmMemberSingle(memberUuid) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_SINGLE(memberUuid), { method: 'GET' }, true, 'admin');
}

// PATCH /crm-members/members/<uuid>/
// body: { profile_data, basic_info, game_info }
export async function updateCrmMember(memberUuid, data) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_SINGLE(memberUuid), {
    method: 'PATCH',
    body: data
  }, true, 'admin');
}

export async function patchCrmMember(memberUuid, data) {
  return updateCrmMember(memberUuid, data);
}

// ──────────────────────── Retention Alert ────────────────────────

// GET /crm-members/priority-summary/
export async function getPrioritySummary() {
  return await apiRequest(ENDPOINTS.CRM.PRIORITY_SUMMARY, { method: 'GET' }, true, 'admin');
}

// POST /crm-members/refresh-members/
export async function refreshCrmMembers() {
  return await apiRequest(ENDPOINTS.CRM.REFRESH_MEMBERS, { method: 'POST' }, true, 'admin');
}

// ──────────────────────── Retention Profile ──────────────────────

// GET /crm-members/retention-summary/<admin_uuid>/
// params: { type, from_date, to_date }  type: 1=Daily 2=Monthly 3=Yearly 4=Input
export async function getRetentionSummary(adminUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.RETENTION_SUMMARY(adminUuid)}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-members/retention-members/  (paginated)
// params: { page, page_size, from_date, to_date, vip_level, from_sales, to_sales, search }
export async function getRetentionMembers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.RETENTION_MEMBERS}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-members/<admin_uuid>/admin-members/  (paginated)
// params: { page, page_size, from_date, to_date, vip_level, from_sales, to_sales, search }
export async function getAdminMembers(adminUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.ADMIN_MEMBERS(adminUuid)}${qs}`, { method: 'GET' }, true, 'admin');
}

// ─────────────────────────── Dashboard ───────────────────────────

// GET /crm-admins/dashboard-summary/
export async function getCrmDashboardSummary() {
  return await apiRequest(ENDPOINTS.CRM.DASHBOARD_SUMMARY, { method: 'GET' }, true, 'admin');
}

// GET /crm-admins/dashboard-details/  (paginated)
// params: { page, page_size, type, from_date, to_date }
export async function getCrmDashboardDetails(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.DASHBOARD_DETAILS}${qs}`, { method: 'GET' }, true, 'admin');
}

// ───────────────────────── Member Assignment ─────────────────────

// GET /crm-admins/assignments/  (paginated)
export async function getCrmAssignments(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.ASSIGNMENTS}${qs}`, { method: 'GET' }, true, 'admin');
}

// POST /crm-admins/assignments/
// body: { name, status, retain_criteria, upgrade_criteria, pic_uuid }
export async function createCrmAssignment(data) {
  return await apiRequest(ENDPOINTS.CRM.ASSIGNMENTS, {
    method: 'POST',
    body: data
  }, true, 'admin');
}

// PUT /crm-admins/assignments/<uuid>/
export async function updateCrmAssignment(uuid, data) {
  return await apiRequest(ENDPOINTS.CRM.ASSIGNMENT_SINGLE(uuid), {
    method: 'PUT',
    body: data
  }, true, 'admin');
}

// PATCH /crm-admins/assignments/set-target/
// body: { pic_uuid, deposit }
export async function setCrmAssignmentTarget(data) {
  return await apiRequest(ENDPOINTS.CRM.ASSIGNMENT_SET_TARGET, {
    method: 'PATCH',
    body: data
  }, true, 'admin');
}

// ───────────────────────────── Enums ─────────────────────────────
// `type` query param across retention-summary, dashboard-details
export const CRM_PERIOD_TYPE = {
  DAILY: 1,
  MONTHLY: 2,
  YEARLY: 3,
  CUSTOM: 4
};

// PeriodToggle labels → API type
export function periodLabelToType(label) {
  switch (label) {
    case 'Daily': return CRM_PERIOD_TYPE.DAILY;
    case 'Monthly': return CRM_PERIOD_TYPE.MONTHLY;
    case 'Yearly': return CRM_PERIOD_TYPE.YEARLY;
    default: return CRM_PERIOD_TYPE.DAILY;
  }
}

// Assignment status enum (1 = Active, 2 = Inactive)
export const ASSIGNMENT_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2
};

export function statusLabelToInt(label) {
  return label === 'Active' ? ASSIGNMENT_STATUS.ACTIVE : ASSIGNMENT_STATUS.INACTIVE;
}
