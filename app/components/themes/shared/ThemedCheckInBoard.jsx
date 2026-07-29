"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { checkIn, getCheckinSettings, getMemberInfo } from "../../../api/memberApi";
import { useUser } from "../../../contexts/UserContext";
import { CHECKIN_DAYS } from "./checkinMartSkin";
import ThemedDialog from "./ThemedDialog";
import ThemedActionButton from "./ThemedActionButton";

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
  const [checkedDays, setCheckedDays] = useState([]);
  const [checkinSettings, setCheckinSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(null);
  const { refreshUserData, authReady, memberUuid } = useUser();

  const applyStreak = useCallback((streakValue) => {
    if (streakValue === undefined || streakValue === null) return;
    const streak = streakValue >= 7 ? 7 : streakValue;
    setCheckedDays(Array.from({ length: streak }, (_, i) => i + 1));
  }, []);

  useEffect(() => {
    if (!authReady) return;
    // Auth settled but no member (e.g. guard disabled in dev): drop the
    // spinner instead of leaving it running forever.
    if (!memberUuid) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const [info, settings] = await Promise.all([
          getMemberInfo(memberUuid),
          getCheckinSettings().catch((err) => {
            console.error("Failed to fetch check-in settings:", err);
            return null;
          }),
        ]);
        if (cancelled) return;
        applyStreak(info?.current_streak);
        setCheckinSettings(settings);
      } catch (err) {
        console.error("Failed to fetch member info:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, memberUuid, applyStreak]);

  const days = useMemo(() => {
    const rewardFor = (day) => {
      const entry = checkinSettings?.rewards?.find((r) => r.day === day);
      const text = entry?.display_text;
      return text && text.trim() ? text : "";
    };
    return CHECKIN_DAYS.map((d) => ({ ...d, reward: rewardFor(d.day) }));
  }, [checkinSettings]);

  const onDayClick = useCallback(
    async (day) => {
      if (isCheckingIn) return;

      if (checkedDays.includes(day.day)) {
        setDialogMessage("You have already checked in for this day!");
        return;
      }

      // Serial check-in: only the next unclaimed day is actionable.
      const nextDay = checkedDays.length + 1;
      if (day.day !== nextDay) {
        setDialogMessage(`Please check in for Day ${nextDay} first!`);
        return;
      }

      if (!memberUuid) {
        setDialogMessage("Please log in to check in.");
        return;
      }

      setIsCheckingIn(true);
      try {
        const response = await checkIn(memberUuid);
        const tokens = response?.tokens_obtained;
        const earned =
          tokens != null ? `${tokens} token${tokens !== 1 ? "s" : ""}` : "your reward";
        setDialogMessage(
          `Congratulations! You've checked in for today and earned ${earned}!`
        );

        const updated = await getMemberInfo(memberUuid);
        applyStreak(updated?.current_streak);
        await refreshUserData();
      } catch (err) {
        console.error("Check-in failed:", err);
        const detail =
          err.data?.details || err.data?.detail || err.data?.message || err.message || "";
        const lower = detail.toLowerCase();

        if (lower.includes("already checked in")) {
          setDialogMessage("Already checked in today! Try again tomorrow.");
        } else if (lower.includes("module") || lower.includes("checkinnotsetuperror")) {
          setDialogMessage("Check-in is currently unavailable. Please try again later.");
        } else {
          setDialogMessage(detail || "Failed to check in. Please try again.");
        }
      } finally {
        setIsCheckingIn(false);
      }
    },
    [checkedDays, isCheckingIn, memberUuid, refreshUserData, applyStreak]
  );

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
          <Image
            src={skin.boardFrame}
            alt=""
            fill
            priority
            className="object-fill"
            sizes="(max-width: 400px) 100vw, 362px"
          />

          <div className="absolute inset-0">
            {days.map((d) => {
              const isChecked = checkedDays.includes(d.day);
              const icon = d.isSpecial ? null : skin.icons[d.icon];

              // Grow the tile from its anchored edge so the extra size is taken
              // out of the panel's middle, not out of the frame's rails.
              const baseW = d.isSpecial ? d.w : skin.cardW;
              const baseH = d.isSpecial ? d.h : skin.cardH;
              const w = baseW * skin.cardScale;
              const h = baseH * skin.cardScale;
              const cy =
                d.anchor === "bottom"
                  ? d.cy + baseH / 2 - h / 2
                  : d.anchor === "top"
                    ? d.cy - baseH / 2 + h / 2
                    : d.cy;

              return (
                <motion.button
                  key={d.day}
                  type="button"
                  onClick={() => onDayClick(d)}
                  disabled={isCheckingIn}
                  aria-label={`Check in ${d.label}`}
                  className={`@container absolute ${isChecked ? "opacity-60 grayscale" : ""}`}
                  style={{
                    left: `${d.cx}%`,
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
                    <Image
                      src={d.isSpecial ? skin.chest : skin.dayCard}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="160px"
                    />

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

      <ThemedDialog open={!!dialogMessage} onClose={() => setDialogMessage(null)}>
        <p
          className="text-center text-[16px] font-bold leading-[1.45]"
          style={{ fontFamily: skin.font, color: skin.c.label }}
        >
          {dialogMessage}
        </p>
        <ThemedActionButton textSize={16} onClick={() => setDialogMessage(null)}>
          OK
        </ThemedActionButton>
      </ThemedDialog>
    </section>
  );
}
