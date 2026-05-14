"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import PrivilegesCard from "./PrivilegesCard";

const CARD_W = 344;
const CARD_W_SM = 292;
const SM_BREAKPOINT = 400;
const GAP = 16;

// How much weight to give release velocity when projecting a swipe's
// landing spot. Higher = faster flicks travel further. 0.25 feels close
// to native-app carousels.
const SWIPE_POWER = 0.25;

// Cap multi-card jumps from a single fling so a violent swipe doesn't
// skip the entire deck.
const MAX_SKIP = 2;

// A pointer move under this threshold is treated as a click, not a drag.
// Used to suppress the per-card onClick when the user actually dragged.
const CLICK_DRAG_THRESHOLD_PX = 6;

export default function PrivilegesCarousel({ tiers = [], activeName, onSelect }) {
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(0);
  const [isSmall, setIsSmall] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Track active index instead of relying solely on name matching
  const [activeIndex, setActiveIndex] = useState(0);
  // Imperative motion value — lets us snap the carousel back even when
  // the active card hasn't changed (e.g., a small drag past the first
  // or last card that didn't pass the swipe threshold).
  const x = useMotionValue(0);
  // Track whether the most recent pointer interaction was a true drag —
  // not just a press-and-release. Prevents a stale `onClick` on the
  // active card from firing right after a release.
  const draggedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const update = () => {
      const small = window.innerWidth < SM_BREAKPOINT;
      setIsSmall(small);
      if (containerRef.current) {
        setContainerW(containerRef.current.getBoundingClientRect().width);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const cardW = isSmall ? CARD_W_SM : CARD_W;
  const stride = cardW + GAP;

  // Sync activeIndex when activeName changes from parent
  useEffect(() => {
    const i = tiers.findIndex(t => t.name === activeName);
    if (i >= 0 && i !== activeIndex) {
      setActiveIndex(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeName, tiers]);

  const targetX = useMemo(() => {
    if (!containerW) return 0;
    return containerW / 2 - cardW / 2 - activeIndex * stride;
  }, [containerW, cardW, stride, activeIndex]);

  const springConfig = useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 320, damping: 36, mass: 0.7 },
    [prefersReducedMotion],
  );

  // Animate x toward targetX whenever the active card changes (or the
  // container resizes and shifts the centred position).
  useEffect(() => {
    const controls = animate(x, targetX, springConfig);
    return () => controls.stop();
  }, [targetX, x, springConfig]);

  const handleDragStart = () => {
    draggedRef.current = false;
    setIsDragging(true);
  };

  const handleDrag = (_, info) => {
    if (!draggedRef.current && Math.abs(info.offset.x) > CLICK_DRAG_THRESHOLD_PX) {
      draggedRef.current = true;
    }
  };

  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Project where the swipe "wants" to land using flick velocity.
    // Negative offset/velocity = swiping left = advancing forward.
    const projected = offset + SWIPE_POWER * velocity;

    // Snap to the nearest card boundary; a fling of >25% of a card width
    // (or equivalent velocity) is enough to advance one card.
    let delta = -Math.round(projected / stride);
    if (Math.abs(projected) < stride * 0.25) delta = 0;
    delta = Math.max(-MAX_SKIP, Math.min(MAX_SKIP, delta));

    const newIndex = Math.max(0, Math.min(tiers.length - 1, activeIndex + delta));
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      onSelect?.(tiers[newIndex].name);
      // useEffect above will animate to the new targetX.
    } else {
      // The active card didn't change (small drag, or already at the
      // first/last card). Snap explicitly back to the current targetX
      // so the deck doesn't get stuck off-position.
      animate(x, targetX, springConfig);
    }

    // Reset the dragged flag on the next tick so the per-card onClick
    // (which fires after pointerup) sees the correct value.
    setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  };

  if (tiers.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height: isSmall ? 332 : 396 }}
    >
      <motion.div
        className="absolute top-0 left-0 flex items-center"
        style={{
          x,
          height: "100%",
          gap: `${GAP}px`,
          touchAction: "pan-y",
          willChange: isDragging ? "transform" : "auto",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        drag="x"
        // No constraints — let the user drag freely. The post-drag
        // animation always snaps back to targetX (handled imperatively
        // in handleDragEnd / the targetX useEffect), so first / last
        // card overshoots can't get stuck off-position.
        dragElastic={0.35}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {tiers.map((tier, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = index === activeIndex;
          const scale = isActive ? 1 : distance === 1 ? 0.85 : 0.78;
          const opacity = isActive ? 1 : distance === 1 ? 0.7 : 0.4;

          return (
            <motion.div
              key={`${tier.name}-${index}`}
              className="shrink-0 cursor-pointer"
              style={{ width: cardW }}
              animate={{ scale, opacity }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 36 }
              }
              onClick={() => {
                // Suppress click-to-jump if this pointer interaction was
                // actually a drag (offset > threshold). Without this,
                // dragging horizontally and releasing on a different card
                // would also "click" the card under the pointer.
                if (draggedRef.current) return;
                if (!isActive) {
                  setActiveIndex(index);
                  onSelect?.(tier.name);
                }
              }}
            >
              <PrivilegesCard
                level={tier.name}
                tierData={tier}
                tierIndex={index}
                isActive={isActive}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
