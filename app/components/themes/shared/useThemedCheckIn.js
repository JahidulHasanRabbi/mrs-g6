"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const inFlight = useRef(false);
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
        setLastCheckInDate(info?.last_check_in_date ?? null);
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
    return CHECKIN_DAYS.map((d) => ({
      ...d,
      reward: rewardFor(d.day),
      rewardEntry: checkinSettings?.rewards?.find((r) => r.day === d.day) ?? null,
    }));
  }, [checkinSettings]);

  const submitCheckIn = useCallback(async () => {
    if (!memberUuid) {
      setDialog({ kind: "login", message: "Please log in to check in." });
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;

    setIsCheckingIn(true);
    try {
      const response = await checkIn(memberUuid);
      const tokens = response?.tokens_obtained;
      const battlePoints =
        response?.battle_point_amount ?? response?.battle_points_obtained ?? response?.battle_point_obtained;
      const earned =
        tokens != null ? `${tokens} KR Coin${tokens !== 1 ? "s" : ""}` : "your reward";
      setDialog({
        kind: "success",
        tokens,
        battlePoints: battlePoints != null ? Number(battlePoints) : null,
        message: `Congratulations! You've checked in for today and earned ${earned}!`,
      });

      // The claim already landed: a failed refresh must not read as a retryable check-in error.
      const updated = await getMemberInfo(memberUuid).catch(() => null);
      if (updated) applyStreak(updated.current_streak);
      else setStreak((s) => s + 1);
      setLastCheckInDate(updated?.last_check_in_date ?? new Date().toISOString());
      await refreshUserData().catch((refreshErr) => console.error("Post check-in refresh failed:", refreshErr));
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
        setDialog({ kind: "error", retryable: true, message: detail || "Failed to check in. Please try again." });
      }
    } finally {
      inFlight.current = false;
      setIsCheckingIn(false);
    }
  }, [memberUuid, refreshUserData, applyStreak]);

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

      await submitCheckIn();
    },
    [checkedDays, isCheckingIn, submitCheckIn]
  );

  const closeDialog = useCallback(() => setDialog(null), []);

  return {
    checkedDays,
    streak,
    lastCheckInDate,
    days,
    isLoading,
    isCheckingIn,
    dialog,
    closeDialog,
    onDayClick,
    // KR's single "Check In" button: the server decides which day today is.
    checkInToday: submitCheckIn,
  };
}
