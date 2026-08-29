// Mock backend for the Mission Pop Out promotion, in the same style as
// penalty-kick/mockApi.js and leaderboard/mockApi.js: it returns the shapes the
// real endpoints are specified to return, so promoApi.js can swap over without
// the page changing. Remove once /mission/pop-out-settings/ ships.
//
// Drive it from the URL while demoing:
//   /missions?promo=offer      NS wallet RM0 — eligible
//   /missions?promo=blocked    NS wallet > RM0 — must clear first
//   /missions?promo=completed  qualified, completion pop-up on next entry
//   /missions?promo=none       nothing configured

const STORE_KEY = "mrs_mission_popup_mock";

const PROMOTION = {
  uuid: "mock-popout-0001",
  title: "Happy Friday!",
  content: "Deposit RM200 & Get Extra 50 Tokens",
  banner_image: null,
  deposit_amount: 200,
  deposit_times: 1,
  deposit_mode: 1,
  reward_category: 1,
  reward_amount: 50,
  deposit_url: null,
  wallet_url: null,
};

function readStore() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "{}"); } catch { return {}; }
}

function writeStore(next) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
}

function forcedState() {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("promo");
  return ["offer", "blocked", "completed", "none"].includes(value) ? value : null;
}

// Mirrors what the backend decides from display_frequency (requirement row 14).
function withinDisplayBudget() {
  const store = readStore();
  return !store.shownOnce;
}

export async function getMissionPopup() {
  const forced = forcedState();
  if (forced === "none" || forced === "completed") return null;

  const blocked = forced === "blocked";
  return {
    ...PROMOTION,
    state: blocked ? "blocked" : "offer",
    can_show: forced ? true : withinDisplayBudget(),
    ns_wallet_balance: blocked ? "35.00" : "0.00",
  };
}

export async function getPendingMissionPopup() {
  if (forcedState() === "completed") {
    return { ...PROMOTION, state: "completed", can_show: true, ns_wallet_balance: "0.00" };
  }

  const store = readStore();
  if (store.qualified && !store.acknowledged) {
    return { ...PROMOTION, state: "completed", can_show: true, ns_wallet_balance: "0.00" };
  }
  return null;
}

export async function recordMissionPopupShown() {
  writeStore({ ...readStore(), shownOnce: true });
  return { ok: true };
}

// Stands in for "member left for the deposit page and came back qualified", so
// the offer -> completion -> acknowledged cycle can be walked without a backend.
export async function markQualified() {
  writeStore({ ...readStore(), qualified: true, acknowledged: false });
  return { ok: true };
}

export async function acknowledgeMissionPopup() {
  writeStore({ ...readStore(), acknowledged: true });
  return { ok: true };
}
