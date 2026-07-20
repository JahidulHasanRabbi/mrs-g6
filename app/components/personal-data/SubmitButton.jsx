"use client";

import { motion } from "framer-motion";
import { FORM_COLORS } from "./constants";
import { useTheme } from "../../contexts/ThemeContext";
import { ACEBET_ASSETS, ACEBET_COLORS } from "../themes/acebet77/assets";

export default function SubmitButton({ onClick, label = "Saved Change", disabled = false }) {
  const { isAcebet77 } = useTheme();

  // acebet77 skin: render the theme's dark gold-trim plaque (btn-play.png) with
  // gold text so the button matches the surrounding theme instead of the
  // default bright pill. Other themes keep the default pill exactly as before.
  if (isAcebet77) {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className="relative w-full h-[52px] overflow-hidden my-8"
        style={{ opacity: disabled ? 0.6 : 1 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <img
          src={ACEBET_ASSETS.spin.btnPlay}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        />
        <span
          className="relative z-10 text-base leading-normal"
          style={{
            fontFamily: '"Times New Roman", serif',
            fontWeight: "bold",
            color: ACEBET_COLORS.goldBright,
          }}
        >
          {label}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="relative w-full h-[48px] rounded-[99px] overflow-hidden my-8"
      style={{
        boxShadow: "1px 4px 11px 0px rgba(0,0,0,0.1)",
        filter: "blur(0px)",
        opacity: disabled ? 0.6 : 1,
      }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Base Background */}
      <div
        className="absolute inset-0 rounded-[99px]"
        style={{ backgroundColor: FORM_COLORS.primary }}
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 rounded-[99px] mix-blend-color-dodge opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 335px 48px at 50% 50%, rgba(255,177,81,1) 0%, rgba(249,173,79,1) 10%, rgba(232,161,74,1) 22%, rgba(206,143,65,1) 36%, rgba(168,116,53,1) 51%, rgba(120,83,38,1) 67%, rgba(91,63,29,1) 75.5%, rgba(62,43,19,1) 84%, rgba(31,22,10,1) 92%, rgba(16,11,5,1) 96%, rgba(8,5,2,1) 98%, rgba(0,0,0,1) 100%)",
        }}
      />

      {/* Inner Shadow */}
      <div
        className="absolute inset-0 rounded-[99px]"
        style={{
          boxShadow: "inset -5px -5px 15px 0px rgba(0,0,0,0.4)",
        }}
      />

      {/* Button Text */}
      <span
        className="relative z-10 text-base leading-normal"
        style={{
          fontFamily: '"Times New Roman", serif',
          fontWeight: "bold",
          color: FORM_COLORS.textButton,
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
