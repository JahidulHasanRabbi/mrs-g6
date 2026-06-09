"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Background music for the leaderboard: a single football song on a seamless
// loop. Tries to autoplay on mount; browsers that block unmuted autoplay fall
// back to starting on the user's first interaction with the page.
const TRACK = "/assets/penalty-kick/leaderboard/football-song.mpeg";

const VOLUME = 0.4;

// Plays the football song on loop. The returned `muted` flag drives a header
// toggle.
export function useCrowdAmbience() {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    return audio.play();
  }, []);

  useEffect(() => {
    const audio = new Audio(TRACK);
    audio.volume = VOLUME;
    audio.preload = "auto";
    audio.loop = true;
    audioRef.current = audio;

    // First-interaction fallback: if autoplay is blocked, the first tap/keypress
    // anywhere on the page starts the music (unless the user has muted).
    let started = false;
    const startOnInteraction = () => {
      if (started) return;
      started = true;
      if (!mutedRef.current) play()?.catch(() => {});
      removeInteractionListeners();
    };
    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
      window.removeEventListener("touchstart", startOnInteraction);
    };

    // Try unmuted autoplay first; on rejection, arm the interaction fallback.
    play()
      ?.then(() => { started = true; })
      .catch(() => {
        window.addEventListener("pointerdown", startOnInteraction);
        window.addEventListener("keydown", startOnInteraction);
        window.addEventListener("touchstart", startOnInteraction);
      });

    return () => {
      removeInteractionListeners();
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [play]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      const audio = audioRef.current;
      if (audio) {
        audio.muted = next;
        // Unmuting after a blocked autoplay may need a fresh play() call, now
        // that the toggle itself is a user gesture.
        if (!next && audio.paused) play()?.catch(() => {});
      }
      return next;
    });
  }, [play]);

  return { muted, toggleMuted };
}
