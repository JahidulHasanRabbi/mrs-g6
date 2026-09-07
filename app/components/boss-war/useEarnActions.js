"use client";

// One handler for every "How to Earn Attack Points" tile: link tiles route to
// the feature, claim tiles hit claimAp() and push the new AP balance up.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as warApi from "./bossWarApi";
import { EARN_TILES } from "./constants";
import { tokenStorage } from "../../api/tokenStorage";

export function stationDepositUrl() {
  try {
    const o = tokenStorage?.getRedirectO?.();
    return o || null;
  } catch {
    return null;
  }
}

export function useEarnActions({ onApUpdate, onNotice }) {
  const router = useRouter();
  const [tiles, setTiles] = useState(EARN_TILES.map((t) => ({ ...t, claimable: !t.href })));
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    warApi
      .getEarnRules()
      .then((r) => {
        if (!cancelled && r?.tiles) setTiles(r.tiles);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const onAction = useCallback(
    async (tile) => {
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
      }
      setBusyId(tile.id);
      try {
        const res = await warApi.claimAp(tile.id);
        onApUpdate?.(res.ap);
        setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, claimable: false } : t)));
        onNotice?.("ATTACK POINTS", `+${res.gained} AP claimed. You now have ${res.ap.current} / ${res.ap.max}.`);
      } catch (err) {
        onNotice?.("CANNOT CLAIM", err?.message || "Try again later.");
      } finally {
        setBusyId(null);
      }
    },
    [router, onApUpdate, onNotice],
  );

  return { tiles, busyId, onAction };
}
