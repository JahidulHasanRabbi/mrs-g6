"use client";

// One handler for every "How to Earn Attack Points" tile. Attack Points are
// granted by the feature that awards them, so every tile navigates there.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as warApi from "./bossWarApi";
import { DEFAULT_DEPOSIT_AP, DEFAULT_FREE_AP, EARN_TILES, MINI_GAMES_NOTE } from "./constants";
import { tokenStorage } from "../../api/tokenStorage";

export function stationDepositUrl() {
  try {
    const o = tokenStorage?.getRedirectO?.();
    return o || null;
  } catch {
    return null;
  }
}

const FALLBACK_RULES = {
  tiles: EARN_TILES.map((t) => ({ ...t, claimable: !t.href })),
  deposit: DEFAULT_DEPOSIT_AP,
  free: DEFAULT_FREE_AP,
  miniGames: MINI_GAMES_NOTE,
};

export function useEarnActions({ onNotice, enabled = true }) {
  const router = useRouter();
  const [rules, setRules] = useState(FALLBACK_RULES);
  const [busyId] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    warApi
      .getEarnRules()
      .then((r) => {
        if (!cancelled && r) setRules(r);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Attack Points are granted by the feature that awards them — check-in,
  // missions, mini-games, a deposit — so every tile navigates there. Boss War
  // has no claim endpoint of its own.
  const onAction = useCallback(
    (tile) => {
      if (tile.href) {
        router.push(tile.href);
        return;
      }
      if (tile.id === "deposit") {
        const url = stationDepositUrl();
        if (url) {
          window.location.assign(url);
          return;
        }
        onNotice?.("DEPOSIT", "Deposit from your station to earn Attack Points.");
        return;
      }
      if (tile.id === "checkin") {
        router.push("/daily-checkin");
        return;
      }
      if (tile.id === "missions") {
        router.push("/missions");
        return;
      }
      onNotice?.("ATTACK POINTS", "Play the linked feature to earn Attack Points.");
    },
    [router, onNotice],
  );

  return { ...rules, busyId, onAction };
}
