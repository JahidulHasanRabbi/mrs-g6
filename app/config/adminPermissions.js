import { tokenStorage } from "../api/tokenStorage";

export const ADMIN_PERMISSIONS = {
  VIEW_LOGINS: "view_logins",
  APPROVE_LOGINS: "approve_logins",
  BYPASS_APPROVAL: "bypass_approval",
  VIEW_ADMINS: "view_admins",
  CREATE_ADMINS: "create_admins",
  EDIT_ADMINS: "edit_admins",
  ARCHIVE_ADMINS: "archive_admins",
  VIEW_ACTIVITY_LOG: "view_activity_log",
  VIEW_ROLES: "view_roles",
  CREATE_ROLES: "create_roles",
  EDIT_ROLES: "edit_roles",
  ARCHIVE_ROLES: "archive_roles",
  VIEW_MRS_TIER: "view_mrs_tier",
  CREATE_MRS_TIER: "create_mrs_tier",
  EDIT_MRS_TIER: "edit_mrs_tier",
  ARCHIVE_MRS_TIER: "archive_mrs_tier",
  VIEW_WALLET_TIER: "view_wallet_tier",
  CREATE_WALLET_TIER: "create_wallet_tier",
  EDIT_WALLET_TIER: "edit_wallet_tier",
  ARCHIVE_WALLET_TIER: "archive_wallet_tier",
  VIEW_LUCKY_SPIN_PRIZES: "view_lucky_spin_prizes",
  CREATE_LUCKY_SPIN_PRIZES: "create_lucky_spin_prizes",
  EDIT_LUCKY_SPIN_PRIZES: "edit_lucky_spin_prizes",
  ARCHIVE_LUCKY_SPIN_PRIZES: "archive_lucky_spin_prizes",
};

export const MENU_PERMISSION_BY_ID = {
  "lucky-spin": [ADMIN_PERMISSIONS.VIEW_LUCKY_SPIN_PRIZES],
  "vip": [ADMIN_PERMISSIONS.VIEW_MRS_TIER, ADMIN_PERMISSIONS.VIEW_WALLET_TIER],
  "wallet-site-vip": [ADMIN_PERMISSIONS.VIEW_WALLET_TIER],
  "mrs-vip-level": [ADMIN_PERMISSIONS.VIEW_MRS_TIER],
  "settings-user-access": [ADMIN_PERMISSIONS.VIEW_ADMINS],
  "settings-role-management": [ADMIN_PERMISSIONS.VIEW_ROLES],
  "settings-user-activity-log": [ADMIN_PERMISSIONS.VIEW_ACTIVITY_LOG],
  "settings-login-requests": [ADMIN_PERMISSIONS.VIEW_LOGINS],
};

export const ADMIN_ROUTE_RULES = [
  { pattern: /^\/admin\/lucky-spin(?:\/prize-settings)?\/?$/, any: [ADMIN_PERMISSIONS.VIEW_LUCKY_SPIN_PRIZES] },
  { pattern: /^\/admin\/vip-tiers\/?$/, any: [ADMIN_PERMISSIONS.VIEW_MRS_TIER] },
  { pattern: /^\/admin\/wallet-site-vip\/?$/, any: [ADMIN_PERMISSIONS.VIEW_WALLET_TIER] },
  { pattern: /^\/admin\/mrs-vip\/?$/, any: [ADMIN_PERMISSIONS.VIEW_MRS_TIER] },
  { pattern: /^\/admin\/settings\/user-access\/add\/?$/, any: [ADMIN_PERMISSIONS.CREATE_ADMINS] },
  { pattern: /^\/admin\/settings\/user-access\/edit\/[^/]+\/?$/, any: [ADMIN_PERMISSIONS.EDIT_ADMINS] },
  { pattern: /^\/admin\/settings\/user-access\/?$/, any: [ADMIN_PERMISSIONS.VIEW_ADMINS] },
  { pattern: /^\/admin\/settings\/role-management\/new\/?$/, any: [ADMIN_PERMISSIONS.CREATE_ROLES] },
  { pattern: /^\/admin\/settings\/role-management\/[^/]+\/?$/, any: [ADMIN_PERMISSIONS.EDIT_ROLES] },
  { pattern: /^\/admin\/settings\/role-management\/?$/, any: [ADMIN_PERMISSIONS.VIEW_ROLES] },
  { pattern: /^\/admin\/settings\/user-activity-log\/?$/, any: [ADMIN_PERMISSIONS.VIEW_ACTIVITY_LOG] },
  { pattern: /^\/admin\/settings\/login-requests\/?$/, any: [ADMIN_PERMISSIONS.VIEW_LOGINS] },
];

export function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((permission) => typeof permission === "string" && permission.trim());
}

export function getStoredAdminPermissions() {
  return normalizePermissions(tokenStorage.getAdminPermissions());
}

export function hasAdminPermission(permission, permissions = getStoredAdminPermissions()) {
  return Boolean(permission) && permissions.includes(permission);
}

export function hasAnyAdminPermission(requiredPermissions, permissions = getStoredAdminPermissions()) {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) return true;
  return requiredPermissions.some((permission) => hasAdminPermission(permission, permissions));
}

export function canAccessMenuItem(item, permissions = getStoredAdminPermissions()) {
  const required = MENU_PERMISSION_BY_ID[item?.id];
  if (required && !hasAnyAdminPermission(required, permissions)) return false;

  if (Array.isArray(item?.children)) {
    return item.children.some((child) => canAccessMenuItem(child, permissions));
  }

  return true;
}

export function filterMenuByPermissions(items, permissions = getStoredAdminPermissions()) {
  return items.reduce((visibleItems, item) => {
    if (!canAccessMenuItem(item, permissions)) return visibleItems;

    if (Array.isArray(item.children)) {
      const children = filterMenuByPermissions(item.children, permissions);
      if (children.length > 0) {
        visibleItems.push({ ...item, href: children[0]?.href || item.href, children });
      }
      return visibleItems;
    }

    visibleItems.push(item);
    return visibleItems;
  }, []);
}

export function getRoutePermissionRule(pathname) {
  if (!pathname) return null;
  return ADMIN_ROUTE_RULES.find((rule) => rule.pattern.test(pathname)) || null;
}

export function canAccessAdminRoute(pathname, permissions = getStoredAdminPermissions()) {
  const rule = getRoutePermissionRule(pathname);
  if (!rule) return true;
  return hasAnyAdminPermission(rule.any, permissions);
}
