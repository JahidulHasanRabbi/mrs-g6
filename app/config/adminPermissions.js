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
  VIEW_PHONE_NUMBERS: "view_phone_numbers",
  ACCESS_RETENTION: "access_retention",
  ACCESS_MRS: "access_MRS",
};

// Module-level flags (ACCESS_MRS / ACCESS_RETENTION) gate entire sidebar
// sections. Items that already carry a more specific permission (lucky spin,
// VIP tiers, settings/*) are left on their existing checks rather than also
// requiring the module flag — MENU_PERMISSION_BY_ID entries are OR'd
// together (hasAnyAdminPermission), so adding the module flag alongside a
// specific one would loosen, not tighten, that item's gating. "home" is
// deliberately never gated: AdminRouteGuard falls back to router.replace
// ('/admin') when a route is denied, so it must always stay reachable.
export const MENU_PERMISSION_BY_ID = {
  "lucky-spin": [ADMIN_PERMISSIONS.VIEW_LUCKY_SPIN_PRIZES],
  "prize-settings": [ADMIN_PERMISSIONS.VIEW_LUCKY_SPIN_PRIZES],
  "user-logs": [ADMIN_PERMISSIONS.VIEW_LUCKY_SPIN_PRIZES],
  "daily-limits": [ADMIN_PERMISSIONS.VIEW_LUCKY_SPIN_PRIZES],
  "vip": [ADMIN_PERMISSIONS.VIEW_MRS_TIER, ADMIN_PERMISSIONS.VIEW_WALLET_TIER],
  "wallet-site-vip": [ADMIN_PERMISSIONS.VIEW_WALLET_TIER],
  "mrs-vip-level": [ADMIN_PERMISSIONS.VIEW_MRS_TIER],
  "settings-user-access": [ADMIN_PERMISSIONS.VIEW_ADMINS],
  "settings-role-management": [ADMIN_PERMISSIONS.VIEW_ROLES],
  "settings-user-activity-log": [ADMIN_PERMISSIONS.VIEW_ACTIVITY_LOG],
  "settings-login-requests": [ADMIN_PERMISSIONS.VIEW_LOGINS],

  // Retention System — every item requires the module-level flag.
  "retention-pic-dashboard": [ADMIN_PERMISSIONS.ACCESS_RETENTION],
  "retention-member-alert": [ADMIN_PERMISSIONS.ACCESS_RETENTION],
  "retention-member-list": [ADMIN_PERMISSIONS.ACCESS_RETENTION],
  "retention-member-comparison": [ADMIN_PERMISSIONS.ACCESS_RETENTION],
  "retention-error-transactions": [ADMIN_PERMISSIONS.ACCESS_RETENTION],
  "retention-settings": [ADMIN_PERMISSIONS.ACCESS_RETENTION],

  // MRS System — every item without its own specific permission above
  // requires the module-level flag. Parent items with children (avatar,
  // reports) only need the flag on the parent: canAccessMenuItem short-
  // circuits to `false` when the parent's own check fails, before it ever
  // looks at the children.
  "member-list": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "smash-egg": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "penalty-kick": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "redeem-links": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "mission-game": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "avatar": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "redemption-mall": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "mart-tiers": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "tournament": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "frame-setting": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "floating-menu": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "external-api": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "checkin-settings": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "feedback": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "banners": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "terms-conditions": [ADMIN_PERMISSIONS.ACCESS_MRS],
  "reports": [ADMIN_PERMISSIONS.ACCESS_MRS],
};

export const ADMIN_ROUTE_RULES = [
  // Whole Retention System — one prefix rule covers every sub-route
  // (dashboard, member alert/list/comparison, error transactions, settings,
  // member detail/edit) so a direct URL can't bypass the sidebar gate.
  { pattern: /^\/admin\/retention(\/.*)?$/, any: [ADMIN_PERMISSIONS.ACCESS_RETENTION] },
  { pattern: /^\/admin\/lucky-spin(?:\/(?:prize-settings|user-logs|daily-limits))?\/?$/, any: [ADMIN_PERMISSIONS.VIEW_LUCKY_SPIN_PRIZES] },
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
  // Whole MRS System — every top-level route that has no specific
  // permission of its own (lucky-spin/vip-tiers/wallet-site-vip/mrs-vip
  // above already have theirs) requires the module-level flag.
  {
    pattern: /^\/admin\/(members|smash-egg|penalty-kick|redeem-links|mission-game|avatar|redemption-mall|mart-tiers|tournament|frame-setting|floating-menu|external-api|checkin-settings|feedback|banners|terms-conditions|reports)(\/.*)?$/,
    any: [ADMIN_PERMISSIONS.ACCESS_MRS],
  },
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
