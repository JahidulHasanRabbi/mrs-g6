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

// Masked display names arrive from the API padded out to the real name's length
// ("D**********n"). The long star run carries nothing a reader needs and it was
// squeezing the prize column until "10 KR Coins" clipped, so cap the run.
export function shortenMaskedName(name, maxStars = 4) {
  if (!name) return "";
  return String(name).replace(/\*{5,}/g, "*".repeat(maxStars));
}
