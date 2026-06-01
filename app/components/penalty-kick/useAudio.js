"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_PATHS, STORAGE_KEYS } from "./constants";

// Plays one of the named clips with a persisted mute toggle.
// Best-effort — autoplay-blocked browsers silently no-op.
export function useAudio() {
  const audiosRef = useRef({});
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEYS.muted);
      if (saved === "1") setMuted(true);
    } catch {}

    Object.entries(AUDIO_PATHS).forEach(([name, src]) => {
      try {
        const el = new Audio(src);
        el.preload = "auto";
        audiosRef.current[name] = el;
      } catch {}
    });

    return () => {
      Object.values(audiosRef.current).forEach((el) => {
        try { el.pause(); el.src = ""; } catch {}
      });
      audiosRef.current = {};
    };
  }, []);

  const play = useCallback((name) => {
    if (muted) return;
    const el = audiosRef.current[name];
    if (!el) return;
    try {
      el.currentTime = 0;
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {}
  }, [muted]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(STORAGE_KEYS.muted, next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  return { play, muted, toggleMuted };
}
