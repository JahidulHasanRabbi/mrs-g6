// Shared Smash Egg data helpers. Extracted verbatim from app/smash-egg/page.js
// so the themed Smash Egg pages (ep369 / ubetclub / acebet77) can build the
// same Prize List / Winner List / Terms data without duplicating the logic.

// Terms & Conditions category id for Smash Egg (getPublicTermsAndConditions).
export const SMASH_EGG_TERMS_CATEGORY = 6;

// Turn the raw item list into the ranked-prize + free-credit-range board the
// PrizeList component expects.
export function buildRewardBoard(items = []) {
  const prizeItems = items
    .filter((item) => item.itemType !== "Free credit")
    .map((item, index) => ({
      rank: index + 1,
      name: item.name,
      image: item.itemType === "Prize" ? item.image : null,
      itemType: item.itemType,
    }));

  const creditRanges = items
    .filter((item) => item.itemType === "Free credit")
    .map((item) => `RM${item.minWithdraw || 0} ~ RM${item.maxWithdraw || 0}`);

  return { prizes: prizeItems, creditRanges };
}

// Mask a display name for the public winner feed.
export function maskName(name) {
  if (!name) return "";
  if (name.includes("*")) return name;
  if (name.length <= 2) return `${name[0] || ""}*`;
  if (name.length <= 4) return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
  return `${name.slice(0, 2)}${"*".repeat(name.length - 4)}${name.slice(-2)}`;
}

// Normalize the winning-list response (array / {value} / {results}) into the
// row shape WinnerList expects: { date, name, prize }.
export function mapWinningHistory(items) {
  const rows = Array.isArray(items)
    ? items
    : Array.isArray(items?.value)
      ? items.value
      : Array.isArray(items?.results)
        ? items.results
        : [];

  return rows.map((item) => {
    const date = item.datetime_obtained
      ? new Date(item.datetime_obtained).toISOString().slice(0, 10)
      : "";

    return {
      date,
      name: maskName(item.display_name),
      prize: item.prize_name,
    };
  });
}
