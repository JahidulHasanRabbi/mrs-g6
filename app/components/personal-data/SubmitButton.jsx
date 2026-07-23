"use client";

import { motion } from "framer-motion";
import { FORM_COLORS } from "./constants";
import { useTheme } from "../../contexts/ThemeContext";
import { ACEBET_ASSETS, ACEBET_COLORS } from "../themes/acebet77/assets";
import { UBET_ASSETS, UBET_COLORS } from "../themes/ubetclub/assets";
import { EP369_ASSETS, EP369_COLORS } from "../themes/ep369/assets";
import { KGAME99_ASSETS, KGAME99_COLORS } from "../themes/kgame99/assets";
import { LV918_ASSETS, LV918_COLORS } from "../themes/lv918/assets";

export default function SubmitButton({ onClick, label = "Saved Change", disabled = false }) {
  const { isAcebet77, isUbetclub, isEp369, isKgame99, isLv918 } = useTheme();

  const themedSkin = isAcebet77
    ? { src: ACEBET_ASSETS.spin.btnPlay, color: ACEBET_COLORS.goldBright }
    : isUbetclub
      ? { src: UBET_ASSETS.spin.btnPlay, color: UBET_COLORS.goldBright }
      : isEp369
        ? { src: EP369_ASSETS.spin.btnPlay, color: EP369_COLORS.goldBright }
        : isKgame99
          ? { src: KGAME99_ASSETS.spin.btnPlay, color: KGAME99_COLORS.goldBright }
          : isLv918
            ? { src: LV918_ASSETS.spin.btnPlay, color: LV918_COLORS.goldBright }
            : null;

  if (themedSkin) {
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
          src={themedSkin.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        />
        <span
          className="relative z-10 text-base leading-normal"
          style={{
            fontFamily: '"Times New Roman", serif',
            fontWeight: "bold",
            color: themedSkin.color,
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
