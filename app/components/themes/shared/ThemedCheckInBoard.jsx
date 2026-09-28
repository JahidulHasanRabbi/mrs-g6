"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fitStyle, layoutTransform } from "./checkinMartSkin";
import ThemedDialog from "./ThemedDialog";
import ThemedActionButton from "./ThemedActionButton";
import { useThemedCheckIn } from "./useThemedCheckIn";

/**
 * Skin-driven Daily Check-in board (Figma "Check in", MRS Theme Engine file).
 *
 * Same data pipeline as the default portal's <CheckInBoard>: the member's
 * `current_streak` decides which days read as claimed, `getCheckinSettings()`
 * supplies each day's reward text, and tapping the next day in sequence calls
 * `checkIn()`. Only the art changes per theme — geometry lives in
 * ./checkinMartSkin.js and is shared by all six skins.
 */
export default function ThemedCheckInBoard({ skin }) {
  const { checkedDays, days, isLoading, isCheckingIn, dialog, closeDialog, onDayClick } =
    useThemedCheckIn();

  const layout = useMemo(() => layoutTransform(skin.panel), [skin.panel]);

  return (
    <section className="relative w-full px-4">
      {/* Title plaque — the label is baked into the art, as with the other
          themed page titles (profile / vip / terms). */}
      {/* -mx-4 cancels the section padding so a full-bleed plaque reaches both
          screen edges, as the comps do. A plain <img> (like the other themed
          page titles) keeps each plaque's own intrinsic aspect ratio. */}
      <div className="-mx-4 flex justify-center">
        <motion.img
          src={skin.title}
          alt="Daily Check in"
          draggable={false}
          style={{ width: `${skin.titleWidthPct}%` }}
          className="h-auto max-w-none select-none object-contain"
          initial={{ opacity: 0, y: -26, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
        />
      </div>

      <motion.div
        className="relative mx-auto mt-1 w-full"
        style={{ maxWidth: skin.boardMaxWidth }}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.1 }}
      >
        <div className="relative w-full" style={{ aspectRatio: skin.boardAspect }}>
          {/* Frame art is overscaled into its slot and clipped, as the comps do,
              so its baked-in transparent margin doesn't shrink the panel. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={skin.boardFrame}
              alt=""
              className="absolute max-w-none object-fill"
              style={fitStyle(skin.fit.board)}
            />
          </div>

          <div className="absolute inset-0">
            {days.map((d) => {
              const isChecked = checkedDays.includes(d.day);
              const icon = d.isSpecial ? null : skin.icons[d.icon];

              // Map the comp's slot into this frame's inner panel.
              const w = (d.isSpecial ? d.w : skin.cardW) * layout.scale;
              const h = (d.isSpecial ? d.h : skin.cardH) * layout.scale;
              const cx = layout.x(d.cx);
              const cy = layout.y(d.cy);

              return (
                <motion.button
                  key={d.day}
                  type="button"
                  onClick={() => onDayClick(d)}
                  disabled={isCheckingIn}
                  aria-label={`Check in ${d.label}`}
                  className={`@container absolute ${isChecked ? "opacity-60 grayscale" : ""}`}
                  style={{
                    left: `${cx}%`,
                    top: `${cy}%`,
                    width: `${w}%`,
                    height: `${h}%`,
                    background: "transparent",
                    outline: "none",
                    cursor: isChecked ? "default" : "pointer",
                  }}
                  initial={{ opacity: 0, scale: 0.4, x: "-50%", y: "-120%" }}
                  animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 18,
                    delay: (d.day - 1) * 0.09 + 0.28,
                  }}
                  whileHover={isChecked ? undefined : { scale: 1.12 }}
                  whileTap={isChecked ? undefined : { scale: 0.94 }}
                >
                  <div className="relative h-full w-full">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <img
                        src={d.isSpecial ? skin.chest : skin.dayCard}
                        alt=""
                        className="absolute max-w-none object-fill"
                        style={fitStyle(d.isSpecial ? skin.fit.chest : skin.fit.dayCard)}
                      />
                    </div>

                    {/* Reward glyph — each icon keeps its own designed box. */}
                    {icon && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                          top: `${icon.top}%`,
                          width: `${icon.w}%`,
                          height: `${icon.h}%`,
                        }}
                      >
                        <Image
                          src={icon.src}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
                      </div>
                    )}

                    {/* Reward text (the API's display_text). Rendered for all
                        seven days, matching the default <CheckInBoard>. */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center"
                      style={{
                        top: d.isSpecial ? "56%" : "69.3%",
                        fontFamily: skin.font,
                        fontWeight: 700,
                        color: d.isSpecial ? skin.c.rewardSpecial : skin.c.reward,
                        fontSize: d.isSpecial
                          ? "clamp(9px, 10cqi, 15px)"
                          : "clamp(9px, 24cqi, 16px)",
                        lineHeight: "normal",
                      }}
                    >
                      {d.reward}
                    </div>

                  </div>

                  {/* DAY n label, just below the card. */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
                    style={{
                      bottom: d.isSpecial ? "-9cqi" : "-13cqi",
                      fontFamily: skin.font,
                      fontWeight: 700,
                      color: d.isSpecial ? skin.c.labelSpecial : skin.c.label,
                      fontSize: d.isSpecial
                        ? "clamp(10px, 11cqi, 16px)"
                        : "clamp(10px, 24cqi, 16px)",
                      lineHeight: "normal",
                    }}
                  >
                    {d.label}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div
                className="h-9 w-9 animate-spin rounded-full border-2 border-transparent"
                style={{ borderTopColor: skin.c.label, borderRightColor: skin.c.label }}
              />
            </div>
          )}
        </div>
      </motion.div>

      <ThemedDialog open={!!dialog} onClose={closeDialog}>
        <p
          className="text-center text-[16px] font-bold leading-[1.45]"
          style={{ fontFamily: skin.font, color: skin.c.label }}
        >
          {dialog?.message}
        </p>
        <ThemedActionButton textSize={16} onClick={closeDialog}>
          OK
        </ThemedActionButton>
      </ThemedDialog>
    </section>
  );
}
