/**
 * Global query parameter builder for all paginated API endpoints.
 * Strips null/undefined/empty values automatically.
 */

import { TOKEN_CATEGORY_LABELS } from "./tokenReport.mjs";

// ── Category Enums ──────────────────────────────────────────
// Token reason codes live in tokenReport.mjs (codes 1-18) so the report and
// the member token-history screen label the same code the same way.
export const TOKEN_CATEGORIES = TOKEN_CATEGORY_LABELS;

export const REWARD_CATEGORIES = {
  1: "Prize",
  2: "Credit",
};

// ── Query Builder ───────────────────────────────────────────
/**
 * Build a clean query string from a params object.
 * Automatically strips null, undefined, and empty string values.
 * 
 * @param {Object} params - Key/value pairs for query params
 * @returns {string} - "?key=value&..." or "" if no params
 * 
 * Usage:
 *   buildQueryParams({ page: 1, page_size: 20, category: null })
 *   → "?page=1&page_size=20"
 */
export function buildQueryParams(params = {}) {
  const filtered = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      filtered[key] = value;
    }
  }
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : "";
}

/**
 * Convert category enum ID to display label.
 */
export function getCategoryLabel(type, id) {
  const map = type === "token" ? TOKEN_CATEGORIES : REWARD_CATEGORIES;
  return map[id] || String(id);
}

/**
 * Get category options array for dropdown rendering.
 * Returns: [{ value: "all", label: "Category" }, { value: 1, label: "Check-In" }, ...]
 */
export function getCategoryOptions(type) {
  const map = type === "token" ? TOKEN_CATEGORIES : REWARD_CATEGORIES;
  return Object.entries(map).map(([value, label]) => ({
    value: parseInt(value, 10),
    label,
  }));
}
