/**
 * Shared number formatting for the leaderboard surfaces (table, podium, My
 * Rank, preview fixtures). Kept in one place so the boards can't drift apart
 * on thousands separators the way three hand-rolled copies did.
 */
export function formatAmount(amount) {
  if (amount == null) return "";
  const num = Number(String(amount).replace(/,/g, ""));
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(amount);
}
