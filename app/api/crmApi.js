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
// params: { page, page_size, priority, wallet_vip_level, mrs_vip_level, retention, search, brand, sales ("High"|"Low"), win_lose ("High"|"Low") }
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

// POST /crm-members/<uuid>/refresh/
export async function refreshCrmMember(memberUuid) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_REFRESH(memberUuid), { method: 'POST' }, true, 'admin');
}

// POST /crm-members/<uuid>/update-data/
export async function updateCrmMemberData(memberUuid) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_UPDATE_DATA(memberUuid), { method: 'POST' }, true, 'admin');
}

// GET /crm-members/follow-up/
// params: { page, page_size, pic_uuid, member_uuid, start_date, end_date }
export async function getCrmFollowUps(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.FOLLOW_UPS}${qs}`, { method: 'GET' }, true, 'admin');
}

// PATCH /crm-members/members/<uuid>/assign-to-pic/
// body: { pic_uuid }
export async function assignCrmMemberToPic(memberUuid, data) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_ASSIGN_TO_PIC(memberUuid), {
    method: 'PATCH',
    body: data
  }, true, 'admin');
}

// PATCH /crm-members/members/<uuid>/follow-up/
// body: { follow_up_remark }
export async function patchCrmMemberFollowUp(memberUuid, data) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_FOLLOW_UP(memberUuid), {
    method: 'PATCH',
    body: data
  }, true, 'admin');
}

// PATCH /crm-members/members/<uuid>/alert/
// body: { alert }
export async function patchCrmMemberAlert(memberUuid, alert) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_ALERT(memberUuid), {
    method: 'PATCH',
    body: { alert }
  }, true, 'admin');
}

// POST /crm-members/members/<uuid>/send-bonus/
// body: { bonus }
export async function sendCrmMemberBonus(memberUuid, data) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_SEND_BONUS(memberUuid), {
    method: 'POST',
    body: data
  }, true, 'admin');
}

// ──────────────────────── Retention Profile ──────────────────────

// GET /crm-members/retention-summary/<admin_uuid>/
// params: { type, from_date, to_date }  type: 1=Daily 2=Monthly 3=Yearly 4=Input
export async function getRetentionSummary(adminUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.RETENTION_SUMMARY(adminUuid)}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-members/retention-members/  (paginated) — only members with priority set
// params: { page, page_size, priority ("inactive"|"low"|"medium"|"high"), mrs_vip_level, wallet_vip_level, retention (PIC uuid), search, brand, date, sales ("High"|"Low"), win_lose ("High"|"Low") }
export async function getRetentionMembers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.RETENTION_MEMBERS}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-members/<admin_uuid>/admin-members/  (paginated)
// params: { page, page_size, from_date, to_date, wallet_vip_level, mrs_vip_level, brand, search, sales ("High"|"Low"), win_lose ("High"|"Low") }
export async function getAdminMembers(adminUuid, params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.ADMIN_MEMBERS(adminUuid)}${qs}`, { method: 'GET' }, true, 'admin');
}

// ─────────────────────────── Dashboard ───────────────────────────

// GET /crm-admins/dashboard-summary/
// params: { from_date, to_date }
export async function getCrmDashboardSummary(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.DASHBOARD_SUMMARY}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-admins/dashboard-breakdown/
// params: { from_date, to_date, metric }
export async function getCrmDashboardBreakdown(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.DASHBOARD_BREAKDOWN}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-admins/dashboard-details/  (paginated)
// params: { page, page_size, from_date, to_date }
export async function getCrmDashboardDetails(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.DASHBOARD_DETAILS}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-admins/notifications/
export async function getCrmNotifications() {
  return await apiRequest(ENDPOINTS.CRM.NOTIFICATIONS, { method: 'GET' }, true, 'admin');
}

// PATCH /crm-admins/notifications/<notification_uuid>/mark-as-read/
export async function markCrmNotificationRead(uuid) {
  return await apiRequest(ENDPOINTS.CRM.NOTIFICATION_MARK_READ(uuid), { method: 'PATCH' }, true, 'admin');
}

// ───────────────────────── Member Assignment ─────────────────────

// GET /crm-admins/assignments/  (paginated)
export async function getCrmAssignments(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.ASSIGNMENTS}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-admins/assignments/<admin_uuid>/retention-target/
export async function getCrmAssignmentRetentionTarget(adminUuid) {
  return await apiRequest(ENDPOINTS.CRM.ASSIGNMENT_RETENTION_TARGET(adminUuid), { method: 'GET' }, true, 'admin');
}

// POST /crm-admins/assignments/
// body: { retention_targets }
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

// POST /crm-admins/assignments/<uuid>/import-members/
// body: multipart/form-data { member_list: File }
export async function importCrmAssignmentMembers(uuid, file) {
  return await apiRequest(ENDPOINTS.CRM.ASSIGNMENT_IMPORT_MEMBERS(uuid), {
    method: 'POST',
    body: { member_list: file }
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
