"use client";

import { useEffect, useRef } from "react";
import { pingGameSession } from "../api/memberApi";

const HEARTBEAT_MS = 60000;
const PING = { START: 1, HEARTBEAT: 2, END: 3 };

export const GAME_SESSION_IDS = {
  LUCKY_SPIN: 1,
  PENALTY_KICK: 2,
  SMASH_EGG: 3,
  PREDICTION: 4,
  AVATAR: 5,
};

// Session-duration tracking for the 5 mini-games — feeds Usage Report's
// Avg. Session Duration (see doc/usage-report-api-reference.md, "AVG. SESSION
// DURATION"). One start on mount, a heartbeat every 60s (well under the
// backend's 120s resume window) with a single retry on failure, and a
// best-effort end when the member leaves. The backend falls back to the last
// heartbeat if the end signal never arrives, so none of this needs to be
// perfectly reliable — a dropped ping just costs a few seconds of accuracy.
export function useGameSessionPing(gameId) {
  const endedRef = useRef(false);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!gameId) return undefined;
    endedRef.current = false;
    sendingRef.current = false;

    const heartbeat = async () => {
      // A slow request (each attempt can take up to the 30s API timeout) could
      // still be in flight when the next 60s tick fires — skip this tick
      // entirely rather than let two heartbeats overlap and double up on the
      // server. There is exactly one attempt plus one retry per tick, never
      // more, and a failed tick does nothing further until the next one.
      if (sendingRef.current) return;
      sendingRef.current = true;
      try {
        await pingGameSession(gameId, PING.HEARTBEAT);
      } catch {
        try {
          await pingGameSession(gameId, PING.HEARTBEAT);
        } catch {
          // One retry only — the next scheduled tick tries again in 60s.
        }
      } finally {
        sendingRef.current = false;
      }
    };

    const sendEnd = () => {
      if (endedRef.current) return;
      endedRef.current = true;
      // keepalive lets the request finish after the page starts unloading.
      pingGameSession(gameId, PING.END, { keepalive: true }).catch(() => {});
    };

    pingGameSession(gameId, PING.START).catch(() => {});
    const interval = setInterval(heartbeat, HEARTBEAT_MS);

    // "pagehide" covers tab close / hard refresh / back-forward navigation;
    // it fires reliably where "beforeunload" can be blocked by the browser.
    window.addEventListener("pagehide", sendEnd);

    return () => {
      window.removeEventListener("pagehide", sendEnd);
      clearInterval(interval);
      sendEnd(); // in-app navigation to another route
    };
  }, [gameId]);
}
