/**
 * Shared number formatting for the leaderboard surfaces (table, podium, My
 * Rank, preview fixtures). Kept in one place so the boards can't drift apart
 * on thousands separators the way three hand-rolled copies did.
 */
export function formatAmount(amount, { decimals } = {}) {
  if (amount == null) return "";
  const num = Number(String(amount).replace(/,/g, ""));
  if (!Number.isFinite(num)) return String(amount);
  return decimals == null
    ? num.toLocaleString("en-US")
    : num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
}
