"use client";

import { motion } from 'framer-motion';

/**
 * PageTitle Component
 * Large "HOMEPAGE" title banner
 */
export default function PageTitle() {
  return (
    <motion.div
      className="w-full px-4 pt-4 pb-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1
        className="text-5xl font-bold text-center"
        style={{
          fontFamily: '"Times New Roman", serif',
          color: '#e9af41',
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
          letterSpacing: '0.1em',
        }}
      >
        HOMEPAGE
      </h1>
    </motion.div>
  );
}
