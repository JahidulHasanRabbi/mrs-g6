"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PrivilegesCard from "./PrivilegesCard";

const CARD_W = 344;
const CARD_W_SM = 292;
const SM_BREAKPOINT = 400;
const GAP = 16;

export default function PrivilegesCarousel({ tiers = [], activeName, onSelect }) {
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(0);
  const [isSmall, setIsSmall] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  const activeIndex = useMemo(() => {
    const i = tiers.findIndex(t => t.name === activeName);
    return i >= 0 ? i : 0;
  }, [tiers, activeName]);

  const targetX = useMemo(() => {
    if (!containerW) return 0;
    return containerW / 2 - cardW / 2 - activeIndex * stride;
  }, [containerW, cardW, stride, activeIndex]);

  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    const threshold = 60;
    if (info.offset.x < -threshold && activeIndex < tiers.length - 1) {
      onSelect?.(tiers[activeIndex + 1].name);
    } else if (info.offset.x > threshold && activeIndex > 0) {
      onSelect?.(tiers[activeIndex - 1].name);
    }
  };

  if (tiers.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: isSmall ? 332 : 396 }}
    >
      <motion.div
        className="absolute top-0 left-0 flex items-center"
        style={{
          height: "100%",
          gap: `${GAP}px`,
          touchAction: "pan-y",
          willChange: isDragging ? "transform" : "auto",
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: targetX }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 30, mass: 0.9 }
        }
      >
        {tiers.map((tier, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = index === activeIndex;
          const scale = isActive ? 1 : distance === 1 ? 0.85 : 0.78;
          const opacity = isActive ? 1 : distance === 1 ? 0.7 : 0.4;

          return (
            <motion.div
              key={tier.name}
              className="shrink-0 cursor-pointer"
              style={{ width: cardW }}
              animate={{ scale, opacity }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 260, damping: 30 }
              }
              onClick={() => {
                if (!isActive && !isDragging) onSelect?.(tier.name);
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
