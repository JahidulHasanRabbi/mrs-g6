"use client";

import { motion } from "framer-motion";

/**
 * Shared themed "Edit Profiles" list — the ornate scroll panel at the bottom of
 * every skin's /profile page. Lists the six editable profile fields, each a row
 * that jumps to /personal-data. One layout, driven per theme by the scroll
 * frame art + palette; the frame is drawn as a `background-size:100% 100%` layer
 * so the panel grows to fit all six rows.
 *
 * `pad` is the safe content box inside the scroll art (the rolled tops/bottoms
 * and side gems eat into the frame); tune it per theme's scroll image.
 */
const EDIT_ROWS = [
  { key: "displayPhoto", label: "Display Photo" },
  { key: "gender", label: "Gender" },
  { key: "birthday", label: "Birthday" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "interest", label: "Interest" },
];

export default function ThemedEditProfileList({
  frame,
  pad = { x: "18%", top: "18%", bottom: "21%" },
  colors,
  onItem,
}) {
  const acme = "var(--font-acme), 'Times New Roman', serif";

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[360px]"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.14 }}
      style={{
        backgroundImage: `url(${frame})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="relative flex flex-col"
        style={{
          paddingLeft: pad.x,
          paddingRight: pad.x,
          paddingTop: pad.top,
          paddingBottom: pad.bottom,
        }}
      >
        <p
          className="mb-2 text-center text-[15px] tracking-wide"
          style={{ color: colors.heading, fontFamily: acme, textShadow: `0 0 10px ${colors.heading}55` }}
        >
          Edit Profiles
        </p>
        <ul className="flex flex-col">
          {EDIT_ROWS.map((row, i) => (
            <li key={row.key}>
              {i > 0 && (
                <div
                  className="h-px w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${colors.divider} 20%, ${colors.divider} 80%, transparent 100%)`,
                  }}
                />
              )}
              <button
                type="button"
                onClick={() => onItem?.(row.key)}
                className="flex w-full cursor-pointer items-center justify-between py-2 transition-transform active:scale-[0.99]"
              >
                <span className="text-[13px] leading-none" style={{ color: colors.rowText, fontFamily: acme }}>
                  {row.label}
                </span>
                <span className="text-[14px] leading-none opacity-70" style={{ color: colors.chevron, fontFamily: acme }}>
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
