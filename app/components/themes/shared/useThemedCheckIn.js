"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { checkIn, getCheckinSettings, getMemberInfo } from "../../../api/memberApi";
import { useUser } from "../../../contexts/UserContext";
import { CHECKIN_DAYS } from "./checkinMartSkin";

/** Check-in state shared by ThemedCheckInBoard and KR; `dialog.kind` lets a skin title it without parsing copy. */
export function useThemedCheckIn() {
  const [streak, setStreak] = useState(0);
  const checkedDays = useMemo(() => Array.from({ length: Math.min(streak, 7) }, (_, i) => i + 1), [streak]);
  const [checkinSettings, setCheckinSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [dialog, setDialog] = useState(null);
  const { refreshUserData, authReady, memberUuid } = useUser();

  const applyStreak = useCallback((streakValue) => {
    if (streakValue === undefined || streakValue === null) return;
    setStreak(Number(streakValue) || 0);
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
        setDialog({ kind: "claimed", day: day.day, message: "You have already checked in for this day!" });
        return;
      }

      // Serial check-in: only the next unclaimed day is actionable.
      const nextDay = checkedDays.length + 1;
      if (day.day !== nextDay) {
        setDialog({ kind: "order", message: `Please check in for Day ${nextDay} first!` });
        return;
      }

      if (!memberUuid) {
        setDialog({ kind: "login", message: "Please log in to check in." });
        return;
      }

      setIsCheckingIn(true);
      try {
        const response = await checkIn(memberUuid);
        const tokens = response?.tokens_obtained;
        const earned =
          tokens != null ? `${tokens} KR Coin${tokens !== 1 ? "s" : ""}` : "your reward";
        setDialog({
          kind: "success",
          tokens,
          message: `Congratulations! You've checked in for today and earned ${earned}!`,
        });

        const updated = await getMemberInfo(memberUuid);
        applyStreak(updated?.current_streak);
        await refreshUserData();
      } catch (err) {
        console.error("Check-in failed:", err);
        const detail =
          err.data?.details || err.data?.detail || err.data?.message || err.message || "";
        const lower = detail.toLowerCase();

        if (lower.includes("already checked in")) {
          setDialog({ kind: "error", message: "Already checked in today! Try again tomorrow." });
        } else if (lower.includes("module") || lower.includes("checkinnotsetuperror")) {
          setDialog({
            kind: "error",
            message: "Check-in is currently unavailable. Please try again later.",
          });
        } else {
          setDialog({ kind: "error", message: detail || "Failed to check in. Please try again." });
        }
      } finally {
        setIsCheckingIn(false);
      }
    },
    [checkedDays, isCheckingIn, memberUuid, refreshUserData, applyStreak]
  );

  const closeDialog = useCallback(() => setDialog(null), []);

  return { checkedDays, streak, days, isLoading, isCheckingIn, dialog, closeDialog, onDayClick };
}
