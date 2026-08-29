// Single import point for the Mission Pop Out promotion.
//
// The backend (/mission/pop-out-settings/) is still in flight, so a mock stands
// in during development. A production build talks to the real endpoints unless
// it is explicitly told otherwise — set NEXT_PUBLIC_MISSION_POPUP_API=mock to
// demo the flow from a deployed preview, or =live to hit the real API locally.
// Remove the mock, this switch, and the "endpoint not available" banner on
// app/admin/mission-game/pop-out/page.jsx together once the API ships.

import { tokenStorage } from "../../../api/tokenStorage";
import * as real from "../../../api/memberApi";
import * as mock from "./mockPromoApi";

const MODE = process.env.NEXT_PUBLIC_MISSION_POPUP_API;
const USE_MOCK = MODE === "mock" || (MODE !== "live" && process.env.NODE_ENV !== "production");

const impl = USE_MOCK ? mock : real;

export const {
  getMissionPopup,
  getPendingMissionPopup,
  recordMissionPopupShown,
  acknowledgeMissionPopup,
} = impl;

// Both CTAs fall back to the member's station when the promotion carries no
// explicit URL — the same construction the hamburger's "Back to Station" uses.
function stationOrigin() {
  const saved = tokenStorage.getRedirectO?.();
  if (!saved) return "/";
  return saved.startsWith("http") ? saved : `https://${saved}`;
}

// Where "Unlock Reward" sends the member. Against the mock this also marks them
// qualified, standing in for the deposit the backend would observe.
export async function beginUnlock(promo) {
  if (USE_MOCK) await mock.markQualified(promo?.uuid).catch(() => {});
  return promo?.deposit_url || stationOrigin();
}

export function walletUrlFor(promo) {
  return promo?.wallet_url || stationOrigin();
}
