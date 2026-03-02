"use client";

import { motion } from "framer-motion";
import SpinButton from "./SpinButton";

const SpinButtonsContainer = ({ buttons, onButtonClick, disabled = false }) => {
  return (
    <motion.div 
      className="flex flex-row justify-center gap-4 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {buttons.map((button, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.2,
            ease: "easeOut"
          }}
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
};

export default SpinButtonsContainer;
