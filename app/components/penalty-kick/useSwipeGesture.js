"use client";

import { useCallback, useRef } from "react";

// Captures a pointer path on a surface and reports it on release.
// `onComplete(path)` fires once at pointerup with the recorded samples.
// `enabled` short-circuits the listeners when the game is not in READY phase.
export function useSwipeGesture({ enabled, onComplete }) {
  const pathRef = useRef([]);
  const activeRef = useRef(false);
  const surfaceRef = useRef(null);

  const setSurface = useCallback((el) => {
    surfaceRef.current = el;
  }, []);

  const localCoords = useCallback((e) => {
    const surf = surfaceRef.current;
    if (!surf) return { x: e.clientX, y: e.clientY };
    const rect = surf.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (!enabled) return;
      try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
      activeRef.current = true;
      const { x, y } = localCoords(e);
      pathRef.current = [{ x, y, t: performance.now() }];
    },
    [enabled, localCoords],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!enabled || !activeRef.current) return;
      const { x, y } = localCoords(e);
      const last = pathRef.current[pathRef.current.length - 1];
      // Throttle to ~one sample per 16ms so we don't blow the array up.
      if (!last || performance.now() - last.t > 14) {
        pathRef.current.push({ x, y, t: performance.now() });
        if (pathRef.current.length > 40) pathRef.current.shift();
      }
    },
    [enabled, localCoords],
  );

  const onPointerUp = useCallback(
    (e) => {
      if (!activeRef.current) return;
      activeRef.current = false;
      try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch {}
      const path = pathRef.current.slice();
      pathRef.current = [];
      onComplete?.(path);
    },
    [onComplete],
  );

  return {
    setSurface,
    surfaceHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
