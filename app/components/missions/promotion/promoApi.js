// Single import point for the Mission Promotion pop-up (doc/usage-report-api-reference.md,
// "MISSION PROMOTION"). Normalizes the real endpoints into the one shape the popup
// components (PromotionOfferModal, ClearWalletModal, MissionCompletedModal,
// PromoBanner/PromoOfferArt) already render.

import { tokenStorage } from "../../../api/tokenStorage";
import {
  acknowledgeMissionPromotion,
  checkMissionPromotion,
  getPendingMissionPromotions,
} from "../../../api/memberApi";

// Both CTAs fall back to the member's station when the promotion carries no
// explicit URL — the same construction the hamburger's "Back to Station" uses.
function stationOrigin() {
  const saved = tokenStorage.getRedirectO?.();
  if (!saved) return "/";
  return saved.startsWith("http") ? saved : `https://${saved}`;
}

// GET /mission/missions/{uuid}/promotion/check/ returns null (nothing to
// show) or the offer itself, with no `state`/`can_show` of its own — the
// frontend derives the scenario from wallet_balance (see the doc's "How the
// frontend picks the scenario"). This maps that response onto the shape the
// existing modal components already expect.
function normalizeCheck(check) {
  if (!check) return null;
  const blocked = Number(check.wallet_balance) > 0;
  return {
    uuid: check.participation_uuid,
    state: blocked ? "blocked" : "offer",
    can_show: true,
    banner_image: check.banner_image || null,
    title: null,
    content: check.content_text,
    deposit_amount: check.deposit_amount,
    deposit_times: check.deposit_times,
    deposit_mode: check.deposit_mode,
    reward_amount: check.reward_amount,
    reward_category: check.reward_type,
    ns_wallet_balance: check.wallet_balance,
  };
}

// GET /mission/promotions/pending-completions/ returns a list; the "Mission
// Completed" pop-up shows one at a time (oldest first, so members see their
// mission history in order it was earned).
function normalizeCompleted(row) {
  if (!row) return null;
  return {
    uuid: row.uuid,
    state: "completed",
    can_show: true,
    reward_amount: row.reward_amount,
    reward_category: row.reward_type,
    mission_name: row.mission_name,
  };
}

export async function getMissionPopup(missionUuid) {
  const check = await checkMissionPromotion(missionUuid);
  return normalizeCheck(check);
}

export async function getPendingMissionPopup() {
  const rows = await getPendingMissionPromotions();
  const list = Array.isArray(rows) ? rows : rows?.results ?? [];
  return normalizeCompleted(list[0]);
}

export async function acknowledgeMissionPopup(uuid) {
  return acknowledgeMissionPromotion(uuid);
}

// Where "Unlock Reward" sends the member — the Deposit page on their own station.
export async function beginUnlock(promo) {
  return promo?.deposit_url || stationOrigin();
}

export function walletUrlFor(promo) {
  return promo?.wallet_url || stationOrigin();
}
