"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Stadium ambience for the leaderboard. The client wants all five clips on a
// continuous loop; we shuffle them so there's no obvious repeating pattern.
const CLIPS = [
  "/assets/penalty-kick/leaderboard/cheering.mp3",
  "/assets/penalty-kick/leaderboard/chanting.mp3",
  "/assets/penalty-kick/leaderboard/stadium-1.mp3",
  "/assets/penalty-kick/leaderboard/stadium-2.mp3",
  "/assets/penalty-kick/leaderboard/stadium-3.mp3",
];

const VOLUME = 0.4;

// Fisher–Yates, with one guard: if the freshly shuffled order would replay the
// clip that just finished (the boundary between two shuffles), rotate it so the
// same track never plays twice back-to-back.
function shuffleOrder(prevLast) {
  const order = [...CLIPS];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order[0] === prevLast && order.length > 1) {
    order.push(order.shift());
  }
  return order;
}

// Plays the crowd clips on shuffle-loop. Tries to autoplay on mount; browsers
// that block unmuted autoplay fall back to starting on the user's first
// interaction with the page. The returned `muted` flag drives a header toggle.
export function useCrowdAmbience() {
  const audioRef = useRef(null);
  const orderRef = useRef([]);
  const idxRef = useRef(0);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  const playNext = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (idxRef.current >= orderRef.current.length) {
      const prevLast = orderRef.current[orderRef.current.length - 1];
      orderRef.current = shuffleOrder(prevLast);
      idxRef.current = 0;
    }
    audio.src = orderRef.current[idxRef.current];
    idxRef.current += 1;
    return audio.play();
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;
    orderRef.current = shuffleOrder(null);
    idxRef.current = 0;

    // Advance to the next shuffled clip whenever one finishes — this is what
    // makes it "loop forever" without ever cutting a clip short.
    const onEnded = () => playNext();
    audio.addEventListener("ended", onEnded);

    // First-interaction fallback: if autoplay is blocked, the first tap/keypress
    // anywhere on the page starts the ambience (unless the user has muted).
    let started = false;
    const startOnInteraction = () => {
      if (started) return;
      started = true;
      if (!mutedRef.current) playNext()?.catch(() => {});
      removeInteractionListeners();
    };
    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
      window.removeEventListener("touchstart", startOnInteraction);
    };

    // Try unmuted autoplay first; on rejection, arm the interaction fallback.
    playNext()
      ?.then(() => { started = true; })
      .catch(() => {
        window.addEventListener("pointerdown", startOnInteraction);
        window.addEventListener("keydown", startOnInteraction);
        window.addEventListener("touchstart", startOnInteraction);
      });

    return () => {
      audio.removeEventListener("ended", onEnded);
      removeInteractionListeners();
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [playNext]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      const audio = audioRef.current;
      if (audio) {
        audio.muted = next;
        // Unmuting after a blocked autoplay may need a fresh play() call, now
        // that the toggle itself is a user gesture.
        if (!next && audio.paused) playNext()?.catch(() => {});
      }
      return next;
    });
  }, [playNext]);

  return { muted, toggleMuted };
}
