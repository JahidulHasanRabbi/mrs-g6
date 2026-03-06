"use client";

import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import SpinButton from "./SpinButton";

const SpinButtonsContainer = memo(function SpinButtonsContainer({ buttons, onButtonClick, disabled = false }) {
  const memoizedButtons = useMemo(() => buttons, [buttons]);
  return (
    <motion.div 
      className="flex flex-row flex-wrap justify-center gap-2 sm:gap-4 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      {memoizedButtons.map((button, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.2,
            ease: "easeOut"
          }}
          style={{ willChange: "transform, opacity" }}
        >
          <SpinButton 
            spins={button.spins}
            tokens={button.tokens}
            image={button.image}
            className={button.className}
            onClick={() => !disabled && onButtonClick(button)}
            disabled={disabled}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});

export default SpinButtonsContainer;
