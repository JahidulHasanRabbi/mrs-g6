import { apiRequest } from './apiClient';
import { ENDPOINTS } from './api';
import { buildQueryParams } from './queryParams';

// ───────────────────────── Member Profile ─────────────────────────

// GET /crm-members/members/  (paginated)
// params: { page, page_size, priority, vip_level, retention, search }
export async function getCrmMembers(params = {}) {
  const qs = buildQueryParams(params);
  return await apiRequest(`${ENDPOINTS.CRM.MEMBERS}${qs}`, { method: 'GET' }, true, 'admin');
}

// GET /crm-members/members/<uuid>/
export async function getCrmMemberSingle(memberUuid) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_SINGLE(memberUuid), { method: 'GET' }, true, 'admin');
}

// PUT /crm-members/members/<uuid>/
// body: { profile_data, basic_info, game_info }
export async function updateCrmMember(memberUuid, data) {
  return await apiRequest(ENDPOINTS.CRM.MEMBER_SINGLE(memberUuid), {
    method: 'PUT',
    body: data
  }, true, 'admin');
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
