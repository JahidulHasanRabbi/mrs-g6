"use client";

import { motion } from "framer-motion";

const AnimatedSectionWrapper = ({ 
  children, 
  animation = "fadeInUp", 
  delay = 0,
  duration = 0.4,
  className = "",
  viewportOnce = true,
  viewportAmount = 0.1
}) => {
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

  const selectedAnimation = animations[animation] || animations.fadeInUp;

  return (
    <motion.div
      initial={selectedAnimation.initial}
      whileInView={{ 
        ...selectedAnimation.animate,
        transition: { duration, delay, ease: "easeOut" }
      }}
      exit={selectedAnimation.exit}
      viewport={{ once: viewportOnce, amount: viewportAmount }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSectionWrapper;
