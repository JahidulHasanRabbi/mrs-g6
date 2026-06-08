"use client";

import { motion } from "framer-motion";
import { IMAGES } from "./assets";

export default function Ball({ size = 56, style, animate, initial, transition }) {
  return (
    <motion.img
      src={IMAGES.ballPng}
      alt=""
      draggable={false}
      style={{
        position: "absolute",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        pointerEvents: "none",
        objectFit: "cover",
        filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.55))",
        ...style,
      }}
      initial={initial}
      animate={animate}
      transition={transition}
    />
  );
}
