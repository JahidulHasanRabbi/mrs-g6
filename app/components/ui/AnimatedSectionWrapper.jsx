"use client";

import { motion } from "framer-motion";
import { memo, useMemo } from "react";

const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 }
  },
  fadeInDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 }
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  },
  fadeInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -5, scale: 0.9 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: -5, scale: 0.9 }
  }
};

const AnimatedSectionWrapper = memo(function AnimatedSectionWrapper({ 
  children, 
  animation = "fadeInUp", 
  delay = 0,
  duration = 0.4,
  className = "",
  viewportOnce = true,
  viewportAmount = 0.1
}) {
  const selectedAnimation = useMemo(
    () => animations[animation] || animations.fadeInUp,
    [animation]
  );

  const transitionConfig = useMemo(
    () => ({ duration, delay, ease: "easeOut" }),
    [duration, delay]
  );

  const viewportConfig = useMemo(
    () => ({ once: viewportOnce, amount: viewportAmount }),
    [viewportOnce, viewportAmount]
  );

  return (
    <motion.div
      initial={selectedAnimation.initial}
      whileInView={{ 
        ...selectedAnimation.animate,
        transition: transitionConfig
      }}
      viewport={viewportConfig}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
});

export default AnimatedSectionWrapper;
